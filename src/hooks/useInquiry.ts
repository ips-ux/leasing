import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import type { Inquiry } from '../types/inquiry';
import { getInquiry } from '../firebase/firestore';

export const useInquiry = (id: string | undefined) => {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setInquiry(null);
      setLoading(false);
      return;
    }

    const docRef = getInquiry(id);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setInquiry({ id: doc.id, ...doc.data() } as Inquiry);
          setError(null);
        } else {
          setInquiry(null);
          setError('Inquiry not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching inquiry:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { inquiry, loading, error };
};
