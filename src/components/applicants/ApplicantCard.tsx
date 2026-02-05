import { Card } from '../ui';
import type { Applicant } from '../../types/applicant';
import { getLeaseInfoForCard, WORKFLOW_STEPS } from '../../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';
import { QuickActionSubStep } from './QuickActionSubStep';
import { useUsers } from '../../hooks/useUsers';
import { extractAgentName } from '../../utils/user';
import { timestampToLocalDate } from '../../utils/date';

// Format date using the local date conversion utility
const formatDateUTC = (timestamp: Timestamp | null): string => {
  if (!timestamp) return '-';
  const date = timestampToLocalDate(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

interface ApplicantCardProps {
  applicant: Applicant;
  onClick?: () => void;
}

export const ApplicantCard = ({ applicant, onClick }: ApplicantCardProps) => {
  const { users } = useUsers();

  // Get lease info for at-a-glance display
  const leaseInfo = applicant.workflow ? getLeaseInfoForCard(applicant.workflow) : [];

  const profile = applicant["1_Profile"];
  const tracking = applicant["2_Tracking"];

  return (
    <Card onClick={onClick} className="cursor-pointer" disableHoverAnimation={true}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Left Column: Identity & Status */}
          {/* Left Column: Identity & Dates */}
          <div className="flex-1 min-w-[200px] flex items-center gap-4">
            {/* Move-In Date Calendar Badge */}
            <div className="flex flex-col items-center justify-center w-14 h-14 bg-neuro-base rounded-neuro-md shadow-neuro-raised border border-white/60 shrink-0">
              {profile.moveInDate ? (
                <>
                  <span className="text-[10px] font-bold text-neuro-secondary uppercase leading-none mb-1">
                    {(() => {
                      const d = timestampToLocalDate(profile.moveInDate);
                      return d.toLocaleString('default', { month: 'short' }).toUpperCase();
                    })()}
                  </span>
                  <span className="text-2xl font-bold text-black/80 leading-none tracking-tight">
                    {(() => {
                      const d = timestampToLocalDate(profile.moveInDate);
                      return String(d.getDate()).padStart(2, '0');
                    })()}
                  </span>
                </>
              ) : (
                <span className="text-xs text-black/30">-</span>
              )}
            </div>

            <div className="flex flex-col justify-center gap-0.5">
              <h3 className="text-lg font-bold leading-tight">
                {profile.name} <span className="text-black/40 mx-2">|</span> {profile.unit}
              </h3>
              {profile.dateApplied && (
                <span className="text-[10px] text-black/50 font-mono uppercase tracking-wide">
                  Applied: <span className="font-bold text-black/70">{formatDateUTC(profile.dateApplied)}</span>
                </span>
              )}
              {/* Agent Name */}
              <div className="text-xs text-black/50 font-mono mt-1">
                Agent: <span className="text-black/80 font-bold uppercase">
                  {(() => {
                    const agentId = tracking.assignedTo;
                    if (!agentId) return 'N/A';
                    const agent = users.find(u => u.uid === agentId);
                    return agent ? (agent.Agent_Name || extractAgentName(agent.email)) : 'Unknown';
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Lease Info & Tags */}
          <div className="flex-1 min-w-[200px] border-l-0 md:border-l-2 border-black/10 md:pl-4 flex flex-col justify-center">
            {/* Lease Info Preview + Concession */}
            {(leaseInfo.length > 0 || profile.concessionApplied) && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.concessionApplied && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-neuro-lavender rounded-neuro-sm shadow-neuro-pressed text-neuro-primary">
                    Concession: {profile.concessionApplied}
                  </span>
                )}
                {leaseInfo.slice(0, 3).map((item, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-neuro-base rounded-neuro-sm shadow-neuro-pressed whitespace-nowrap text-neuro-primary"
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

            {/* Tags moved to center */}
            {applicant.tags && applicant.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {applicant.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-neuro-lavender rounded-neuro-sm shadow-neuro-pressed text-neuro-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Progress & Agent */}
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

                <div className="w-full h-4 bg-neuro-base rounded-full shadow-neuro-pressed p-1 mb-2">
                  <div
                    className="h-full bg-neuro-primary rounded-full transition-all duration-500 shadow-neuro-flat"
                    style={{ width: `${(tracking.currentStep / 6) * 100}%`, backgroundColor: 'orange' }}
                  />
                </div>

                <p className="text-xs text-black/60 truncate">
                  {WORKFLOW_STEPS[tracking.currentStep - 1]?.name || 'Complete'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Sub-step */}
        <QuickActionSubStep applicant={applicant} />
      </div>
    </Card>
  );
};
