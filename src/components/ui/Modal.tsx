import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-xl border-4 border-black shadow-brutal-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {title && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold font-sans">{title}</h2>
                    <button
                      onClick={onClose}
                      className="text-2xl font-bold hover:text-peach transition-colors"
                      aria-label="Close modal"
                    >
                      ×
                    </button>
                  </div>
                )}
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
