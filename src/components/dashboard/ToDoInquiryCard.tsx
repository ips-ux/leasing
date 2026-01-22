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
      className="rounded-neuro-md bg-white/60 shadow-neuro-pressed p-2 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-sm text-neuro-primary">{inquiry.title}</div>
          {inquiry.unitNumber && (
            <div className="text-xs text-neuro-secondary">Unit {inquiry.unitNumber}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getPriorityVariant(inquiry.priority)}>
            {inquiry.priority.toUpperCase()}
          </Badge>
          <Badge variant={getStatusVariant(inquiry.status)}>
            {inquiry.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  );
};
