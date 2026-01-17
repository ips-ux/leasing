import { Card } from '../ui';
import { ToDoInquiryCard } from './ToDoInquiryCard';
import type { Inquiry } from '../../types/inquiry';

interface DashboardActivityColumnProps {
  inquiries: Inquiry[];
  loading: boolean;
}

export const DashboardActivityColumn = ({
  inquiries,
  loading
}: DashboardActivityColumnProps) => {
  // Filter active inquiries (not completed)
  const activeInquiries = inquiries.filter(i => i.status !== 'completed');

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4">Inquiries</h2>
      {loading ? (
        <div className="text-center py-8">Loading inquiries...</div>
      ) : activeInquiries.length === 0 ? (
        <div className="text-black/60 text-center py-8">
          No active inquiries
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {activeInquiries.map(inq => (
            <ToDoInquiryCard key={inq.id} inquiry={inq} />
          ))}
        </div>
      )}
    </Card>
  );
};
