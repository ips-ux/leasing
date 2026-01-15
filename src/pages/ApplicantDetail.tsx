import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Input, DatePicker, Modal } from '../components/ui';
import { WorkflowChecklist } from '../components/applicants/WorkflowChecklist';
import { useApplicant } from '../hooks/useApplicant';
import { useApplicants } from '../hooks/useApplicants';
import { getLeaseInfoForCard } from '../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';

const formatDate = (timestamp: Timestamp | null): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  // Dates are stored at midnight UTC, so format them as UTC to get the correct date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'high' | 'medium' | 'low' | 'success' | 'info'> = {
    in_progress: 'info',
    approved: 'success',
    completed: 'success',
    cancelled: 'high',
  };
  return variants[status] || 'info';
};

export const ApplicantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    applicant,
    loading,
    error,
    updateSubStep,
    updateSubStepDate,
    updateStepNotes,
  } = useApplicant(id);
  const { updateApplicant, deleteApplicant } = useApplicants();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    unit: '',
    dateApplied: new Date(),
    moveInDate: new Date(),
    concessionApplied: '',
    leasingProfessional: '',
  });

  // Cancellation modals state
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);

  // Initialize edit data when applicant loads
  const initEditData = () => {
    if (!applicant) return;
    const profile = applicant["1_Profile"];
    // Convert Firestore Timestamps (stored at midnight UTC) to local Date objects for the date picker
    const dateAppliedUTC = profile.dateApplied.toDate();
    const moveInDateUTC = profile.moveInDate.toDate();

    setEditData({
      name: profile.name,
      unit: profile.unit,
      // Create date in local timezone with the same year/month/day as the UTC date
      dateApplied: new Date(
        dateAppliedUTC.getUTCFullYear(),
        dateAppliedUTC.getUTCMonth(),
        dateAppliedUTC.getUTCDate()
      ),
      moveInDate: new Date(
        moveInDateUTC.getUTCFullYear(),
        moveInDateUTC.getUTCMonth(),
        moveInDateUTC.getUTCDate()
      ),
      concessionApplied: profile.concessionApplied,
      leasingProfessional: profile.leasingProfessional,
    });
  };

  // Scroll to current step on load
  useEffect(() => {
    if (!loading && applicant && !isEditing) {
      // Small delay to allow fade-in animation to start/finish
      const timer = setTimeout(() => {
        const element = document.getElementById(`workflow-step-${applicant["2_Tracking"].currentStep}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, applicant?.id, isEditing]);

  const handleEditClick = () => {
    initEditData();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!applicant) return;

    const success = await updateApplicant(applicant.id, {
      name: editData.name,
      unit: editData.unit,
      dateApplied: editData.dateApplied as any,
      moveInDate: editData.moveInDate as any,
      concessionApplied: editData.concessionApplied,
      leasingProfessional: editData.leasingProfessional,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDateChange = (name: string) => (date: Date) => {
    setEditData((prev) => ({ ...prev, [name]: date }));
  };

  const handlePromoteToResident = async () => {
    if (!applicant) return;

    const success = await updateApplicant(applicant.id, {
      promotedToResident: true,
      promotedToResidentAt: new Date() as any,
    });

    if (!success) {
      // Error is already shown by toast in useApplicants
      return;
    }
  };

  // Cancellation handlers
  const handleCancelClick = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    setShowCancelReasonModal(true);
  };

  const handleSubmitCancellation = async () => {
    if (!applicant || !cancelReason.trim()) return;

    const success = await updateApplicant(applicant.id, {
      status: 'cancelled',
      cancellationReason: cancelReason.trim(),
      cancelledAt: new Date() as any,
    });

    if (success) {
      setShowCancelReasonModal(false);
      setCancelReason('');
    }
  };

  const handleRestoreApplicant = async () => {
    if (!applicant) return;

    await updateApplicant(applicant.id, {
      status: 'in_progress',
      cancellationReason: null,
      cancelledAt: null,
    });
  };

  const handleRemoveClick = () => {
    setShowRemoveWarning(true);
  };

  const handleConfirmRemove = async () => {
    if (!applicant) return;

    const success = await deleteApplicant(applicant.id);

    if (success) {
      navigate('/applicants');
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
        <div className="h-40 bg-white/10 border-[3px] border-black/20 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white/10 border-[3px] border-black/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !applicant) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/applicants')}>
          ← Back to List
        </Button>
        <Card priority="high">
          <div className="text-center py-8">
            <p className="font-bold text-xl mb-2">Error Loading Applicant</p>
            <p className="text-black/60 font-mono">{error || 'Applicant not found'}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Get lease info for display
  const leaseInfo = getLeaseInfoForCard(applicant.workflow);
  const profile = applicant["1_Profile"];
  const tracking = applicant["2_Tracking"];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating Back Button */}
      {/* Sticky Back Button */}
      <div className="sticky top-[78px] z-40 flex justify-end pointer-events-none">
        <Button
          variant="secondary"
          onClick={() => navigate('/applicants')}
          className="mr-4 pointer-events-auto shadow-brutal-sm bg-white/90 backdrop-blur-sm border-2 border-black"
        >
          ← Back to List
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isEditing ? editData.name : profile.name}
          </motion.h1>
          <motion.div
            className="flex items-center gap-3 flex-wrap"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="font-mono text-black/60">Unit {isEditing ? editData.unit : profile.unit}</span>
            <Badge variant={getStatusBadge(tracking.status)}>
              {tracking.status.replace('_', ' ').toUpperCase()}
            </Badge>

            {/* Tags from optional checkboxes */}
            {applicant.tags && applicant.tags.map((tag, i) => (
              <Badge key={i} variant="medium" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Applicant Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <Input
                label="Applicant Name"
                name="name"
                type="text"
                value={editData.name}
                onChange={handleEditChange}
                required
              />

              <Input
                label="Unit Number"
                name="unit"
                type="text"
                value={editData.unit}
                onChange={handleEditChange}
                required
              />

              <DatePicker
                label="Date Applied"
                name="dateApplied"
                value={editData.dateApplied}
                onChange={handleEditDateChange('dateApplied')}
                required
              />

              <DatePicker
                label="Move-In Date"
                name="moveInDate"
                value={editData.moveInDate}
                onChange={handleEditDateChange('moveInDate')}
                required
              />

              <Input
                label="Concession Applied"
                name="concessionApplied"
                type="text"
                value={editData.concessionApplied}
                onChange={handleEditChange}
              />

              <Input
                label="Leasing Professional"
                name="leasingProfessional"
                type="text"
                value={editData.leasingProfessional}
                onChange={handleEditChange}
                required
              />
            </div>
          ) : (
            // View Mode
            <>
              {/* Leasing Professional - Prominent Display */}
              <div className="mb-4 pb-4 border-b-2 border-black/20">
                <p className="text-xs font-mono text-black/50 uppercase mb-1">Leasing Professional</p>
                <p className="text-lg font-bold text-lavender">
                  {profile.leasingProfessional || 'Not Set'}
                </p>
              </div>

              {/* Cancellation Reason - Prominent Display if Cancelled */}
              {tracking.status === 'cancelled' && tracking.cancellationReason && (
                <div className="mb-4 pb-4 border-b-2 border-peach/50 bg-peach/10 p-3">
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Cancellation Reason</p>
                  <p className="text-base font-semibold text-black">
                    {tracking.cancellationReason}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Date Applied</p>
                  <p className="font-semibold">{formatDate(profile.dateApplied)}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Move-In Date</p>
                  <p className="font-semibold">{formatDate(profile.moveInDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Concession</p>
                  <p className="font-semibold">{profile.concessionApplied || 'None'}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-black/50 uppercase mb-1">Current Step</p>
                  <p className="font-semibold">Step {tracking.currentStep} of 6</p>
                </div>
              </div>
            </>
          )}

          {/* Lease Info from Step 3 */}
          {leaseInfo.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-black/20">
              <p className="text-xs font-mono text-black/50 uppercase mb-2">Lease Information</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {leaseInfo.map((item, index) => (
                  <div key={index} className="bg-white/10 p-2 border border-black/20">
                    <p className="text-[10px] font-mono text-black/50 uppercase">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit/Cancel Buttons - Bottom of Card */}
          <div className="flex justify-between items-center gap-2 mt-6 pt-4 border-t-2 border-black/20">
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="secondary" onClick={handleEditClick}>
                  Edit Info
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

            <div className="flex gap-2">
              {applicant["2_Tracking"].status === 'cancelled' ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleRestoreApplicant}
                    className="!text-sm !px-4 !py-2"
                  >
                    Restore Applicant
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleRemoveClick}
                    className="!text-sm !px-4 !py-2"
                  >
                    Remove Entry
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  onClick={handleCancelClick}
                  className="!text-sm !px-4 !py-2"
                >
                  Cancel Applicant
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Workflow Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Processing Workflow</h2>
        <WorkflowChecklist
          applicant={applicant}
          onSubStepUpdate={updateSubStep}
          onSubStepDateChange={updateSubStepDate}
          onNotesChange={updateStepNotes}
          onPromoteToResident={handlePromoteToResident}
        />
      </motion.div>

      {/* Cancel Warning Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="⚠️ Cancel Applicant?"
      >
        <div className="space-y-4">
          <p className="text-base">
            Are you sure you want to cancel this application? You will need to provide a reason for cancelling.
          </p>
          <p className="text-sm text-black/60 font-mono">
            This action can be reversed using the "Restore Applicant" button.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowCancelWarning(false)}>
              No, Keep Active
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              Yes, Continue to Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Reason Modal */}
      <Modal
        isOpen={showCancelReasonModal}
        onClose={() => {
          setShowCancelReasonModal(false);
          setCancelReason('');
        }}
        title="Reason for Cancelling"
      >
        <div className="space-y-4">
          <p className="text-sm text-black/60">
            Please provide a reason for cancelling this application. This will be visible in the applicant details.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            className="w-full p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans resize-none focus:outline-none focus:ring-4 focus:ring-lavender/40"
            rows={4}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCancelReasonModal(false);
                setCancelReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmitCancellation}
              disabled={!cancelReason.trim()}
            >
              Submit Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Entry Warning Modal */}
      <Modal
        isOpen={showRemoveWarning}
        onClose={() => setShowRemoveWarning(false)}
        title="🗑️ Remove Entry Permanently?"
      >
        <div className="space-y-4">
          <p className="text-base font-semibold text-peach">
            ⚠️ WARNING: This action cannot be undone!
          </p>
          <p className="text-base">
            Are you sure you want to permanently remove this applicant entry from the system?
            All workflow data will be lost.
          </p>
          <p className="text-sm text-black/60 font-mono bg-black/5 p-3 border-l-4 border-peach">
            This will delete all information about <strong>{profile.name}</strong> (Unit {profile.unit}).
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowRemoveWarning(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmRemove}>
              Yes, Remove Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
