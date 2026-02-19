/**
 * Scheduler Page
 * Main amenity scheduler interface with calendar, list, and items views
 */

import { useState, useRef, useEffect } from 'react';
import { Button, SegmentedControl, PageLoader } from '../components/ui';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import {
  SchedulerCalendar,
  SchedulerList,
  SchedulerItems,
  ReservationModal,
  TypeSelectionModal,
  CompleteReservationModal,
  ConfirmationDialog,
} from '../components/scheduler';
import { useReservations } from '../hooks/useReservations';
import { useSchedulerItems } from '../hooks/useSchedulerItems';
import { useAuth } from '../hooks/useAuth';
import type { Reservation, ResourceType, ReservationFormData } from '../types/scheduler';
import { getReservationCost, getCancellationFee, formatPrice } from '../services/scheduler/pricingService';
import { openOutlookCalendar } from '../services/scheduler/outlookCalendarService';
import FullCalendar from '@fullcalendar/react';
import { getSchedulerStaffName } from '../utils/user';
import toast from 'react-hot-toast';

type ViewType = 'calendar' | 'list' | 'items';

export const Scheduler = () => {
  const [view, setView] = useState<ViewType>('calendar');
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [currentDateTitle, setCurrentDateTitle] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarRef = useRef<FullCalendar>(null);

  // Hooks
  const {
    reservations,
    loading: loadingReservations,
    createReservation,
    updateReservation,
    cancelReservation,
    restoreReservation,
    completeReservation,
    deleteReservation,
  } = useReservations();

  const { items, loading: loadingItems } = useSchedulerItems();
  const { user } = useAuth();

  const staffName = getSchedulerStaffName(user?.email);

  // Calendar Control Handlers
  const handlePrev = () => {
    if (view === 'calendar') {
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.prev();
    } else {
      // For list view, manually update state
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
      updateTitle(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'calendar') {
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.next();
    } else {
      // For list view, manually update state
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
      updateTitle(newDate);
    }
  };

  const handleToday = () => {
    if (view === 'calendar') {
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.today();
    } else {
      // For list view, manually update state
      const newDate = new Date();
      setCurrentDate(newDate);
      updateTitle(newDate);
    }
  };

  const updateTitle = (date: Date) => {
    const title = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    setCurrentDateTitle(title);
  };

  // Callback from FullCalendar when dates change
  const handleDatesSet = (arg: any) => {
    setCurrentDateTitle(arg.view.title);
    // Update our local state to match calendar
    setCurrentDate(arg.view.currentStart);
  };

  // Initialize title on mount
  useEffect(() => {
    if (view === 'list') {
      updateTitle(currentDate);
    }
    // For calendar, datesSet will handle it
  }, [view]);

  // Handlers for new reservation flow
  const handleNewReservation = () => {
    setShowTypeSelection(true);
  };

  const handleSelectType = (type: ResourceType) => {
    setSelectedType(type);
    setEditingReservation(null);
    setShowTypeSelection(false);
    setShowReservationModal(true);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowTypeSelection(true);
  };

  const handleEventClick = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setSelectedType(reservation.resource_type);
    setShowReservationModal(true);
  };

  // Handlers for reservation actions
  const handleSaveReservation = async (data: ReservationFormData) => {
    const priceInfo = getReservationCost(
      data.resource_type,
      new Date(data.start_time),
      new Date(data.end_time)
    );

    if (editingReservation) {
      // Update existing reservation
      await updateReservation(editingReservation.tx_id, {
        ...data,
        total_cost: priceInfo.total,
        edit_by: staffName,
        last_update: new Date().toISOString(),
      }, staffName);
    } else {
      // Create new reservation
      const itemDisplay = data.item || data.items?.join(', ') || '';
      const tx_id = await createReservation({
        rented_to: data.rented_to,
        item: itemDisplay,
        items: data.items,
        resource_type: data.resource_type,
        start_time: data.start_time,
        end_time: data.end_time,
        total_cost: priceInfo.total,
        scheduled_by: staffName,
        rental_notes: data.rental_notes,
        override_lock: data.override_lock,
      });

      // Build reservation object for Outlook calendar
      const reservationForCalendar: Reservation = {
        tx_id,
        rented_to: data.rented_to,
        item: itemDisplay,
        items: data.items,
        resource_type: data.resource_type,
        status: 'Scheduled',
        start_time: data.start_time,
        end_time: data.end_time,
        total_cost: priceInfo.total,
        scheduled_by: staffName,
        rental_notes: data.rental_notes,
        override_lock: data.override_lock,
        created_at: new Date().toISOString(),
      };

      // Show toast with option to add to Outlook calendar
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span>Reservation created!</span>
            <button
              onClick={() => {
                openOutlookCalendar(reservationForCalendar);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 text-sm font-medium bg-neuro-blue text-white rounded-md hover:bg-neuro-blue/90 transition-colors"
            >
              Add to Outlook
            </button>
          </div>
        ),
        {
          duration: 6000,
          position: 'bottom-center',
        }
      );
    }

    setShowReservationModal(false);
    setEditingReservation(null);
    setSelectedType(null);
    setSelectedDate(null);
  };

  const handleCancelReservation = async () => {
    if (!editingReservation) return;

    await cancelReservation(
      editingReservation.tx_id,
      editingReservation.start_time,
      editingReservation.resource_type
    );
    setShowCancelConfirmation(false);
    setShowReservationModal(false);
    setEditingReservation(null);
  };

  const handleRestoreReservation = async () => {
    if (!editingReservation) return;
    await restoreReservation(editingReservation.tx_id);
    setShowReservationModal(false);
    setEditingReservation(null);
  };

  const handleCompleteReservation = async (returnNotes: string): Promise<void> => {
    if (!editingReservation) return;
    await completeReservation(
      editingReservation.tx_id,
      returnNotes,
      staffName
    );
  };

  const handleDeleteReservation = async () => {
    if (!editingReservation) return;
    await deleteReservation(editingReservation.tx_id);
    setShowDeleteConfirmation(false);
    setShowReservationModal(false);
    setEditingReservation(null);
  };

  const isLoading = loadingReservations || loadingItems;
  const showLoader = useDelayedLoading(isLoading);

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-4xl font-bold mb-2">Amenity Scheduler</h1>
          <p className="text-black/60">Manage amenity reservations and items</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Calendar Controls - Show in calendar and list views */}
          {view !== 'items' && (
            <div className="flex items-center gap-3 bg-neuro-element px-4 py-2 rounded-neuro-lg shadow-neuro-flat">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-neuro-sm text-neuro-secondary hover:text-neuro-primary hover:bg-white/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-neuro-sm text-neuro-secondary hover:text-neuro-primary hover:bg-white/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <h2 className="text-sm font-semibold text-neuro-primary min-w-[130px] text-center">
                {currentDateTitle}
              </h2>

              <button
                onClick={handleToday}
                className="px-3 py-1 text-sm font-medium text-neuro-primary bg-neuro-lavender rounded-neuro-sm shadow-neuro-flat hover:opacity-90 transition-opacity"
              >
                Today
              </button>
            </div>
          )}

          {/* View Switcher */}
          <SegmentedControl
            layoutId="scheduler-view-tabs"
            options={[
              { label: 'Calendar', value: 'calendar' },
              { label: 'List View', value: 'list' },
              { label: 'Items', value: 'items' },
            ]}
            value={view}
            onChange={(value) => setView(value as ViewType)}
          />

          <div className="h-8 w-px bg-black/10"></div>

          {/* New Reservation Button */}
          {view !== 'items' && (
            <Button variant="primary" onClick={handleNewReservation} className="!py-2.5 text-sm !font-bold min-w-[11rem] text-center">
              + New Reservation
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="rounded-neuro-md bg-white/60 shadow-neuro-pressed flex-1 overflow-hidden flex flex-col">
        {showLoader ? (
          <div className="flex items-center justify-center h-full">
            <PageLoader />
          </div>
        ) : (
          <>
            {view === 'calendar' && (
              <SchedulerCalendar
                ref={calendarRef}
                reservations={reservations}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                onDatesSet={handleDatesSet}
              />
            )}
            {view === 'list' && (
              <SchedulerList
                reservations={reservations}
                onEditReservation={handleEventClick}
                currentDate={currentDate}
              />
            )}
            {view === 'items' && <SchedulerItems items={items} />}
          </>
        )}
      </div>

      {/* Modals */}
      <TypeSelectionModal
        isOpen={showTypeSelection}
        onClose={() => {
          setShowTypeSelection(false);
          setSelectedDate(null);
        }}
        onSelectType={handleSelectType}
      />

      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setEditingReservation(null);
          setSelectedType(null);
          setSelectedDate(null);
        }}
        onSave={handleSaveReservation}
        onCancel={
          editingReservation
            ? async () => setShowCancelConfirmation(true)
            : undefined
        }
        onRestore={
          editingReservation?.status === 'Cancelled'
            ? handleRestoreReservation
            : undefined
        }
        onComplete={
          editingReservation ? () => setShowCompleteModal(true) : undefined
        }
        onDelete={
          editingReservation ? () => setShowDeleteConfirmation(true) : undefined
        }
        reservation={editingReservation}
        resourceType={selectedType || undefined}
        initialDate={selectedDate || undefined}
        selectedStaff={staffName}
      />

      <CompleteReservationModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        reservation={editingReservation}
        onComplete={handleCompleteReservation}
      />

      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleCancelReservation}
        title="Cancel Reservation"
        message={`Are you sure you want to cancel this reservation? ${editingReservation
          ? `A cancellation fee of ${formatPrice(getCancellationFee(
            editingReservation.resource_type,
            editingReservation.start_time
          ))} may apply.`
          : ''
          }`}
        confirmText="Cancel Reservation"
        confirmVariant="danger"
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteReservation}
        title="Delete Reservation"
        message="Are you sure you want to permanently delete this reservation? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};
