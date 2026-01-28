/**
 * CompleteReservationModal Component
 * Mark reservation as complete with return notes
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reservation } from '../../types/scheduler';
import { Button, Textarea } from '../ui';

interface CompleteReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onComplete: (returnNotes: string) => Promise<void>;
}

export const CompleteReservationModal = ({
  isOpen,
  onClose,
  reservation,
  onComplete,
}: CompleteReservationModalProps) => {
  const [returnNotes, setReturnNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !reservation) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!returnNotes.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(returnNotes);
      setReturnNotes('');
      onClose();
    } catch (error) {
      console.error('Error completing reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-neuro-element rounded-neuro-xl shadow-neuro-hover w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neuro-primary">Complete Reservation</h2>
            <button
              onClick={onClose}
              className="text-neuro-secondary hover:text-neuro-primary text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Reservation Summary */}
              <div className="bg-white/20 rounded-neuro-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-neuro-secondary">Unit:</span>
                  <span className="text-sm font-semibold text-neuro-primary">
                    {reservation.rented_to}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-neuro-secondary">Item:</span>
                  <span className="text-sm font-semibold text-neuro-primary">
                    {reservation.item}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-neuro-secondary">Period:</span>
                  <span className="text-sm font-semibold text-neuro-primary">
                    {formatDateTime(reservation.start_time)} - {formatDateTime(reservation.end_time)}
                  </span>
                </div>
              </div>

              {/* Return Notes */}
              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Return Notes <span className="text-neuro-peach">*</span>
                </label>
                <Textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={4}
                  placeholder="Document the condition of returned items, any damages, missing items, etc."
                  required
                />
                <p className="text-xs text-neuro-secondary mt-1">
                  Please provide detailed notes about the return condition
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={!returnNotes.trim() || isSubmitting}
              >
                Mark as Complete
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
