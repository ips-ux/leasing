import type { Timestamp } from 'firebase/firestore';

export interface EmailTemplate {
  id: string;
  title: string;                // e.g. "Application Approved Email"
  buttonText: string;           // e.g. "APP APRVD" — shown on substep buttons
  htmlContent: string;          // Full HTML email body
  linkedSubStepIds: string[];   // e.g. ["2d", "t5c"] — links to workflow substep IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface EmailTemplateFormData {
  title: string;
  buttonText: string;
  htmlContent: string;
  linkedSubStepIds: string[];
}
