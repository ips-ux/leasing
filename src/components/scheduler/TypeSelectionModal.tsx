/**
 * TypeSelectionModal Component
 * Three-card selection for reservation type
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { ResourceType } from '../../types/scheduler';

interface TypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: ResourceType) => void;
}

interface TypeCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

const TypeCard = ({ icon, title, description, onClick }: TypeCardProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-6 rounded-neuro-xl bg-neuro-element shadow-neuro-flat hover:shadow-neuro-hover transition-all duration-300 text-left w-full"
  >
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-neuro-primary mb-2">{title}</h3>
    <p className="text-sm text-neuro-secondary">{description}</p>
  </motion.button>
);

export const TypeSelectionModal = ({
  isOpen,
  onClose,
  onSelectType,
}: TypeSelectionModalProps) => {
  if (!isOpen) return null;

  const handleSelectType = (type: ResourceType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-neuro-element rounded-neuro-xl shadow-neuro-hover w-full max-w-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neuro-primary">Select Reservation Type</h2>
            <button
              onClick={onClose}
              className="text-neuro-secondary hover:text-neuro-primary text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TypeCard
                icon="🏠"
                title="Guest Suite"
                description="Book a suite for your guests. 2-night minimum."
                onClick={() => handleSelectType('GUEST_SUITE')}
              />
              <TypeCard
                icon="🌆"
                title="Sky Lounge"
                description="Reserve the lounge for events. 4-hour limit."
                onClick={() => handleSelectType('SKY_LOUNGE')}
              />
              <TypeCard
                icon="🎿"
                title="Gear Shed"
                description="Borrow kayaks, bikes, and more."
                onClick={() => handleSelectType('GEAR_SHED')}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
