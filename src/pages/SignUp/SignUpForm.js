import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Envelope, User, Password, Eye, EyeSlash } from "phosphor-react";
import { motion } from "framer-motion";
import axios from "axios";
import "../Login/LoginForm.css";
import { FormInput, ToggleButton, LogoSection } from "../../components";
import { useFormValidation, usePasswordVisibility } from "../../hooks";
import { signupValidationRules } from "../../utils";
import PasswordStrengthIndicator from "../../components/common/StrongPassword";
import SocialLoginButtons from "../../components/common/SocialLoginButtons";

export default function SignUpForm() {
    const [isSignUp, setIsSignUp] = useState(true);
    const navigate = useNavigate();

    const { formData, errors, touched, handleChange: originalHandleChange, validateForm } = useFormValidation(
        { name: "", email: "", password: "", confirmPassword: "" },
        signupValidationRules
    );

    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        originalHandleChange(e);
        if (apiError) setApiError("");
    };

    const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
    const { showPassword: showConfirmPassword, togglePasswordVisibility: toggleConfirmPasswordVisibility } = usePasswordVisibility();

    const handleToggleChange = (value) => {
        const isSignUpMode = value === 'signup';
        setIsSignUp(isSignUpMode);
        navigate(isSignUpMode ? "/signup" : "/login");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleFormSubmission();
    };

    const handleFormSubmission = async () => {
        if (!validateForm()) return;
        setApiError("");
        setIsLoading(true);
        try {
            const response = await axios.post('https://meetza-backend.vercel.app/api/auth/register', {
                name: formData.name,
                password: formData.password,
                email: formData.email,
                role: 'Administrator'
            });
            console.log(response);
            localStorage.setItem("userEmail", formData.email);
            navigate('/verify-email');
        } catch (error) {
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
        <motion.div
            className="align-items-center text-center"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
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

                <div className="mt-4 d-flex justify-content-center">
                    <ToggleButton
                        options={toggleOptions}
                        activeOption={isSignUp ? 'signup' : 'login'}
                        onOptionChange={handleToggleChange}
                    />
                </div>

                <form className="form" onSubmit={handleSubmit} onKeyPress={handleKeyPress} noValidate>
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
                        label="Your Email"
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
                        showPasswordToggle
                        onTogglePassword={togglePasswordVisibility}
                    />
                    <PasswordStrengthIndicator password={formData.password} />

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
                            showPasswordToggle
                            onTogglePassword={toggleConfirmPasswordVisibility}
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
                        ) : 'Creat Account'}
                    </motion.button>

                    <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >

                        <SocialLoginButtons />
                    </motion.div>
                </form>
            </div>
        </motion.div>
    );
}
