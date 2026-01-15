import { useState, useEffect, useCallback } from 'react';
import { onSnapshot } from 'firebase/firestore';
import {
    getApplicant,
    updateSubStep as updateSubStepService,
    updateSubStepDate as updateSubStepDateService,
    updateStepNotes as updateStepNotesService,
} from '../firebase/firestore';
import type { Applicant, SubStepData } from '../types/applicant';
import { normalizeApplicant } from '../lib/workflow-steps';
import toast from 'react-hot-toast';

interface UseApplicantReturn {
    applicant: Applicant | null;
    loading: boolean;
    error: string | null;
    updateSubStep: (stepNumber: number, subStepId: string, updates: Partial<SubStepData>) => Promise<void>;
    updateSubStepDate: (stepNumber: number, subStepId: string, date: Date | null) => Promise<void>;
    updateStepNotes: (stepNumber: number, notes: string) => Promise<void>;
}

export const useApplicant = (id: string | undefined): UseApplicantReturn => {
    const [applicant, setApplicant] = useState<Applicant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError('No applicant ID provided');
            return;
        }

        const docRef = getApplicant(id);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setApplicant(normalizeApplicant({
                        id: snapshot.id,
                        ...snapshot.data(),
                    }) as Applicant);
                    setError(null);
                } else {
                    setError('Applicant not found');
                    setApplicant(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching applicant:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [id]);

    const updateSubStep = useCallback(
        async (stepNumber: number, subStepId: string, updates: Partial<SubStepData>): Promise<void> => {
            if (!id) {
                toast.error('No applicant ID');
                return;
            }

            try {
                await updateSubStepService(id, stepNumber, subStepId, updates);
                // Toast handled by the service or we can add here if needed
            } catch (err: any) {
                console.error('Error updating sub-step:', err);
                toast.error(err.message || 'Failed to update');
            }
        },
        [id]
    );

    const updateSubStepDate = useCallback(
        async (stepNumber: number, subStepId: string, date: Date | null): Promise<void> => {
            if (!id) {
                toast.error('No applicant ID');
                return;
            }

            try {
                await updateSubStepDateService(id, stepNumber, subStepId, date);
                toast.success('Date updated');
            } catch (err: any) {
                console.error('Error updating date:', err);
                toast.error(err.message || 'Failed to update date');
            }
        },
        [id]
    );

    const updateStepNotes = useCallback(
        async (stepNumber: number, notes: string): Promise<void> => {
            if (!id) {
                toast.error('No applicant ID');
                return;
            }

            try {
                await updateStepNotesService(id, stepNumber, notes);
            } catch (err: any) {
                console.error('Error updating notes:', err);
                toast.error(err.message || 'Failed to save notes');
            }
        },
        [id]
    );

    return {
        applicant,
        loading,
        error,
        updateSubStep,
        updateSubStepDate,
        updateStepNotes,
    };
};
