import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button, Toggle, SegmentedControl, PageLoader } from '../components/ui';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useInquiries } from '../hooks/useInquiries';
import { useAuth } from '../hooks/useAuth';
import { useViewMode } from '../context/ViewModeContext';
import { NewInquiryModal } from '../components/inquiries/NewInquiryModal';
import { EditInquiryModal } from '../components/inquiries/EditInquiryModal';
import { InquiryListItem } from '../components/inquiries/InquiryListItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import type { Inquiry, InquiryPriority } from '../types/inquiry';

// Helper to format month display
const formatMonthDisplay = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Generate last 6 months
const generateMonths = (): string[] => {
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
  }

  return months;
};

type SortField = 'createdAt' | 'priority';
type SortDirection = 'asc' | 'desc';

export const InquiriesList = () => {
  const { user } = useAuth();
  const months = generateMonths();
  const currentMonth = months[0];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { showMineOnly, setShowMineOnly } = useViewMode();

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { inquiries, loading, updateInquiry } = useInquiries();
  const showLoader = useDelayedLoading(loading);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for new field
    }
  };

  const sortedInquiries = useMemo(() => {
    const filtered = inquiries.filter(i => {
      // Filter by Mine/Everyone
      const isMine = i.assignedTo === user?.uid || (!i.assignedTo && i.createdBy === user?.uid);
      if (showMineOnly && !isMine) return false;

      // Logic:
      // 1. If Active (open/in_progress) -> Always show
      // 2. If Completed -> Only show if it matches selectedMonth
      const isActive = i.status === 'open' || i.status === 'in_progress';
      if (isActive) return true;

      return i.month === selectedMonth;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'createdAt') {
        const dateA = a.createdAt?.toDate().getTime() || 0;
        const dateB = b.createdAt?.toDate().getTime() || 0;
        comparison = dateA - dateB;
      } else if (sortField === 'priority') {
        const priorityWeight: Record<InquiryPriority, number> = { high: 3, medium: 2, low: 1 };
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [inquiries, showMineOnly, user?.uid, sortField, sortDirection, selectedMonth]);

  // Split into Active (Open + In Progress) and Completed
  const activeInquiries = sortedInquiries.filter(i => i.status === 'open' || i.status === 'in_progress');
  const completedInquiries = sortedInquiries.filter(i => i.status === 'completed');

  const handleUpdateInquiry = async (id: string, data: Partial<Inquiry>) => {
    await updateInquiry(id, data);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Resident Inquiries</h1>
            <p className="text-black/60">Track resident &amp; prospect inquiries.</p>
          </div>

          <div className="flex items-center gap-4">
            <Toggle
              value={showMineOnly}
              onChange={setShowMineOnly}
              leftIcon={<FontAwesomeIcon icon={faUser} />}
              rightIcon={<FontAwesomeIcon icon={faUsers} />}
            />

            <div className="h-8 w-px bg-black/10"></div>

            <Button variant="primary" onClick={() => setIsNewModalOpen(true)} className="!py-2.5 text-sm !font-bold min-w-[11rem] text-center">
              + New Inquiry
            </Button>
          </div>
        </div>

        {/* Controls: Month Tabs & Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 p-4 rounded-neuro-md shadow-neuro-pressed">
          {/* Month Tabs */}
          {/* Month Tabs */}
          <SegmentedControl
            layoutId="inquiries-month-tabs"
            options={months.map(month => ({
              label: formatMonthDisplay(month),
              value: month
            }))}
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="flex-wrap"
          />

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-neuro-secondary">Sort by:</span>
            <button
              onClick={() => handleSort('createdAt')}
              className={`px-3 py-1 text-xs font-mono rounded-neuro-sm transition-all whitespace-nowrap ${sortField === 'createdAt' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed font-bold' : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary hover:shadow-neuro-raised'}`}
            >
              Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('priority')}
              className={`px-3 py-1 text-xs font-mono rounded-neuro-sm transition-all whitespace-nowrap ${sortField === 'priority' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed font-bold' : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary hover:shadow-neuro-raised'}`}
            >
              Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Loading State - only shown after 150ms to avoid flash on fast loads */}
        {showLoader && (
          <PageLoader />
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Active Inquiries Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-neuro-primary">Active Inquiries</h2>
                <span className="px-2 py-1 bg-neuro-base shadow-neuro-pressed rounded-neuro-sm text-xs font-bold text-neuro-secondary">
                  {activeInquiries.length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeInquiries.length === 0 ? (
                    <div className="text-center py-12 text-neuro-muted italic bg-neuro-base/50 rounded-neuro-md border-2 border-dashed border-neuro-secondary/20">
                      No active inquiries.
                    </div>
                  ) : (
                    activeInquiries.map((inquiry) => (
                      <InquiryListItem
                        key={inquiry.id}
                        inquiry={inquiry}
                        onUpdate={handleUpdateInquiry}
                        onClick={() => setSelectedInquiry(inquiry)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Completed Inquiries Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-neuro-secondary">Completed</h2>
                <span className="px-2 py-1 bg-neuro-base shadow-neuro-pressed rounded-neuro-sm text-xs font-bold text-neuro-secondary">
                  {completedInquiries.length}
                </span>
              </div>

              <div className="space-y-3 opacity-80">
                <AnimatePresence mode="popLayout">
                  {completedInquiries.length === 0 ? (
                    <div className="text-center py-8 text-neuro-muted italic">
                      No completed inquiries.
                    </div>
                  ) : (
                    completedInquiries.map((inquiry) => (
                      <InquiryListItem
                        key={inquiry.id}
                        inquiry={inquiry}
                        onUpdate={handleUpdateInquiry}
                        onClick={() => setSelectedInquiry(inquiry)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        )}
      </div>

      <NewInquiryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
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
