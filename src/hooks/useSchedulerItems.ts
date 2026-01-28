/**
 * useSchedulerItems Hook
 * Real-time items (inventory) data with CRUD operations
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import toast from 'react-hot-toast';
import type { SchedulerItem } from '../types/scheduler';
import {
  createItem as createItemService,
  updateItem as updateItemService,
  seedInitialItems,
  type CreateItemData,
} from '../services/scheduler/itemService';

export function useSchedulerItems() {
  const [items, setItems] = useState<SchedulerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'items'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          _docId: doc.id,
          ...doc.data(),
        })) as SchedulerItem[];

        // Seed initial items if empty
        if (data.length === 0) {
          console.log('No items found, seeding initial items...');
          try {
            await seedInitialItems();
            // Data will update via the snapshot listener
          } catch (err) {
            console.error('Error seeding items:', err);
          }
        }

        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching items:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load items');
      }
    );

    return unsubscribe;
  }, []);

  const createItem = async (data: CreateItemData): Promise<string> => {
    try {
      const docId = await createItemService(data);
      toast.success('Item created successfully');
      return docId;
    } catch (err: any) {
      console.error('Error creating item:', err);
      toast.error('Failed to create item');
      throw err;
    }
  };

  const updateItem = async (docId: string, data: Partial<SchedulerItem>): Promise<void> => {
    try {
      await updateItemService(docId, data);
      toast.success('Item updated successfully');
    } catch (err: any) {
      console.error('Error updating item:', err);
      toast.error('Failed to update item');
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
  };
}
