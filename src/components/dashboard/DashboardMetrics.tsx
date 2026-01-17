import { Card, Badge } from '../ui';

interface DashboardMetricsProps {
  activeApplicants: number;
  inProgressApplicants: number;
  highPriorityInquiries: number;
  totalCompletedThisMonth: number;
  loading: boolean;
}

export const DashboardMetrics = ({
  activeApplicants,
  inProgressApplicants,
  highPriorityInquiries,
  totalCompletedThisMonth,
  loading
}: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-black/60">Total Active Applicants</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : activeApplicants}
          </div>
          <Badge variant="info">Active</Badge>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-black/60">In Progress</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : inProgressApplicants}
          </div>
          <Badge variant="medium">Processing</Badge>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-black/60">High Priority Inquiries</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : highPriorityInquiries}
          </div>
          <Badge variant="high">Action Needed</Badge>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-black/60">Completed This Month</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : totalCompletedThisMonth}
          </div>
          <Badge variant="success">Success</Badge>
        </div>
      </Card>
    </div>
  );
};
