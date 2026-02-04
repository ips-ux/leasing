/**
 * Email Template Service
 * Handles CRUD operations for email templates in Firestore
 */

import { db } from '../firebase/config';
import { doc, getDoc, setDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

export interface EmailTemplate {
    id: string;
    name: string;
    content: string;
    lastModified: Timestamp;
    modifiedBy: string;
}

export type TemplateId = 'request-income' | 'application-approved' | 'final-steps';

const TEMPLATES_COLLECTION = 'emailTemplates';

/**
 * Get a single template by ID
 */
export async function getTemplate(templateId: TemplateId): Promise<EmailTemplate | null> {
    try {
        const templateRef = doc(db, TEMPLATES_COLLECTION, templateId);
        const templateSnap = await getDoc(templateRef);

        if (templateSnap.exists()) {
            return templateSnap.data() as EmailTemplate;
        }
        return null;
    } catch (error) {
        console.error('Error fetching template:', error);
        throw error;
    }
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<EmailTemplate[]> {
    try {
        const templatesRef = collection(db, TEMPLATES_COLLECTION);
        const querySnapshot = await getDocs(templatesRef);

        return querySnapshot.docs.map(doc => doc.data() as EmailTemplate);
    } catch (error) {
        console.error('Error fetching all templates:', error);
        throw error;
    }
}

/**
 * Save a template (create or update)
 */
export async function saveTemplate(
    templateId: TemplateId,
    content: string,
    userEmail: string
): Promise<void> {
    try {
        const templateRef = doc(db, TEMPLATES_COLLECTION, templateId);

        // Get existing template to preserve name
        const existing = await getDoc(templateRef);
        const name = existing.exists()
            ? (existing.data() as EmailTemplate).name
            : getDefaultTemplateName(templateId);

        const template: EmailTemplate = {
            id: templateId,
            name,
            content,
            lastModified: Timestamp.now(),
            modifiedBy: userEmail,
        };

        await setDoc(templateRef, template);
    } catch (error) {
        console.error('Error saving template:', error);
        throw error;
    }
}

/**
 * Get default template name based on ID
 */
function getDefaultTemplateName(templateId: TemplateId): string {
    const names: Record<TemplateId, string> = {
        'request-income': 'Request Income Email',
        'application-approved': 'Application Approved Email',
        'final-steps': 'Final Steps Email',
    };
    return names[templateId];
}
