/**
 * TimePickerWheel Component
 * Custom wheel picker for Sky Lounge (10am-6pm)
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimePickerWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime: (time: string) => void;
  initialTime?: string;
}

export const TimePickerWheel = ({
  isOpen,
  onClose,
  onSelectTime,
  initialTime = '10:00',
}: TimePickerWheelProps) => {
  // Parse initial time
  const [hour, minute] = initialTime.split(':');
  const initialHour = parseInt(hour);
  const initialMinute = parseInt(minute);

  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sky Lounge hours: 10am-6pm (using 24h format for correct AM/PM logic)
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18];
  const minutes = [0, 15, 30, 45];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getAMPM = (hour: number): string => {
    return hour >= 12 ? 'PM' : 'AM';
  };

  const formatHour = (hour: number): string => {
    if (hour === 12) return '12';
    return hour > 12 ? String(hour - 12) : String(hour);
  };

  const handleConfirm = () => {
    const formattedHour = selectedHour.toString().padStart(2, '0');
    const formattedMinute = selectedMinute.toString().padStart(2, '0');
    onSelectTime(`${formattedHour}:${formattedMinute}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-neuro-element rounded-neuro-xl shadow-neuro-hover w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <h3 className="text-lg font-bold text-neuro-primary">Select Start Time</h3>
            <button
              onClick={onClose}
              className="text-neuro-secondary hover:text-neuro-primary text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Time Picker */}
          <div className="p-6">
            <div className="flex items-center justify-center gap-4">
              {/* Hour Column */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-neuro-secondary mb-2">Hour</div>
                <div className="bg-white/20 rounded-neuro-md p-2 h-40 overflow-y-auto space-y-1 w-20">
                  {hours.map((h) => (
                    <button
                      key={h}
                      onClick={() => setSelectedHour(h)}
                      className={`w-full px-3 py-2 rounded-neuro-sm transition-all duration-200 ${selectedHour === h
                          ? 'bg-neuro-lavender text-neuro-primary font-bold shadow-neuro-flat'
                          : 'bg-neuro-element text-neuro-secondary hover:bg-white/40'
                        }`}
                    >
                      {formatHour(h)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="text-2xl font-bold text-neuro-primary">:</div>

              {/* Minute Column */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-neuro-secondary mb-2">Minute</div>
                <div className="bg-white/20 rounded-neuro-md p-2 h-40 overflow-y-auto space-y-1 w-20">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMinute(m)}
                      className={`w-full px-3 py-2 rounded-neuro-sm transition-all duration-200 ${selectedMinute === m
                          ? 'bg-neuro-lavender text-neuro-primary font-bold shadow-neuro-flat'
                          : 'bg-neuro-element text-neuro-secondary hover:bg-white/40'
                        }`}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Display */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-neuro-secondary mb-2">Period</div>
                <div className="bg-white/20 rounded-neuro-md p-2 h-40 flex items-center justify-center w-16">
                  <div className="text-lg font-bold text-neuro-primary">{getAMPM(selectedHour)}</div>
                </div>
              </div>
            </div>

            {/* Selected Time Display */}
            <div className="mt-6 text-center">
              <div className="text-sm text-neuro-secondary mb-1">Selected Time</div>
              <div className="text-2xl font-bold text-neuro-primary">
                {formatHour(selectedHour)}:{selectedMinute.toString().padStart(2, '0')}{' '}
                {getAMPM(selectedHour)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 flex justify-end">
            <button
              onClick={handleConfirm}
              className="px-6 py-2 rounded-neuro-md bg-neuro-lavender text-neuro-primary font-medium shadow-neuro-flat hover:shadow-neuro-hover active:shadow-neuro-pressed transition-all duration-200"
            >
              OK
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
