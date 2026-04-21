import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import { motion } from 'framer-motion';

const ToggleButton = ({
    options = [],
    activeOption,
    onOptionChange,
    className = "",
    buttonClassName = "",
    ...props
}) => {
    return (
        <ButtonGroup className={`custom-button-group ${className}`} role="group" {...props}>
            {options.map((option) => (
                <Button
                    key={option.value}
                    onClick={() => onOptionChange(option.value)}
                    className={`${activeOption === option.value ? "btn-active" : ""} ${buttonClassName}`}
                    as={motion.button}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                >
                    {option.label}
                </Button>
            ))}
        </ButtonGroup>
    );
};

export default ToggleButton;
