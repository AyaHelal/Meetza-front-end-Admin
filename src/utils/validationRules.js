export const emailValidation = {
    required: true,
    requiredMessage: "Email is required",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: "Please enter a valid email"
};

export const passwordValidation = {
    required: true,
    requiredMessage: "Password is required",
    minLength: 8,
    minLengthMessage: "Password must be at least 8 characters"
};

export const nameValidation = {
    required: true,
    requiredMessage: "Name is required",
    minLength: 3,
    minLengthMessage: "Name must be at least 3 characters"
};

export const confirmPasswordValidation = {
    required: true,
    requiredMessage: "Please confirm your password",
    customValidation: (value, allValues) => {
        if (value !== allValues.password) {
            return "Passwords do not match";
        }
        return "";
    }
};

export const loginValidationRules = {
    email: emailValidation,
    password: passwordValidation
};

export const signupValidationRules = {
    name: nameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation
};
