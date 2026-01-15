import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import type { User } from '../types/user';
import { toAppUser } from '../types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => (() => void);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({ user: toAppUser(firebaseUser), loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });

    // Return cleanup function
    return unsubscribe;
  },
}));
