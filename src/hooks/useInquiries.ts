import { useState, useEffect } from 'react';
import { onSnapshot, where } from 'firebase/firestore';
import type { Inquiry, InquiryFormData } from '../types/inquiry';
import {
  createInquiry,
  getInquiries,
  updateInquiry,
  deleteInquiry,
} from '../firebase/firestore';

export const useInquiries = (month?: string) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints = month ? [where('month', '==', month)] : [];
    const q = getInquiries(constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const inquiriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Inquiry[];

        setInquiries(inquiriesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching inquiries:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [month]);

  const addInquiry = async (formData: InquiryFormData): Promise<boolean> => {
    try {
      await createInquiry(formData);
      return true;
    } catch (err: any) {
      console.error('Error creating inquiry:', err);
      setError(err.message);
      return false;
    }
  };

  const modifyInquiry = async (id: string, data: Partial<Inquiry>): Promise<boolean> => {
    try {
      await updateInquiry(id, data);
      return true;
    } catch (err: any) {
      console.error('Error updating inquiry:', err);
      setError(err.message);
      return false;
    }
  };

  const removeInquiry = async (id: string): Promise<boolean> => {
    try {
      await deleteInquiry(id);
      return true;
    } catch (err: any) {
      console.error('Error deleting inquiry:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    inquiries,
    loading,
    error,
    addInquiry,
    updateInquiry: modifyInquiry,
    deleteInquiry: removeInquiry,
  };
};
