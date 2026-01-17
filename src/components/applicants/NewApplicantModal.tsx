import { useState, useMemo } from 'react';
import { Button, Input, DatePicker, Select, Modal, Checkbox } from '../ui';
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
    isTransfer: false,
    isConcession: false,
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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
          isTransfer: false,
          isConcession: false,
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
          {/* Primary Name and Unit Number in line */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primary Name"
              name="name"
              type="text"
              placeholder="Primary Name"
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
          </div>

          {/* Date Applied and Move-In Date in line */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Transfer and Concession checkboxes in line */}
          <div className="grid grid-cols-2 gap-4 overflow-hidden">
            <div className="overflow-hidden">
              <Checkbox
                label="Transfer?"
                name="isTransfer"
                checked={formData.isTransfer}
                onChange={handleCheckboxChange}
              />
            </div>

            <div className="overflow-hidden">
              <Checkbox
                label="Concession?"
                name="isConcession"
                checked={formData.isConcession}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>

          {/* Concession field - only show if checkbox is checked */}
          <div className={formData.isConcession ? 'block' : 'hidden'}>
            <Input
              label="Concession Applied"
              name="concessionApplied"
              type="text"
              placeholder="e.g., 6 weeks + $250, 1 month free, etc."
              value={formData.concessionApplied}
              onChange={handleChange}
              required={formData.isConcession}
            />
          </div>

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
