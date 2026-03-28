// Workflow Steps Configuration with Sub-Steps
import type { ApplicantType } from '../types/applicant';

export type SubStepType = 'checkbox' | 'textbox' | 'checkbox-na';
export type UIVariant = 'parking' | 'storage' | 'pets' | 'reasonable_acc' | 'payment_method';

export interface SubStepConfig {
  id: string;
  label: string;
  type: SubStepType;
  required: boolean;
  tagOnComplete?: string;    // Tag to display on applicant card when checked
  showOnCard?: boolean;      // Whether to show value on at-a-glance card (for textboxes)
  uiVariant?: UIVariant;     // Special UI rendering for parking/storage/pets/RA textboxes
  emailTemplate?: string;    // Email template key for copy buttons
  autoNATarget?: string;     // Substep ID to auto-mark N/A when this is checked
}

export interface WorkflowStepConfig {
  step: number;
  name: string;
  subtext?: string;
  subSteps: SubStepConfig[];
}

// ==================== NEW APPLICANT WORKFLOW ====================

export const NEW_APPLICANT_STEPS: WorkflowStepConfig[] = [
  {
    step: 1,
    name: 'Begin Income Verification',
    subSteps: [
      { id: '1a', label: 'Submit income documents for approval', type: 'checkbox', required: true, emailTemplate: 'request-income' },
      { id: '1b', label: 'Guarantor?', type: 'checkbox-na', required: true, tagOnComplete: 'Guarantor' },
      { id: '1c', label: 'Transfer?', type: 'checkbox-na', required: true, tagOnComplete: 'x-fer' },
      { id: '1d', label: 'Conditional?', type: 'checkbox-na', required: true, tagOnComplete: 'Conditional' },
    ],
  },
  {
    step: 2,
    name: 'Applicant Approval',
    subSteps: [
      { id: '2a', label: 'Approve in PMS', type: 'checkbox', required: true },
      { id: '2b', label: 'Upload verified income to file', type: 'checkbox', required: true },
      { id: '2c', label: 'Upload screening document to file', type: 'checkbox', required: true },
      { id: '2d', label: 'Send Application Approved E-mail', type: 'checkbox', required: true, emailTemplate: 'application-approved' },
    ],
  },
  {
    step: 3,
    name: 'Lease Information',
    subtext: 'Note waitlist requests in notes section',
    subSteps: [
      { id: '3a', label: 'Parking', type: 'textbox', required: true, showOnCard: true, uiVariant: 'parking' },
      { id: '3b', label: 'Storage', type: 'textbox', required: true, showOnCard: true, uiVariant: 'storage' },
      { id: '3c', label: 'Pets', type: 'textbox', required: true, showOnCard: true, uiVariant: 'pets' },
      { id: '3e', label: 'Reasonable Acc. Requested', type: 'textbox', required: true, showOnCard: true, uiVariant: 'reasonable_acc' },
    ],
  },
  {
    step: 4,
    name: 'Lease Generation',
    subSteps: [
      { id: '4a', label: 'Generate lease in PMS', type: 'checkbox', required: true },
      { id: '4b', label: 'Generate move-in balance sheet & checklist', type: 'checkbox', required: true },
      { id: '4c', label: 'E-mail final steps & move-in balance to future resident', type: 'checkbox', required: true, emailTemplate: 'final-steps' },
    ],
  },
  {
    step: 5,
    name: 'Move-In Prep',
    subSteps: [
      { id: '5a', label: 'Countersign lease', type: 'checkbox', required: true },
      { id: '5b', label: 'Upload intermediate application documents (Updated Vax Records, RA Form, Guarantor, Etc.)', type: 'checkbox-na', required: true },
      { id: '5c', label: 'Record utility account in PMS', type: 'checkbox', required: true },
      { id: '5d', label: 'Confirm insurance compliance (Upload policy if not tracked by Assurant yet)', type: 'checkbox', required: true },
      { id: '5g', label: 'Move-In packet, keys and fob access', type: 'checkbox', required: true },
      { id: '5h', label: 'Did Resident Pay Online?', type: 'textbox', required: true, uiVariant: 'payment_method', tagOnComplete: 'payment_method' },
    ],
  },
  {
    step: 6,
    name: 'Post Move-In',
    subSteps: [
      { id: '6d', label: 'Confirm Lease File Descriptions (RQA, Radon, Application, POI, Screening, ETC)', type: 'checkbox', required: true },
      { id: '6f', label: 'Sign Balance Sheet & Checklist - Deliver to MGR for finalization', type: 'checkbox', required: true },
      { id: '6a', label: 'Upload signed Balance Sheet to PMS', type: 'checkbox', required: true },
      { id: '6b', label: 'Upload signed Checklist to PMS', type: 'checkbox', required: true },
      { id: '6c', label: "Upload Cashier's Check to PMS", type: 'checkbox', required: true },
      { id: '6e', label: 'Upload Inventory & Conditions Form to PMS', type: 'checkbox', required: true },
    ],
  },
];

// Backward-compatible alias
export const WORKFLOW_STEPS = NEW_APPLICANT_STEPS;

// ==================== TRANSFER WORKFLOW ====================

export const TRANSFER_STEPS: WorkflowStepConfig[] = [
  {
    step: 1,
    name: 'Begin Transfer Agreement Form',
    subSteps: [
      { id: 't1a', label: 'E-mail Resident Transfer Request Form', type: 'checkbox', required: true, emailTemplate: 'transfer-request' },
      { id: 't1b', label: 'Lease End Date', type: 'textbox', required: true },
      { id: 't1c', label: 'Requested Transfer Date', type: 'textbox', required: true },
      { id: 't1d', label: 'Transferring Apartment Number', type: 'textbox', required: true },
      { id: 't1e', label: 'Preliminary Transfer Inspection Date', type: 'textbox', required: true },
      { id: 't1f', label: 'Move Out Inspection Date', type: 'textbox', required: true },
    ],
  },
  {
    step: 2,
    name: 'Transfer Inspection',
    subSteps: [
      { id: 't2a', label: 'Walk apartment confirming transfer eligibility', type: 'checkbox', required: true },
      { id: 't2b', label: 'Confirm Transfer Dates & Timeline', type: 'checkbox', required: true },
      { id: 't2c', label: 'Resident & Leasing sign Transfer Agreement', type: 'checkbox', required: true },
      { id: 't2d', label: 'Manager Approval & Signature', type: 'checkbox', required: true },
      { id: 't2e', label: 'Schedule Transfer In PMS', type: 'checkbox', required: true },
    ],
  },
  {
    step: 3,
    name: 'Income Verification',
    subSteps: [
      { id: 't3a', label: 'Request new income documents from Resident', type: 'checkbox', required: true, emailTemplate: 'transfer-income-request' },
      { id: 't3b', label: 'Upload income verification to resident file', type: 'checkbox', required: true },
    ],
  },
  {
    step: 4,
    name: 'Update Resident Information',
    subSteps: [
      { id: 't4a', label: 'E-mail "Transferring Resident Information Update" form to all transferring residents', type: 'checkbox', required: true, emailTemplate: 'transfer-info-update' },
      { id: 't4b', label: 'Update/Confirm Transferring Resident Information in PMS', type: 'checkbox', required: true },
      { id: 't4c', label: 'Upload completed TRIU Form to resident file', type: 'checkbox', required: true },
      { id: 't4d', label: 'Parking', type: 'textbox', required: true, showOnCard: true, uiVariant: 'parking' },
      { id: 't4e', label: 'Storage', type: 'textbox', required: true, showOnCard: true, uiVariant: 'storage' },
      { id: 't4f', label: 'Pets', type: 'textbox', required: true, showOnCard: true, uiVariant: 'pets' },
      { id: 't4g', label: 'Reasonable Acc. Requested', type: 'textbox', required: true, showOnCard: true, uiVariant: 'reasonable_acc' },
    ],
  },
  {
    step: 5,
    name: 'Lease Generation',
    subSteps: [
      { id: 't5a', label: 'Generate Lease In PMS', type: 'checkbox', required: true },
      { id: 't5b', label: 'Generate move-in balance sheet & checklist', type: 'checkbox', required: true },
      { id: 't5c', label: 'Email final steps & move-in balance to future resident', type: 'checkbox', required: true, emailTemplate: 'final-steps' },
    ],
  },
  {
    step: 6,
    name: 'Move-In Prep',
    subSteps: [
      { id: 't6a', label: 'Countersign lease', type: 'checkbox', required: true },
      { id: 't6b', label: 'Upload intermediate application documents (Updated Vax Records, RA Form, Guarantor, Etc.)', type: 'checkbox-na', required: true },
      { id: 't6c', label: 'Record utility account in PMS', type: 'checkbox', required: true },
      { id: 't6d', label: 'Confirm insurance compliance (Upload policy if not tracked by Assurant yet)', type: 'checkbox', required: true },
      { id: 't6e', label: 'Move-In packet, keys and fob access', type: 'checkbox', required: true },
      { id: 't6f', label: 'Did Resident Pay Online?', type: 'textbox', required: true, uiVariant: 'payment_method', tagOnComplete: 'payment_method' },
    ],
  },
  {
    step: 7,
    name: 'Post Move-In',
    subSteps: [
      { id: 't7d', label: 'Confirm Lease File Descriptions (RQA, Radon, Application, POI, Screening, ETC)', type: 'checkbox', required: true },
      { id: 't7f', label: 'Sign Balance Sheet & Checklist - Deliver to MGR for finalization', type: 'checkbox', required: true },
      { id: 't7a', label: 'Upload signed Balance Sheet to PMS', type: 'checkbox', required: true },
      { id: 't7b', label: 'Upload signed Checklist to PMS', type: 'checkbox', required: true },
      { id: 't7c', label: "Upload Cashier's Check to PMS", type: 'checkbox', required: true },
      { id: 't7e', label: 'Upload Inventory & Conditions Form to PMS', type: 'checkbox', required: true },
    ],
  },
];

// ==================== HELPER FUNCTIONS ====================

// Get the correct workflow steps for an applicant type
export const getWorkflowSteps = (applicantType?: ApplicantType): WorkflowStepConfig[] => {
  return applicantType === 'transfer' ? TRANSFER_STEPS : NEW_APPLICANT_STEPS;
};

// Helper to get all sub-step IDs for a step
export const getSubStepIds = (stepNumber: number, applicantType?: ApplicantType): string[] => {
  const steps = getWorkflowSteps(applicantType);
  const step = steps.find((s) => s.step === stepNumber);
  return step ? step.subSteps.map((ss) => ss.id) : [];
};

// Helper to get sub-step config by ID
export const getSubStepConfig = (subStepId: string, applicantType?: ApplicantType): SubStepConfig | undefined => {
  const steps = getWorkflowSteps(applicantType);
  for (const step of steps) {
    const subStep = step.subSteps.find((ss) => ss.id === subStepId);
    if (subStep) return subStep;
  }
  return undefined;
};

// Initialize workflow data structure for an applicant
export const initializeWorkflow = (applicantType: ApplicantType = 'new') => {
  const steps = getWorkflowSteps(applicantType);
  const workflow: { [key: string]: any } = {};

  steps.forEach((step) => {
    const subSteps: { [key: string]: any } = {};

    step.subSteps.forEach((subStep) => {
      const subStepData: any = {
        isCompleted: false,
        isNA: false,
        completedAt: null,
        completedBy: null,
      };

      // Only add textValue field for textbox types (Firestore doesn't allow undefined)
      if (subStep.type === 'textbox') {
        subStepData.textValue = '';
      }

      subSteps[subStep.id] = subStepData;
    });

    workflow[step.step.toString()] = {
      stepName: step.name,
      isCompleted: false,
      subSteps,
      notes: '',
    };
  });

  return workflow;
};

// Check if a step is complete (all sub-steps must be fulfilled or marked N/A)
export const isStepComplete = (stepData: any, stepConfig: WorkflowStepConfig): boolean => {
  if (!stepData) return false;
  // Backward compatibility: if the step was already locked in complete before a new sub-step was added
  if (stepData.isCompleted === true) return true;
  if (!stepData.subSteps) return false;

  return stepConfig.subSteps
    .every((ss) => {
      const subStepData = stepData.subSteps[ss.id];
      if (!subStepData) return false;

      if (ss.type === 'textbox') {
        // Textbox: must have value OR be marked N/A
        return subStepData.isNA || (subStepData.textValue && subStepData.textValue.trim() !== '');
      } else if (ss.type === 'checkbox-na') {
        // Checkbox with N/A option: must be checked OR marked N/A
        return subStepData.isNA || subStepData.isCompleted;
      } else {
        // Regular checkbox: must be checked
        return subStepData.isCompleted;
      }
    });
};

// Get tags to display on applicant card based on completed sub-steps
export const getApplicantTags = (workflow: any, applicantType?: ApplicantType): string[] => {
  const steps = getWorkflowSteps(applicantType);
  const tags: string[] = [];

  steps.forEach((step) => {
    const stepData = workflow[step.step.toString()];
    if (!stepData?.subSteps) return;

    step.subSteps.forEach((subStep) => {
      if (subStep.tagOnComplete) {
        const subStepData = stepData.subSteps[subStep.id];
        if (subStepData?.isCompleted) {
          // Dynamic tag for payment_method based on textValue
          if (subStep.tagOnComplete === 'payment_method') {
            if (subStepData.textValue === 'paid_online') tags.push('PAID ONLINE');
            else if (subStepData.textValue === 'cashiers_check') tags.push('PAID CASHIERS');
          } else {
            tags.push(subStep.tagOnComplete);
          }
        }
      }
    });
  });

  return tags;
};

// ==================== TAG DISPLAY SYSTEM ====================

// Tag color definitions — each tag type gets a unique background
export const TAG_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  'Guarantor':       { bg: 'bg-amber-200/60',   border: 'border-amber-400/60',   text: 'text-amber-900' },
  'x-fer':           { bg: 'bg-sky-200/60',      border: 'border-sky-400/60',     text: 'text-sky-900' },
  'TRANSFER':        { bg: 'bg-sky-200/60',      border: 'border-sky-400/60',     text: 'text-sky-900' },
  'Conditional':     { bg: 'bg-orange-200/60',   border: 'border-orange-400/60',  text: 'text-orange-900' },
  'CONCESSION':      { bg: 'bg-emerald-200/60',  border: 'border-emerald-400/60', text: 'text-emerald-900' },
  'PARKING':         { bg: 'bg-violet-200/60',   border: 'border-violet-400/60',  text: 'text-violet-900' },
  'STORAGE':         { bg: 'bg-indigo-200/60',   border: 'border-indigo-400/60',  text: 'text-indigo-900' },
  'PETS':            { bg: 'bg-pink-200/60',     border: 'border-pink-400/60',    text: 'text-pink-900' },
  'RA REQUESTED':    { bg: 'bg-red-200/60',      border: 'border-red-400/60',     text: 'text-red-900' },
  'PAID ONLINE':     { bg: 'bg-teal-200/60',     border: 'border-teal-400/60',    text: 'text-teal-900' },
  'PAID CASHIERS':   { bg: 'bg-cyan-200/60',     border: 'border-cyan-400/60',    text: 'text-cyan-900' },
  'TRANSFER FEE':    { bg: 'bg-rose-200/60',     border: 'border-rose-400/60',    text: 'text-rose-900' },
  '30-DAY FREE XFER':{ bg: 'bg-lime-200/60',    border: 'border-lime-400/60',    text: 'text-lime-900' },
};

const DEFAULT_TAG_STYLE = { bg: 'bg-lavender/30', border: 'border-lavender/50', text: 'text-neuro-primary' };

export const getTagStyle = (tag: string) => {
  // Exact match first
  if (TAG_STYLES[tag]) return TAG_STYLES[tag];
  // Prefix match for value-bearing tags (e.g., "CONCESSION: 10 Weeks" → "CONCESSION")
  const prefix = tag.split(':')[0];
  if (TAG_STYLES[prefix]) return TAG_STYLES[prefix];
  return DEFAULT_TAG_STYLE;
};

// Compute ALL display tags from every source: substep checkboxes, profile fields, textbox values
export const computeAllTags = (applicant: any): string[] => {
  const tags: string[] = [];
  const profile = applicant['1_Profile'];
  const applicantType = profile?.applicantType || 'new';
  const workflow = applicant.workflow;
  if (!workflow) return tags;

  // 1. Transfer applicant type tag
  if (applicantType === 'transfer') {
    tags.push('TRANSFER');
  }

  // 2. Concession from profile (with value)
  if (profile?.isConcession || (profile?.concessionApplied && profile.concessionApplied.trim() !== '')) {
    tags.push(profile.concessionApplied ? `CONCESSION: ${profile.concessionApplied}` : 'CONCESSION');
  }

  // 3. Tags from substep checkboxes (Guarantor, Conditional, x-fer, payment method)
  const steps = getWorkflowSteps(applicantType);
  steps.forEach((step) => {
    const stepData = workflow[step.step.toString()];
    if (!stepData?.subSteps) return;

    step.subSteps.forEach((subStep) => {
      if (subStep.tagOnComplete) {
        const subStepData = stepData.subSteps[subStep.id];
        if (subStepData?.isCompleted) {
          if (subStep.tagOnComplete === 'payment_method') {
            if (subStepData.textValue === 'paid_online') tags.push('PAID ONLINE');
            else if (subStepData.textValue === 'cashiers_check') tags.push('PAID CASHIERS');
          } else {
            tags.push(subStep.tagOnComplete);
          }
        }
      }

      // 4. Tags derived from textbox values (parking, storage, pets, RA) — include values
      if (subStep.uiVariant && !subStep.tagOnComplete) {
        const subStepData = stepData.subSteps[subStep.id];
        if (subStepData?.isNA || !subStepData?.textValue || subStepData.textValue.trim() === '') return;
        const val = subStepData.textValue;

        if (subStep.uiVariant === 'parking') {
          tags.push(`PARKING: ${val}`);
        } else if (subStep.uiVariant === 'storage') {
          tags.push(`STORAGE: ${val}`);
        } else if (subStep.uiVariant === 'pets') {
          tags.push(`PETS: ${val}`);
        } else if (subStep.uiVariant === 'reasonable_acc' && val === 'Yes') {
          tags.push('RA REQUESTED');
        }
      }
    });
  });

  // 5. Preserved transfer fee tags (stored on applicant.tags, computed separately)
  const existingTags = applicant.tags || [];
  const transferFeeTag = existingTags.find((t: string) => t === 'TRANSFER FEE' || t === '30-DAY FREE XFER');
  if (transferFeeTag && !tags.includes(transferFeeTag)) {
    tags.push(transferFeeTag);
  }

  return tags;
};

// Get lease info values for at-a-glance card (only shows items with actual text, not N/A)
export const getLeaseInfoForCard = (workflow: any, applicantType?: ApplicantType): { label: string; value: string }[] => {
  const steps = getWorkflowSteps(applicantType);
  const results: { label: string; value: string }[] = [];

  steps.forEach((step) => {
    const stepData = workflow[step.step.toString()];
    if (!stepData?.subSteps) return;

    step.subSteps.forEach((ss) => {
      if (!ss.showOnCard) return;
      const subStepData = stepData.subSteps[ss.id];
      if (subStepData?.isNA || !subStepData?.textValue || subStepData.textValue.trim() === '') return;
      results.push({ label: ss.label, value: subStepData.textValue });
    });
  });

  return results;
};

// Result type for getNextIncompleteSubStep
export type NextSubStepResult =
  | { type: 'substep'; stepNumber: number; config: SubStepConfig }
  | { type: 'needs_promotion' }
  | null;

// Find the next incomplete sub-step across all workflow steps.
// Enforces promotion gate: all steps except the last must be complete AND applicant promoted before last step is shown.
export const getNextIncompleteSubStep = (workflow: any, promotedToResident: boolean, applicantType?: ApplicantType): NextSubStepResult => {
  const steps = getWorkflowSteps(applicantType);
  const lastStepNum = steps[steps.length - 1].step;
  const prePromotionSteps = steps.filter(s => s.step !== lastStepNum);

  // Scan all steps before the last (pre-promotion)
  for (const stepConfig of prePromotionSteps) {
    const stepData = workflow[stepConfig.step.toString()];
    if (!stepData) continue;

    // Backward compatibility: Skip if the step is already completely checked off
    if (stepData.isCompleted) continue;

    const firstIncomplete = stepConfig.subSteps.find(ss => {
      const data = stepData.subSteps[ss.id];
      return !data?.isCompleted && !data?.isNA;
    });

    if (firstIncomplete) {
      return { type: 'substep', stepNumber: stepConfig.step, config: firstIncomplete };
    }
  }

  // All pre-promotion steps complete — check promotion gate
  if (!promotedToResident) {
    return { type: 'needs_promotion' };
  }

  // Promoted — scan last step
  const lastStepConfig = steps[steps.length - 1];
  const stepData = workflow[lastStepNum.toString()];
  if (stepData && !stepData.isCompleted) {
    const firstIncomplete = lastStepConfig.subSteps.find(ss => {
      const data = stepData.subSteps[ss.id];
      return !data?.isCompleted && !data?.isNA;
    });
    if (firstIncomplete) {
      return { type: 'substep', stepNumber: lastStepNum, config: firstIncomplete };
    }
  }

  return null;
};

// Compute transfer fee tags based on lease end date and requested transfer date
export const computeTransferFeeTags = (leaseEndDateStr: string, transferDateStr: string): string[] => {
  if (!leaseEndDateStr || !transferDateStr) return [];

  const leaseEnd = new Date(leaseEndDateStr);
  const transferDate = new Date(transferDateStr);

  if (isNaN(leaseEnd.getTime()) || isNaN(transferDate.getTime())) return [];

  const diffMs = leaseEnd.getTime() - transferDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // If transfer date is within 30 days of lease end date (before or on)
  if (diffDays >= 0 && diffDays <= 30) {
    return ['30-DAY FREE XFER'];
  }

  return ['TRANSFER FEE'];
};

// Normalize applicant data to ensure it follows the new nested structure
export const normalizeApplicant = (data: any): any => {
  if (!data) return null;
  const applicant = { ...data };

  // If new structure doesn't exist, migrate from flat structure
  if (!applicant["1_Profile"]) {
    applicant["1_Profile"] = {
      name: data.name || '',
      unit: data.unit || '',
      dateApplied: data.dateApplied || null,
      moveInDate: data.moveInDate || null,
      concessionApplied: data.concessionApplied || '',
    };
  } else if (!applicant["1_Profile"].name && data.name) {
    // If 1_Profile exists but name is missing, pull it from top level
    applicant["1_Profile"].name = data.name;
  }

  // Default applicantType to 'new' for backward compatibility
  if (!applicant["1_Profile"].applicantType) {
    applicant["1_Profile"].applicantType = 'new';
  }

  if (!applicant["2_Tracking"]) {
    applicant["2_Tracking"] = {
      status: data.status || 'in_progress',
      currentStep: data.currentStep || 1,
      promotedToResident: data.promotedToResident || false,
      promotedToResidentAt: data.promotedToResidentAt || data.promotedAt || null,
      leaseCompletedTime: data.leaseCompletedTime || data.completedAt || null,
      createdAt: data.createdAt || null,
      createdBy: data.createdBy || '',
      updatedAt: data.updatedAt || null,
    };
  }

  // Ensure new substeps exist for existing new applicants (6d, 6e, 6f added)
  // Skip if step 6 is already marked complete (don't affect completed residents)
  if (applicant["1_Profile"].applicantType === 'new' && applicant.workflow) {
    const step6 = applicant.workflow['6'];
    if (step6?.subSteps && !step6.isCompleted) {
      if (!step6.subSteps['6d']) {
        step6.subSteps['6d'] = { isCompleted: false, isNA: false, completedAt: null, completedBy: null };
      }
      if (!step6.subSteps['6e']) {
        step6.subSteps['6e'] = { isCompleted: false, isNA: false, completedAt: null, completedBy: null };
      }
      if (!step6.subSteps['6f']) {
        step6.subSteps['6f'] = { isCompleted: false, isNA: false, completedAt: null, completedBy: null };
      }
    }
    // Convert 5h from checkbox-na to textbox format if needed (payment_method migration)
    const step5 = applicant.workflow['5'];
    if (step5?.subSteps?.['5h'] && step5.subSteps['5h'].textValue === undefined) {
      step5.subSteps['5h'].textValue = '';
    }
  }

  // Ensure new substeps for existing transfer applicants (t7f added)
  if (applicant["1_Profile"].applicantType === 'transfer' && applicant.workflow) {
    const step7 = applicant.workflow['7'];
    if (step7?.subSteps && !step7.isCompleted) {
      if (!step7.subSteps['t7f']) {
        step7.subSteps['t7f'] = { isCompleted: false, isNA: false, completedAt: null, completedBy: null };
      }
    }
    // Convert t6f from checkbox-na to textbox format if needed
    const step6 = applicant.workflow['6'];
    if (step6?.subSteps?.['t6f'] && step6.subSteps['t6f'].textValue === undefined) {
      step6.subSteps['t6f'].textValue = '';
    }
  }

  return applicant;
};
