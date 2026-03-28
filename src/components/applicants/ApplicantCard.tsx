
import type { Applicant } from '../../types/applicant';
import { getWorkflowSteps, computeAllTags, getTagStyle } from '../../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';
import { QuickActionSubStep } from './QuickActionSubStep';
import type { User } from '../../types/user';
import { extractAgentName } from '../../utils/user';
import { timestampToLocalDate } from '../../utils/date';
import { differenceInCalendarDays } from 'date-fns';

const getMoveInColorClass = (moveInDate: Timestamp | null, status: string) => {
  if (!moveInDate) return 'bg-neuro-base text-black/80';
  
  const date = timestampToLocalDate(moveInDate);
  const diff = differenceInCalendarDays(date, new Date());
  
  // Past or Today
  if (diff <= 0) {
    if (status === 'finalize_move_in' || status === 'completed') {
      return 'bg-blue-400 text-white';
    }
    // If they are past due or due today but haven't been moved into Post Move-In stage, remain red
    return 'bg-red-600 text-white';
  }
  
  // Tomorrow
  if (diff <= 1) return 'bg-red-600 text-white';
  // 2 Days - 1 Week
  if (diff <= 7) return 'bg-orange-400 text-neutral-900';
  // 1 Week to 3 Weeks
  if (diff <= 21) return 'bg-[#FFFF00] text-black'; 
  // 3 weeks or greater
  return 'bg-green-500 text-white';
};

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
  users: User[];
  onClick?: () => void;
}

export const ApplicantCard = ({ applicant, users, onClick }: ApplicantCardProps) => {

  const applicantType = applicant["1_Profile"]?.applicantType || 'new';
  const steps = getWorkflowSteps(applicantType);
  const totalSteps = steps.length;

  // Get lease info for at-a-glance display

  const profile = applicant["1_Profile"];
  const tracking = applicant["2_Tracking"];

  return (
    <div 
      onClick={onClick} 
      className={`flex flex-col gap-4 p-5 transition-all cursor-pointer neu-pressed !rounded-2xl`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left Column: Identity & Dates */}
        <div className="flex-1 min-w-[200px] flex items-center gap-4">
          {/* Move-In Date Calendar Badge */}
          <div className="flex flex-col w-14 h-14 rounded-xl shadow-neuro-raised shrink-0 overflow-hidden bg-white/60">
            {profile.moveInDate ? (
              <>
                <div className="h-1/3 flex items-center justify-center bg-black/5 pb-0.5">
                  <span className="text-[10px] font-bold text-black/60 uppercase leading-none tracking-widest">
                    {(() => {
                      const d = timestampToLocalDate(profile.moveInDate);
                      return d.toLocaleString('default', { month: 'short' }).toUpperCase();
                    })()}
                  </span>
                </div>
                <div className={`h-2/3 flex items-center justify-center shadow-inner ${getMoveInColorClass(profile.moveInDate, tracking.status)}`}>
                  <span className="text-xl font-bold leading-none tracking-tight">
                    {(() => {
                      const d = timestampToLocalDate(profile.moveInDate);
                      return String(d.getDate()).padStart(2, '0');
                    })()}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-xs text-black/30">-</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-0.5">
            <h3 className="text-lg font-bold leading-tight">
              {profile.unit} <span className="text-black/40 mx-2">|</span> {profile.name}
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
          {/* Tags (now include concession, parking, storage, pets values) */}
          {(() => {
            const tags = computeAllTags(applicant);
            return tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, i) => {
                  const style = getTagStyle(tag);
                  return (
                    <span
                      key={i}
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-neuro-sm shadow-neuro-pressed border ${style.bg} ${style.border} ${style.text}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            );
          })()}
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
                <span className="font-mono font-bold text-sm">{tracking.currentStep}/{totalSteps}</span>
              </div>

              <div className="w-full h-4 bg-neuro-base rounded-full shadow-[inset_2px_2px_4px_#D1D9E6,inset_-2px_-2px_4px_#FFFFFF] p-1 mb-2">
                <div
                  className="h-full bg-neuro-primary rounded-full transition-all duration-500 shadow-neuro-flat"
                  style={{ width: `${(tracking.currentStep / totalSteps) * 100}%`, backgroundColor: 'orange' }}
                />
              </div>

              <p className="text-xs text-black/60 truncate">
                {steps[tracking.currentStep - 1]?.name || 'Complete'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick Action Sub-step */}
      <div onClick={(e) => onClick ? e.stopPropagation() : undefined}>
        <QuickActionSubStep applicant={applicant} />
      </div>
    </div>
  );
};
