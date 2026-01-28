import { Badge } from '../ui';
import type { Inquiry } from '../../types/inquiry';

interface ToDoInquiryCardProps {
  inquiry: Inquiry;
  onClick?: () => void;
}

const getPriorityVariant = (priority: string): 'high' | 'medium' | 'low' => {
  if (priority === 'high') return 'high';
  if (priority === 'low') return 'low';
  return 'medium';
};

const getStatusVariant = (status: string): 'high' | 'medium' | 'success' | 'info' => {
  if (status === 'completed') return 'success';
  if (status === 'in_progress') return 'info';
  if (status === 'open') return 'high';
  return 'medium';
};

export const ToDoInquiryCard = ({ inquiry, onClick }: ToDoInquiryCardProps) => {
  return (
    <div
      onClick={onClick}
      className="rounded-neuro-md bg-white/60 shadow-neuro-pressed p-3 transition-all cursor-pointer hover:bg-white/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-semibold text-sm text-neuro-primary truncate">{inquiry.title}</div>
            {inquiry.unitNumber && (
              <span className="text-xs text-neuro-secondary px-1.5 py-0.5 bg-neuro-base rounded-md">
                Unit {inquiry.unitNumber}
              </span>
            )}
          </div>

          {inquiry.description && (
            <p className="text-xs text-neuro-secondary line-clamp-2 mb-2">
              {inquiry.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant={getPriorityVariant(inquiry.priority)}>
              {inquiry.priority.toUpperCase()}
            </Badge>
            <Badge variant={getStatusVariant(inquiry.status)}>
              {inquiry.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {inquiry.notes && (
              <Badge variant="medium" className="bg-neuro-base text-neuro-secondary border border-neuro-highlight">
                NOTES
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
