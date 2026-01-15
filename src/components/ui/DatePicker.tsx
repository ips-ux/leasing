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
  const errorClass = error ? 'border-peach' : '';

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
        <label className="font-sans font-semibold text-sm">
          {label}
          {required && <span className="text-peach ml-1">*</span>}
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
          className={`px-4 py-2 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans focus:outline-none focus:ring-4 focus:ring-lavender/40 w-full ${errorClass}`}
        />
      </div>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 bg-white border-4 border-black shadow-brutal-lg p-4"
            style={{
              marginTop: '2.5rem',
              boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-1 py-1 border-3 border-black bg-pale-blue font-bold hover:bg-lavender transition-colors"
              >
                ←
              </button>
              <span className="font-sans font-bold text-sm">{monthName}</span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-1 py-1 border-3 border-black bg-pale-blue font-bold hover:bg-lavender transition-colors"
              >
                →
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-black/60 py-1"
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
                      aspect-square flex items-center justify-center text-sm font-semibold
                      border-2 border-black transition-all duration-100
                      ${selected
                        ? 'bg-lavender border-black shadow-brutal-sm'
                        : today
                          ? 'bg-mint border-black'
                          : 'bg-white hover:bg-pale-blue border-black/20'
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
              className="w-full mt-4 px-4 py-2 border-3 border-black bg-mint font-bold text-sm hover:bg-pale-blue transition-colors"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="text-peach text-sm font-sans">
          {error}
        </span>
      )}
    </div>
  );
};
