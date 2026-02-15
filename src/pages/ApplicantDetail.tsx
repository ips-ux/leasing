import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input, DatePicker, Modal, Select, Textarea } from '../components/ui';
import { WorkflowChecklist } from '../components/applicants/WorkflowChecklist';
import { useApplicant } from '../hooks/useApplicant';
import { useApplicants } from '../hooks/useApplicants';
import { useUsers } from '../hooks/useUsers';
import { extractAgentName } from '../utils/user';
import { timestampToLocalDate } from '../utils/date';
import { getLeaseInfoForCard } from '../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';

const formatDate = (timestamp: Timestamp | null): string => {
  if (!timestamp) return 'N/A';
  const date = timestampToLocalDate(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'high' | 'medium' | 'low' | 'success' | 'info'> = {
    in_progress: 'info',
    approved: 'success',
    finalize_move_in: 'medium',
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
  const { users, loading: usersLoading } = useUsers();

  const agentOptions = useMemo(() => {
    return users.map((u) => ({
      label: u.Agent_Name || extractAgentName(u.email),
      value: u.uid,
    }));
  }, [users]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    unit: '',
    dateApplied: new Date(),
    moveInDate: new Date(),
    concessionApplied: '',
    assignedTo: '',
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

    setEditData({
      name: profile.name,
      unit: profile.unit,
      dateApplied: timestampToLocalDate(profile.dateApplied),
      moveInDate: timestampToLocalDate(profile.moveInDate),
      concessionApplied: profile.concessionApplied,
      assignedTo: applicant['2_Tracking'].assignedTo || '',
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

  // Sticky Header Logic
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [headerStyle, setHeaderStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScrollAndResize = () => {
      const cardElement = document.getElementById('applicant-card-container');
      const containerElement = containerRef.current;

      if (cardElement && containerElement) {
        const rect = cardElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();

        // Update visibility
        setShowStickyHeader(rect.bottom < 120);

        // Update measurement for fixed header
        setHeaderStyle({
          width: containerRect.width,
          left: containerRect.left,
        });
      }
    };

    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);

    // Initial check
    handleScrollAndResize();

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, []);

  const handleEditClick = () => {
    initEditData();
    setIsEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDateChange = (name: string) => (date: Date) => {
    setEditData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSaveEdit = async () => {
    if (!applicant) return;

    const success = await updateApplicant(applicant.id, {
      name: editData.name,
      unit: editData.unit,
      dateApplied: editData.dateApplied as any,
      moveInDate: editData.moveInDate as any,
      concessionApplied: editData.concessionApplied,
      assignedTo: editData.assignedTo,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handlePromoteToResident = async () => {
    if (!applicant) return;

    const success = await updateApplicant(applicant.id, {
      promotedToResident: true,
      promotedToResidentAt: new Date() as any,
      status: 'finalize_move_in',
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
      ref={containerRef}
    >
      {/* Sticky Top Bar (Fixed + Measured) */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.div
            className="fixed top-4 z-50 bg-white/80 backdrop-blur-xl shadow-neuro-raised border border-white/40 rounded-2xl px-6 py-3 flex items-center justify-between pointer-events-auto"
            style={headerStyle}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <div>
                <h3 className="font-bold text-lg leading-tight">{profile.name}</h3>
                <p className="text-xs font-mono text-black/50">Unit {profile.unit}</p>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-mono text-black/50 uppercase">Move-In</p>
                  <p className="text-sm font-semibold">{formatDate(profile.moveInDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-black/50 uppercase">Applied</p>
                  <p className="text-sm font-semibold">{formatDate(profile.dateApplied)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-black/50 uppercase">Concession</p>
                  <p className="text-sm font-semibold">{profile.concessionApplied || 'None'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-black/50 uppercase">Agent</p>
                  <p className="text-sm font-semibold">
                    {users.find(u => u.uid === tracking.assignedTo)?.Agent_Name ||
                      extractAgentName(users.find(u => u.uid === tracking.assignedTo)?.email) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadge(tracking.status)} className="scale-90">
                {tracking.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                variant="secondary"
                onClick={() => navigate('/applicants')}
                className="!text-xs !px-3 !py-1.5"
              >
                Back
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Back Button (only visible when sticky header is NOT visible) */}
      <motion.div
        className="sticky top-[78px] z-40 flex justify-end pointer-events-none"
        animate={{ opacity: showStickyHeader ? 0 : 1, pointerEvents: showStickyHeader ? 'none' : 'auto' as any }}
      >
        <Button
          variant="secondary"
          onClick={() => navigate('/applicants')}
          className="mr-4 pointer-events-auto shadow-neuro-flat bg-neuro-base/90 backdrop-blur-sm"
        >
          ← Back to List
        </Button>
      </motion.div>

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            Applicant Workflow Checklist
          </motion.h1>
        </div>
      </div>

      {/* Applicant Info Card */}
      <motion.div
        id="applicant-card-container"
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
              {/* Primary Applicant Info (Moved from Header) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-black/10">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{profile.name}</h2>
                  <p className="text-xl font-mono text-black/60">Unit {profile.unit}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={getStatusBadge(tracking.status)} className="!text-sm !px-3 !py-1">
                    {tracking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {/* Tags from optional checkboxes */}
                  {applicant.tags && applicant.tags.map((tag, i) => (
                    <Badge key={i} variant="medium" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Assigned Agent - Prominent Display */}
              <div className="mb-4 pb-4 border-b-2 border-black/20">
                <p className="text-xs font-mono text-black/50 uppercase mb-1">Assigned To</p>
                <p className="text-lg font-bold text-lavender">
                  {users.find(u => u.uid === tracking.assignedTo)?.Agent_Name ||
                    extractAgentName(users.find(u => u.uid === tracking.assignedTo)?.email) ||
                    'Not Set'}
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
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter cancellation reason..."
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
