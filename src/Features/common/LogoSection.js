import React from 'react';
import { motion } from 'framer-motion';
import BrandingLogo from '../../components/common/BrandingLogo';

const LogoSection = ({
    className = "",
    logoClassName = "",
    wordClassName = "",
    showSystemName = true
}) => {
    return (
        <motion.div
            className={`pt-5 pb-4 ${className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <BrandingLogo 
                className={logoClassName}
                showSystemName={showSystemName}
                systemNameClassName={` ${wordClassName}`}
                style={{ maxWidth: '120px', height: 'auto' }}
            />
        </motion.div>
    );
};

export default LogoSection;
