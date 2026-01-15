import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './config';

export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
