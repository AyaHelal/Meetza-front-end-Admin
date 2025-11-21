import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Envelope, Password, Eye, EyeSlash } from "phosphor-react";
import { motion } from "framer-motion";
import axios from "axios";
import { FormInput, ToggleButton, LogoSection } from "../../components";
import SocialLoginButtons from "../../components/common/SocialLoginButtons";
import { useFormValidation, usePasswordVisibility } from "../../hooks";
import { loginValidationRules } from "../../utils";

import "./LoginForm.css";

export default function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Super_Admin');
    const [apiError, setApiError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

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
        navigate(isLoginMode ? "/login" : "/signup");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleFormSubmission();
    };

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

    // reCAPTCHA callbacks
    window.onCaptchaVerified = (token) => {
        setCaptchaToken(token);
        setApiError("");
        setShowCaptcha(false);
        setFailedAttempts(0);
    };

    window.onCaptchaExpired = () => {
        setCaptchaToken('');
        setApiError("CAPTCHA expired. Please complete it again.");
        setShowCaptcha(true);
    };

    // Reset CAPTCHA token when hidden
    useEffect(() => {
        if (!showCaptcha) setCaptchaToken('');
    }, [showCaptcha]);

    // Show CAPTCHA after 3 failed attempts
    useEffect(() => {
        if (!captchaToken && failedAttempts >= 3 && !showCaptcha) {
            setShowCaptcha(true);
            console.log('🔄 Showing CAPTCHA after failed attempts');
        }
    }, [captchaToken, failedAttempts, showCaptcha]);

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

        if (failedAttempts >= 3 && !captchaToken) {
            setShowCaptcha(true);
            setApiError("Please complete the CAPTCHA to continue.");
            return;
        }

        setApiError("");
        setIsLoading(true);

        try {
            const requestData = {
                ...formData,
                remember_me: rememberMe.toString(),
                role: selectedRole,
                from: "dashboard",
                ...(captchaToken && { recaptchaToken: captchaToken })
            };

            const response = await axios.post('https://meetza-backend.vercel.app/api/auth/login', requestData);

            if (response?.data?.data?.token) {
                localStorage.setItem('authToken', response?.data?.data?.token);
                if (rememberMe) localStorage.setItem('rememberMe', 'true');
                else localStorage.removeItem('rememberMe');

                const userName = response?.data?.data?.user?.name || response?.data?.name;
                const userRole = response?.data?.data?.user?.role || response?.data?.role;
                const userPayload = response?.data?.data?.user || { name: userName, role: userRole };

                localStorage.setItem('userName', userName);
                localStorage.setItem('userRole', userRole);
                localStorage.setItem('user', JSON.stringify(userPayload));

                setFailedAttempts(0);
                setShowCaptcha(false);
                setCaptchaToken('');

                navigate('/dashboard');
            }
        } catch (error) {
            const attempts = failedAttempts + 1;
            setFailedAttempts(attempts);

            if (attempts >= 3) setShowCaptcha(true);

            if (error.response?.data?.message) setApiError(error.response.data.message);
            else if (error.message) setApiError(error.message);
            else setApiError("Login failed. Please try again.");
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

                        {/* Failed Attempts Counter */}
                        {failedAttempts > 0 && (
                            <div className="mb-3 text-center">
                                <small className="text-warning">
                                    Failed attempts: {failedAttempts}/3
                                    {failedAttempts >= 3 && " - reCAPTCHA required"}
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

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-3">
                            <span className="text-888888">or continue with</span>
                        </motion.div>

                        <div className="mt-2">
                            <SocialLoginButtons />
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
