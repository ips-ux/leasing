/**
 * useSchedulerStaff Hook
 * Real-time staff data with localStorage-backed selection
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import toast from 'react-hot-toast';
import type { Staff } from '../types/scheduler';
import {
  createStaff as createStaffService,
  seedInitialStaff,
  getSelectedStaff,
  setSelectedStaff as setSelectedStaffService,
  clearSelectedStaff as clearSelectedStaffService,
} from '../services/scheduler/staffService';

export function useSchedulerStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaffState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load selected staff from localStorage on mount
  useEffect(() => {
    const saved = getSelectedStaff();
    if (saved) {
      setSelectedStaffState(saved);
    }
  }, []);

  // Subscribe to staff collection
  useEffect(() => {
    const q = query(collection(db, 'staff'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data()) as Staff[];

        // Seed initial staff if empty
        if (data.length === 0) {
          console.log('No staff found, seeding initial staff...');
          try {
            await seedInitialStaff();
            // Data will update via the snapshot listener
          } catch (err) {
            console.error('Error seeding staff:', err);
          }
        }

        setStaff(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching staff:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load staff');
      }
    );

    return unsubscribe;
  }, []);

  const createStaff = async (name: string): Promise<string> => {
    try {
      const docId = await createStaffService(name);
      toast.success('Staff member added successfully');
      return docId;
    } catch (err: any) {
      console.error('Error creating staff:', err);
      toast.error('Failed to add staff member');
      throw err;
    }
  };

  const setSelectedStaff = (staffName: string): void => {
    setSelectedStaffState(staffName);
    setSelectedStaffService(staffName);
    toast.success(`Switched to ${staffName}`);
  };

  const clearSelectedStaff = (): void => {
    setSelectedStaffState(null);
    clearSelectedStaffService();
  };

  return {
    staff,
    selectedStaff,
    loading,
    error,
    createStaff,
    setSelectedStaff,
    clearSelectedStaff,
  };
}
