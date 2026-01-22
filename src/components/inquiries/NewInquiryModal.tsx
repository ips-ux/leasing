import { useState, useMemo } from 'react';
import { Button, Input, Select, Modal, Checkbox, Textarea } from '../ui';
import { useInquiries } from '../../hooks/useInquiries';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { extractFirstName } from '../../utils/user';
import type { InquiryFormData } from '../../types/inquiry';

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewInquiryModal = ({ isOpen, onClose, onSuccess }: NewInquiryModalProps) => {
  const { user } = useAuth();
  const { addInquiry } = useInquiries();
  const { users, loading: usersLoading } = useUsers();

  const [formData, setFormData] = useState<InquiryFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    unitNumber: '',
    notes: '',
    assignedTo: user?.uid || '',
  });

  const [isResident, setIsResident] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentOptions = useMemo(() => {
    return users.map((u) => ({
      label: u.displayName || extractFirstName(u.email),
      value: u.uid,
    }));
  }, [users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResidentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsResident(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, unitNumber: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await addInquiry(formData);

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
      setIsResident(true);
      onSuccess?.();
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Inquiry">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field with Resident checkbox, Priority, and Open/Closed toggle */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              label="Name"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Inquiry name or title"
            />
          </div>

          <Checkbox
            label="Resident?"
            name="isResident"
            checked={isResident}
            onChange={handleResidentToggle}
          />

          <div>
            <Select
              label="Priority"
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' }
              ]}
              value={formData.priority}
              onChange={(value) => setFormData((prev) => ({ ...prev, priority: value as any }))}
              required
            />
          </div>

          <div className="pt-3">
            <div className="flex p-1 rounded-neuro-md shadow-neuro-pressed bg-neuro-base w-fit">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'open' }))}
                className={`px-4 py-2 text-sm font-semibold rounded-neuro-sm transition-all ${formData.status === 'open'
                  ? 'bg-neuro-peach text-neuro-primary shadow-neuro-flat'
                  : 'text-neuro-secondary hover:text-neuro-primary'
                  }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'completed' }))}
                className={`px-4 py-2 text-sm font-semibold rounded-neuro-sm transition-all ${formData.status === 'completed'
                  ? 'bg-neuro-mint text-neuro-primary shadow-neuro-flat'
                  : 'text-neuro-secondary hover:text-neuro-primary'
                  }`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>

        {/* Unit field - only show if Resident is checked */}
        {isResident && (
          <Input
            label="Unit"
            name="unitNumber"
            type="text"
            value={formData.unitNumber || ''}
            onChange={handleChange}
            placeholder="e.g., 101"
          />
        )}

        <div>
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Detailed description of the inquiry"
            rows={4}
          />
        </div>

        <div>
          <Textarea
            label="Notes (Optional)"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Additional notes"
            rows={3}
          />
        </div>

        <Select
          label="Assigned To"
          options={agentOptions}
          value={formData.assignedTo}
          onChange={(value) => setFormData((prev) => ({ ...prev, assignedTo: value }))}
          placeholder={usersLoading ? 'Loading agents...' : 'Select Agent'}
          required
        />

        <div className="flex gap-3 justify-end pt-4 border-t-2 border-black/20">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Inquiry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
