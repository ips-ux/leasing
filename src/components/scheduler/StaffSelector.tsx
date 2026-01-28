/**
 * StaffSelector Component
 * Staff member selection dropdown with localStorage persistence
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Staff } from '../../types/scheduler';

interface StaffSelectorProps {
  staff: Staff[];
  selectedStaff: string | null;
  onSelectStaff: (staffName: string) => void;
}

export const StaffSelector = ({
  staff,
  selectedStaff,
  onSelectStaff,
}: StaffSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleSelectStaff = (staffName: string) => {
    onSelectStaff(staffName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-flat hover:shadow-neuro-hover transition-all duration-200 flex items-center gap-2 text-neuro-primary font-medium"
      >
        <span>{selectedStaff || 'Select Staff'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform w-4 h-4 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-neuro-element rounded-neuro-lg shadow-neuro-hover overflow-hidden z-50"
          >
            <div className="p-2 border-b border-white/20 text-sm font-semibold text-neuro-secondary">
              Select Staff Member
            </div>
            <div className="max-h-64 overflow-y-auto">
              {staff.map((member, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectStaff(member.name)}
                  className={`w-full px-4 py-2 text-left hover:bg-white/40 transition-colors flex items-center justify-between ${selectedStaff === member.name ? 'bg-white/30' : ''
                    }`}
                >
                  <span className="text-neuro-primary">{member.name}</span>
                  {selectedStaff === member.name && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-neuro-mint w-4 h-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
