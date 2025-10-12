# Components Structure

This directory contains reusable React components organized by category.

## Directory Structure

```
src/
├── components/
│   ├── common/           # Common UI components
│   │   ├── ToggleButton.js
│   │   ├── LogoSection.js
│   │   └── SocialLoginButtons.js
│   ├── forms/            # Form-related components
│   │   └── FormInput.js
│   └── index.js          # Component exports
├── hooks/                # Custom React hooks
│   ├── useFormValidation.js
│   ├── usePasswordVisibility.js
│   └── index.js
└── utils/                # Utility functions
    ├── validationRules.js
    └── index.js
```

## Components

### Common Components

- **ToggleButton**: A reusable toggle button group component
- **LogoSection**: Displays logo and wordmark with animations
- **SocialLoginButtons**: Social media login buttons with hover effects

### Form Components

- **FormInput**: A comprehensive form input component with validation, icons, and password toggle. Supports separate icons for the main input and toggle button.

## Custom Hooks

- **useFormValidation**: Handles form state, validation, and error management
- **usePasswordVisibility**: Manages password visibility toggle state

## Utilities

- **validationRules**: Predefined validation rules for common form fields

## Usage

```javascript
import {
  FormInput,
  ToggleButton,
  LogoSection,
  SocialLoginButtons,
} from "../components";
import { useFormValidation, usePasswordVisibility } from "../hooks";
import { loginValidationRules } from "../utils";
```
