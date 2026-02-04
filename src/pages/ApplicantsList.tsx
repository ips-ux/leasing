import { useState } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import { useAuth } from '../hooks/useAuth';
import { ApplicantList } from '../components/applicants/ApplicantList';
import type { ApplicantStatus } from '../components/applicants/ApplicantList';
import { Button, Card, Toggle } from '../components/ui';
import { NewApplicantModal } from '../components/applicants/NewApplicantModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';

export const ApplicantsList = () => {
  const { user } = useAuth();
  const { applicants, loading, error } = useApplicants();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(true);
  const [activeStatus, setActiveStatus] = useState<ApplicantStatus>('in_progress');

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      if (!showMineOnly) return true;
      const tracking = a['2_Tracking'];
      return tracking.assignedTo === user?.uid ||
        (!tracking.assignedTo && tracking.createdBy === user?.uid);
    });
  }, [applicants, showMineOnly, user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card>
          <div className="text-center py-8 px-12">
            <div className="text-xl font-semibold">Loading applicants...</div>
          </div>
        </Card>
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Applicants</h1>
            <p className="text-black/60">Manage and track applicant processing</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2 mr-4">
              <button
                onClick={() => setActiveStatus('in_progress')}
                className={`px-4 py-2 text-sm font-bold rounded-neuro-md transition-all ${activeStatus === 'in_progress' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed' : 'bg-transparent text-neuro-secondary hover:text-neuro-primary'
                  }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveStatus('completed')}
                className={`px-4 py-2 text-sm font-bold rounded-neuro-md transition-all ${activeStatus === 'completed' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed' : 'bg-transparent text-neuro-secondary hover:text-neuro-primary'
                  }`}
              >
                Complete
              </button>
              <button
                onClick={() => setActiveStatus('cancelled')}
                className={`px-4 py-2 text-sm font-bold rounded-neuro-md transition-all ${activeStatus === 'cancelled' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed' : 'bg-transparent text-neuro-secondary hover:text-neuro-primary'
                  }`}
              >
                Cancelled
              </button>
            </div>

            <div className="h-8 w-px bg-black/10 mr-2"></div>

            <Toggle
              value={showMineOnly}
              onChange={setShowMineOnly}
              leftIcon={<FontAwesomeIcon icon={faUser} />}
              rightIcon={<FontAwesomeIcon icon={faUsers} />}
            />
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + New Applicant
            </Button>
          </div>
        </div>

        <ApplicantList
          applicants={filteredApplicants}
          loading={loading}
          activeStatus={activeStatus}
        />
      </div>

      <NewApplicantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
