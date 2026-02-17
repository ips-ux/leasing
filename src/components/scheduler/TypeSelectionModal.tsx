import type { ResourceType } from '../../types/scheduler';
import { Modal } from '../ui';
import { motion } from 'framer-motion';

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
  const handleSelectType = (type: ResourceType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Reservation Type"
    >
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
    </Modal>
  );
};
