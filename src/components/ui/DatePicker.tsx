import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  label?: string;
  name: string;
  value: Date;
  onChange: (date: Date) => void;
  required?: boolean;
  error?: string;
}

export const DatePicker = ({ label, name, value, onChange, required, error }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorClass = error ? 'bg-neuro-peach/30' : '';
  const errorShadow = error ? '0 0 0 2px rgba(245, 198, 198, 0.4)' : '';

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Format: "YYYY-MM-DD"
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day); // month is 0-indexed
      onChange(newDate);
      setViewDate(newDate);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setViewDate(newDate);
    setIsOpen(false);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(viewDate);
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === value.getDate() &&
      viewDate.getMonth() === value.getMonth() &&
      viewDate.getFullYear() === value.getFullYear()
    );
  };

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {label && (
        <label className="font-sans font-medium text-sm text-neuro-primary">
          {label}
          {required && <span className="text-neuro-peach ml-1">*</span>}
        </label>
      )}

      {/* Native date input with calendar icon */}
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          name={name}
          value={value.toISOString().split('T')[0]}
          onChange={handleInputChange}
          required={required}
          onClick={(e) => {
            // If clicking on calendar icon (right side), open our popover instead
            const input = e.currentTarget;
            const rect = input.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX > rect.width - 40) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={`px-4 py-2 rounded-neuro-md shadow-neuro-pressed bg-white/50 font-sans text-neuro-primary focus:outline-none transition-all duration-200 w-full ${errorClass}`}
          style={{
            boxShadow: error ? errorShadow : undefined
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 197, 249, 0.3)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.boxShadow = '';
            }
          }}
        />
      </div>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 bg-white/80 backdrop-blur-md rounded-neuro-lg shadow-neuro-raised p-4"
            style={{
              marginTop: '2.5rem'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-3 py-1 rounded-neuro-sm shadow-neuro-flat bg-neuro-blue font-semibold text-neuro-primary hover:shadow-neuro-raised transition-all duration-200"
              >
                ←
              </button>
              <span className="font-sans font-semibold text-sm text-neuro-primary">{monthName}</span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-3 py-1 rounded-neuro-sm shadow-neuro-flat bg-neuro-blue font-semibold text-neuro-primary hover:shadow-neuro-raised transition-all duration-200"
              >
                →
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-neuro-secondary py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const today = isToday(day);
                const selected = isSelected(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`
                      aspect-square flex items-center justify-center text-sm font-medium rounded-neuro-sm transition-all duration-200 text-neuro-primary
                      ${selected
                        ? 'bg-neuro-lavender shadow-neuro-raised'
                        : today
                          ? 'bg-neuro-mint shadow-neuro-flat'
                          : 'bg-white/50 shadow-neuro-flat hover:shadow-neuro-raised hover:bg-neuro-blue'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Today Button */}
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(today);
                setViewDate(today);
                setIsOpen(false);
              }}
              className="w-full mt-4 px-4 py-2 rounded-neuro-md shadow-neuro-flat bg-neuro-mint font-semibold text-sm text-neuro-primary hover:shadow-neuro-raised transition-all duration-200"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="text-neuro-primary text-sm font-sans opacity-80">
          {error}
        </span>
      )}
    </div>
  );
};
