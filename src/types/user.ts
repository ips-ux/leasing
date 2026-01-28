import type { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  Agent_Name?: string;
  role?: 'agent' | 'admin';
  lastActive?: any;
  lastLogin?: any;
  archived?: boolean;
  migratedTo?: string;
  migratedAt?: any;
}

export const toAppUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});
