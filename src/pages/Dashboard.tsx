import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApplicants } from '../hooks/useApplicants';
import { useInquiries } from '../hooks/useInquiries';
import { extractFirstName } from '../utils/user';
import { DashboardToDoColumn } from '../components/dashboard/DashboardToDoColumn';
import { DashboardActivityColumn } from '../components/dashboard/DashboardActivityColumn';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { DashboardRecentActivity } from '../components/dashboard/DashboardRecentActivity';
import { NewApplicantModal } from '../components/applicants/NewApplicantModal';
import { NewInquiryModal } from '../components/inquiries/NewInquiryModal';
import { EditInquiryModal } from '../components/inquiries/EditInquiryModal';
import type { Inquiry } from '../types/inquiry';

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
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showMineOnly, setShowMineOnly] = useState(true);

  // Fetch all applicants and inquiries
  const { applicants, loading: applicantsLoading } = useApplicants();
  const { inquiries, loading: inquiriesLoading } = useInquiries();

  // Filter applicants based on toggle
  const filteredApplicants = applicants.filter(a => {
    if (!showMineOnly) return true;
    const tracking = a['2_Tracking'];
    return tracking.assignedTo === user?.uid ||
      (!tracking.assignedTo && tracking.createdBy === user?.uid);
  });

  // Filter inquiries based on toggle
  const filteredInquiries = inquiries.filter(i => {
    if (!showMineOnly) return true;
    return i.assignedTo === user?.uid ||
      (!i.assignedTo && i.createdBy === user?.uid);
  });

  // Calculate Metrics (always based on all data for global overview)
  const activeApplicants = applicants.filter(a =>
    a['2_Tracking'].status !== 'completed' && a['2_Tracking'].status !== 'cancelled'
  ).length;
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
  const handleInquiryClick = (inquiry: Inquiry) => setSelectedInquiry(inquiry);

  return (
    <>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-black/60">Welcome back, {extractFirstName(user?.email)}!</p>
            </div>

            {/* Mine/Everyone Selector */}
            <div className="flex border-[3px] border-black bg-white/10 w-fit">
              <button
                onClick={() => setShowMineOnly(true)}
                className={`px-6 py-2 font-bold transition-all ${showMineOnly
                  ? 'bg-lavender text-black shadow-brutal-sm'
                  : 'bg-white/10 text-black/60 hover:bg-white/20'
                  }`}
              >
                Mine
              </button>
              <div className="w-[3px] bg-black" />
              <button
                onClick={() => setShowMineOnly(false)}
                className={`px-6 py-2 font-bold transition-all ${!showMineOnly
                  ? 'bg-lavender text-black shadow-brutal-sm'
                  : 'bg-white/10 text-black/60 hover:bg-white/20'
                  }`}
              >
                Everyone
              </button>
            </div>
          </div>
        </motion.div>

        {/* Full-Width Metrics */}
        <motion.div variants={itemVariants}>
          <DashboardMetrics
            activeApplicants={activeApplicants}
            inProgressApplicants={inProgressApplicants}
            highPriorityInquiries={highPriorityInquiries}
            totalCompletedThisMonth={totalCompletedThisMonth}
            loading={loading}
          />
        </motion.div>

        {/* 2-Column Grid: Applicants and Inquiries */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Applicants */}
            <DashboardToDoColumn
              applicants={filteredApplicants}
              loading={loading}
              onNewApplicant={handleOpenApplicantModal}
            />

            {/* Right Column - Inquiries */}
            <DashboardActivityColumn
              inquiries={filteredInquiries}
              loading={loading}
              onNewInquiry={handleOpenInquiryModal}
              onInquiryClick={handleInquiryClick}
            />
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
      <EditInquiryModal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        inquiry={selectedInquiry}
        onSuccess={() => setSelectedInquiry(null)}
      />
    </>
  );
};
