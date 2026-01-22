import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export const Select = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    required = false,
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2" ref={containerRef}>
            <label className="block text-sm font-medium text-neuro-primary">
                {label} {required && <span className="text-neuro-peach">*</span>}
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full text-left px-4 py-2 rounded-neuro-md shadow-neuro-pressed bg-white/50 font-sans text-neuro-primary focus:outline-none transition-all duration-200 flex justify-between items-center min-h-[48px]`}
                    style={{
                        boxShadow: isOpen ? 'inset -2px -2px 4px rgba(255, 255, 255, 0.5), inset 2px 2px 4px rgba(0, 0, 0, 0.1)' : undefined
                    }}
                    onFocus={(e) => {
                        if (!isOpen) {
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 197, 249, 0.3)';
                        }
                    }}
                    onBlur={(e) => {
                        if (!isOpen) {
                            e.currentTarget.style.boxShadow = '';
                        }
                    }}
                >
                    <span className={`truncate ${!selectedOption ? 'text-neuro-muted' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <svg
                            style={{ width: '20px', height: '20px' }}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-neuro-element rounded-neuro-md shadow-neuro-raised overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-neuro-lavender/30 transition-colors font-medium text-neuro-primary border-b border-neuro-base/20 last:border-b-0 ${value === option.value ? 'bg-neuro-lavender/20' : ''
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
