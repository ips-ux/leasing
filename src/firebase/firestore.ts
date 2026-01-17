import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';
import type { Applicant, ApplicantFormData, SubStepData } from '../types/applicant';
import type { Inquiry, InquiryFormData } from '../types/inquiry';
import type { User } from '../types/user';
import { initializeWorkflow, WORKFLOW_STEPS, isStepComplete, getApplicantTags } from '../lib/workflow-steps';
import { extractFirstName } from '../utils/user';

// ==================== HELPER FUNCTIONS ====================

/**
 * Converts a Date to a Timestamp at midnight UTC to avoid timezone issues
 * This ensures dates like "12/30/2025" always display as "12/30/2025" regardless of timezone
 */
const dateToMidnightUTC = (date: Date): Timestamp => {
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ));
  return Timestamp.fromDate(utcDate);
};

// ==================== APPLICANTS ====================

export const createApplicant = async (formData: ApplicantFormData): Promise<string> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('User not authenticated');

  // Initialize workflow
  const workflow = initializeWorkflow();

  // Handle Transfer checkbox - set substep 1c
  if (formData.isTransfer) {
    workflow['1'].subSteps['1c'] = {
      isCompleted: true,
      isNA: false,
      completedAt: serverTimestamp(),
      completedBy: currentUser.uid,
    };
  }

  // Calculate initial tags
  const initialTags = formData.isTransfer ? ['x-fer'] : [];

  const applicantData = {
    "1_Profile": {
      name: formData.name,
      unit: formData.unit,
      dateApplied: dateToMidnightUTC(formData.dateApplied),
      moveInDate: dateToMidnightUTC(formData.moveInDate),
      concessionApplied: formData.isConcession ? formData.concessionApplied : 'N/A',
    },
    "2_Tracking": {
      currentStep: 1,
      status: 'in_progress' as const,
      promotedToResident: false,
      promotedToResidentAt: null,
      leaseCompletedTime: null,
      createdBy: currentUser.uid,
      assignedTo: formData.assignedTo || currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    workflow,
    tags: initialTags,
    rentables: [],
    documents: {},
  };

  const docRef = await addDoc(collection(db, 'applicants'), applicantData);
  return docRef.id;
};

export const getApplicants = (constraints: QueryConstraint[] = []) => {
  const applicantsQuery = query(
    collection(db, 'applicants'),
    // Temporarily removed orderBy to ensure all applicants show up during migration
    // orderBy('1_Profile.name', 'asc'),
    ...constraints
  );
  return applicantsQuery;
};

export const getApplicant = (id: string) => {
  return doc(db, 'applicants', id);
};

export const updateApplicant = async (id: string, data: any): Promise<void> => {
  const docRef = doc(db, 'applicants', id);

  // Convert Date objects to Timestamps at midnight UTC for date-only fields
  const processedData: any = {};

  // Handle flat updates or nested updates
  Object.entries(data).forEach(([key, value]) => {
    if (key === '1_Profile' || key === '2_Tracking') {
      // If updating the whole map
      processedData[key] = value;
    } else if (key === 'name' || key === 'tags' || key === 'workflow' || key === 'documents' || key === 'rentables') {
      processedData[key] = value;
    } else {
      // Legacy or convenience: if field is in Profile or Tracking, use dot notation
      const profileFields = ['name', 'unit', 'dateApplied', 'moveInDate', 'concessionApplied'];
      const trackingFields = ['status', 'currentStep', 'promotedToResident', 'promotedToResidentAt', 'leaseCompletedTime', 'createdAt', 'createdBy', 'assignedTo', 'updatedAt', 'cancellationReason', 'cancelledAt', 'cancelledBy'];

      if (profileFields.includes(key)) {
        let val = value;
        if ((key === 'dateApplied' || key === 'moveInDate') && value instanceof Date) {
          val = dateToMidnightUTC(value);
        }
        processedData[`1_Profile.${key}`] = val;
      } else if (trackingFields.includes(key)) {
        processedData[`2_Tracking.${key}`] = value;
      } else {
        processedData[key] = value;
      }
    }
  });

  await updateDoc(docRef, {
    ...processedData,
    "2_Tracking.updatedAt": serverTimestamp(),
  });
};

export const deleteApplicant = async (id: string): Promise<void> => {
  const docRef = doc(db, 'applicants', id);
  await deleteDoc(docRef);
};

// ==================== SUB-STEP OPERATIONS ====================

// Update a sub-step within a workflow step
export const updateSubStep = async (
  applicantId: string,
  stepNumber: number,
  subStepId: string,
  updates: Partial<SubStepData>
): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('User not authenticated');

  const docRef = doc(db, 'applicants', applicantId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Applicant not found');

  const applicant = docSnap.data() as Applicant;
  const stepKey = stepNumber.toString();
  const stepData = applicant.workflow[stepKey];

  if (!stepData) throw new Error('Step not found');

  // Prepare the sub-step update
  const subStepPath = `workflow.${stepKey}.subSteps.${subStepId}`;
  const updateData: any = {
    updatedAt: serverTimestamp(),
  };

  // Update each field in the sub-step
  Object.entries(updates).forEach(([key, value]) => {
    updateData[`${subStepPath}.${key}`] = value;
  });

  // If marking as completed, set the timestamp and user
  if (updates.isCompleted === true) {
    updateData[`${subStepPath}.completedAt`] = updates.completedAt || serverTimestamp();
    updateData[`${subStepPath}.completedBy`] = currentUser.uid;
  }

  // If unchecking, clear completion info
  if (updates.isCompleted === false && updates.isNA !== true) {
    updateData[`${subStepPath}.completedAt`] = null;
    updateData[`${subStepPath}.completedBy`] = null;
  }

  await updateDoc(docRef, updateData);

  // After updating, recalculate step completion and tags
  await recalculateStepAndTags(applicantId, stepNumber);
};

// Update completion date for a sub-step
export const updateSubStepDate = async (
  applicantId: string,
  stepNumber: number,
  subStepId: string,
  completedAt: Date | null
): Promise<void> => {
  const docRef = doc(db, 'applicants', applicantId);
  const subStepPath = `workflow.${stepNumber}.subSteps.${subStepId}`;

  await updateDoc(docRef, {
    [`${subStepPath}.completedAt`]: completedAt ? Timestamp.fromDate(completedAt) : null,
    "2_Tracking.updatedAt": serverTimestamp(),
  });
};

// Recalculate step completion status and applicant tags
export const recalculateStepAndTags = async (
  applicantId: string,
  stepNumber: number
): Promise<void> => {
  const docRef = doc(db, 'applicants', applicantId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Applicant not found');

  const applicant = { id: docSnap.id, ...docSnap.data() } as Applicant;
  const stepKey = stepNumber.toString();
  const stepData = applicant.workflow[stepKey];
  const stepConfig = WORKFLOW_STEPS.find((s) => s.step === stepNumber);

  if (!stepData || !stepConfig) return;

  // Check if step is complete
  const stepComplete = isStepComplete(stepData, stepConfig);

  // Calculate tags from all steps
  const tags = getApplicantTags(applicant.workflow);

  // Find current step (first incomplete required step)
  let currentStep = 1;
  for (const step of WORKFLOW_STEPS) {
    const sData = applicant.workflow[step.step.toString()];
    if (isStepComplete(sData, step)) {
      currentStep = step.step + 1;
    } else {
      break;
    }
  }
  currentStep = Math.min(currentStep, WORKFLOW_STEPS.length);

  // Check if all steps are complete
  const allComplete = WORKFLOW_STEPS.every((step) => {
    const sData = applicant.workflow[step.step.toString()];
    return isStepComplete(sData, step);
  });

  await updateDoc(docRef, {
    [`workflow.${stepKey}.isCompleted`]: stepComplete,
    tags,
    "2_Tracking.currentStep": currentStep,
    "2_Tracking.status": allComplete ? 'completed' : applicant["2_Tracking"].status === 'completed' ? 'in_progress' : applicant["2_Tracking"].status,
    "2_Tracking.updatedAt": serverTimestamp(),
  });
};

// Update notes for a workflow step
export const updateStepNotes = async (
  applicantId: string,
  stepNumber: number,
  notes: string
): Promise<void> => {
  const docRef = doc(db, 'applicants', applicantId);

  await updateDoc(docRef, {
    [`workflow.${stepNumber}.notes`]: notes,
    "2_Tracking.updatedAt": serverTimestamp(),
  });
};

// ==================== LEGACY RENTABLES (kept for compatibility) ====================

export const addRentable = async (
  applicantId: string,
  rentable: { itemType: 'parking' | 'storage'; itemName: string; quantity: number; monthlyRate: number }
): Promise<void> => {
  const docRef = doc(db, 'applicants', applicantId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Applicant not found');

  const currentRentables = docSnap.data().rentables || [];
  await updateDoc(docRef, {
    rentables: [...currentRentables, rentable],
    "2_Tracking.updatedAt": serverTimestamp(),
  });
};

export const removeRentable = async (applicantId: string, rentableIndex: number): Promise<void> => {
  const docRef = doc(db, 'applicants', applicantId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Applicant not found');

  const currentRentables = docSnap.data().rentables || [];
  currentRentables.splice(rentableIndex, 1);

  await updateDoc(docRef, {
    rentables: currentRentables,
    "2_Tracking.updatedAt": serverTimestamp(),
  });
};

// ==================== INQUIRIES ====================

export const createInquiry = async (formData: InquiryFormData): Promise<string> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('User not authenticated');

  // Get current month in YYYY-MM format
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const inquiryData = {
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    status: formData.status,
    unitNumber: formData.unitNumber || '',
    notes: formData.notes || '',
    month,
    createdBy: currentUser.uid,
    assignedTo: formData.assignedTo || currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  };

  const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);
  return docRef.id;
};

export const getInquiries = (constraints: QueryConstraint[] = []) => {
  const inquiriesQuery = query(
    collection(db, 'inquiries'),
    orderBy('createdAt', 'desc'),
    ...constraints
  );
  return inquiriesQuery;
};

export const getInquiry = (id: string) => {
  return doc(db, 'inquiries', id);
};

export const updateInquiry = async (id: string, data: Partial<Inquiry>): Promise<void> => {
  const docRef = doc(db, 'inquiries', id);

  const updateData: any = { ...data, updatedAt: serverTimestamp() };

  // If marking as completed, set completedAt timestamp
  if (data.status === 'completed' && !data.completedAt) {
    updateData.completedAt = serverTimestamp();
  }

  // If changing from completed to another status, clear completedAt
  if (data.status && data.status !== 'completed') {
    updateData.completedAt = null;
  }

  await updateDoc(docRef, updateData);
};

export const deleteInquiry = async (id: string): Promise<void> => {
  const docRef = doc(db, 'inquiries', id);
  await deleteDoc(docRef);
};

// ==================== USERS ====================

export const syncUserToFirestore = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || extractFirstName(user.email),
    lastLogin: serverTimestamp(),
    lastActive: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } else {
    // Only update fields that might have changed or need refreshing
    await updateDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName,
      lastActive: userData.lastActive,
      updatedAt: userData.updatedAt,
    });
  }
};

export const getUsers = async (onlyActive: boolean = false): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  let q = query(usersRef, orderBy('displayName', 'asc'));

  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(doc => doc.data() as User);

  if (onlyActive) {
    // Filter users active in the last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return users.filter(u => {
      // If lastActive doesn't exist, include the user (they might be newly created)
      if (!u.lastActive) return true;

      const lastActive = u.lastActive instanceof Timestamp ? u.lastActive.toMillis() :
        u.lastActive instanceof Date ? u.lastActive.getTime() : 0;

      // If lastActive is 0 (invalid), include the user
      if (lastActive === 0) return true;

      return lastActive > thirtyDaysAgo;
    });
  }

  return users;
};

/**
 * Manually remove a user record from Firestore.
 * This is useful if a user was deleted from Auth and needs to be cleaned up.
 */
export const deleteUserRecord = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
};
