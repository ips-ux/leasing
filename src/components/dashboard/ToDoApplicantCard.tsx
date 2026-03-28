import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui';
import { QuickActionSubStep } from '../applicants/QuickActionSubStep';
import { timestampToLocalDate } from '../../utils/date';
import type { Applicant } from '../../types/applicant';
import { getWorkflowSteps, computeAllTags, getTagStyle } from '../../lib/workflow-steps';
import { differenceInCalendarDays } from 'date-fns';

interface ToDoApplicantCardProps {
  applicant: Applicant;
  isUpcoming?: boolean;
}

const getStatusVariant = (status: string): 'high' | 'medium' | 'success' | 'info' => {
  if (status === 'completed') return 'success';
  if (status === 'in_progress') return 'info';
  if (status === 'cancelled') return 'medium';
  return 'info';
};

const formatMoveInDays = (date: Date) => {
  const diff = differenceInCalendarDays(date, new Date());
  if (diff === 0) return 'TODAY';
  if (diff === 1) return 'TOMORROW';
  if (diff === -1) return 'YESTERDAY';
  if (diff > 1) return `In ${diff} Days`;
  return `${Math.abs(diff)} Days Ago`;
};

export const ToDoApplicantCard = ({ applicant, isUpcoming = false }: ToDoApplicantCardProps) => {
  const navigate = useNavigate();
  const moveInDate = applicant['1_Profile'].moveInDate ? timestampToLocalDate(applicant['1_Profile'].moveInDate) : null;
  const tags = computeAllTags(applicant);

  return (
    <div
      onClick={() => navigate(`/applicants/${applicant.id}`)}
      className="neu-pressed !rounded-2xl p-4 transition-all cursor-pointer hover:bg-white/40"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold text-sm text-neuro-primary">
            {applicant['1_Profile'].unit} <span className="text-neuro-secondary font-normal mx-1">|</span> {applicant['1_Profile'].name}
          </div>
          {moveInDate && (
            <div className="text-xs text-neuro-muted font-mono font-bold">
              Move-in: {formatMoveInDays(moveInDate)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {tags.map((tag) => {
                const style = getTagStyle(tag);
                return (
                  <span
                    key={tag}
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-sm border whitespace-nowrap ${style.bg} ${style.border} ${style.text}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
          {isUpcoming ? (
            <Badge variant="success">Ready for Move-In</Badge>
          ) : (
            <Badge variant={getStatusVariant(applicant['2_Tracking'].status)}>
              Step {applicant['2_Tracking'].currentStep}/{getWorkflowSteps(applicant['1_Profile']?.applicantType || 'new').length}
            </Badge>
          )}
        </div>
      </div>

      {/* Inline Quick Action - prevent click propagation */}
      {!isUpcoming && (
        <div onClick={(e) => e.stopPropagation()}>
          <QuickActionSubStep applicant={applicant} />
        </div>
      )}
    </div>
  );
};
