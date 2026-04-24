import { useState, useEffect } from 'react';
import type { RentableItem, WaitlistEntry } from '../types/rentableItem';
import {
  subscribeToRentableItems,
  subscribeToWaitlist,
  upsertRentableItems,
  addRentableItem,
  updateRentableItem,
  deleteRentableItem,
  deleteRentableItems,
  addWaitlistEntry,
  updateWaitlistEntry,
  deleteWaitlistEntry,
} from '../firebase/rentableItemsService';

export const useRentableItems = () => {
  const [items, setItems] = useState<RentableItem[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let itemsDone = false;
    let waitlistDone = false;
    const check = () => {
      if (itemsDone && waitlistDone) setLoading(false);
    };

    const unsubItems = subscribeToRentableItems((data) => {
      setItems(data);
      itemsDone = true;
      check();
    });

    const unsubWaitlist = subscribeToWaitlist((data) => {
      setWaitlist(data);
      waitlistDone = true;
      check();
    });

    return () => {
      unsubItems();
      unsubWaitlist();
    };
  }, []);

  return {
    items,
    waitlist,
    loading,
    upsertRentableItems,
    addRentableItem,
    updateRentableItem,
    deleteRentableItem,
    deleteRentableItems,
    addWaitlistEntry,
    updateWaitlistEntry,
    deleteWaitlistEntry,
  };
};
