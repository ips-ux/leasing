import { motion } from 'framer-motion';
import { useState } from 'react';

interface ToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    leftLabel?: string;
    rightLabel?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}

export const Toggle = ({
    value,
    onChange,
    leftLabel,
    rightLabel,
    leftIcon,
    rightIcon,
    className = ''
}: ToggleProps) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleToggle = () => {
        onChange(!value);
    };

    return (
        <div
            className={`relative flex items-center bg-neuro-base rounded-neuro-md shadow-neuro-pressed p-1 cursor-pointer select-none overflow-hidden ${className}`}
            onClick={handleToggle}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            style={{ width: 'fit-content' }}
        >
            {/* Animated Background Pill */}
            <motion.div
                className="absolute top-1 bottom-1 bg-neuro-lavender rounded-neuro-sm shadow-neuro-flat z-0"
                initial={false}
                animate={{
                    x: value ? '0%' : '100%',
                    scaleX: isPressed ? 0.95 : 1,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                }}
                style={{
                    width: 'calc(50% - 4px)', // Account for padding
                    left: '4px', // Initial offset
                    transformOrigin: value ? 'left center' : 'right center'
                }}
            />

            {/* Labels */}
            <div className="relative z-10 flex w-full">
                <div
                    className={`flex items-center justify-center gap-2 px-6 py-2 font-bold text-sm transition-colors duration-200 ${value ? 'text-neuro-primary' : 'text-neuro-secondary'
                        }`}
                >
                    {leftIcon && <span className="w-4 h-4">{leftIcon}</span>}
                    {leftLabel}
                </div>
                <div
                    className={`flex items-center justify-center gap-2 px-6 py-2 font-bold text-sm transition-colors duration-200 ${!value ? 'text-neuro-primary' : 'text-neuro-secondary'
                        }`}
                >
                    {rightIcon && <span className="w-4 h-4">{rightIcon}</span>}
                    {rightLabel}
                </div>
            </div>
        </div>
    );
};
