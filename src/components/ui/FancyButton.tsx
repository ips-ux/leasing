import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FancyButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
}

export const FancyButton = ({
    children,
    onClick,
    className = '',
    isActive = false
}: FancyButtonProps) => {
    return (
        <motion.button
            onClick={onClick}
            className={`relative rounded-full transition-all duration-200 ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                boxShadow: isActive
                    ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
                    : '-1px -1px 2px rgba(255, 255, 255, 0.6), 1px 1px 2px rgba(0, 0, 0, 0.1)'
            }}
        >
            {children}
        </motion.button>
    );
};
