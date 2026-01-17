import { Card, Button } from '../ui';
import { ToDoApplicantCard } from './ToDoApplicantCard';
import type { Applicant } from '../../types/applicant';

interface DashboardToDoColumnProps {
  applicants: Applicant[];
  loading: boolean;
  onNewApplicant: () => void;
}

export const DashboardToDoColumn = ({ applicants, loading, onNewApplicant }: DashboardToDoColumnProps) => {
  // Filter upcoming move-ins: all steps complete + future move-in date
  const upcomingMoveIns = applicants.filter(a => {
    const allStepsComplete = Object.values(a.workflow).every(step => step.isCompleted);
    const moveInDate = a['1_Profile'].moveInDate?.toDate();
    const isFuture = moveInDate && moveInDate > new Date();
    return allStepsComplete && isFuture && a['2_Tracking'].status !== 'cancelled';
  }).sort((a, b) => {
    const dateA = a['1_Profile'].moveInDate?.toDate() || new Date(0);
    const dateB = b['1_Profile'].moveInDate?.toDate() || new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter in-progress applicants, sorted by move-in date (closest first)
  const inProgressApplicants = applicants.filter(a =>
    a['2_Tracking'].status === 'in_progress'
  ).sort((a, b) => {
    const dateA = a['1_Profile'].moveInDate?.toDate() || new Date(0);
    const dateB = b['1_Profile'].moveInDate?.toDate() || new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return (
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Applicants</h2>
        <div className="text-center py-8 text-black/40">Loading...</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Applicants</h2>
      </div>

      {/* New Applicant Button */}
      <Button variant="primary" onClick={onNewApplicant} className="w-full mb-4">
        + New Applicant
      </Button>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Upcoming Move-Ins Section */}
        {upcomingMoveIns.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase text-black/60 mb-2">
              Upcoming Move-Ins ({upcomingMoveIns.length})
            </h3>
            <div className="space-y-3">
              {upcomingMoveIns.map(app => (
                <ToDoApplicantCard key={app.id} applicant={app} isUpcoming={true} />
              ))}
            </div>
          </div>
        )}

        {/* In Progress Applicants Section */}
        <div>
          <h3 className="text-sm font-bold uppercase text-black/60 mb-2">
            In Progress ({inProgressApplicants.length})
          </h3>
          {inProgressApplicants.length === 0 ? (
            <div className="text-black/40 text-sm py-4">No in-progress applicants</div>
          ) : (
            <div className="space-y-3">
              {inProgressApplicants.map(app => (
                <ToDoApplicantCard key={app.id} applicant={app} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
