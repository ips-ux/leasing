import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../ui';

interface DashboardMetricsProps {
  activeApplicants: number;
  totalInquiries: number;
  highPriorityInquiries: number;
  monthlyMoveIns: number;
  loading: boolean;
}

export const DashboardMetrics = ({
  activeApplicants,
  totalInquiries,
  highPriorityInquiries,
  monthlyMoveIns,
  loading
}: DashboardMetricsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        className="cursor-pointer hover:shadow-neuro-hover transition-all duration-200"
        onClick={() => navigate('/applicants')}
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neuro-secondary">Total Active Applicants</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : activeApplicants}
          </div>
          <Badge variant="info">Active</Badge>
        </div>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-neuro-hover transition-all duration-200"
        onClick={() => navigate('/inquiries')}
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neuro-secondary">Total Inquiries</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : totalInquiries}
          </div>
          <Badge variant="medium">All Inquiries</Badge>
        </div>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-neuro-hover transition-all duration-200"
        onClick={() => navigate('/inquiries')}
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neuro-secondary">High Priority Inquiries</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : highPriorityInquiries}
          </div>
          <Badge variant="high">Action Needed</Badge>
        </div>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-neuro-hover transition-all duration-200"
        onClick={() => navigate('/reports')}
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neuro-secondary">Monthly Move-Ins</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : monthlyMoveIns}
          </div>
          <Badge variant="success">Completed</Badge>
        </div>
      </Card>
    </div>
  );
};
