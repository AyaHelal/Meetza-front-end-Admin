
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Envelope, Password, Eye, EyeSlash } from "phosphor-react";
import { motion } from "framer-motion";
import axios from "axios";

// Import reusable components
import { FormInput, ToggleButton, LogoSection, SocialLoginButtons } from "../../components";

// Import custom hooks and utilities
import { useFormValidation, usePasswordVisibility } from "../../hooks";
import { loginValidationRules } from "../../utils";

import "./LoginForm.css";

export default function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Custom hooks
    const { formData, errors, touched, handleChange: originalHandleChange, validateForm } = useFormValidation(
        { email: "", password: "" },
        loginValidationRules
    );

    // API error state
    const [apiError, setApiError] = useState("");

    // Remember me state
    const [rememberMe, setRememberMe] = useState(false);

    // Enhanced handleChange that clears API errors
    const handleChange = (e) => {
        originalHandleChange(e);
        if (apiError) setApiError("");

    };

    const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

    // Handle toggle button change
    const handleToggleChange = (value) => {
        const isLoginMode = value === 'login';
        setIsLogin(isLoginMode);
        navigate(isLoginMode ? "/login" : "/signup");
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        handleFormSubmission();
    };

    // Handle form submission logic
    const handleFormSubmission = async () => {
        if (validateForm()) {
            setApiError("");
            setIsLoading(true);
            try {
                const response = await axios.post('https://meetza-backend.vercel.app/api/auth/login', {
                    ...formData,
                    remember_me: rememberMe.toString(), // "true" or "false"
                    role: 'Administrator'
                });
                console.log(response);

                if (response?.data?.data?.token) {
                    localStorage.setItem('authToken', response?.data?.data?.token);
                    console.log("authToken", response?.data?.data?.token);
                }
                try {
                    const userName = response?.data?.data?.user?.name || response?.data?.name;
                    if (userName) {
                        localStorage.setItem('userName', userName);
                    }
                    const userRole = response?.data?.data?.user?.role || response?.data?.role;
                    if (userRole) {
                        localStorage.setItem('userRole', userRole);
                    }
                    const userPayload = response?.data?.data?.user || { name: userName, role: userRole };
                    localStorage.setItem('user', JSON.stringify(userPayload));
                    console.log("Login successful:", userName);
                } catch (e) {
                    // ignore storage errors
                }

                navigate('/dashboard');
            } catch (error) {
                console.log(error);
                if (error.response?.data?.message) {
                    setApiError(error.response.data.message);
                } else if (error.message) {
                    setApiError(error.message);
                } else {
                    setApiError("Login failed. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFormSubmission();
        }
    };

    // Handle social login
    const handleSocialLogin = (provider) => {
        console.log(`Login with ${provider}`);
        // Add social login logic here
    };

    const toggleOptions = [
        { value: 'login', label: 'Sign In' },
        { value: 'signup', label: 'Sign Up' }
    ];

    return (
        <motion.div
            className="align-items-center text-center "
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <LogoSection />

            <div className="justify-content-center p-8 ff">
                <motion.h2
                    className="fw-semibold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Welcome Back
                </motion.h2>
                <motion.span
                    className="text-888888"
                    style={{ fontSize: "20px" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Please enter your Details as administrator
                </motion.span>

                <div className="justify-content-center">
                    <div className="mt-4 d-flex justify-content-center">
                        <ToggleButton
                            options={toggleOptions}
                            activeOption={isLogin ? 'login' : 'signup'}
                            onOptionChange={handleToggleChange}
                        />
                    </div>

                    <form className="form " onSubmit={handleSubmit} onKeyPress={handleKeyPress} noValidate>
                        {/* API Error Display */}
                        {apiError && (
                            <motion.div
                                className="alert alert-danger mt-3"
                                role="alert"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {apiError}
                            </motion.div>
                        )}

                        <FormInput
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="johndoe@email.com"
                            type="email"
                            label="Email"
                            error={errors.email}
                            touched={touched.email}
                            icon={Envelope}
                        />

                        <FormInput
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
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
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: "12px" }}>
                                    Remember me
                                </label>
                            </div>

                            <a href="/forgot-password" className="text-decoration-none text-888888" style={{ fontSize: "12px" }}>
                                Forgot Password?
                            </a>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary w-100 py-3 mt-3 mb-3 rounded-4 d-inline-flex align-items-center justify-content-center"
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                'continue'
                            )}
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <span className="text-888888">or continue with</span>
                        </motion.div>

                        <SocialLoginButtons onProviderClick={handleSocialLogin} />
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
