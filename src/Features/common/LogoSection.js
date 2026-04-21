import React from 'react';
import { motion } from 'framer-motion';

const LogoSection = ({
    logoPath = "/assets/MeetzaLogo.png",
    wordPath = "/assets/MeetzaWord.png",
    logoAlt = "Logo picture",
    wordAlt = "Logo picture",
    className = "",
    logoClassName = "",
    wordClassName = ""
}) => {
    return (
        <motion.div
            className={`pt-5 pb-4 ${className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <img
                src={logoPath}
                alt={logoAlt}
                className={logoClassName}
            />
            <img
                src={wordPath}
                alt={wordAlt}
                className={wordClassName}
            />
        </motion.div>
    );
};

export default LogoSection;
