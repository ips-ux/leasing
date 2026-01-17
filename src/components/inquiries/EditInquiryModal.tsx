import { useState, useMemo, useEffect } from 'react';
import { Button, Input, Select, Modal } from '../ui';
import { useInquiries } from '../../hooks/useInquiries';
import { useUsers } from '../../hooks/useUsers';
import { extractFirstName } from '../../utils/user';
import type { Inquiry, InquiryPriority, InquiryStatus } from '../../types/inquiry';

interface EditInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onSuccess?: () => void;
}

export const EditInquiryModal = ({ isOpen, onClose, inquiry, onSuccess }: EditInquiryModalProps) => {
  const { updateInquiry, deleteInquiry } = useInquiries();
  const { users, loading: usersLoading } = useUsers();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as InquiryPriority,
    status: 'open' as InquiryStatus,
    unitNumber: '',
    notes: '',
    assignedTo: '',
  });

  const [isResident, setIsResident] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const agentOptions = useMemo(() => {
    return users.map((u) => ({
      label: u.displayName || extractFirstName(u.email),
      value: u.uid,
    }));
  }, [users]);

  // Initialize form data when inquiry changes
  useEffect(() => {
    if (inquiry) {
      setFormData({
        title: inquiry.title,
        description: inquiry.description,
        priority: inquiry.priority,
        status: inquiry.status,
        unitNumber: inquiry.unitNumber || '',
        notes: inquiry.notes || '',
        assignedTo: inquiry.assignedTo || '',
      });
      setIsResident(!!inquiry.unitNumber);
      setHasChanges(false);
    }
  }, [inquiry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleStatusChange = (status: InquiryStatus) => {
    setFormData((prev) => ({ ...prev, status }));
    setHasChanges(true);
  };

  const handleResidentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsResident(checked);
    setHasChanges(true);
    if (!checked) {
      setFormData((prev) => ({ ...prev, unitNumber: '' }));
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!inquiry) return;
    setIsSubmitting(true);

    const success = await updateInquiry(inquiry.id, formData);

    if (success) {
      setHasChanges(false);
      onSuccess?.();
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!inquiry) return;

    const success = await deleteInquiry(inquiry.id);

    if (success) {
      setShowDeleteModal(false);
      onSuccess?.();
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    setHasChanges(false);
    onClose();
  };

  if (!inquiry) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Inquiry">
        <div className="space-y-4">
          {/* Name field with Resident checkbox, Priority, and Status toggle */}
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

            <label className="flex items-center gap-2 py-3 px-4 border-[3px] border-black bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={isResident}
                onChange={handleResidentToggle}
                className="w-5 h-5 border-2 border-black"
              />
              <span className="text-sm font-semibold whitespace-nowrap">Resident?</span>
            </label>

            <div>
              <label className="block text-sm font-semibold mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans focus:outline-none focus:ring-4 focus:ring-lavender/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="pt-3">
              <div className="flex border-[3px] border-black bg-white/10">
                <button
                  type="button"
                  onClick={() => handleStatusChange('open')}
                  className={`px-4 py-3 text-sm font-semibold transition-colors ${
                    formData.status === 'open'
                      ? 'bg-peach text-black'
                      : 'bg-white/10 text-black/60 hover:bg-white/20'
                  }`}
                >
                  Open
                </button>
                <div className="w-[3px] bg-black" />
                <button
                  type="button"
                  onClick={() => handleStatusChange('in_progress')}
                  className={`px-4 py-3 text-sm font-semibold transition-colors ${
                    formData.status === 'in_progress'
                      ? 'bg-lavender text-black'
                      : 'bg-white/10 text-black/60 hover:bg-white/20'
                  }`}
                >
                  In Progress
                </button>
                <div className="w-[3px] bg-black" />
                <button
                  type="button"
                  onClick={() => handleStatusChange('completed')}
                  className={`px-4 py-3 text-sm font-semibold transition-colors ${
                    formData.status === 'completed'
                      ? 'bg-mint text-black'
                      : 'bg-white/10 text-black/60 hover:bg-white/20'
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
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Detailed description of the inquiry"
              className="w-full p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans resize-none focus:outline-none focus:ring-4 focus:ring-lavender/40"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Additional notes"
              className="w-full p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans resize-none focus:outline-none focus:ring-4 focus:ring-lavender/40"
              rows={3}
            />
          </div>

          <Select
            label="Assigned To"
            options={agentOptions}
            value={formData.assignedTo}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, assignedTo: value }));
              setHasChanges(true);
            }}
            placeholder={usersLoading ? 'Loading agents...' : 'Select Agent'}
            required
          />

          <div className="flex justify-between items-center gap-2 pt-4 border-t-2 border-black/20">
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="!text-sm !px-4 !py-2"
            >
              Delete
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={isSubmitting || !hasChanges}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Unsaved Changes Modal */}
      <Modal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        title="Unsaved Changes"
      >
        <div className="space-y-4">
          <p className="text-base">
            You have unsaved changes. Do you want to save them before closing?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleDiscardChanges}>
              Discard Changes
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                await handleSave();
                setShowUnsavedModal(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Inquiry?"
      >
        <div className="space-y-4">
          <p className="text-base">
            Are you sure you want to delete this inquiry? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
