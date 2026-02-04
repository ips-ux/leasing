/**
 * Email Utilities Service
 * Handles placeholder replacement and formatting for emails
 */

import type { Applicant } from '../../types/applicant';
import type { Timestamp } from 'firebase/firestore';

/**
 * Email template types
 */
export type EmailTemplateType = 'application-approved' | 'final-steps' | 'request-income';

/**
 * Formats a Firestore Timestamp to a readable date string
 */
function formatDate(timestamp: Timestamp | Date | null): string {
    if (!timestamp) return '[Date Not Set]';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Replaces placeholders in email template with actual applicant data
 * Placeholders: [Applicant], [Apartment #], [Move-In Date], [Move-In Balance]
 */
export function replacePlaceholders(
    emailHtml: string,
    applicant: Applicant | null
): string {
    if (!applicant) return emailHtml;

    let result = emailHtml;

    // Replace [Applicant] with applicant name
    result = result.replace(/\[Applicant\]/g, applicant['1_Profile']?.name || '[Applicant]');

    // Replace [APARTMENT#] or [Apartment #] with unit number
    result = result.replace(/\[APARTMENT#\]/g, applicant['1_Profile']?.unit || '[Apartment #]');
    result = result.replace(/\[Apartment #\]/g, applicant['1_Profile']?.unit || '[Apartment #]');

    // Replace [Move-In Date] with formatted move-in date
    const moveInDate = formatDate(applicant['1_Profile']?.moveInDate);
    result = result.replace(/\[Move-In Date\]/g, moveInDate);

    // Note: [Move-In Balance] is left as-is since we don't have that data
    // Agents will need to manually fill this in

    return result;
}
