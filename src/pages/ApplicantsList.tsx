import { useState, useMemo } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import { useAuth } from '../hooks/useAuth';
import { useViewMode } from '../context/ViewModeContext';
import { ApplicantList } from '../components/applicants/ApplicantList';
import type { ApplicantStatus } from '../components/applicants/ApplicantList';
import { Button, Card, Toggle, SegmentedControl, PageLoader } from '../components/ui';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { NewApplicantModal } from '../components/applicants/NewApplicantModal';
import { NewTransferModal } from '../components/applicants/NewTransferModal';
import { ApplicantTypeModal } from '../components/applicants/ApplicantTypeModal';
import { getWorkflowSteps } from '../lib/workflow-steps';
import type { ApplicantType } from '../types/applicant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';

export const ApplicantsList = () => {
  const { user } = useAuth();
  const { applicants, loading, error } = useApplicants();
  const { showMineOnly, setShowMineOnly } = useViewMode();
  const [activeStatus, setActiveStatus] = useState<ApplicantStatus>('in_progress');

  // Modal state: type selection → specific modal
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const handleSelectType = (type: ApplicantType) => {
    if (type === 'new') {
      setNewModalOpen(true);
    } else {
      setTransferModalOpen(true);
    }
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      if (!showMineOnly) return true;
      const tracking = a['2_Tracking'];
      return tracking.assignedTo === user?.uid ||
        (!tracking.assignedTo && tracking.createdBy === user?.uid);
    });
  }, [applicants, showMineOnly, user?.uid]);

  const showLoader = useDelayedLoading(loading);

  const tabCounts = useMemo(() => {
    const inProgress = filteredApplicants.filter(app => {
      const s = app['2_Tracking'].status;
      if (s === 'in_progress' || s === 'approved') return true;
      if (s === 'finalize_move_in') {
        const appType = (app['1_Profile'] as any)?.applicantType || 'new';
        const steps = getWorkflowSteps(appType);
        const prePromotionSteps = steps.slice(0, -1);
        const wf = app.workflow || {};
        return !prePromotionSteps.every(step => wf[step.step.toString()]?.isCompleted);
      }
      return false;
    }).length;

    const postMoveIn = filteredApplicants.filter(app => {
      const s = app['2_Tracking'].status;
      if (s === 'completed' || s === 'cancelled') return false;
      const appType = (app['1_Profile'] as any)?.applicantType || 'new';
      const steps = getWorkflowSteps(appType);
      const prePromotionSteps = steps.slice(0, -1);
      const wf = app.workflow || {};
      return prePromotionSteps.every(step => wf[step.step.toString()]?.isCompleted);
    }).length;

    return { inProgress, postMoveIn };
  }, [filteredApplicants]);

  if (showLoader) {
    return (
      <div className="flex items-center justify-center py-12">
        <PageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Error Loading Applicants</h2>
            <p className="text-black/60">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const CountBadge = ({ count }: { count: number }) => (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none">
      {count}
    </span>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header row — title left, Toggle pinned right */}
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Applicants</h1>
            <p className="text-black/60">Manage and track applicant processing</p>
          </div>

          <Toggle
            value={showMineOnly}
            onChange={setShowMineOnly}
            leftIcon={<FontAwesomeIcon icon={faUser} />}
            rightIcon={<FontAwesomeIcon icon={faUsers} />}
            className="!px-3"
          />
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            layoutId="applicants-status-tabs"
            options={[
              { label: 'In Progress', value: 'in_progress', icon: <CountBadge count={tabCounts.inProgress} /> },
              { label: 'Post Move-In', value: 'post_move_in', icon: <CountBadge count={tabCounts.postMoveIn} /> },
              { label: 'Complete', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' }
            ]}
            value={activeStatus}
            onChange={(value) => setActiveStatus(value as ApplicantStatus)}
          />

          <Button variant="primary" onClick={() => setTypeModalOpen(true)} className="!py-2.5 text-sm !font-bold min-w-[11rem] text-center ml-auto">
            + New Applicant
          </Button>
        </div>

        <ApplicantList
          applicants={filteredApplicants}
          loading={loading}
          activeStatus={activeStatus}
        />
      </div>

      <ApplicantTypeModal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        onSelectType={handleSelectType}
      />

      <NewApplicantModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
      />

      <NewTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />
    </>
  );
};
