/**
 * ReservationModal Component
 * Main form for creating/editing reservations with conditional rendering based on type
 */

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import type { Reservation, ResourceType, ReservationFormData } from '../../types/scheduler';
import { Button, Input, Textarea, Modal } from '../ui';
import { GearShedSelector } from './GearShedSelector';
import { TimePickerWheel } from './TimePickerWheel';
import { useSchedulerItems } from '../../hooks/useSchedulerItems';
import { validateReservation } from '../../services/scheduler/validationService';
import { getReservationCost, getCancellationFee, formatPrice } from '../../services/scheduler/pricingService';
import { openOutlookCalendar } from '../../services/scheduler/outlookCalendarService';
import toast from 'react-hot-toast';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReservationFormData) => Promise<void>;
  onCancel?: (cancellationFee: number) => Promise<void>;
  onRestore?: () => Promise<void>;
  onComplete?: () => void;
  onDelete?: () => void;
  reservation?: Reservation | null;
  resourceType?: ResourceType;
  initialDate?: string;
  selectedStaff: string | null;
}

export const ReservationModal = ({
  isOpen,
  onClose,
  onSave,
  onCancel,
  onRestore,
  onComplete,
  onDelete,
  reservation,
  resourceType,
  initialDate,
  selectedStaff,
}: ReservationModalProps) => {
  const { items } = useSchedulerItems();
  const [formData, setFormData] = useState<ReservationFormData>({
    rented_to: '',
    item: '',
    items: [],
    resource_type: resourceType || 'GUEST_SUITE',
    start_time: '',
    end_time: '',
    rental_notes: '',
    override_lock: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (reservation) {
      setFormData({
        rented_to: reservation.rented_to,
        item: reservation.item,
        items: reservation.items || [],
        resource_type: reservation.resource_type,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        rental_notes: reservation.rental_notes || '',
        override_lock: reservation.override_lock || false,
      });
    } else if (resourceType) {
      setFormData((prev) => ({
        ...prev,
        resource_type: resourceType,
        start_time: initialDate ? `${initialDate}T15:00:00` : '',
        end_time: initialDate ? `${initialDate}T15:00:00` : '',
      }));
    }
  }, [reservation, resourceType, initialDate]);

  // Auto-calculate end time for Sky Lounge (4 hours)
  useEffect(() => {
    if (formData.resource_type === 'SKY_LOUNGE' && formData.start_time) {
      const start = new Date(formData.start_time);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
      setFormData((prev) => ({
        ...prev,
        item: 'Sky Lounge',
        end_time: end.toISOString(),
      }));
    }
  }, [formData.resource_type, formData.start_time]);

  // Filter items by resource type (handle legacy lowercase format from ported data)
  const availableItems = useMemo(() => {
    const normalizeResourceType = (type: string) => type?.toUpperCase();
    const normalizeServiceStatus = (status: string) => status?.toLowerCase().replace(/_/g, ' ');

    return items.filter((item) => {
      const itemType = normalizeResourceType(item.resource_type);
      const formType = normalizeResourceType(formData.resource_type);
      const itemStatus = normalizeServiceStatus(item.service_status);
      return itemType === formType && itemStatus === 'in service';
    });
  }, [items, formData.resource_type]);

  // Calculate price
  const priceInfo = useMemo(() => {
    if (!formData.start_time || !formData.end_time) {
      return null;
    }
    return getReservationCost(
      formData.resource_type,
      new Date(formData.start_time),
      new Date(formData.end_time)
    );
  }, [formData.resource_type, formData.start_time, formData.end_time]);

  // Cancellation fee
  const cancellationFee = useMemo(() => {
    if (!reservation) return 0;
    return getCancellationFee(
      reservation.resource_type,
      reservation.start_time
    );
  }, [reservation]);

  // Check if can complete
  const canComplete = useMemo(() => {
    if (!reservation || reservation.status !== 'Scheduled') return false;
    return new Date() > new Date(reservation.end_time);
  }, [reservation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedStaff) {
      toast.error('Please select a staff member first');
      return;
    }

    // Validate
    const errors = await validateReservation(formData, reservation?.tx_id);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    // Prepare data
    const dataToSave: ReservationFormData = {
      ...formData,
      item:
        formData.resource_type === 'GEAR_SHED'
          ? formData.items!.join(', ')
          : formData.item,
    };

    setIsSubmitting(true);
    try {
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsSubmitting(true);
    try {
      await onCancel(cancellationFee);
      onClose();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setIsSubmitting(true);
    try {
      await onRestore();
      onClose();
    } catch (error) {
      console.error('Error restoring reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    // Don't close modal here - let the confirmation dialog handle it
    await onDelete();
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isGuestSuite = formData.resource_type === 'GUEST_SUITE';
  const isSkyLounge = formData.resource_type === 'SKY_LOUNGE';
  const isGearShed = formData.resource_type === 'GEAR_SHED';
  const isEditMode = !!reservation;
  const isCancelled = reservation?.status === 'Cancelled';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? 'Edit Reservation' : 'New Reservation'}
      >
        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="space-y-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-neuro-peach/20 border border-neuro-peach rounded-neuro-md p-4">
                <ul className="list-disc list-inside text-sm text-neuro-primary space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unit Number */}
            <div>
              <label className="block text-sm font-medium text-neuro-secondary mb-2">
                Unit Number <span className="text-neuro-peach">*</span>
              </label>
              <Input
                type="text"
                value={formData.rented_to}
                onChange={(e) =>
                  setFormData({ ...formData, rented_to: e.target.value })
                }
                required
                disabled={isCancelled}
              />
            </div>

            {/* Item Selector - Guest Suite */}
            {isGuestSuite && (
              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Guest Suite
                </label>
                <select
                  className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
                  value={formData.item}
                  onChange={(e) =>
                    setFormData({ ...formData, item: e.target.value })
                  }
                  required
                  disabled={isCancelled}
                >
                  <option value="">Select Suite</option>
                  {availableItems.map((item) => (
                    <option key={item._docId} value={item.item}>
                      {item.item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Item Selector - Sky Lounge */}
            {isSkyLounge && (
              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Sky Lounge
                </label>
                <Input
                  type="text"
                  value="Sky Lounge"
                  disabled
                  className="bg-white/10"
                />
              </div>
            )}

            {/* Item Selector - Gear Shed */}
            {isGearShed && (
              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Select Item(s) <span className="text-neuro-peach">*</span>
                </label>
                <GearShedSelector
                  availableItems={availableItems}
                  selectedItems={formData.items || []}
                  onSelectionChange={(items: string[]) =>
                    setFormData({ ...formData, items })
                  }
                  disabled={isCancelled}
                />
              </div>
            )}

            {/* Date/Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date/Time */}
              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Start <span className="text-neuro-peach">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
                    value={
                      formData.start_time
                        ? formData.start_time.split('T')[0]
                        : ''
                    }
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = isGuestSuite
                        ? '15:00'
                        : formData.start_time
                          ? formData.start_time.split('T')[1]?.slice(0, 5) || '10:00'
                          : '10:00';
                      setFormData({
                        ...formData,
                        start_time: `${date}T${time}:00`,
                      });
                    }}
                    required
                    disabled={isCancelled}
                  />
                  {!isGuestSuite && (
                    <>
                      {isSkyLounge ? (
                        <button
                          type="button"
                          onClick={() => setShowTimePicker(true)}
                          className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-flat hover:shadow-neuro-hover transition-all text-left"
                          disabled={isCancelled}
                        >
                          {formData.start_time
                            ? formatDateTime(formData.start_time).split(',')[1]
                            : 'Select Time'}
                        </button>
                      ) : (
                        <input
                          type="time"
                          className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
                          value={
                            formData.start_time
                              ? formData.start_time.split('T')[1]?.slice(0, 5) || ''
                              : ''
                          }
                          onChange={(e) => {
                            const date = formData.start_time.split('T')[0];
                            setFormData({
                              ...formData,
                              start_time: `${date}T${e.target.value}:00`,
                            });
                          }}
                          required
                          disabled={isCancelled}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* End Date/Time */}
              {!isSkyLounge && (
                <div>
                  <label className="block text-sm font-medium text-neuro-secondary mb-2">
                    End <span className="text-neuro-peach">*</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
                      value={
                        formData.end_time ? formData.end_time.split('T')[0] : ''
                      }
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = isGuestSuite
                          ? '11:00'
                          : formData.end_time
                            ? formData.end_time.split('T')[1]?.slice(0, 5) || '14:00'
                            : '14:00';
                        setFormData({
                          ...formData,
                          end_time: `${date}T${time}:00`,
                        });
                      }}
                      required
                      disabled={isCancelled}
                    />
                    {!isGuestSuite && (
                      <input
                        type="time"
                        className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
                        value={
                          formData.end_time
                            ? formData.end_time.split('T')[1]?.slice(0, 5) || ''
                            : ''
                        }
                        onChange={(e) => {
                          const date = formData.end_time.split('T')[0];
                          setFormData({
                            ...formData,
                            end_time: `${date}T${e.target.value}:00`,
                          });
                        }}
                        required
                        disabled={isCancelled}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sky Lounge Override Checkbox */}
            {isSkyLounge && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="override"
                  checked={formData.override_lock}
                  onChange={(e) =>
                    setFormData({ ...formData, override_lock: e.target.checked })
                  }
                  className="rounded"
                  disabled={isCancelled}
                />
                <label
                  htmlFor="override"
                  className="text-sm text-neuro-secondary"
                >
                  Override 24-hour lock (bypass all-day booking check)
                </label>
              </div>
            )}

            {/* Price Display */}
            {!isGearShed && priceInfo && (
              <div className="bg-white/20 rounded-neuro-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neuro-secondary">
                    Total Cost:
                  </span>
                  <span className="text-2xl font-bold text-neuro-primary">
                    {formatPrice(priceInfo.total)}
                  </span>
                </div>
                <p className="text-xs text-neuro-secondary">{priceInfo.breakdown}</p>
              </div>
            )}

            {/* Rental Notes */}
            <div>
              <label className="block text-sm font-medium text-neuro-secondary mb-2">
                Rental Notes
              </label>
              <Textarea
                value={formData.rental_notes}
                onChange={(e) =>
                  setFormData({ ...formData, rental_notes: e.target.value })
                }
                rows={3}
                placeholder="Add any special instructions or notes..."
                disabled={isCancelled}
              />
            </div>

            {/* Tracking Info (Edit Mode Only) */}
            {isEditMode && reservation && (
              <div className="bg-white/10 rounded-neuro-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neuro-secondary">Scheduled by:</span>
                  <span className="text-neuro-primary font-medium">
                    {reservation.scheduled_by}
                  </span>
                </div>
                {reservation.edit_by && (
                  <div className="flex justify-between">
                    <span className="text-neuro-secondary">Last edited by:</span>
                    <span className="text-neuro-primary font-medium">
                      {reservation.edit_by}
                    </span>
                  </div>
                )}
                {reservation.last_update && (
                  <div className="flex justify-between">
                    <span className="text-neuro-secondary">Last update:</span>
                    <span className="text-neuro-primary font-medium">
                      {formatDateTime(reservation.last_update)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/20 flex justify-between">
            <div className="flex gap-3">
              {isEditMode && !isCancelled && onDelete && (
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  type="button"
                  isLoading={isSubmitting}
                  className="px-4 py-2 text-sm"
                >
                  Delete
                </Button>
              )}
              {isCancelled && onRestore && (
                <Button
                  variant="primary"
                  onClick={handleRestore}
                  type="button"
                  isLoading={isSubmitting}
                  className="px-4 py-2 text-sm"
                >
                  Restore
                </Button>
              )}
              {/* Add to Outlook Calendar - available for scheduled reservations */}
              {isEditMode && reservation && reservation.status === 'Scheduled' && (
                <Button
                  variant="secondary"
                  onClick={() => openOutlookCalendar(reservation)}
                  type="button"
                  className="px-4 py-2 text-sm"
                >
                  Add to Outlook
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} type="button" className="px-4 py-2 text-sm">
                {isEditMode ? 'Back' : 'Cancel'}
              </Button>
              {isEditMode && !isCancelled && canComplete && onComplete && (
                <Button
                  variant="primary"
                  onClick={onComplete}
                  type="button"
                  className="px-4 py-2 text-sm"
                >
                  Complete
                </Button>
              )}
              {isEditMode && !isCancelled && onCancel && (
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  type="button"
                  isLoading={isSubmitting}
                  className="px-4 py-2 text-sm"
                >
                  Cancel (Fee: {formatPrice(cancellationFee)})
                </Button>
              )}
              {!isCancelled && (
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  className="px-4 py-2 text-sm"
                >
                  {isEditMode ? 'Update' : 'Save'} Reservation
                </Button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <TimePickerWheel
          isOpen={showTimePicker}
          onClose={() => setShowTimePicker(false)}
          onSelectTime={(time) => {
            const date = formData.start_time.split('T')[0];
            setFormData({
              ...formData,
              start_time: `${date}T${time}:00`,
            });
            setShowTimePicker(false);
          }}
          initialTime={
            formData.start_time
              ? formData.start_time.split('T')[1]?.slice(0, 5)
              : undefined
          }
        />
      )}
    </>
  );
};
