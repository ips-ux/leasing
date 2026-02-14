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

    return (
        <div
            className={`relative flex items-center neu-pressed p-1 cursor-pointer select-none overflow-hidden ${className}`}
            onClick={() => onChange(!value)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            style={{ width: 'fit-content' }}
        >
            {/* Animated Background Pill */}
            <motion.div
                className="absolute bg-surface shadow-sm rounded-lg border border-black/5 z-0"
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
                    width: 'calc(50% - 4px)',
                    top: '4px',
                    bottom: '4px',
                    left: '4px',
                }}
            />

            {/* Labels */}
            <div className="relative z-10 flex w-full">
                <div
                    className={`flex items-center justify-center gap-2 px-6 py-2 font-medium text-sm transition-colors duration-200 ${value ? 'text-primary' : 'text-secondary'
                        }`}
                >
                    {leftIcon && <span className="w-4 h-4 flex items-center justify-center">{leftIcon}</span>}
                    {leftLabel}
                </div>
                <div
                    className={`flex items-center justify-center gap-2 px-6 py-2 font-medium text-sm transition-colors duration-200 ${!value ? 'text-primary' : 'text-secondary'
                        }`}
                >
                    {rightIcon && <span className="w-4 h-4 flex items-center justify-center">{rightIcon}</span>}
                    {rightLabel}
                </div>
            </div>
        </div>
    );
};
