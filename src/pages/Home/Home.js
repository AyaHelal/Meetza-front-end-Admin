import React from 'react';
import { motion } from 'framer-motion';
import { LogoSection } from '../../components';

export default function Home() {
    return (
        <motion.div
            className="container-fluid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="row py-2">
                <motion.div
                    className="col-12 d-flex justify-content-center align-items-center min-vh-100"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="text-center">
                        <LogoSection />

                        <motion.h1
                            className="fw-bold mt-4 mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            Welcome Home
                        </motion.h1>

                        <motion.p
                            className="text-888888 mb-4"
                            style={{ fontSize: "18px" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            You have successfully logged in to your account
                        </motion.p>

                        <motion.div
                            className="mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <button
                                className="btn btn-outline-primary me-3"
                                onClick={() => {
                                    localStorage.removeItem('authToken');
                                    window.location.href = '/login';
                                }}
                            >
                                Logout
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
