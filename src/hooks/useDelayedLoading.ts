import { useState, useEffect } from 'react';

/**
 * Returns true only after `loading` has been true for longer than `delayMs`.
 * Prevents skeleton/loader flicker on fast (cached) Firestore loads.
 */
export const useDelayedLoading = (loading: boolean, delayMs = 150): boolean => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!loading) {
            setShow(false);
            return;
        }
        const timer = setTimeout(() => setShow(true), delayMs);
        return () => clearTimeout(timer);
    }, [loading, delayMs]);

    return show;
};
