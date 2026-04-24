import {
  collection,
  doc,
  setDoc,
  writeBatch,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import type { RentableItem, WaitlistEntry } from '../types/rentableItem';

const ITEMS_COLLECTION = 'rentableItems';
const WAITLIST_COLLECTION = 'rentableWaitlist';

export const upsertRentableItems = async (items: RentableItem[]): Promise<void> => {
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const item of items.slice(i, i + CHUNK)) {
      batch.set(doc(db, ITEMS_COLLECTION, item.code), item);
    }
    await batch.commit();
  }
};

export const subscribeToRentableItems = (
  callback: (items: RentableItem[]) => void
): (() => void) => {
  const q = query(collection(db, ITEMS_COLLECTION), orderBy('code'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as RentableItem));
  });
};

export const subscribeToWaitlist = (
  callback: (entries: WaitlistEntry[]) => void
): (() => void) => {
  const q = query(collection(db, WAITLIST_COLLECTION), orderBy('requestedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WaitlistEntry)));
  });
};

export const addWaitlistEntry = async (
  entry: Omit<WaitlistEntry, 'id'>
): Promise<string> => {
  const ref = await addDoc(collection(db, WAITLIST_COLLECTION), entry);
  return ref.id;
};

export const updateWaitlistEntry = async (
  id: string,
  updates: Partial<Pick<WaitlistEntry, 'status' | 'notes' | 'contact'>>
): Promise<void> => {
  await updateDoc(doc(db, WAITLIST_COLLECTION, id), updates);
};

export const deleteWaitlistEntry = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, WAITLIST_COLLECTION, id));
};

// ─── Single-item CRUD (manual adds / removes) ─────────────────────────────────

export const addRentableItem = async (item: RentableItem): Promise<void> => {
  await setDoc(doc(db, ITEMS_COLLECTION, item.code), item);
};

export const updateRentableItem = async (
  code: string,
  updates: Partial<RentableItem>
): Promise<void> => {
  await updateDoc(doc(db, ITEMS_COLLECTION, code), updates as Record<string, unknown>);
};

export const deleteRentableItem = async (code: string): Promise<void> => {
  await deleteDoc(doc(db, ITEMS_COLLECTION, code));
};

/** Batch-delete a list of codes (used by seed to remove items not in XLS) */
export const deleteRentableItems = async (codes: string[]): Promise<void> => {
  const CHUNK = 400;
  for (let i = 0; i < codes.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const code of codes.slice(i, i + CHUNK)) {
      batch.delete(doc(db, ITEMS_COLLECTION, code));
    }
    await batch.commit();
  }
};
