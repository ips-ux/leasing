import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApplicants } from '../hooks/useApplicants';
import { useInquiries } from '../hooks/useInquiries';
import { extractFirstName } from '../utils/user';
import { DashboardToDoColumn } from '../components/dashboard/DashboardToDoColumn';
import { DashboardCenterColumn } from '../components/dashboard/DashboardCenterColumn';
import { DashboardActivityColumn } from '../components/dashboard/DashboardActivityColumn';
import { DashboardRecentActivity } from '../components/dashboard/DashboardRecentActivity';
import { NewApplicantModal } from '../components/applicants/NewApplicantModal';
import { NewInquiryModal } from '../components/inquiries/NewInquiryModal';

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
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Fetch all applicants and inquiries
  const { applicants, loading: applicantsLoading } = useApplicants();
  const { inquiries, loading: inquiriesLoading } = useInquiries();

  // Filter applicants assigned to current user
  const myApplicants = applicants.filter(a => {
    const tracking = a['2_Tracking'];
    // If assignedTo exists, use it. Otherwise fall back to createdBy for backward compatibility
    return tracking.assignedTo === user?.uid ||
      (!tracking.assignedTo && tracking.createdBy === user?.uid);
  });

  // Filter inquiries assigned to current user
  const myInquiries = inquiries.filter(i => {
    // If assignedTo exists, use it. Otherwise fall back to createdBy for backward compatibility
    return i.assignedTo === user?.uid ||
      (!i.assignedTo && i.createdBy === user?.uid);
  });

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
      type: 'applicant' as const,
      title: a['1_Profile'].name,
      status: a['2_Tracking'].status,
      updatedAt: a['2_Tracking'].updatedAt?.toDate() || new Date(0),
      link: `/applicants/${a.id}`
    })),
    ...inquiries.map(i => ({
      id: i.id,
      type: 'inquiry' as const,
      title: i.title,
      status: i.status,
      updatedAt: i.updatedAt?.toDate() || new Date(0),
      link: `/inquiries/${i.id}`
    }))
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const loading = applicantsLoading || inquiriesLoading;

  const handleOpenApplicantModal = () => setIsApplicantModalOpen(true);
  const handleOpenInquiryModal = () => setIsInquiryModalOpen(true);

  return (
    <>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-black/60">Welcome back, {extractFirstName(user?.email)}!</p>
        </motion.div>

        {/* 3-Column Grid: 3fr 4fr 3fr */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Left Column - To Do (30% / 3fr) */}
            <div className="lg:col-span-3">
              <DashboardToDoColumn
                myApplicants={myApplicants}
                allApplicants={applicants}
                loading={applicantsLoading || inquiriesLoading}
                onNewApplicant={handleOpenApplicantModal}
              />
            </div>

            {/* Center Column - Quick Actions + Stats (40% / 4fr) */}
            <div className="lg:col-span-4 space-y-6">
              <DashboardCenterColumn
                activeApplicants={activeApplicants}
                inProgressApplicants={inProgressApplicants}
                highPriorityInquiries={highPriorityInquiries}
                totalCompletedThisMonth={totalCompletedThisMonth}
                loading={loading}
                onNavigate={handleOpenApplicantModal}
                onNavigateInquiry={handleOpenInquiryModal}
              />
            </div>

            {/* Right Column - Inquiries (30% / 3fr) */}
            <div className="lg:col-span-3">
              <DashboardActivityColumn
                inquiries={myInquiries}
                loading={loading}
              />
            </div>
          </div>
        </motion.div>

        {/* Full-Width Recent Activity */}
        <motion.div variants={itemVariants}>
          <DashboardRecentActivity
            recentActivity={recentActivity}
            loading={loading}
            onNavigate={navigate}
          />
        </motion.div>
      </motion.div>

      {/* Modals */}
      <NewApplicantModal
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
      />
      <NewInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />
    </>
  );
};
