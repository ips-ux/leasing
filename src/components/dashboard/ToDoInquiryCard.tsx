import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui';
import type { Inquiry } from '../../types/inquiry';

interface ToDoInquiryCardProps {
  inquiry: Inquiry;
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

export const ToDoInquiryCard = ({ inquiry }: ToDoInquiryCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/inquiries/${inquiry.id}`)}
      className="border-2 border-black p-2 hover:bg-black/5 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-sm">{inquiry.title}</div>
          {inquiry.unitNumber && (
            <div className="text-xs text-black/60">Unit {inquiry.unitNumber}</div>
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
