/**
 * Staff Service
 * CRUD operations for staff members
 */

import { db } from '../../firebase/config';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import type { Staff } from '../../types/scheduler';

/**
 * Create a new staff member
 */
export async function createStaff(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'staff'), { name });
  return docRef.id;
}

/**
 * Seed initial staff if collection is empty
 */
export async function seedInitialStaff(): Promise<void> {
  const initialStaff: Staff[] = [
    { name: 'Staff Member 1' },
    { name: 'Staff Member 2' },
  ];

  const batch = writeBatch(db);
  const staffRef = collection(db, 'staff');

  initialStaff.forEach((staff) => {
    const docRef = doc(staffRef);
    batch.set(docRef, staff);
  });

  await batch.commit();
}

// LocalStorage key for selected staff
const SELECTED_STAFF_KEY = 'scheduler_selected_staff';

/**
 * Get selected staff from localStorage
 */
export function getSelectedStaff(): string | null {
  return localStorage.getItem(SELECTED_STAFF_KEY);
}

/**
 * Save selected staff to localStorage
 */
export function setSelectedStaff(staffName: string): void {
  localStorage.setItem(SELECTED_STAFF_KEY, staffName);
}

/**
 * Clear selected staff from localStorage
 */
export function clearSelectedStaff(): void {
  localStorage.removeItem(SELECTED_STAFF_KEY);
}
