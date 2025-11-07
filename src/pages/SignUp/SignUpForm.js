import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Envelope, User, Password, Eye, EyeSlash } from "phosphor-react";
import { motion } from "framer-motion";
import axios from "axios";


// Import reusable components
import { FormInput, ToggleButton, LogoSection, SocialLoginButtons } from "../../components";

// Import custom hooks and utilities
import { useFormValidation, usePasswordVisibility } from "../../hooks";
import { signupValidationRules } from "../../utils";

import '../Login/LoginForm.css';

export default function SignUpForm() {
    const [isSignUp, setIsSignUp] = useState(true);
    const navigate = useNavigate();

    // Custom hooks
    const { formData, errors, touched, handleChange: originalHandleChange, validateForm } = useFormValidation(
        { name: "", email: "", password: "", confirmPassword: "" },
        signupValidationRules
    );

    // Enhanced handleChange that clears API errors
    const handleChange = (e) => {
        originalHandleChange(e);
        // Clear API error when user starts typing
        if (apiError) {
            setApiError("");
        }
    };

    const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
    const { showPassword: showConfirmPassword, togglePasswordVisibility: toggleConfirmPasswordVisibility } = usePasswordVisibility();

    // Handle toggle button change
    const handleToggleChange = (value) => {
        const isSignUpMode = value === 'signup';
        setIsSignUp(isSignUpMode);
        navigate(isSignUpMode ? "/signup" : "/login");
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        handleFormSubmission();
    };

    // API error state
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle form submission logic
    const handleFormSubmission = async () => {
        if (validateForm()) {
            setApiError(""); // Clear previous errors
            setIsLoading(true);
            try {
                const response = await axios.post('https://meetza-backend.vercel.app/api/auth/register', {
                    name: formData.name,
                    password: formData.password,
                    email: formData.email,
                    role: 'Administrator'
                });
                console.log(response);
                // Save email to localStorage for verification
                localStorage.setItem("userEmail", formData.email);
                // Navigate to verify email page after successful registration
                navigate('/verify-email');
            } catch (error) {
                console.log(error);
                // Display API error message to user
                if (error.response?.data?.message) {
                    setApiError(error.response.data.message);
                } else if (error.message) {
                    setApiError(error.message);
                } else {
                    setApiError("Registration failed. Please try again.");
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
        console.log(`Sign up with ${provider}`);
        // Add social signup logic here
    };

    const toggleOptions = [
        { value: 'login', label: 'Sign In' },
        { value: 'signup', label: 'Sign Up' }
    ];

    return (
        <motion.div
            className="align-items-center text-center"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <LogoSection />

            <div className="justify-content-center p-8">
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
                            activeOption={isSignUp ? 'signup' : 'login'}
                            onOptionChange={handleToggleChange}
                        />
                    </div>

                    <form className="form" onSubmit={handleSubmit} onKeyPress={handleKeyPress} noValidate>
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
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Farida Emad"
                            type="text"
                            label="Name"
                            error={errors.name}
                            touched={touched.name}
                            icon={User}
                        />

                        <FormInput
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="johndoe@email.com"
                            type="email"
                            label="your Email"
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

                        {/* Confirm Password Field - Only shows when password field has content */}
                        {formData.password.length > 0 && (
                            <FormInput
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onKeyPress={handleKeyPress}
                                placeholder="●●●●●●●●"
                                type={showConfirmPassword ? "text" : "password"}
                                label="Confirm Password"
                                error={errors.confirmPassword}
                                touched={touched.confirmPassword}
                                icon={Password}
                                toggleIcon={showConfirmPassword ? EyeSlash : Eye}
                                showPasswordToggle={true}
                                onTogglePassword={toggleConfirmPasswordVisibility}
                                showPassword={showConfirmPassword}
                            />
                        )}

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
                                    Creating account...
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
                            <span className="text-888888">
                                or continue with
                            </span>
                        </motion.div>

                        <SocialLoginButtons onProviderClick={handleSocialLogin} />
                    </form>
                </div>
            </div>
        </motion.div>
    );
}