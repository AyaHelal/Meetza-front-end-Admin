import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { LogoSection } from "../../components";
import '../Login/LoginForm.css';
import { FormInput } from "../../components";
import { Envelope } from "phosphor-react";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("https://meetza-backend.vercel.app/api/auth/forgot-password", {
                email: email
            });

            setSuccess("A verification code has been sent to your email.");
            // Store email for next page
            localStorage.setItem("resetEmail", email);

            // Redirect to verify reset code page after a short delay
            setTimeout(() => {
                navigate("/verify-reset-code");
            }, 2000);

        } catch (error) {
            console.error("Forgot password error:", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to send reset code. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

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
                    Forgot Password
                </motion.h2>
                <motion.span
                    className="text-888888"
                    style={{ fontSize: "20px" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Enter your email to receive a reset code
                </motion.span>

                <form className="form" onSubmit={handleSubmit} noValidate>
                    {/* Success Message */}
                    {success && (
                        <motion.div
                            className="alert alert-success mt-3"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {success}
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            className="alert alert-danger mt-3"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}



                    <FormInput
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        type="email"
                        label="your Email"
                        icon={Envelope}
                        required
                    />


                    <motion.button
                        type="submit"
                        className="btn btn-primary w-100 py-3 mt-3 mb-3 rounded-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
                    </motion.button>

                    <div className="text-center">
                        <a href="/login" className="text-decoration-none text-888888">
                            Back to Login
                        </a>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
