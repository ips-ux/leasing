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
            className="fixed inset-0 z-[9998]"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              className="neu-flat bg-surface/95 backdrop-blur-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {title && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">{title}</h2>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full hover:bg-black/5 transition-colors flex items-center justify-center text-secondary hover:text-primary text-xl"
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
