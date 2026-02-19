import { motion } from 'framer-motion';

interface SegmentedControlProps<T extends string> {
    options: { label: string; value: T; icon?: React.ReactNode }[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    layoutId?: string;
}

export const SegmentedControl = <T extends string>({
    options,
    value,
    onChange,
    className = '',
    layoutId = 'segmented-control-active'
}: SegmentedControlProps<T>) => {
    return (
        <div className={`p-1 bg-main neu-pressed rounded-lg flex items-center ${className}`}>
            {options.map((option) => {
                const isSelected = value === option.value;

                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`relative flex-1 px-4 py-2 text-sm font-medium transition-colors z-10 whitespace-nowrap ${isSelected ? 'text-primary' : 'text-secondary hover:text-primary'
                            }`}
                    >
                        {isSelected && (
                            <motion.div
                                layoutId={layoutId}
                                className="absolute inset-0 bg-surface shadow-sm rounded-lg border border-black/5 z-[-1]"
                                initial={false}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {option.label}
                            {option.icon && <span>{option.icon}</span>}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
