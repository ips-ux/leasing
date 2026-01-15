import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApplicants } from '../hooks/useApplicants';
import { useInquiries } from '../hooks/useInquiries';
import { Card, Badge } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch all applicants
  const { applicants, loading: applicantsLoading } = useApplicants();

  // Fetch inquiries for current month (default behavior of useInquiries without args is actually ALL if we don't pass month, 
  // but let's check the hook implementation. 
  // Ah, the hook takes an optional month. If undefined, it passes empty constraints, so it fetches ALL inquiries.
  // That's perfect for the dashboard summary.)
  const { inquiries, loading: inquiriesLoading } = useInquiries();

  // Calculate Metrics
  const activeApplicants = applicants.filter(a => a['2_Tracking'].status !== 'completed').length;
  const inProgressApplicants = applicants.filter(a => a['2_Tracking'].status === 'in_progress').length;

  const highPriorityInquiries = inquiries.filter(i =>
    i.status !== 'completed' && i.priority === 'high'
  ).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedApplicantsThisMonth = applicants.filter(a => {
    if (a['2_Tracking'].status !== 'completed' || !a['2_Tracking'].leaseCompletedTime) return false;
    const date = a['2_Tracking'].leaseCompletedTime.toDate();
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const completedInquiriesThisMonth = inquiries.filter(i => {
    if (i.status !== 'completed' || !i.completedAt) return false;
    const date = i.completedAt.toDate();
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const totalCompletedThisMonth = completedApplicantsThisMonth + completedInquiriesThisMonth;

  // Recent Activity
  // Combine applicants and inquiries, sort by updatedAt, take top 5
  const recentActivity = [
    ...applicants.map(a => ({
      id: a.id,
      type: 'applicant',
      title: a['1_Profile'].name,
      status: a['2_Tracking'].status,
      updatedAt: a['2_Tracking'].updatedAt?.toDate() || new Date(0),
      link: `/applicants/${a.id}`
    })),
    ...inquiries.map(i => ({
      id: i.id,
      type: 'inquiry',
      title: i.title,
      status: i.status,
      updatedAt: i.updatedAt?.toDate() || new Date(0),
      link: `/inquiries/${i.id}`
    }))
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const loading = applicantsLoading || inquiriesLoading;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-black/60">Welcome back, {user?.displayName || user?.email}!</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => navigate('/applicants/new')}
              className="border-3 border-black p-4 hover:bg-black/5 transition-colors duration-100 cursor-pointer"
            >
              <div className="font-semibold mb-1">New Applicant</div>
              <div className="text-sm text-black/60">Start processing a new application</div>
            </div>
            <div
              onClick={() => navigate('/inquiries/new')}
              className="border-3 border-black p-4 hover:bg-black/5 transition-colors duration-100 cursor-pointer"
            >
              <div className="font-semibold mb-1">New Inquiry</div>
              <div className="text-sm text-black/60">Log a new resident inquiry</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">Total Active Applicants</div>
              <div className="text-3xl font-bold font-mono">
                {loading ? '-' : activeApplicants}
              </div>
              <Badge variant="info">Active</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">In Progress</div>
              <div className="text-3xl font-bold font-mono">
                {loading ? '-' : inProgressApplicants}
              </div>
              <Badge variant="medium">Processing</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">High Priority Inquiries</div>
              <div className="text-3xl font-bold font-mono">
                {loading ? '-' : highPriorityInquiries}
              </div>
              <Badge variant="high">Action Needed</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">Completed This Month</div>
              <div className="text-3xl font-bold font-mono">
                {loading ? '-' : totalCompletedThisMonth}
              </div>
              <Badge variant="success">Success</Badge>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="text-center py-8">Loading activity...</div>
          ) : recentActivity.length === 0 ? (
            <div className="text-black/60 text-center py-8">
              No recent activity to display
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => navigate(item.link)}
                  className="flex items-center justify-between p-3 border-b-2 border-black/10 hover:bg-black/5 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold">
                      {item.type === 'applicant' ? 'Applicant Update' : 'Inquiry Update'}
                    </div>
                    <div className="text-sm text-black/60">
                      {item.title} - <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="text-xs text-black/40 font-mono">
                    {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};
