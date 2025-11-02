import React from 'react';
import { motion } from 'framer-motion';

const SocialLoginButtons = ({
    socialProviders = [
        { name: 'Google', icon: '/assets/Google_icon.png', alt: 'Google' },
        { name: 'Facebook', icon: '/assets/Facebook_icon.png', alt: 'Facebook' },
        { name: 'Apple', icon: '/assets/Apple_icon.png', alt: 'Apple' }
    ],
    onProviderClick,
    className = "",
    buttonClassName = ""
}) => {
    return (
        <motion.div
            className={`d-flex gap-2 mt-2 justify-content-center ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            {socialProviders.map((provider, index) => (
                <motion.div
                    key={provider.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onProviderClick?.(provider.name)}
                    className={buttonClassName}
                >
                    <img
                        src={provider.icon}
                        alt={provider.alt}
                        style={{ transition: 'transform 0.2s ease' }}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default SocialLoginButtons;
