import { useState } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateField = (name, value) => {
        const rule = validationRules[name];
        if (!rule) return "";

        if (rule.required && (!value || value.trim() === "")) {
            return rule.requiredMessage || `${name} is required`;
        }

        if (rule.pattern && value && !rule.pattern.test(value)) {
            return rule.patternMessage || `Invalid ${name} format`;
        }

        if (rule.minLength && value && value.length < rule.minLength) {
            return rule.minLengthMessage || `${name} must be at least ${rule.minLength} characters`;
        }

        // Custom validation (e.g., password confirmation)
        if (rule.customValidation && value) {
            const customError = rule.customValidation(value, formData);
            if (customError) {
                return customError;
            }
        }

        return "";
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Mark all fields as touched when validating
        const allFieldsTouched = {};
        Object.keys(validationRules).forEach(fieldName => {
            allFieldsTouched[fieldName] = true;
        });
        setTouched(allFieldsTouched);

        Object.keys(validationRules).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const resetForm = () => {
        setFormData(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        formData,
        errors,
        touched,
        handleChange,
        validateForm,
        resetForm,
        setFormData
    };
};
