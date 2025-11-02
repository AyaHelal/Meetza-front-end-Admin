import React from 'react';
import { motion } from 'framer-motion';

const FormInput = ({
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    label,
    error,
    touched,
    icon: Icon,
    toggleIcon: ToggleIcon,
    showPasswordToggle = false,
    onTogglePassword,
    showPassword = false,
    onKeyPress,
    className = "",
    inputClassName = "",
    ...props
}) => {
    const hasError = error && touched;

    return (
        <div className={`mt-3 ${className}`}>
            <div className={`d-flex gx-2 w-100 border ${hasError ? 'border-danger' : 'border-2'} py-1 px-4 rounded-4 align-items-center`}>
                {Icon && (
                    <div>
                        <Icon size={32} color="#888" weight="bold" className="me-2" />
                    </div>
                )}

                <div className="text-start w-100">
                    {label && (
                        <label className="text-888888" style={{ fontSize: "12px", paddingLeft: "12px" }}>
                            {label}
                        </label>
                    )}
                    <input
                        name={name}
                        value={value}
                        onChange={onChange}
                        onKeyPress={onKeyPress}
                        placeholder={placeholder}
                        type={type}
                        className={`form-control border-0 shadow-none ${inputClassName}`}
                        style={{ width: "100%", paddingTop: "0", paddingBottom: "0" }}
                        autoComplete={type === "password" ? "current-password" : "off"}
                        {...props}
                    />
                </div>

                {showPasswordToggle && ToggleIcon && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="btn btn-link p-0 border-0"
                        style={{ minWidth: "auto" }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ToggleIcon size={24} color="#888" weight="bold" />
                        </motion.div>
                    </button>
                )}
            </div>

            {hasError && (
                <motion.div
                    className="text-danger text-start mt-1"
                    style={{ fontSize: "12px", paddingLeft: "12px" }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
};

export default FormInput;
