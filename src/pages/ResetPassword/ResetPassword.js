import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { LogoSection } from "../../components";
import { usePasswordVisibility } from "../../hooks";
import { Eye, EyeSlash } from "phosphor-react";
import '../Login/LoginForm.css';

export default function ResetPassword() {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
    const { showPassword: showConfirmPassword, togglePasswordVisibility: toggleConfirmPasswordVisibility } = usePasswordVisibility();

    // Check if user is verified
    useEffect(() => {
        const isVerified = localStorage.getItem("resetVerified");
        const email = localStorage.getItem("resetEmail");

        if (!isVerified || !email) {
            navigate("/forgot-password");
        }
    }, [navigate]);

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!formData.newPassword.trim()) {
            setError("New password is required");
            return;
        }

        if (!formData.confirmPassword.trim()) {
            setError("Please confirm your password");
            return;
        }

        if (!validatePassword(formData.newPassword)) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const email = localStorage.getItem("resetEmail");
        if (!email) {
            setError("Email not found. Please start over.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("https://meetza-backend.vercel.app/api/auth/reset_password", {
                email: email,
                new_password: formData.newPassword,
                is_verifyed: "true"
            });

            setSuccess("Password reset successfully!");

            // Clear stored data
            localStorage.removeItem("resetEmail");
            localStorage.removeItem("resetVerified");

            // Redirect to login after success
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error("Reset password error:", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to reset password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row py-2">
                <motion.div
                    className="d-flex justify-content-center align-items-center"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <motion.div
                        className="align-items-center text-center"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <LogoSection />

                        <div className="justify-content-center p-8 form-container">
                            <motion.h2
                                className="fw-semibold"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Reset Password
                            </motion.h2>
                            <motion.span
                                className="text-888888"
                                style={{ fontSize: "20px" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                Enter your new password
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

                                <div className="form-group mt-4">
                                    <label htmlFor="newPassword" className="form-label text-start d-block mb-2">
                                        New Password
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="newPassword"
                                            name="newPassword"
                                            className="form-control"
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                            onClick={togglePasswordVisibility}
                                            style={{ zIndex: 10 }}
                                        >
                                            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group mt-3">
                                    <label htmlFor="confirmPassword" className="form-label text-start d-block mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            className="form-control"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                            onClick={toggleConfirmPasswordVisibility}
                                            style={{ zIndex: 10 }}
                                        >
                                            {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3 mt-3 mb-3 rounded-4"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </motion.button>

                                <div className="text-center">
                                    <a href="/login" className="text-decoration-none text-888888">
                                        Back to Login
                                    </a>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>


            </div>
        </div>
    );
}