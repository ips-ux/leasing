import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '../components/ui';
import { useInquiries } from '../hooks/useInquiries';
import { NewInquiryModal } from '../components/inquiries/NewInquiryModal';
import { EditInquiryModal } from '../components/inquiries/EditInquiryModal';
import type { Inquiry, InquiryPriority, InquiryStatus } from '../types/inquiry';

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

const getPriorityBadge = (priority: InquiryPriority): 'high' | 'medium' | 'low' => {
  return priority;
};

export const InquiriesList = () => {
  const months = generateMonths();
  const currentMonth = months[0];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [draggedInquiry, setDraggedInquiry] = useState<Inquiry | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { inquiries, loading, updateInquiry } = useInquiries(selectedMonth);

  const openInquiries = inquiries.filter((i) => i.status === 'open');
  const inProgressInquiries = inquiries.filter((i) => i.status === 'in_progress');
  const completedInquiries = inquiries.filter((i) => i.status === 'completed');

  const handleDragStart = (inquiry: Inquiry) => {
    setDraggedInquiry(inquiry);
  };

  const handleDragEnd = () => {
    setDraggedInquiry(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = async (targetStatus: InquiryStatus) => {
    if (!draggedInquiry || draggedInquiry.status === targetStatus) {
      setDraggedInquiry(null);
      return;
    }

    await updateInquiry(draggedInquiry.id, { status: targetStatus });
    setDraggedInquiry(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            Resident Inquiries
          </motion.h1>

          <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
            + New Inquiry
          </Button>
        </div>

      {/* Month Tabs */}
      <motion.div
        className="flex gap-2 flex-wrap border-b-[3px] border-black pb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`
              px-4 py-2 font-semibold border-[3px] border-black transition-all
              ${selectedMonth === month
                ? 'bg-lavender text-black'
                : 'bg-white/10 text-black/70 hover:bg-white/20'
              }
            `}
          >
            {formatMonthDisplay(month)}
          </button>
        ))}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/10 border-[3px] border-black/20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Inquiry Columns */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Open Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card priority="high" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Open</h2>
                <Badge variant="high">{openInquiries.length}</Badge>
              </div>

              <div
                className="space-y-3 max-h-[600px] overflow-y-auto min-h-[200px]"
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop('open');
                }}
              >
                {openInquiries.length === 0 && (
                  <p className="text-black/50 text-sm font-mono text-center py-8">
                    No open inquiries
                  </p>
                )}

                {openInquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onClick={() => setSelectedInquiry(inquiry)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedInquiry?.id === inquiry.id}
                  />
                ))}
              </div>
            </Card>
          </motion.div>

          {/* In Progress Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card priority="medium" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">In Progress</h2>
                <Badge variant="info">{inProgressInquiries.length}</Badge>
              </div>

              <div
                className="space-y-3 max-h-[600px] overflow-y-auto min-h-[200px]"
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop('in_progress');
                }}
              >
                {inProgressInquiries.length === 0 && (
                  <p className="text-black/50 text-sm font-mono text-center py-8">
                    No inquiries in progress
                  </p>
                )}

                {inProgressInquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onClick={() => setSelectedInquiry(inquiry)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedInquiry?.id === inquiry.id}
                  />
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Completed Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card priority="low" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Completed</h2>
                <Badge variant="success">{completedInquiries.length}</Badge>
              </div>

              <div
                className="space-y-3 max-h-[600px] overflow-y-auto min-h-[200px]"
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop('completed');
                }}
              >
                {completedInquiries.length === 0 && (
                  <p className="text-black/50 text-sm font-mono text-center py-8">
                    No completed inquiries
                  </p>
                )}

                {completedInquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onClick={() => setSelectedInquiry(inquiry)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedInquiry?.id === inquiry.id}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
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

// Inquiry Card Component
const InquiryCard = ({
  inquiry,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  inquiry: Inquiry;
  onClick: () => void;
  onDragStart: (inquiry: Inquiry) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) => {
  const handleClick = () => {
    // Prevent navigation when dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(inquiry)}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`
        bg-white/10 backdrop-blur-sm border-[3px] border-black p-3
        hover:bg-white/20 cursor-move transition-all
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {inquiry.unitNumber && (
            <Badge variant="info" className="flex-shrink-0">
              {inquiry.unitNumber}
            </Badge>
          )}
          <h3 className="font-bold text-sm line-clamp-1 min-w-0">{inquiry.title}</h3>
        </div>
        <Badge variant={getPriorityBadge(inquiry.priority)} className="flex-shrink-0">
          {inquiry.priority.toUpperCase()}
        </Badge>
      </div>

      <p className="text-xs text-black/70 font-bold line-clamp-2 mt-2">{inquiry.description}</p>
      <p className="text-xs text-black/70 em line-clamp-2 mt-2">{inquiry.notes}</p>
    </div>
  );
};
