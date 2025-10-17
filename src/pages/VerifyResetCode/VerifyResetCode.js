import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { LogoSection } from "../../components";
import '../Login/LoginForm.css';

export default function VerifyResetCode() {
    const [code, setCode] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputsRef = useRef([]);
    const navigate = useNavigate();

    // Get email from localStorage
    const email = localStorage.getItem("resetEmail");

    const handleChange = (index, value) => {
        const digit = value.replace(/[^0-9]/g, "").slice(0, 1);
        const nextCode = [...code];
        nextCode[index] = digit;
        setCode(nextCode);

        if (digit && index < inputsRef.current.length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (!pasted) return;
        const next = ["", "", "", ""];
        for (let i = 0; i < Math.min(4, pasted.length); i++) {
            next[i] = pasted[i];
        }
        setCode(next);
        inputsRef.current[Math.min(pasted.length, 3)]?.focus();
    };

    const handleResend = async () => {
        if (!email) {
            setError("Email not found. Please start over.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await axios.post("https://meetza-backend.vercel.app/api/auth/forgot-password", {
                email: email
            });
            alert("Verification code resent to your email.");
        } catch (error) {
            console.error("Resend error:", error);
            setError("Failed to resend code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const otp = code.join("");
        if (otp.length < 4) {
            setError("Please enter the complete 4-digit code");
            return;
        }

        if (!email) {
            setError("Email not found. Please start over.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await axios.post("https://meetza-backend.vercel.app/api/auth/verify-reset-code", {
                email: email,
                code: otp
            });

            if (response.data.success) {
                // Store verification success for next page
                localStorage.setItem("resetVerified", "true");
                navigate("/reset-password");
            } else {
                setError(response.data.message || "Invalid or expired code");
            }
        } catch (error) {
            console.error("Verify code error:", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Invalid or expired code");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row py-2">
                <motion.div
                    className="col-md-6 d-flex justify-content-center align-items-center"
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

                        <div className="justify-content-center p-8">
                            <motion.h2
                                className="fw-semibold"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Verify Reset Code
                            </motion.h2>
                            <motion.span
                                className="text-888888"
                                style={{ fontSize: "20px" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                Enter the 4-digit code sent to {email}
                            </motion.span>

                            <form className="form" onSubmit={(e) => { e.preventDefault(); handleVerify(); }} noValidate>
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

                                <div className="d-flex gap-2 mb-3 mt-4 justify-content-center" onPaste={handlePaste}>
                                    {code.map((value, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            inputMode="numeric"
                                            className="form-control text-center"
                                            style={{ width: 56, height: 56, fontSize: 24 }}
                                            maxLength={1}
                                            value={value}
                                            onChange={(e) => handleChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            ref={(el) => (inputsRef.current[idx] = el)}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                <div className="mb-4 d-flex align-items-center justify-content-center gap-1">
                                    <span>Didn't receive a code?</span>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0"
                                        onClick={handleResend}
                                        disabled={loading}
                                    >
                                        Request again
                                    </button>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3 mt-1 mb-3 rounded-4"
                                    style={{ maxWidth: 420 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify Code"}
                                </motion.button>

                                <div className="text-center">
                                    <a href="/forgot-password" className="text-decoration-none text-888888">
                                        Back to Forgot Password
                                    </a>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="col-md-6 d-none d-md-flex justify-content-center align-items-center"
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
