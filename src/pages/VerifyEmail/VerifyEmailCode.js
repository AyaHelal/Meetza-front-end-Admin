import { useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { LogoSection } from "../../components";
import "../Login/LoginForm.css";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailCode() {
    const [code, setCode] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputsRef = useRef([]);
    const navigate = useNavigate();

    const email = localStorage.getItem("userEmail");

    // Debug: Check what's in localStorage
    console.log("Email from localStorage:", email);
    console.log("All localStorage items:", { ...localStorage });

    // === handle inputs ===
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

    // === handle resend code ===
    const handleResend = async () => {
        try {
            setLoading(true);
            const res = await axios.post("https://meetza-backend.vercel.app/api/auth/forgot-password", { email });
            alert(res.data.message || "Verification code resent!");
        } catch (err) {
            console.error(err);
            alert("Error resending code");
        } finally {
            setLoading(false);
        }
    };

    // === handle verify code ===
    const handleVerify = async () => {
        const otp = code.join("");
        if (otp.length < 4) return alert("Please enter the 4-digit code");

        // Check if email exists
        if (!email) {
            alert("Email not found. Please try signing up again.");
            return;
        }

        try {
            setLoading(true);
            console.log("Sending verification request:", { email, code: otp });

            const res = await axios.post(
                "https://meetza-backend.vercel.app/api/auth/verify",
                { email, code: otp },
                { headers: { "Content-Type": "application/json" } }
            );


            console.log("Backend response:", res.data);

            if (res.data.success) {
                alert("Email verified successfully!");
                navigate("/login");
            } else {
                alert(res.data.message || "Invalid verification code");
            }
        } catch (err) {
            console.error("Verification error:", err);
            console.error("Error details:", err.response?.data);

            if (err.response?.status === 404) {
                alert("API endpoint not found. Please check the backend URL.");
            } else if (err.response?.status === 500) {
                alert("Server error. Please try again later.");
            } else if (err.code === 'NETWORK_ERROR') {
                alert("Network error. Please check your internet connection.");
            } else {
                alert(`Error verifying code: ${err.message}`);
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

            <div className="w-100 d-flex flex-column align-items-center text-center justify-content-center p-8 form-container">
                <motion.h2
                    className="fw-semibold mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Verify Email
                </motion.h2>

                <p className="text-888888 mb-4" style={{ maxWidth: 420, fontSize: "18px" }}>
                    {email ? (
                        <>We've sent a verification code to <b>{email}</b>. Please enter it below.</>
                    ) : (
                        <>No email found. Please <a href="/signup">sign up again</a>.</>
                    )}
                </p>

                <div className="d-flex gap-2 mb-3" onPaste={handlePaste}>
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

                <div className="mb-4 d-flex align-items-center gap-1">
                    <span>Didn't receive a code?</span>
                    <button type="button" className="btn btn-link p-0" onClick={handleResend} disabled={loading}>
                        Request again
                    </button>
                </div>

                <button
                    type="button"
                    className="btn btn-primary w-100 py-3 mt-1 mb-3 rounded-4"
                    style={{ maxWidth: 420 }}
                    onClick={handleVerify}
                    disabled={loading}
                >
                    {loading ? "Verifying..." : "Verify Email"}
                </button>
            </div>
        </motion.div>
    );
}
