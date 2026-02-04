/**
 * Outlook Email Deeplink Service
 * Generates URLs to open Outlook Web with pre-filled email data
 *
 * Uses the Outlook deeplink API to seed new email messages without
 * requiring manual copy-paste - users are already logged into Outlook Web
 *
 * @see https://gist.github.com/miwebguy/2e805e343e0d434f06f2194b92b925d8
 */

import type { Applicant } from '../../types/applicant';
import type { Timestamp } from 'firebase/firestore';

// Greystar Outlook Cloud email deeplink
// Format: https://outlook.cloud.microsoft/mail/{email}/deeplink/compose
const OUTLOOK_EMAIL = 'beacon85@greystar.com';
const OUTLOOK_BASE_URL = `https://outlook.cloud.microsoft/mail/${OUTLOOK_EMAIL}/deeplink/compose`;

/**
 * Email template types
 */
export type EmailTemplateType = 'application-approved' | 'final-steps' | 'request-income';

/**
 * Subject lines for each email template
 */
const EMAIL_SUBJECTS: Record<EmailTemplateType, string> = {
    'application-approved': "You're Approved! Here's what to do next...",
    'final-steps': 'Action Req: Final Steps Before Your Move!',
    'request-income': 'Income Verification Documents Required',
};

interface OutlookEmailParams {
    subject: string;
    body: string;
    to?: string;
}

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

/**
 * Converts HTML to plain text for email body
 * Outlook deeplink accepts HTML in the body parameter
 */
function prepareEmailBody(html: string): string {
    // Outlook deeplink can handle HTML, but we need to ensure proper encoding
    // The URLSearchParams will handle the encoding
    return html;
}

/**
 * Builds the Outlook deeplink URL with all parameters
 */
function buildOutlookEmailUrl(params: OutlookEmailParams): string {
    const searchParams = new URLSearchParams();

    // Required parameters for the deeplink to work
    searchParams.set('path', '/mail/action/compose');

    // Email details
    searchParams.set('subject', params.subject);
    searchParams.set('body', params.body);

    if (params.to) {
        searchParams.set('to', params.to);
    }

    return `${OUTLOOK_BASE_URL}?${searchParams.toString()}`;
}

/**
 * Generates an Outlook Web deeplink URL for an email template
 * Opens Outlook's new email form with all details pre-filled
 *
 * @param emailHtml - The HTML template content
 * @param emailType - The type of email template
 * @param applicant - The applicant data for placeholder replacement
 * @returns URL string to open Outlook Web email compose
 */
export function generateOutlookEmailDeeplink(
    emailHtml: string,
    emailType: EmailTemplateType,
    applicant: Applicant | null
): string {
    // Replace placeholders with actual data
    const populatedHtml = replacePlaceholders(emailHtml, applicant);

    const params: OutlookEmailParams = {
        subject: EMAIL_SUBJECTS[emailType],
        body: prepareEmailBody(populatedHtml),
    };

    return buildOutlookEmailUrl(params);
}

/**
 * Opens Outlook Web email compose in a new tab with template details
 *
 * @param emailHtml - The HTML template content
 * @param emailType - The type of email template
 * @param applicant - The applicant data for placeholder replacement
 */
export function openOutlookEmail(
    emailHtml: string,
    emailType: EmailTemplateType,
    applicant: Applicant | null
): void {
    const url = generateOutlookEmailDeeplink(emailHtml, emailType, applicant);
    window.open(url, '_blank', 'noopener,noreferrer');
}
