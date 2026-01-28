/**
 * NotificationsPanel Component
 * Pending completions tracker with bell icon and badge
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reservation } from '../../types/scheduler';

interface NotificationsPanelProps {
  reservations: Reservation[];
  onClickReservation: (reservation: Reservation) => void;
}

interface PendingCompletion {
  reservation: Reservation;
  daysOverdue: number;
}

export const NotificationsPanel = ({
  reservations,
  onClickReservation,
}: NotificationsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate pending completions
  const pendingCompletions = useMemo(() => {
    const now = new Date();
    const pending: PendingCompletion[] = [];

    reservations
      .filter((res) => res.status === 'Scheduled')
      .forEach((res) => {
        const endDate = new Date(res.end_time);
        if (endDate < now) {
          const daysDiff = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
          pending.push({ reservation: res, daysOverdue: daysDiff });
        }
      });

    // Sort by end date (oldest first)
    pending.sort((a, b) => {
      return new Date(a.reservation.end_time).getTime() - new Date(b.reservation.end_time).getTime();
    });

    return pending;
  }, [reservations]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClickNotification = (reservation: Reservation) => {
    onClickReservation(reservation);
    setIsOpen(false);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })} - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-neuro-md bg-neuro-element shadow-neuro-flat hover:shadow-neuro-hover transition-all duration-200"
        title="Pending Completions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neuro-primary"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {/* Badge */}
        {pendingCompletions.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-neuro-peach text-neuro-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-neuro-flat">
            {pendingCompletions.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-neuro-element rounded-neuro-lg shadow-neuro-hover overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/20 text-sm font-semibold text-neuro-secondary">
              Pending Completions
            </div>
            <div className="max-h-96 overflow-y-auto">
              {pendingCompletions.length === 0 ? (
                <div className="p-4 text-center text-neuro-secondary">
                  No pending completions
                </div>
              ) : (
                pendingCompletions.map(({ reservation, daysOverdue }) => (
                  <button
                    key={reservation.tx_id}
                    onClick={() => handleClickNotification(reservation)}
                    className="w-full p-4 text-left hover:bg-white/40 transition-colors border-b border-white/10 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-neuro-primary">
                        Unit {reservation.rented_to}
                      </span>
                      <span className="text-xs text-neuro-peach font-medium">
                        {daysOverdue === 0
                          ? 'Due today'
                          : `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`}
                      </span>
                    </div>
                    <div className="text-sm text-neuro-secondary mb-1">{reservation.item}</div>
                    <div className="text-xs text-neuro-secondary">
                      {formatDateRange(reservation.start_time, reservation.end_time)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
