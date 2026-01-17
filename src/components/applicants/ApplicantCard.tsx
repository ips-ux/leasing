import { Card, Badge } from '../ui';
import type { Applicant } from '../../types/applicant';
import { getLeaseInfoForCard, WORKFLOW_STEPS } from '../../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';
import { QuickActionSubStep } from './QuickActionSubStep';

// Format date by extracting UTC components to avoid timezone issues
const formatDateUTC = (timestamp: Timestamp | null): string => {
  if (!timestamp) return '-';
  const date = timestamp.toDate();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

interface ApplicantCardProps {
  applicant: Applicant;
  onClick?: () => void;
}

export const ApplicantCard = ({ applicant, onClick }: ApplicantCardProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'info';
      case 'approved':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'medium';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Get lease info for at-a-glance display
  const leaseInfo = applicant.workflow ? getLeaseInfoForCard(applicant.workflow) : [];

  const profile = applicant["1_Profile"];
  const tracking = applicant["2_Tracking"];

  return (
    <Card onClick={onClick} className="cursor-pointer">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Left Column: Identity & Status */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold">{profile.name}</h3>
              <Badge variant={getStatusVariant(tracking.status)}>
                {getStatusLabel(tracking.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-black/60 font-mono">
              <span>Unit {profile.unit}</span>
              {profile.concessionApplied && (
                <>
                  <span>•</span>
                  <span className="text-black bg-soft-yellow/30 px-1 border border-black/20">
                    Concession: {profile.concessionApplied}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-black/50 font-mono mt-1">
              Agent: <span className="text-black/80 font-bold uppercase">{tracking.assignedTo || 'N/A'}</span>
            </div>
          </div>

          {/* Middle Column: Dates & Lease Info */}
          <div className="flex-1 min-w-[200px] border-l-0 md:border-l-2 border-black/10 md:pl-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
              <div>
                <span className="text-black/50 text-xs uppercase block">Applied</span>
                <span className="font-mono font-semibold">
                  {formatDateUTC(profile.dateApplied)}
                </span>
              </div>
              <div>
                <span className="text-black/50 text-xs uppercase block">Move-In</span>
                <span className="font-mono font-semibold">
                  {formatDateUTC(profile.moveInDate)}
                </span>
              </div>
            </div>

            {/* Lease Info Preview */}
            {leaseInfo.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {leaseInfo.slice(0, 3).map((item, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-pale-blue/30 border border-black/20 whitespace-nowrap"
                  >
                    {item.label}: {item.value}
                  </span>
                ))}
                {leaseInfo.length > 3 && (
                  <span className="text-[10px] font-mono text-black/50">
                    +{leaseInfo.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Progress & Tags OR Cancellation Reason */}
          <div className="flex-1 min-w-[200px] border-l-0 md:border-l-2 border-black/10 md:pl-4">
            {tracking.status === 'cancelled' ? (
              <div className="h-full flex flex-col">
                <span className="text-xs font-bold uppercase text-black/50 mb-1">Cancellation Reason</span>
                <div className="bg-peach/10 p-2 text-sm italic text-black/80 min-h-[60px] mb-2">
                  {tracking.cancellationReason || 'No reason provided'}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase text-black/50">Progress</span>
                  <span className="font-mono font-bold text-sm">{tracking.currentStep}/6</span>
                </div>

                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-mint transition-all duration-500"
                    style={{ width: `${(tracking.currentStep / 6) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-black/60 truncate mb-2">
                  {WORKFLOW_STEPS[tracking.currentStep - 1]?.name || 'Complete'}
                </p>
              </>
            )}

            {/* Tags */}
            {applicant.tags && applicant.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {applicant.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-lavender border border-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Sub-step */}
        <QuickActionSubStep applicant={applicant} />
      </div>
    </Card>
  );
};
