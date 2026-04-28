import type { Timestamp } from 'firebase/firestore';

export const CATEGORY_COLORS = [
  '#a78bfa', // lavender
  '#60a5fa', // blue
  '#34d399', // emerald
  '#4ade80', // lime
  '#22d3ee', // cyan
  '#fb923c', // orange
  '#f472b6', // pink
  '#f87171', // red
  '#facc15', // yellow
  '#94a3b8', // slate
] as const;

export interface EmailTemplateCategory {
  id: string;
  name: string;
  color: string;
  createdAt: Timestamp;
  createdBy: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  buttonText: string;
  htmlContent: string;
  linkedSubStepIds: string[];
  categoryIds?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface EmailTemplateFormData {
  title: string;
  buttonText: string;
  htmlContent: string;
  linkedSubStepIds: string[];
  categoryIds?: string[];
}
