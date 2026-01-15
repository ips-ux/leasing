import type { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'agent' | 'admin';
}

export const toAppUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});
