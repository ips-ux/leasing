import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Input, Modal, Select, Checkbox, Textarea, Toggle } from '../components/ui';
import { useInquiry } from '../hooks/useInquiry';
import { useInquiries } from '../hooks/useInquiries';
import { useUsers } from '../hooks/useUsers';
import { extractAgentName } from '../utils/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard as faClipboardRegular } from '@fortawesome/free-regular-svg-icons';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import type { InquiryPriority, InquiryStatus } from '../types/inquiry';
import type { Timestamp } from 'firebase/firestore';

const formatDate = (timestamp: Timestamp | null): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getPriorityBadge = (priority: InquiryPriority): 'high' | 'medium' | 'low' => {
  return priority;
};

const getStatusBadge = (status: InquiryStatus): 'high' | 'medium' | 'low' | 'success' | 'info' => {
  const variants: Record<InquiryStatus, 'high' | 'medium' | 'low' | 'success' | 'info'> = {
    open: 'high',
    in_progress: 'info',
    completed: 'success',
  };
  return variants[status];
};

export const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inquiry, loading, error } = useInquiry(id);
  const { updateInquiry, deleteInquiry } = useInquiries();
  const { users, loading: usersLoading } = useUsers();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isResident, setIsResident] = useState(false);

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: 'medium' as InquiryPriority,
    status: 'open' as InquiryStatus,
    unitNumber: '',
    notes: '',
    assignedTo: '',
  });

  const agentOptions = useMemo(() => {
    return users.map((u) => ({
      label: u.Agent_Name || extractAgentName(u.email),
      value: u.uid,
    }));
  }, [users]);

  const initEditData = () => {
    if (!inquiry) return;
    setEditData({
      title: inquiry.title,
      description: inquiry.description,
      priority: inquiry.priority,
      status: inquiry.status,
      unitNumber: inquiry.unitNumber || '',
      notes: inquiry.notes || '',
      assignedTo: inquiry.assignedTo || '',
    });
    // Initialize isResident based on whether unit number exists
    setIsResident(!!inquiry.unitNumber);
  };

  const handleEditClick = () => {
    initEditData();
    setIsEditing(true);
  };

  const handleResidentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsResident(checked);
    if (!checked) {
      // Clear unit when unchecked
      setEditData((prev) => ({ ...prev, unitNumber: '' }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!inquiry) return;

    const success = await updateInquiry(inquiry.id, editData);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!inquiry) return;

    const success = await deleteInquiry(inquiry.id);

    if (success) {
      navigate('/inquiries');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-white/20 animate-pulse" />
          <div className="h-10 w-32 bg-white/20 animate-pulse" />
        </div>
        <div className="h-96 bg-white/10 border-[3px] border-black/20 animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error || !inquiry) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/inquiries')}>
          ← Back to Inquiries
        </Button>
        <Card priority="high">
          <div className="text-center py-8">
            <p className="font-bold text-xl mb-2">Error Loading Inquiry</p>
            <p className="text-black/60 font-mono">{error || 'Inquiry not found'}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isEditing ? editData.title : inquiry.title}
          </motion.h1>
          <motion.div
            className="flex items-center gap-3 flex-wrap"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Badge variant={getStatusBadge(inquiry.status)}>
              {inquiry.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant={getPriorityBadge(inquiry.priority)}>
              {inquiry.priority.toUpperCase()} PRIORITY
            </Badge>
          </motion.div>
        </div>

        <Button variant="secondary" onClick={() => navigate('/inquiries')}>
          ← Back to List
        </Button>
      </div>

      {/* Inquiry Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              {/* Name field with Resident checkbox, Priority, and Status toggle */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Input
                    label="Name"
                    name="title"
                    type="text"
                    value={editData.title}
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
                    value={editData.priority}
                    onChange={(value) => setEditData((prev) => ({ ...prev, priority: value as any }))}
                    required
                  />
                </div>

                <div className="pb-3">
                  <Toggle
                    value={editData.status !== 'completed'}
                    onChange={(val) => setEditData((prev) => ({ ...prev, status: val ? 'open' : 'completed' }))}
                    leftIcon={<FontAwesomeIcon icon={faClipboardRegular} />}
                    rightIcon={<FontAwesomeIcon icon={faClipboardCheck} />}
                  />
                </div>
              </div>

              {/* Unit field - only show if Resident is checked */}
              {isResident && (
                <Input
                  label="Unit"
                  name="unitNumber"
                  type="text"
                  value={editData.unitNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g., 101"
                />
              )}

              <div>
                <Textarea
                  label="Description"
                  name="description"
                  value={editData.description}
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
                  value={editData.notes || ''}
                  onChange={handleChange}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>

              <Select
                label="Assigned To"
                options={agentOptions}
                value={editData.assignedTo}
                onChange={(value) => setEditData((prev) => ({ ...prev, assignedTo: value }))}
                placeholder={usersLoading ? 'Loading agents...' : 'Select Agent'}
                required
              />
            </div>
          ) : (
            // View Mode
            <>
              <div className="mb-4">
                <p className="text-xs font-mono text-black/50 uppercase mb-1">Description</p>
                <p className="text-base">{inquiry.description}</p>
              </div>

              {inquiry.unitNumber && (
                <div className="mb-4 pb-4 border-b-2 border-black/20">
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Unit</p>
                  <p className="text-base">Unit {inquiry.unitNumber}</p>
                </div>
              )}

              {inquiry.notes && (
                <div className="mb-4 pb-4 border-b-2 border-black/20">
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Notes</p>
                  <p className="text-base whitespace-pre-wrap">{inquiry.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Created</p>
                  <p className="font-semibold text-sm">{formatDate(inquiry.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Last Updated</p>
                  <p className="font-semibold text-sm">{formatDate(inquiry.updatedAt)}</p>
                </div>
                {inquiry.completedAt && (
                  <div>
                    <p className="text-xs font-mono text-black/50 uppercase mb-1">Completed</p>
                    <p className="font-semibold text-sm">{formatDate(inquiry.completedAt)}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-2 mt-6 pt-4 border-t-2 border-black/20">
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="secondary" onClick={handleEditClick}>
                  Edit Inquiry
                </Button>
              ) : (
                <>
                  <Button variant="primary" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </>
              )}
            </div>

            <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="!text-sm !px-4 !py-2">
              Delete Inquiry
            </Button>
          </div>
        </Card>
      </motion.div>

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
    </motion.div>
  );
};
