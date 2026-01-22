import { Card } from '../ui';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'applicant' | 'inquiry';
  title: string;
  status: string;
  updatedAt: Date;
  link: string;
}

interface DashboardRecentActivityProps {
  recentActivity: ActivityItem[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

export const DashboardRecentActivity = ({
  recentActivity,
  loading,
  onNavigate
}: DashboardRecentActivityProps) => {
  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
      {loading ? (
        <div className="text-center py-8">Loading activity...</div>
      ) : recentActivity.length === 0 ? (
        <div className="text-black/60 text-center py-8">
          No recent activity to display
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentActivity.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => onNavigate(item.link)}
              className="flex flex-col gap-1 p-3 rounded-neuro-md bg-white/60 shadow-neuro-pressed cursor-pointer transition-all"
            >
              <div className="font-semibold text-sm text-neuro-primary">
                {item.type === 'applicant' ? 'Applicant Update' : 'Inquiry Update'}
              </div>
              <div className="text-sm text-neuro-secondary">
                {item.title}
              </div>
              <div className="text-xs text-neuro-muted font-mono">
                <span className="capitalize">{item.status.replace('_', ' ')}</span> • {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
