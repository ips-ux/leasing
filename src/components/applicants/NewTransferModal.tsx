import { useState, useMemo } from 'react';
import { Button, Input, DatePicker, Select, Checkbox, Modal } from '../ui';
import { useApplicants } from '../../hooks/useApplicants';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { extractAgentName } from '../../utils/user';
import type { TransferFormData } from '../../types/applicant';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewTransferModal = ({ isOpen, onClose, onSuccess }: NewTransferModalProps) => {
  const { user } = useAuth();
  const { createTransferApplicant } = useApplicants();
  const { users, loading: usersLoading } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<TransferFormData>({
    name: '',
    unit: '',
    moveInDate: new Date(),
    leaseEndDate: new Date(),
    requestedTransferDate: new Date(),
    transferringApartment: '',
    isConcession: false,
    concessionApplied: '',
    assignedTo: user?.uid || '',
  });

  const agentOptions = useMemo(() => {
    return users.map((u) => ({
      label: u.Agent_Name || extractAgentName(u.email),
      value: u.uid,
    }));
  }, [users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: string) => (date: Date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const id = await createTransferApplicant(formData);
      if (id) {
        setFormData({
          name: '',
          unit: '',
          moveInDate: new Date(),
          leaseEndDate: new Date(),
          requestedTransferDate: new Date(),
          transferringApartment: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title="New Transfer">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Resident Name and New Unit */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Resident Name"
              name="name"
              type="text"
              placeholder="Resident Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="New Unit Number"
              name="unit"
              type="text"
              placeholder="Transferring TO"
              value={formData.unit}
              onChange={handleChange}
              required
            />
          </div>

          {/* Transferring From */}
          <Input
            label="Transferring From (Apartment #)"
            name="transferringApartment"
            type="text"
            placeholder="Current apartment number"
            value={formData.transferringApartment}
            onChange={handleChange}
            required
          />

          {/* Transfer Dates */}
          <div className="grid grid-cols-3 gap-4">
            <DatePicker
              label="Lease End Date"
              name="leaseEndDate"
              value={formData.leaseEndDate}
              onChange={handleDateChange('leaseEndDate')}
              required
            />
            <DatePicker
              label="Requested Transfer Date"
              name="requestedTransferDate"
              value={formData.requestedTransferDate}
              onChange={handleDateChange('requestedTransferDate')}
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

          {/* Concession */}
          <div className="overflow-hidden">
            <Checkbox
              label="Concession?"
              name="isConcession"
              checked={formData.isConcession}
              onChange={handleCheckboxChange}
            />
          </div>

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
            {isSubmitting ? 'Creating...' : 'Create Transfer'}
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
