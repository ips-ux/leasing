/**
 * SchedulerCalendar Component
 * FullCalendar integration with color-coded events
 */

import { useMemo, forwardRef } from 'react';
import '../../styles/fullcalendar-base.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventInput, EventClickArg } from '@fullcalendar/core';
import type { Reservation, ResourceType } from '../../types/scheduler';

interface SchedulerCalendarProps {
  reservations: Reservation[];
  onEventClick: (reservation: Reservation) => void;
  onDateClick: (date: string) => void;
  onDatesSet?: (arg: any) => void;
}

// Color mapping for resource types (handles legacy lowercase format)
const getEventColor = (resourceType: ResourceType | string): string => {
  switch (resourceType?.toUpperCase()) {
    case 'GUEST_SUITE':
      return '#F5EEC8'; // Yellow
    case 'SKY_LOUNGE':
      return '#C8D9F5'; // Blue
    case 'GEAR_SHED':
      return '#C8E6D0'; // Mint Green
    default:
      return '#D4C5F9'; // Lavender
  }
};

const getTextColor = (): string => {
  return '#1a1a1a'; // Dark text for readability
};

export const SchedulerCalendar = forwardRef<FullCalendar, SchedulerCalendarProps>(({
  reservations,
  onEventClick,
  onDateClick,
  onDatesSet,
}, ref) => {
  // Helper to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Transform reservations into FullCalendar events
  const events = useMemo<EventInput[]>(() => {
    const eventList: EventInput[] = [];

    reservations.forEach((res) => {
      if (res.status === 'Cancelled') {
        return; // Skip cancelled reservations
      }

      const startDate = new Date(res.start_time);
      const endDate = new Date(res.end_time);

      // Check if this is a multi-day event (different calendar dates)
      const startDateStr = formatDateLocal(startDate);
      const endDateStr = formatDateLocal(endDate);
      const isMultiDay = startDateStr !== endDateStr;

      // For multi-day events, FullCalendar's end date is exclusive
      // We need to add 1 day to the end date so the event displays through the last day
      // Use date-only strings (YYYY-MM-DD) so FullCalendar treats them as all-day spanning events
      let displayStart: string;
      let displayEnd: string;

      if (isMultiDay) {
        // Use date-only format for multi-day events
        displayStart = startDateStr;
        // Add 1 day to end date (exclusive end)
        const adjustedEnd = new Date(endDate);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        displayEnd = formatDateLocal(adjustedEnd);
      } else {
        // Single day event - use original times
        displayStart = res.start_time;
        displayEnd = res.end_time;
      }

      // For Gear Shed with multiple items, create separate events for each item
      if (res.resource_type?.toUpperCase() === 'GEAR_SHED' && res.items && res.items.length > 0) {
        res.items.forEach((item) => {
          eventList.push({
            id: `${res.tx_id}-${item}`,
            title: `${res.rented_to} - ${item}`,
            start: displayStart,
            end: displayEnd,
            allDay: isMultiDay,
            backgroundColor: getEventColor(res.resource_type),
            borderColor: getEventColor(res.resource_type),
            textColor: getTextColor(),
            extendedProps: {
              reservation: res,
            },
          });
        });
      } else {
        // Single event for Guest Suite and Sky Lounge
        eventList.push({
          id: res.tx_id,
          title: `${res.rented_to} - ${res.item}`,
          start: displayStart,
          end: displayEnd,
          allDay: isMultiDay,
          backgroundColor: getEventColor(res.resource_type),
          borderColor: getEventColor(res.resource_type),
          textColor: getTextColor(),
          extendedProps: {
            reservation: res,
          },
        });
      }
    });

    return eventList;
  }, [reservations]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const reservation = clickInfo.event.extendedProps.reservation as Reservation;
    onEventClick(reservation);
  };

  const handleDateClick = (clickInfo: DateClickArg) => {
    const calendarApi = (ref as React.RefObject<FullCalendar>)?.current?.getApi();

    // Check if clicked date is in a different month (fc-day-other class)
    const dayEl = clickInfo.dayEl;
    const isOtherMonth = dayEl.classList.contains('fc-day-other');

    if (isOtherMonth && calendarApi) {
      // Navigate to the clicked date's month
      calendarApi.gotoDate(clickInfo.date);
    } else {
      // Open reservation modal for current month dates
      onDateClick(clickInfo.dateStr.split('T')[0]);
    }
  };

  return (
    <>
      <FullCalendar
        ref={ref}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={onDatesSet}
        height="100%"
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkText="more"
        nowIndicator={true}
        // Styling overrides
        themeSystem="standard"
        eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
      />
      <style>{`
        .fc {
          font-family: inherit;
          --fc-border-color: #4A5568;
          --fc-neutral-text-color: #4A5568;
        }
        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: rgba(74, 85, 104, 0.2);
        }
        .fc .fc-button {
          background-color: #D4C5F9;
          border: none;
          text-transform: capitalize;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.1);
          color: #4A5568;
        }
        .fc .fc-button:hover {
          background-color: #C5B5E9;
        }
        .fc .fc-button-primary:disabled {
          opacity: 0.5;
        }
        .fc .fc-button-active {
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1);
        }
        .fc .fc-daygrid-day-number {
          color: #4A5568;
          font-weight: 500;
          text-decoration: none;
        }
        .fc .fc-col-header-cell-cushion {
          color: #4A5568;
          font-weight: 600;
          text-decoration: none;
        }
        .fc .fc-event {
          border-radius: 8px;
          padding: 2px 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: transparent;
        }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background-color: #D4C5F9;
          color: #4A5568;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 4px;
        }
        .fc .fc-timegrid-slot {
          height: 3rem;
        }
        .fc-direction-ltr .fc-timegrid-col-events {
          margin: 0 2px;
        }
      `}</style>
    </>
  );
});
