import { useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import { useApplicants } from '../hooks/useApplicants';
import { useInquiries } from '../hooks/useInquiries';
import { useReservations } from '../hooks/useReservations';
import { extractFirstName, getSchedulerStaffName } from '../utils/user';
import { timestampToLocalDate } from '../utils/date';
import { isAfter, isBefore, isEqual, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { useViewMode } from '../context/ViewModeContext';
import { DashboardToDoColumn } from '../components/dashboard/DashboardToDoColumn';
import { DashboardActivityColumn } from '../components/dashboard/DashboardActivityColumn';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';

import { Toggle } from '../components/ui';
import { NewApplicantModal } from '../components/applicants/NewApplicantModal';
import { NewInquiryModal } from '../components/inquiries/NewInquiryModal';
import { EditInquiryModal } from '../components/inquiries/EditInquiryModal';
import type { Inquiry } from '../types/inquiry';



export const Dashboard = () => {
  const { user } = useAuth();
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { showMineOnly, setShowMineOnly } = useViewMode();

  // Fetch all applicants, inquiries, and reservations
  const { applicants, loading: applicantsLoading } = useApplicants();
  const { inquiries, loading: inquiriesLoading } = useInquiries();
  const { reservations, loading: reservationsLoading } = useReservations();

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

  // Calculate Metrics
  const activeApplicants = filteredApplicants.filter(a =>
    a['2_Tracking'].status !== 'completed' && a['2_Tracking'].status !== 'cancelled'
  ).length;

  const openInquiries = filteredInquiries.filter(i =>
    i.status !== 'completed'
  ).length;

  const today = new Date();
  const reservationsToday = reservations.filter(r => {
    const rDate = new Date(r.start_time);
    const isToday = rDate.getDate() === today.getDate() &&
      rDate.getMonth() === today.getMonth() &&
      rDate.getFullYear() === today.getFullYear();

    if (!isToday) return false;

    if (showMineOnly) {
      return r.scheduled_by === getSchedulerStaffName(user?.email);
    }
    return true;
  }).length;

  const currentMonthEnd = endOfDay(endOfMonth(today));
  const currentMonthStart = startOfDay(startOfMonth(today));

  const monthlyMoveIns = applicants.filter(a => {
    // Exclude cancelled
    if (a['2_Tracking'].status === 'cancelled') return false;
    if (!a['1_Profile'].moveInDate) return false;

    const moveInDate = timestampToLocalDate(a['1_Profile'].moveInDate);

    return (isAfter(moveInDate, currentMonthStart) || isEqual(moveInDate, currentMonthStart)) &&
      (isBefore(moveInDate, currentMonthEnd) || isEqual(moveInDate, currentMonthEnd));
  }).length;



  const loading = applicantsLoading || inquiriesLoading || reservationsLoading;

  const handleOpenApplicantModal = () => setIsApplicantModalOpen(true);
  const handleOpenInquiryModal = () => setIsInquiryModalOpen(true);
  const handleInquiryClick = (inquiry: Inquiry) => setSelectedInquiry(inquiry);

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-black/60">Welcome back, {user?.Agent_Name?.split(' ')[0] || extractFirstName(user?.email)}!</p>
          </div>

          {/* Mine/Everyone Selector */}
          <Toggle
            value={showMineOnly}
            onChange={setShowMineOnly}
            leftIcon={<FontAwesomeIcon icon={faUser} />}
            rightIcon={<FontAwesomeIcon icon={faUsers} />}
          />
        </div>

        {/* Full-Width Metrics */}
        <DashboardMetrics
          activeApplicants={activeApplicants}
          openInquiries={openInquiries}
          reservationsToday={reservationsToday}
          monthlyMoveIns={monthlyMoveIns}
          loading={loading}
        />

        {/* 2-Column Grid: Applicants and Inquiries */}
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
      </div>

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
