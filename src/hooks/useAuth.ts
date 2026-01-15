import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { signIn as firebaseSignIn, signUp as firebaseSignUp, signOut as firebaseSignOut } from '../firebase/auth';
import { syncUserToFirestore } from '../firebase/firestore';
import toast from 'react-hot-toast';
import type { User } from '../types/user';
import { toAppUser } from '../types/user';

export const useAuth = () => {
  const { user, loading, initialized, initialize, setLoading } = useAuthStore();

  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initialize]);

  // Periodic sync logic
  useEffect(() => {
    if (!user || !initialized) return;

    const SYNC_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
    const lastSync = localStorage.getItem(`last_sync_${user.uid}`);
    const now = Date.now();

    if (!lastSync || now - parseInt(lastSync) > SYNC_INTERVAL) {
      console.log('Performing periodic user sync...');
      syncUserToFirestore(user).then(() => {
        localStorage.setItem(`last_sync_${user.uid}`, now.toString());
      }).catch(err => {
        console.error('Failed to perform periodic sync:', err);
      });
    }
  }, [user, initialized]);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      const firebaseUser = await firebaseSignIn(email, password);
      const appUser = toAppUser(firebaseUser);

      // Sync user profile to Firestore
      if (appUser) {
        await syncUserToFirestore(appUser);
      }

      toast.success('Signed in successfully!');
      return appUser;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to sign in';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<User | null> => {
    try {
      setLoading(true);
      const firebaseUser = await firebaseSignUp(email, password, displayName);
      const appUser = toAppUser(firebaseUser);

      // Sync user profile to Firestore
      if (appUser) {
        await syncUserToFirestore(appUser);
      }

      toast.success('Account created successfully!');
      return appUser;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create account';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseSignOut();
      toast.success('Signed out successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to sign out';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
  };
};
