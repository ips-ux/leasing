import { Card, Badge } from '../ui';

interface DashboardCenterColumnProps {
  activeApplicants: number;
  inProgressApplicants: number;
  highPriorityInquiries: number;
  totalCompletedThisMonth: number;
  loading: boolean;
  onNavigate: () => void;
  onNavigateInquiry: () => void;
}

export const DashboardCenterColumn = ({
  activeApplicants,
  inProgressApplicants,
  highPriorityInquiries,
  totalCompletedThisMonth,
  loading,
  onNavigate,
  onNavigateInquiry
}: DashboardCenterColumnProps) => {
  return (
    <>
      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={onNavigate}
            className="border-3 border-black p-4 hover:bg-black/5 transition-colors duration-100 cursor-pointer"
          >
            <div className="font-semibold mb-1">New Applicant</div>
            <div className="text-sm text-black/60">Start processing a new application</div>
          </div>
          <div
            onClick={onNavigateInquiry}
            className="border-3 border-black p-4 hover:bg-black/5 transition-colors duration-100 cursor-pointer"
          >
            <div className="font-semibold mb-1">New Inquiry</div>
            <div className="text-sm text-black/60">Log a new resident inquiry</div>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
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
    </>
  );
};
