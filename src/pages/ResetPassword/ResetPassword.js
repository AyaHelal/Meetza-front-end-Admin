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
                    className="col-md d-none d-md-flex justify-content-center align-items-center"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {/* Add image component here if needed */}
                </motion.div>
            </div>
        </div>
    );
}
