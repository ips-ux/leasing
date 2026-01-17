import type { Timestamp } from 'firebase/firestore';

export type InquiryPriority = 'high' | 'medium' | 'low';
export type InquiryStatus = 'open' | 'in_progress' | 'completed';

export interface Inquiry {
  id: string;
  title: string;
  description: string;
  priority: InquiryPriority;
  status: InquiryStatus;

  // Resident information
  unitNumber?: string;

  // Tracking
  createdAt: Timestamp;
  createdBy: string;
  assignedTo: string;
  updatedAt: Timestamp;
  completedAt?: Timestamp | null;

  // Month tracking for migration
  month: string; // Format: "YYYY-MM" (e.g., "2026-01")

  // Optional notes
  notes?: string;
}

export interface InquiryFormData {
  title: string;
  description: string;
  priority: InquiryPriority;
  status: InquiryStatus;
  unitNumber?: string;
  notes?: string;
  assignedTo?: string;
}
