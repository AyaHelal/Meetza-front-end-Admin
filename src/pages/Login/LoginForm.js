import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Envelope, Password, Eye, EyeSlash } from "phosphor-react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { FormInput, ToggleButton, LogoSection } from "../../components";
import SocialLoginButtons from "../../components/common/SocialLoginButtons";
import { useFormValidation, usePasswordVisibility } from "../../hooks";
import { loginValidationRules } from "../../utils";
import { useAuth } from "../../context/AuthContext";

import "./LoginForm.css";

export default function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const { loginUser } = useAuth();
    const [rememberMe, setRememberMe] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [remainingAttempts, setRemainingAttempts] = useState(undefined);

    const { formData, errors, touched, handleChange: originalHandleChange, validateForm } = useFormValidation(
        { email: "", password: "" },
        loginValidationRules
    );

    const handleChange = (e) => {
        originalHandleChange(e);
        if (apiError) setApiError("");
    };

    const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

    const handleToggleChange = (value) => {
        const isLoginMode = value === 'login';
        setIsLogin(isLoginMode);
        navigate(isLoginMode ? "/login" : "/signup", { replace: true });
    };

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
        if (showCaptcha && window.grecaptcha) {
            const container = document.getElementById('recaptcha-container');
            if (container) {
                container.innerHTML = '';
                window.grecaptcha.render('recaptcha-container', {
                    sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
                    callback: (token) => window.onCaptchaVerified(token),
                    'expired-callback': () => window.onCaptchaExpired(),
                    size: 'normal'
                });
            }
        }
    }, [showCaptcha]);

    // reCAPTCHA callbacks (backend may require captcha via 429 + requiresCaptcha)
    window.onCaptchaVerified = (token) => {
        setCaptchaToken(token);
        setApiError("");
    };

    window.onCaptchaExpired = () => {
        setCaptchaToken('');
        setApiError("CAPTCHA expired. Please complete it again.");
    };

    // Reset CAPTCHA token when captcha is hidden
    useEffect(() => {
        if (!showCaptcha) setCaptchaToken('');
    }, [showCaptcha]);

    // Auto-refresh CAPTCHA after 5 seconds
    useEffect(() => {
        let timeoutId;
        if (showCaptcha && captchaToken) {
            timeoutId = setTimeout(() => {
                setCaptchaToken('');
                setApiError("CAPTCHA expired. Please complete it again.");
                if (window.grecaptcha) {
                    try { window.grecaptcha.reset(); } catch (error) { console.error(error); }
                }
            }, 5000);
        }
        return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [showCaptcha, captchaToken]);

    // Cleanup reCAPTCHA on unmount
    useEffect(() => {
        return () => {
            if (window.grecaptcha) {
                const container = document.getElementById('recaptcha-container');
                if (container) container.innerHTML = '';
            }
        };
    }, []);

    const handleFormSubmission = async () => {
        if (!validateForm()) return;

        setApiError("");
        setIsLoading(true);
        setRemainingAttempts(undefined);

        const requestData = {
            ...formData,
            remember_me: rememberMe.toString(),
            from: "dashboard",
            ...(captchaToken && { recaptchaToken: captchaToken })
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
                setRemainingAttempts(undefined);
                navigate('/dashboard');
            } else {
                const msg = response?.data?.message ?? response?.data?.data?.message ?? "Login failed.";
                setApiError(msg);
                const remaining = response?.data?.remaining ?? response?.data?.data?.remaining;
                if (remaining !== undefined) setRemainingAttempts(remaining);
            }
        } catch (error) {
            const res = error.response;
            const data = res?.data || {};
            const msg = data?.message ?? data?.data?.message ?? error.message ?? "Login failed. Please try again.";

            if (res?.status === 429 && data?.requiresCaptcha) {
                setShowCaptcha(true);
                setApiError(msg);
            } else {
                setApiError(msg);
            }
            if (data?.remaining !== undefined) setRemainingAttempts(data.remaining);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFormSubmission();
        }
    };

    const toggleOptions = [
        { value: 'login', label: 'Sign In' },
        { value: 'signup', label: 'Sign Up' }
    ];

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

            <div className="justify-content-center p-8 ff">
                <motion.h2 className="fw-semibold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    Welcome Back
                </motion.h2>
                <motion.span className="text-888888" style={{ fontSize: "20px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    Please enter your Details as administrator
                </motion.span>

                <div className="justify-content-center">
                    <div className="mt-4 d-flex justify-content-center">
                        <ToggleButton options={toggleOptions} activeOption={isLogin ? 'login' : 'signup'} onOptionChange={handleToggleChange} />
                    </div>

                    <form className="form" onSubmit={handleSubmit} onKeyPress={handleKeyPress} noValidate>
                        {apiError && (
                            <motion.div className="alert alert-danger mt-3" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                {apiError}
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

                        {showCaptcha && (
                            <motion.div id="recaptcha-container" className="g-recaptcha mt-3 mb-3 d-flex justify-content-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} />
                        )}

                        <motion.button type="submit" className="btn btn-primary w-100 py-3 mt-3 mb-3 rounded-4 d-inline-flex align-items-center justify-content-center" whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : 'Continue'}
                        </motion.button>



                        <div className="mt-2">
                            <SocialLoginButtons redirectUrl={`${window.location.origin}/dashboard`}/>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
