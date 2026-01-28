/**
 * ConfirmationDialog Component
 * Generic confirmation modal for destructive actions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  cancelText?: string;
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  cancelText = 'Cancel',
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-neuro-element rounded-neuro-xl shadow-neuro-hover w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neuro-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-neuro-secondary hover:text-neuro-primary text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-neuro-secondary">{message}</p>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/20 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
