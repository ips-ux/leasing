import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getApplicants, createApplicant as createApplicantService, updateApplicant as updateApplicantService, deleteApplicant as deleteApplicantService } from '../firebase/firestore';
import type { Applicant, ApplicantFormData } from '../types/applicant';
import { normalizeApplicant } from '../lib/workflow-steps';
import toast from 'react-hot-toast';

export const useApplicants = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = getApplicants();

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const applicantsData = snapshot.docs.map((doc) =>
          normalizeApplicant({
            id: doc.id,
            ...doc.data(),
          })
        ) as Applicant[];

        setApplicants(applicantsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching applicants:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createApplicant = async (formData: ApplicantFormData): Promise<string | null> => {
    try {
      const id = await createApplicantService(formData);
      toast.success('Applicant created successfully!');
      return id;
    } catch (err: any) {
      console.error('Error creating applicant:', err);
      toast.error(err.message || 'Failed to create applicant');
      return null;
    }
  };

  const updateApplicant = async (id: string, data: any): Promise<boolean> => {
    try {
      await updateApplicantService(id, data);
      toast.success('Applicant updated successfully!');
      return true;
    } catch (err: any) {
      console.error('Error updating applicant:', err);
      toast.error(err.message || 'Failed to update applicant');
      return false;
    }
  };

  const deleteApplicant = async (id: string): Promise<boolean> => {
    try {
      await deleteApplicantService(id);
      toast.success('Applicant deleted successfully!');
      return true;
    } catch (err: any) {
      console.error('Error deleting applicant:', err);
      toast.error(err.message || 'Failed to delete applicant');
      return false;
    }
  };

  return {
    applicants,
    loading,
    error,
    createApplicant,
    updateApplicant,
    deleteApplicant,
  };
};
