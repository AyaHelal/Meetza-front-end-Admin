import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Envelope, Password, Eye, EyeSlash, WarningCircle } from "phosphor-react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { FormInput, LogoSection } from "../../Features";
import SocialLoginButtons from "../../Features/common/SocialLoginButtons";
import { useFormValidation, usePasswordVisibility } from "../../hooks";
import { loginValidationRules } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useBranding } from "../../context/BrandingContext";

import "./LoginForm.css";

export default function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const { loginUser } = useAuth();
    const { systemName, authGoogleEnabled, domains } = useBranding();
    const [rememberMe, setRememberMe] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [remainingAttempts, setRemainingAttempts] = useState(undefined);
    const [captchaRequiredByBackend, setCaptchaRequiredByBackend] = useState(false);

    const { formData, errors, touched, handleChange: originalHandleChange, validateForm } = useFormValidation(
        { email: "", password: "" },
        loginValidationRules
    );

    const handleChange = (e) => {
        originalHandleChange(e);
        if (apiError) setApiError("");
    };

    const { showPassword, togglePasswordVisibility } = usePasswordVisibility();



    const handleSubmit = (e) => {
        e.preventDefault();
        handleFormSubmission();
    };

    // Check for error messages from URL params (e.g., member access denied)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const errorParam = searchParams.get('error');

        if (errorParam) {
            let errorMessage = '';

            if (errorParam === 'member_access_denied') {
                errorMessage = 'Access denied: Members cannot access the admin dashboard. Please use the member portal instead.';
            } else if (errorParam === 'access_denied') {
                errorMessage = 'Access denied: You do not have permission to access the admin dashboard.';
            } else if (errorParam === 'parse_error') {
                errorMessage = 'An error occurred during authentication. Please try again.';
            }

            if (errorMessage) {
                // Set error message
                setApiError(errorMessage);

                // Clean up URL after a delay to ensure error is visible
                setTimeout(() => {
                    const newSearchParams = new URLSearchParams(location.search);
                    newSearchParams.delete('error');
                    const newSearch = newSearchParams.toString();
                    navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true });
                }, 500);
            }
        }
    }, [location.search, location.pathname, navigate]);

    // Render reCAPTCHA when showCaptcha changes
    useEffect(() => {
        let isMounted = true;
        
        const renderCaptcha = () => {
            if (!showCaptcha || !window.grecaptcha || !isMounted) return;
            
            const container = document.getElementById('recaptcha-container');
            if (container) {
                try {
                    container.innerHTML = '';
                    window.grecaptcha.render('recaptcha-container', {
                        sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeVQz4sAAAAALscjtOKAqr-Zigom5VdgJ_6qVHd',
                        callback: (token) => window.onCaptchaVerified(token),
                        'expired-callback': () => window.onCaptchaExpired(),
                        size: 'normal'
                    });
                } catch (e) {
                    console.warn("reCAPTCHA render error:", e);
                }
            } else {
                // Try again in a bit if container not ready
                setTimeout(renderCaptcha, 100);
            }
        };

        if (showCaptcha) {
            // Check if script is loaded, if not, wait for it
            if (!window.grecaptcha) {
                const interval = setInterval(() => {
                    if (window.grecaptcha) {
                        clearInterval(interval);
                        renderCaptcha();
                    }
                }, 500);
                // Cleanup interval after 10 seconds to avoid infinite loop
                setTimeout(() => clearInterval(interval), 10000);
            } else {
                renderCaptcha();
            }
        }

        return () => { isMounted = false; };
    }, [showCaptcha]);

    const submitLogin = async (recaptchaTokenToSend = null) => {
        if (!validateForm()) return;
        
        // Domain validation: Only apply when Google Auth is DISABLED
        if (!authGoogleEnabled && domains && domains.length > 0) {
            const emailDomain = formData.email.split('@')[1]?.toLowerCase();
            const brandingDomains = domains.map(d => d.domain_name.toLowerCase());
            
            if (!brandingDomains.includes(emailDomain)) {
                setApiError(`This email domain is not authorized. Allowed domains: ${domains.map(d => d.domain_name).join(', ')}.`);
                return;
            }
        }

        if (captchaRequiredByBackend && !recaptchaTokenToSend) {
            setApiError("Please complete the reCAPTCHA.");
            return;
        }

        setApiError("");
        setIsLoading(true);
        setRemainingAttempts(undefined);

        const requestData = {
            ...formData,
            remember_me: rememberMe.toString(),
            from: "dashboard",
            ...(recaptchaTokenToSend && { captchaToken: recaptchaTokenToSend })
        };

        try {
            const response = await api.post('/auth/login', requestData);
            const data = response?.data?.data ?? response?.data;
            const token = data?.token;
            const userPayload = data?.user;

            if (token) {
                loginUser(userPayload || {}, token, rememberMe);
                setShowCaptcha(false);
                setCaptchaToken('');
                setCaptchaRequiredByBackend(false);
                setRemainingAttempts(undefined);
                navigate('/dashboard');
            } else {
                const msg = response?.data?.message ?? response?.data?.data?.message ?? "Login failed.";
                setApiError(msg);
                
                // Check if this "success" response actually contains a security requirement
                const securityData = response?.data?.data || response?.data || {};
                if (securityData.requiresCaptcha) {
                    setCaptchaRequiredByBackend(true);
                    setShowCaptcha(true);
                }
                if (securityData.remaining !== undefined) {
                    setRemainingAttempts(securityData.remaining);
                }
            }
        } catch (error) {
            const res = error.response;
            const data = res?.data || {};
            const msg = data?.message ?? data?.data?.message ?? error.message ?? "Login failed. Please try again.";

            // Extract security data from backend response
            const remaining = data?.remaining;
            const needsCaptcha = data?.requiresCaptcha || (res?.status === 429);
            
            if (remaining !== undefined) {
                setRemainingAttempts(remaining);
            }

            if (needsCaptcha) {
                setCaptchaRequiredByBackend(true);
                setShowCaptcha(true);
                setApiError(msg);
            } else {
                // If it's a network error, use a clean message
                if (!res && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
                    setApiError("Network Error");
                } else {
                    setApiError(msg);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    window.onCaptchaVerified = (token) => {
        setApiError("");
        setRemainingAttempts(undefined);
        setCaptchaToken(token);
        submitLogin(token);
    };

    window.onCaptchaExpired = () => setCaptchaToken('');

    // Reset CAPTCHA token when captcha is hidden
    useEffect(() => {
        if (!showCaptcha) setCaptchaToken('');
    }, [showCaptcha]);

    // Cleanup reCAPTCHA on unmount
    useEffect(() => {
        return () => {
            if (window.grecaptcha) {
                const container = document.getElementById('recaptcha-container');
                if (container) container.innerHTML = '';
            }
        };
    }, []);

    const handleFormSubmission = () => submitLogin();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (captchaRequiredByBackend) return;
            submitLogin();
        }
    };



    // Handle browser back button to redirect to landing page
    useEffect(() => {
        const landingUrl = 'https://meetza-front-end.vercel.app/landing';

        // Push landing page entry to history before current login page
        // This makes back button go to landing instead of dashboard
        window.history.pushState({ page: 'landing' }, '', window.location.href);

        const handlePopState = (event) => {
            // When back button is clicked, redirect to landing page
            // Use replace to prevent adding to history
            window.location.replace(landingUrl);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return (
        <motion.div className="align-items-center text-center" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <LogoSection />

            <div className={`justify-content-center p-8 ff ${systemName !== 'Meetza' ? 'custom-branding-login' : ''}`}>
                <motion.h2 className="fw-semibold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    Welcome Back
                </motion.h2>
                <motion.span className="text-888888" style={{ fontSize: "20px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    Please enter your Details as Super Admin or Leader
                </motion.span>



                <form className="form" onSubmit={handleSubmit} onKeyPress={handleKeyPress} noValidate>
                    {apiError && (
                        <motion.div className="login-error-container mt-3" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <div className="login-error-icon">
                                <WarningCircle size={24} weight="fill" />
                            </div>
                            <div className="login-error-text">
                                <div className="login-error-title">{apiError}</div>
                                <div className="login-error-message">
                                    {apiError.toLowerCase().includes('network') 
                                        ? "Please check your internet connection and try again." 
                                        : "Please check your credentials and try again."}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {remainingAttempts !== undefined && (
                        <div className="mb-3 text-center">
                            <small className="text-warning">
                                {remainingAttempts === 0 ? "No attempts remaining" : `${remainingAttempts} attempt(s) remaining`}
                            </small>
                        </div>
                    )}

                    <FormInput name="email" value={formData.email} onChange={handleChange} placeholder="johndoe@email.com" type="email" label="Email" error={errors.email} touched={touched.email} icon={Envelope} />
                    <FormInput
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="●●●●●●●●"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        error={errors.password}
                        touched={touched.password}
                        icon={Password}
                        toggleIcon={showPassword ? EyeSlash : Eye}
                        showPasswordToggle={true}
                        onTogglePassword={togglePasswordVisibility}
                        showPassword={showPassword}
                    />

                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                            <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: "12px" }}>Remember me</label>
                        </div>

                        <a href="/forgot-password" className="text-decoration-none text-888888" style={{ fontSize: "12px" }}>Forgot Password?</a>
                    </div>

                    <div 
                        id="recaptcha-container" 
                        className={`g-recaptcha d-flex justify-content-center ${showCaptcha ? 'mt-3 mb-3' : ''}`}
                        style={{ display: showCaptcha ? 'flex' : 'none' }}
                    />

                    <motion.button type="submit" className="btn btn-primary w-100 py-3 mt-3 mb-3 rounded-4 d-inline-flex align-items-center justify-content-center" whileHover={!isLoading && !(captchaRequiredByBackend && !captchaToken) ? { scale: 1.02 } : {}} whileTap={!isLoading && !(captchaRequiredByBackend && !captchaToken) ? { scale: 0.98 } : {}} disabled={isLoading || (captchaRequiredByBackend && !captchaToken)}>
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing in...
                            </>
                        ) : 'Continue'}
                    </motion.button>



                    {authGoogleEnabled && (
                        <div className="mt-2">
                            <SocialLoginButtons redirectUrl={`${window.location.origin}/dashboard`} />
                        </div>
                    )}
                </form>
            </div>
        </motion.div>
    );
}
