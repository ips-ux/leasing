import type { Timestamp } from 'firebase/firestore';

export type ApplicantStatus = 'in_progress' | 'approved' | 'completed' | 'cancelled';

// Sub-step data for individual checkboxes/textboxes within a workflow step
export interface SubStepData {
  isCompleted: boolean;
  isNA: boolean;              // For N/A checkbox option
  completedAt: Timestamp | Date | null;  // Editable completion date
  completedBy: string | null;
  textValue?: string;         // For textbox type sub-steps
}

// Main workflow step containing sub-steps
export interface WorkflowStepData {
  stepName: string;
  isCompleted: boolean;       // Auto-calculated from sub-steps
  subSteps: {
    [subStepId: string]: SubStepData;
  };
  notes: string;
}

export interface Rentable {
  itemType: 'parking' | 'storage';
  itemName: string;
  quantity: number;
  monthlyRate: number;
}

export interface DocumentStatus {
  status: 'pending' | 'complete' | 'not_applicable';
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: Timestamp;
  uploadedBy?: string;
}

export interface Applicant {
  id: string;

  "1_Profile": {
    name: string;
    concessionApplied: string;
    dateApplied: Timestamp;
    leasingProfessional: string;
    moveInDate: Timestamp;
    unit: string;
  };

  "2_Tracking": {
    status: ApplicantStatus;
    createdAt: Timestamp;
    createdBy: string;
    currentStep: number;
    leaseCompletedTime: Timestamp | null;
    promotedToResident: boolean;
    promotedToResidentAt: Timestamp | null;
    updatedAt: Timestamp;
    cancellationReason?: string;
    cancelledAt?: Timestamp | null;
    cancelledBy?: string;
  };

  // Workflow object with steps 1-6 and sub-steps
  workflow: {
    [stepNumber: string]: WorkflowStepData;
  };

  // Tags derived from optional checkboxes (Guarantor, x-fer, Paid MIB)
  tags: string[];

  // Rentables array (legacy - kept for compatibility)
  rentables: Rentable[];

  // Documents map
  documents: {
    [key: string]: DocumentStatus;
  };
}

// Form data type (for creating new applicants)
export interface ApplicantFormData {
  name: string;
  unit: string;
  dateApplied: Date;
  moveInDate: Date;
  concessionApplied: string;
  leasingProfessional: string;
}
