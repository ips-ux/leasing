import { useState } from 'react';
import { Button, Modal } from '../ui';
import { useInquiries } from '../../hooks/useInquiries';
import { useAuth } from '../../hooks/useAuth';
import { InquiryForm } from './InquiryForm';
import type { InquiryFormData } from '../../types/inquiry';

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewInquiryModal = ({ isOpen, onClose, onSuccess }: NewInquiryModalProps) => {
  const { user } = useAuth();
  const { addInquiry } = useInquiries();

  const [formData, setFormData] = useState<InquiryFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    unitNumber: '',
    notes: '',
    assignedTo: user?.uid || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);

    const success = await addInquiry(data);

    if (success) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        unitNumber: '',
        notes: '',
        assignedTo: user?.uid || '',
      });
      onSuccess?.();
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Inquiry">
      <div className="space-y-4">
        <InquiryForm
          initialData={formData}
          onSubmit={handleSubmit}
          onChange={setFormData}
          mode="new"
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting}
            onClick={() => document.getElementById('inquiry-form-submit')?.click()}
          >
            {isSubmitting ? 'Creating...' : 'Create Inquiry'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
