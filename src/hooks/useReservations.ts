/**
 * useReservations Hook
 * Real-time reservations data with CRUD operations
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import toast from 'react-hot-toast';
import type { Reservation } from '../types/scheduler';
import {
  createReservation as createReservationService,
  updateReservation as updateReservationService,
  cancelReservation as cancelReservationService,
  restoreReservation as restoreReservationService,
  completeReservation as completeReservationService,
  deleteReservation as deleteReservationService,
  type CreateReservationData,
} from '../services/scheduler/reservationService';
import { getCancellationFee } from '../services/scheduler/pricingService';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'reservations'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          tx_id: doc.id,
          ...doc.data(),
        })) as Reservation[];

        setReservations(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reservations:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load reservations');
      }
    );

    return unsubscribe;
  }, []);

  const createReservation = async (data: CreateReservationData): Promise<string> => {
    try {
      const tx_id = await createReservationService(data);
      toast.success('Reservation created successfully');
      return tx_id;
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      toast.error('Failed to create reservation');
      throw err;
    }
  };

  const updateReservation = async (
    tx_id: string,
    data: Partial<Reservation>,
    editedBy: string
  ): Promise<void> => {
    try {
      await updateReservationService(tx_id, data, editedBy);
      toast.success('Reservation updated successfully');
    } catch (err: any) {
      console.error('Error updating reservation:', err);
      toast.error('Failed to update reservation');
      throw err;
    }
  };

  const cancelReservation = async (tx_id: string, startTime: string, resourceType: any): Promise<void> => {
    try {
      const fee = getCancellationFee(resourceType, startTime);
      await cancelReservationService(tx_id, fee);

      if (fee > 0) {
        toast.success(`Reservation cancelled with $${fee} fee`);
      } else {
        toast.success('Reservation cancelled successfully');
      }
    } catch (err: any) {
      console.error('Error cancelling reservation:', err);
      toast.error('Failed to cancel reservation');
      throw err;
    }
  };

  const restoreReservation = async (tx_id: string): Promise<void> => {
    try {
      await restoreReservationService(tx_id);
      toast.success('Reservation restored successfully');
    } catch (err: any) {
      console.error('Error restoring reservation:', err);
      toast.error('Failed to restore reservation');
      throw err;
    }
  };

  const completeReservation = async (
    tx_id: string,
    returnNotes: string,
    completedBy: string
  ): Promise<void> => {
    try {
      await completeReservationService(tx_id, returnNotes, completedBy);
      toast.success('Reservation marked as complete');
    } catch (err: any) {
      console.error('Error completing reservation:', err);
      toast.error('Failed to complete reservation');
      throw err;
    }
  };

  const deleteReservation = async (tx_id: string): Promise<void> => {
    try {
      await deleteReservationService(tx_id);
      toast.success('Reservation deleted successfully');
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      toast.error('Failed to delete reservation');
      throw err;
    }
  };

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    cancelReservation,
    restoreReservation,
    completeReservation,
    deleteReservation,
  };
}
