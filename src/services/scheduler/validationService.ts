/**
 * Validation Service
 * Business rules validation for reservations
 */

import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { ReservationFormData } from '../../types/scheduler';

/**
 * Validate reservation form data
 * Returns array of error messages
 */
export async function validateReservation(
  data: ReservationFormData,
  editingId?: string
): Promise<string[]> {
  const errors: string[] = [];

  // Unit number required
  if (!data.rented_to || data.rented_to.trim() === '') {
    errors.push('Unit number is required');
  }

  // Dates required
  if (!data.start_time) {
    errors.push('Start date/time is required');
  }
  if (!data.end_time) {
    errors.push('End date/time is required');
  }

  if (!data.start_time || !data.end_time) {
    return errors; // Can't do further validation without dates
  }

  // Parse dates
  const startDateTime = new Date(data.start_time);
  const endDateTime = new Date(data.end_time);

  // Start must be before end
  if (startDateTime >= endDateTime) {
    errors.push('Start time must be before end time');
  }

  // Type-specific validations (handle case-insensitive resource types)
  const resourceType = data.resource_type?.toUpperCase();
  if (resourceType === 'GUEST_SUITE') {
    await validateGuestSuite(data, startDateTime, endDateTime, errors, editingId);
  } else if (resourceType === 'SKY_LOUNGE') {
    await validateSkyLounge(data, startDateTime, errors, editingId);
  } else if (resourceType === 'GEAR_SHED') {
    await validateGearShed(data, startDateTime, endDateTime, errors, editingId);
  }

  return errors;
}

/**
 * Validate Guest Suite reservation
 */
async function validateGuestSuite(
  data: ReservationFormData,
  startDateTime: Date,
  endDateTime: Date,
  errors: string[],
  editingId?: string
) {
  // 2-night minimum
  const nights = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < 2) {
    errors.push('Guest Suite requires a minimum 2-night stay');
  }

  // Item required
  if (!data.item) {
    errors.push('Please select a Guest Suite');
    return;
  }

  // Check for overlapping reservations
  const hasOverlap = await checkReservationOverlap(
    'GUEST_SUITE',
    data.item,
    startDateTime.toISOString(),
    endDateTime.toISOString(),
    editingId
  );

  if (hasOverlap) {
    errors.push('Guest Suite is already booked for these dates');
  }
}

/**
 * Validate Sky Lounge reservation
 */
async function validateSkyLounge(
  data: ReservationFormData,
  startDateTime: Date,
  errors: string[],
  editingId?: string
) {
  // Time window: 10am-6pm
  const startHour = startDateTime.getHours();
  if (startHour < 10 || startHour >= 18) {
    errors.push('Sky Lounge is only available 10:00 AM - 6:00 PM');
  }

  // All-day lock check (unless override is enabled)
  if (!data.override_lock) {
    const dateStr = data.start_time.split('T')[0];
    const hasAllDayBooking = await checkSkyLoungeAllDayLock(dateStr, editingId);
    if (hasAllDayBooking) {
      errors.push(
        'Sky Lounge is already booked for this date. Use override if confirmed with housekeeping.'
      );
    }
  }
}

/**
 * Validate Gear Shed reservation
 */
async function validateGearShed(
  data: ReservationFormData,
  startDateTime: Date,
  endDateTime: Date,
  errors: string[],
  editingId?: string
) {
  // Items required
  if (!data.items || data.items.length === 0) {
    errors.push('Please select at least one item');
    return;
  }

  // Check each item availability
  for (const itemName of data.items) {
    // Check for overlapping reservations for this specific item
    const hasOverlap = await checkItemAvailability(
      itemName,
      startDateTime.toISOString(),
      endDateTime.toISOString(),
      editingId
    );

    if (hasOverlap) {
      errors.push(`${itemName} is already booked for these dates`);
    }
  }
}

/**
 * Check for overlapping reservations
 */
async function checkReservationOverlap(
  resourceType: string,
  itemName: string,
  startTime: string,
  endTime: string,
  editingId?: string
): Promise<boolean> {
  // Query all scheduled reservations (Firebase is case-sensitive, so we filter client-side)
  const q = query(
    collection(db, 'reservations'),
    where('status', '==', 'Scheduled')
  );

  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    if (editingId && doc.id === editingId) {
      continue; // Skip the reservation being edited
    }

    const reservation = doc.data();

    // Case-insensitive resource type check
    if (reservation.resource_type?.toUpperCase() !== resourceType.toUpperCase()) {
      continue;
    }

    // Item name check
    if (reservation.item !== itemName) {
      continue;
    }

    const resStart = new Date(reservation.start_time);
    const resEnd = new Date(reservation.end_time);
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    // Check for overlap
    if (newStart < resEnd && newEnd > resStart) {
      return true;
    }
  }

  return false;
}

/**
 * Check if Sky Lounge has an all-day booking
 */
async function checkSkyLoungeAllDayLock(
  dateStr: string,
  editingId?: string
): Promise<boolean> {
  // Query all scheduled reservations (filter client-side for case-insensitivity)
  const q = query(
    collection(db, 'reservations'),
    where('status', '==', 'Scheduled')
  );

  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    if (editingId && doc.id === editingId) {
      continue; // Skip the reservation being edited
    }

    const reservation = doc.data();

    // Case-insensitive resource type check
    if (reservation.resource_type?.toUpperCase() !== 'SKY_LOUNGE') {
      continue;
    }

    const resDateStr = reservation.start_time.split('T')[0];

    // Check if the reservation is on the same date
    if (resDateStr === dateStr) {
      return true; // Found a booking for this date
    }
  }

  return false;
}

/**
 * Check if a specific item is available for given time range
 */
async function checkItemAvailability(
  itemName: string,
  startTime: string,
  endTime: string,
  editingId?: string
): Promise<boolean> {
  // Query all scheduled reservations (filter client-side for case-insensitivity)
  const q = query(
    collection(db, 'reservations'),
    where('status', '==', 'Scheduled')
  );

  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    if (editingId && doc.id === editingId) {
      continue; // Skip the reservation being edited
    }

    const reservation = doc.data();

    // Case-insensitive resource type check
    if (reservation.resource_type?.toUpperCase() !== 'GEAR_SHED') {
      continue;
    }

    // Check if this reservation includes the item we're checking
    const items = reservation.items || [];
    if (!items.includes(itemName)) {
      continue; // This reservation doesn't include our item
    }

    const resStart = new Date(reservation.start_time);
    const resEnd = new Date(reservation.end_time);
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    // Check for overlap
    if (newStart < resEnd && newEnd > resStart) {
      return true; // Found overlap
    }
  }

  return false;
}
