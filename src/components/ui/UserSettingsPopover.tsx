import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface UserSettingsPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    onChangePassword: () => void;
    anchorRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
}

export const UserSettingsPopover = ({
    isOpen,
    onClose,
    onChangePassword,
    anchorRef
}: UserSettingsPopoverProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={popoverRef}
                    className="absolute bottom-full mb-3 left-0 z-50"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                        minWidth: '200px'
                    }}
                >
                    {/* Main popover content */}
                    <div
                        className="backdrop-blur-xl rounded-neuro-lg shadow-neuro-raised overflow-hidden"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)'
                        }}
                    >
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    onChangePassword();
                                    onClose();
                                }}
                                className="w-full text-left px-4 py-3 rounded-neuro-md text-neuro-primary font-medium hover:bg-neuro-lavender/20 transition-all duration-200"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>

                    {/* Comic-style speech bubble tail */}
                    <svg
                        className="absolute -bottom-2 left-8"
                        width="20"
                        height="12"
                        viewBox="0 0 20 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 12L0 0H20L10 12Z"
                            fill="rgba(255, 255, 255, 0.95)"
                            style={{
                                filter: 'drop-shadow(-1px -1px 1px rgba(255, 255, 255, 0.6)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.1))'
                            }}
                        />
                    </svg>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
