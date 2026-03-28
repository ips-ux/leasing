import type { ApplicantType } from '../../types/applicant';
import { Modal } from '../ui';
import { motion } from 'framer-motion';

interface ApplicantTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: ApplicantType) => void;
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

export const ApplicantTypeModal = ({
  isOpen,
  onClose,
  onSelectType,
}: ApplicantTypeModalProps) => {
  const handleSelect = (type: ApplicantType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Applicant Type">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TypeCard
          icon="🏠"
          title="New Resident"
          description="Begin the application process for a new prospective resident."
          onClick={() => handleSelect('new')}
        />
        <TypeCard
          icon="🔄"
          title="Transferring Resident"
          description="Start a transfer workflow for a current resident moving to a new unit."
          onClick={() => handleSelect('transfer')}
        />
      </div>
    </Modal>
  );
};
