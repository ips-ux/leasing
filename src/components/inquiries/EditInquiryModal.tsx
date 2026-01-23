import { useState, useEffect } from 'react';
import { Button, Modal } from '../ui';
import { useInquiries } from '../../hooks/useInquiries';
import { InquiryForm } from './InquiryForm';
import type { Inquiry, InquiryFormData } from '../../types/inquiry';

interface EditInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onSuccess?: () => void;
}

export const EditInquiryModal = ({ isOpen, onClose, inquiry, onSuccess }: EditInquiryModalProps) => {
  const { updateInquiry, deleteInquiry } = useInquiries();
  const [formData, setFormData] = useState<InquiryFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    unitNumber: '',
    notes: '',
    assignedTo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      setHasChanges(false);
    }
  }, [inquiry]);

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  const handleSave = async (data?: InquiryFormData) => {
    if (!inquiry) return;
    setIsSubmitting(true);

    const success = await updateInquiry(inquiry.id, data || formData);

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
          <InquiryForm
            initialData={formData}
            onSubmit={handleSave}
            onChange={(data) => {
              setFormData(data);
              setHasChanges(true);
            }}
            mode="edit"
          />

          <div className="flex justify-between items-center gap-2 pt-4">
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
                onClick={() => document.getElementById('inquiry-form-submit')?.click()}
                disabled={isSubmitting}
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
