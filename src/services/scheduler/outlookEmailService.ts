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
 * Placeholders: [Resident], [PROSPECT], [Applicant], [Apartment#], [APT#], [Move-In Date]
 */
export function replacePlaceholders(
    emailHtml: string,
    applicant: Applicant | null
): string {
    if (!applicant) return emailHtml;

    let result = emailHtml;
    const profile = applicant['1_Profile'];
    const fullName = profile?.name || '';
    const firstName = fullName.split(' ')[0] || '[Name]';
    const unit = profile?.unit || '[Apartment #]';

    // Replace Resident/Name placeholders with FIRST NAME
    const namePlaceholders = [/\[Resident\]/g, /\[PROSPECT\]/g, /\[Applicant\]/g];
    namePlaceholders.forEach(regex => {
        result = result.replace(regex, firstName);
    });

    // Replace Apartment placeholders with UNIT NUMBER
    const unitPlaceholders = [/\[APARTMENT#\]/g, /\[Apartment #\]/g, /\[Apartment#\]/g, /\[APT#\]/g];
    unitPlaceholders.forEach(regex => {
        result = result.replace(regex, unit);
    });

    // Replace [Move-In Date] with formatted move-in date
    const moveInDate = formatDate(profile?.moveInDate);
    result = result.replace(/\[Move-In Date\]/g, moveInDate);

    return result;
}
