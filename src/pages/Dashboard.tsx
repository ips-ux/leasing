import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, Badge } from '../components/ui';

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
              <div className="text-3xl font-bold font-mono">0</div>
              <Badge variant="info">Coming Soon</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">In Progress</div>
              <div className="text-3xl font-bold font-mono">0</div>
              <Badge variant="medium">Coming Soon</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">High Priority Inquiries</div>
              <div className="text-3xl font-bold font-mono">0</div>
              <Badge variant="high">Coming Soon</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-black/60">Completed This Month</div>
              <div className="text-3xl font-bold font-mono">0</div>
              <Badge variant="success">Coming Soon</Badge>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-black/60 text-center py-8">
            No recent activity to display
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
