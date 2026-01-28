import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../ui';

interface DashboardMetricsProps {
  activeApplicants: number;
  openInquiries: number;
  reservationsToday: number;
  monthlyMoveIns: number;
  loading: boolean;
}

export const DashboardMetrics = ({
  activeApplicants,
  openInquiries,
  reservationsToday,
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
          <div className="text-sm font-semibold text-neuro-secondary">Open Inquiries</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : openInquiries}
          </div>
          <Badge variant="medium">Active</Badge>
        </div>
      </Card>

      <Card
        className={`cursor-pointer hover:shadow-neuro-hover transition-all duration-200 ${reservationsToday > 0 ? 'bg-neuro-base' : ''
          }`}
        onClick={() => navigate('/scheduler')}
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neuro-secondary">Reservations Today</div>
          <div className="text-3xl font-bold font-mono">
            {loading ? '-' : reservationsToday}
          </div>
          <Badge variant="high">Today</Badge>
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
