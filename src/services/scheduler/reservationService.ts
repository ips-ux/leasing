/**
 * Reservation Service
 * CRUD operations for reservations
 */

import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import type { Reservation, ResourceType } from '../../types/scheduler';

export interface CreateReservationData {
  rented_to: string;
  item: string;
  items?: string[];
  resource_type: ResourceType;
  start_time: string;
  end_time: string;
  total_cost: number;
  scheduled_by: string;
  rental_notes?: string;
  override_lock?: boolean;
}

/**
 * Create a new reservation
 */
export async function createReservation(data: CreateReservationData): Promise<string> {
  const reservationData = {
    ...data,
    status: 'Scheduled',
    created_at: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'reservations'), reservationData);
  return docRef.id;
}

/**
 * Update an existing reservation
 */
export async function updateReservation(
  tx_id: string,
  data: Partial<Reservation>,
  editedBy: string
): Promise<void> {
  const updateData = {
    ...data,
    edit_by: editedBy,
    last_update: new Date().toISOString(),
  };

  await updateDoc(doc(db, 'reservations', tx_id), updateData);
}

/**
 * Cancel a reservation (soft delete with optional fee)
 */
export async function cancelReservation(tx_id: string, fee: number): Promise<void> {
  const updateData: Partial<Reservation> = {
    status: 'Cancelled',
    last_update: new Date().toISOString(),
  };

  if (fee > 0) {
    updateData.cancellation_fee = fee;
  }

  await updateDoc(doc(db, 'reservations', tx_id), updateData);
}

/**
 * Restore a cancelled reservation
 */
export async function restoreReservation(tx_id: string): Promise<void> {
  await updateDoc(doc(db, 'reservations', tx_id), {
    status: 'Scheduled',
    last_update: new Date().toISOString(),
  });
}

/**
 * Complete a reservation
 */
export async function completeReservation(
  tx_id: string,
  returnNotes: string,
  completedBy: string
): Promise<void> {
  await updateDoc(doc(db, 'reservations', tx_id), {
    status: 'Complete',
    return_notes: returnNotes,
    completed_by: completedBy,
    last_update: new Date().toISOString(),
  });
}

/**
 * Delete a reservation (hard delete)
 */
export async function deleteReservation(tx_id: string): Promise<void> {
  await deleteDoc(doc(db, 'reservations', tx_id));
}
