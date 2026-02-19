import { Card, Button, PageLoader } from '../ui';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';
import { ToDoInquiryCard } from './ToDoInquiryCard';
import type { Inquiry } from '../../types/inquiry';

interface DashboardActivityColumnProps {
  inquiries: Inquiry[];
  loading: boolean;
  onNewInquiry: () => void;
  onInquiryClick: (inquiry: Inquiry) => void;
}

export const DashboardActivityColumn = ({
  inquiries,
  loading,
  onNewInquiry,
  onInquiryClick
}: DashboardActivityColumnProps) => {
  // Filter active inquiries (not completed)
  const activeInquiries = inquiries.filter(i => i.status !== 'completed');
  const showLoader = useDelayedLoading(loading);

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4">Inquiries</h2>

      {/* New Inquiry Button */}
      <Button onClick={onNewInquiry} variant="primary" className="w-full mb-4 !py-2.5 text-sm !font-bold">
        + New Inquiry
      </Button>

      {showLoader ? (
        <PageLoader />
      ) : activeInquiries.length === 0 ? (
        <div className="text-neuro-muted text-center py-8">
          No active inquiries
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {activeInquiries.map(inq => (
            <ToDoInquiryCard
              key={inq.id}
              inquiry={inq}
              onClick={() => onInquiryClick(inq)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
