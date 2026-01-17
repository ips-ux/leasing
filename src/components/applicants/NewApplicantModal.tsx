import { useState, useMemo } from 'react';
import { Button, Input, DatePicker, Select, Modal } from '../ui';
import { useApplicants } from '../../hooks/useApplicants';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { extractFirstName } from '../../utils/user';
import type { ApplicantFormData } from '../../types/applicant';

interface NewApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewApplicantModal = ({ isOpen, onClose, onSuccess }: NewApplicantModalProps) => {
  const { user } = useAuth();
  const { createApplicant } = useApplicants();
  const { users, loading: usersLoading } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ApplicantFormData>({
    name: '',
    unit: '',
    dateApplied: new Date(),
    moveInDate: new Date(),
    concessionApplied: '',
    assignedTo: user?.uid || '',
  });

  const agentOptions = useMemo(() => {
    return users.map((u) => ({
      label: u.displayName || extractFirstName(u.email),
      value: u.uid,
    }));
  }, [users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string) => (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const id = await createApplicant(formData);
      if (id) {
        // Reset form
        setFormData({
          name: '',
          unit: '',
          dateApplied: new Date(),
          moveInDate: new Date(),
          concessionApplied: '',
          assignedTo: user?.uid || '',
        });
        onSuccess?.();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Applicant">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Applicant Name"
            name="name"
            type="text"
            placeholder="Applicant Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Unit Number"
            name="unit"
            type="text"
            placeholder="Unit Number"
            value={formData.unit}
            onChange={handleChange}
            required
          />

          <DatePicker
            label="Date Applied"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleDateChange('dateApplied')}
            required
          />

          <DatePicker
            label="Move-In Date"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleDateChange('moveInDate')}
            required
          />

          <Input
            label="Concession Applied"
            name="concessionApplied"
            type="text"
            placeholder="None, 1 month free, etc."
            value={formData.concessionApplied}
            onChange={handleChange}
          />

          <Select
            label="Assigned To"
            options={agentOptions}
            value={formData.assignedTo}
            onChange={handleSelectChange('assignedTo')}
            placeholder={usersLoading ? 'Loading agents...' : 'Select Agent'}
            required
          />
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Applicant'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
