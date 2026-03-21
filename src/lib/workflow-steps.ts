// Workflow Steps Configuration with Sub-Steps

export type SubStepType = 'checkbox' | 'textbox' | 'checkbox-na';

export interface SubStepConfig {
  id: string;
  label: string;
  type: SubStepType;
  required: boolean;
  tagOnComplete?: string; // Tag to display on applicant card when checked
  showOnCard?: boolean;   // Whether to show value on at-a-glance card (for textboxes)
}

export interface WorkflowStepConfig {
  step: number;
  name: string;
  subtext?: string;
  subSteps: SubStepConfig[];
}

export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    step: 1,
    name: 'Begin Income Verification',
    subSteps: [
      { id: '1a', label: 'Submit income documents for approval', type: 'checkbox', required: true },
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
      { id: '2d', label: 'Send Application Approved E-mail', type: 'checkbox', required: true },
    ],
  },
  {
    step: 3,
    name: 'Lease Information',
    subtext: 'Note waitlist requests in notes section',
    subSteps: [
      { id: '3a', label: 'Parking', type: 'textbox', required: true, showOnCard: true },
      { id: '3b', label: 'Storage', type: 'textbox', required: true, showOnCard: true },
      { id: '3c', label: 'Pets', type: 'textbox', required: true, showOnCard: true },
      { id: '3e', label: 'Reasonable Acc. Requested', type: 'textbox', required: true, showOnCard: true },
    ],
  },
  {
    step: 4,
    name: 'Lease Generation',
    subSteps: [
      { id: '4a', label: 'Generate lease in PMS', type: 'checkbox', required: true },
      { id: '4b', label: 'Generate move-in balance sheet & checklist', type: 'checkbox', required: true },
      { id: '4c', label: 'E-mail final steps & move-in balance to future resident', type: 'checkbox', required: true },
    ],
  },
  {
    step: 5,
    name: 'Move-In Prep',
    subSteps: [
      { id: '5a', label: 'Countersign lease', type: 'checkbox', required: true },
      { id: '5b', label: 'Upload intermediate application documents (vax records, RA form, ESA form)', type: 'checkbox-na', required: true },
      { id: '5c', label: 'Record utility account in PMS', type: 'checkbox', required: true },
      { id: '5d', label: 'Confirm insurance compliance', type: 'checkbox', required: true },
      { id: '5e', label: '[HappyCo] Move-In Inspection', type: 'checkbox', required: true },
      { id: '5g', label: 'Move-In packet, keys and fob access', type: 'checkbox', required: true },
      { id: '5h', label: 'Paid in advance?', type: 'checkbox-na', required: true, tagOnComplete: 'Paid MIB' },
    ],
  },
  {
    step: 6,
    name: 'Post Move-In',
    subSteps: [
      { id: '6a', label: 'Upload signed Balance Sheet to PMS', type: 'checkbox', required: true },
      { id: '6b', label: 'Upload signed Checklist to PMS', type: 'checkbox', required: true },
      { id: '6c', label: "Upload Cashier's Check to PMS", type: 'checkbox', required: true },
      { id: '6d', label: 'Upload Inventory & Conditions form to PMS', type: 'checkbox', required: true },
    ],
  },
];

// Helper to get all sub-step IDs for a step
export const getSubStepIds = (stepNumber: number): string[] => {
  const step = WORKFLOW_STEPS.find((s) => s.step === stepNumber);
  return step ? step.subSteps.map((ss) => ss.id) : [];
};

// Helper to get sub-step config by ID
export const getSubStepConfig = (subStepId: string): SubStepConfig | undefined => {
  for (const step of WORKFLOW_STEPS) {
    const subStep = step.subSteps.find((ss) => ss.id === subStepId);
    if (subStep) return subStep;
  }
  return undefined;
};

// Initialize workflow data structure for a new applicant
export const initializeWorkflow = () => {
  const workflow: { [key: string]: any } = {};

  WORKFLOW_STEPS.forEach((step) => {
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
  if (!stepData?.subSteps) return false;

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
export const getApplicantTags = (workflow: any): string[] => {
  const tags: string[] = [];

  WORKFLOW_STEPS.forEach((step) => {
    const stepData = workflow[step.step.toString()];
    if (!stepData?.subSteps) return;

    step.subSteps.forEach((subStep) => {
      if (subStep.tagOnComplete) {
        const subStepData = stepData.subSteps[subStep.id];
        if (subStepData?.isCompleted) {
          tags.push(subStep.tagOnComplete);
        }
      }
    });
  });

  return tags;
};

// Get lease info values for at-a-glance card (only shows items with actual text, not N/A)
export const getLeaseInfoForCard = (workflow: any): { label: string; value: string }[] => {
  const step3 = WORKFLOW_STEPS.find((s) => s.step === 3);
  if (!step3) return [];

  const stepData = workflow['3'];
  if (!stepData?.subSteps) return [];

  return step3.subSteps
    .filter((ss) => ss.showOnCard)
    .map((ss) => {
      const subStepData = stepData.subSteps[ss.id];
      // Only include if there's actual text value (not N/A)
      if (subStepData?.isNA || !subStepData?.textValue || subStepData.textValue.trim() === '') {
        return null;
      }
      return {
        label: ss.label,
        value: subStepData.textValue,
      };
    })
    .filter((item): item is { label: string; value: string } => item !== null);
};

// Result type for getNextIncompleteSubStep
export type NextSubStepResult =
  | { type: 'substep'; stepNumber: number; config: SubStepConfig }
  | { type: 'needs_promotion' }
  | null;

// Find the next incomplete sub-step across all workflow steps.
// Enforces promotion gate: steps 1-5 must be complete AND applicant promoted before step 6 is shown.
export const getNextIncompleteSubStep = (workflow: any, promotedToResident: boolean): NextSubStepResult => {
  // Scan steps 1-5 first
  for (let stepNum = 1; stepNum <= 5; stepNum++) {
    const stepConfig = WORKFLOW_STEPS.find(s => s.step === stepNum);
    if (!stepConfig) continue;

    const stepData = workflow[stepNum.toString()];
    if (!stepData) continue;

    const firstIncomplete = stepConfig.subSteps.find(ss => {
      const data = stepData.subSteps[ss.id];
      return !data?.isCompleted && !data?.isNA;
    });

    if (firstIncomplete) {
      return { type: 'substep', stepNumber: stepNum, config: firstIncomplete };
    }
  }

  // Steps 1-5 are all complete — check promotion gate
  if (!promotedToResident) {
    return { type: 'needs_promotion' };
  }

  // Promoted — scan step 6
  const step6Config = WORKFLOW_STEPS.find(s => s.step === 6);
  if (step6Config) {
    const stepData = workflow['6'];
    if (stepData) {
      const firstIncomplete = step6Config.subSteps.find(ss => {
        const data = stepData.subSteps[ss.id];
        return !data?.isCompleted && !data?.isNA;
      });
      if (firstIncomplete) {
        return { type: 'substep', stepNumber: 6, config: firstIncomplete };
      }
    }
  }

  return null;
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

  return applicant;
};
