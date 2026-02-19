/**
 * Outlook Calendar Deeplink Service
 * Generates URLs to open Outlook Web with pre-filled calendar event data
 *
 * Uses the Outlook deeplink API to seed new calendar events without
 * requiring email invitations - users are already logged into Outlook Web
 *
 * @see https://gist.github.com/miwebguy/2e805e343e0d434f06f2194b92b925d8
 */

import type { Reservation, ResourceType } from '../../types/scheduler';

// Greystar Outlook Cloud calendar deeplink
// Format: https://outlook.cloud.microsoft/calendar/{email}/deeplink/compose
const OUTLOOK_EMAIL = 'beacon85@greystar.com';
const OUTLOOK_BASE_URL = `https://outlook.cloud.microsoft/calendar/${OUTLOOK_EMAIL}/deeplink/compose`;

/**
 * Resource type display names for calendar events
 */
const RESOURCE_DISPLAY_NAMES: Record<ResourceType, string> = {
  GUEST_SUITE: 'Guest Suite',
  SKY_LOUNGE: 'Sky Lounge',
  GEAR_SHED: 'Gear Shed',
};

/**
 * Location names for each resource type
 */
const RESOURCE_LOCATIONS: Record<ResourceType, string> = {
  GUEST_SUITE: 'Guest Suite - Building Amenity',
  SKY_LOUNGE: 'Sky Lounge - Rooftop',
  GEAR_SHED: 'Gear Shed - Ground Floor',
};

interface OutlookCalendarParams {
  subject: string;
  body: string;
  location: string;
  startdt: string;  // ISO format: YYYY-MM-DDTHH:MM:SS
  enddt: string;    // ISO format: YYYY-MM-DDTHH:MM:SS
  allday?: boolean;
}

/**
 * Formats a date string for Outlook deeplink (removes timezone info)
 * Outlook expects: YYYY-MM-DDTHH:MM:SS (local time assumed)
 */
function formatDateForOutlook(isoString: string): string {
  // Remove any 'Z' or timezone offset, keep just the datetime portion
  return isoString.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '').slice(0, 19);
}

/**
 * Generates the calendar event subject line
 */
function generateSubject(reservation: Reservation): string {
  const resourceName = RESOURCE_DISPLAY_NAMES[reservation.resource_type];
  return `${resourceName} Reservation - Unit ${reservation.rented_to}`;
}

/**
 * Generates the calendar event body/description
 */
function generateBody(reservation: Reservation): string {
  const lines: string[] = [
    `Reservation Details`,
    `-------------------`,
    `Unit: ${reservation.rented_to}`,
    `Resource: ${reservation.item}`,
    `Type: ${RESOURCE_DISPLAY_NAMES[reservation.resource_type]}`,
    ``,
    `Scheduled by: ${reservation.scheduled_by}`,
  ];

  if (reservation.total_cost > 0) {
    lines.push(`Total Cost: $${reservation.total_cost.toFixed(2)}`);
  }

  if (reservation.rental_notes) {
    lines.push(``, `Notes: ${reservation.rental_notes}`);
  }

  lines.push(``, `---`, `Created from Property Master Book`);

  return lines.join('\n');
}

/**
 * Builds the Outlook deeplink URL with all parameters
 */
function buildOutlookUrl(params: OutlookCalendarParams): string {
  const searchParams = new URLSearchParams();

  // Required parameters for the deeplink to work
  searchParams.set('path', '/calendar/action/compose');
  searchParams.set('rru', 'addevent');

  // Event details
  searchParams.set('subject', params.subject);
  searchParams.set('body', params.body);
  searchParams.set('location', params.location);
  searchParams.set('startdt', params.startdt);
  searchParams.set('enddt', params.enddt);

  if (params.allday) {
    searchParams.set('allday', 'true');
  }

  return `${OUTLOOK_BASE_URL}?${searchParams.toString()}`;
}

/**
 * Generates an Outlook Web deeplink URL for a reservation
 * Opens Outlook's new event form with all details pre-filled
 *
 * @param reservation - The reservation to create a calendar event for
 * @returns URL string to open Outlook Web calendar compose
 */
export function generateOutlookDeeplink(reservation: Reservation): string {
  const params: OutlookCalendarParams = {
    subject: generateSubject(reservation),
    body: generateBody(reservation),
    location: RESOURCE_LOCATIONS[reservation.resource_type],
    startdt: formatDateForOutlook(reservation.start_time),
    enddt: formatDateForOutlook(reservation.end_time),
  };

  return buildOutlookUrl(params);
}

/**
 * Opens Outlook Web calendar compose in a new tab with reservation details
 *
 * @param reservation - The reservation to add to calendar
 */
export function openOutlookCalendar(reservation: Reservation): void {
  const url = generateOutlookDeeplink(reservation);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Generates deeplink from form data (before reservation is saved)
 * Useful for preview or immediate calendar addition
 */
export function generateOutlookDeeplinkFromFormData(
  formData: {
    rented_to: string;
    resource_type: ResourceType;
    start_time: string;
    end_time: string;
    item?: string;
    items?: string[];
    rental_notes?: string;
  },
  scheduledBy: string
): string {
  // Build a minimal reservation-like object
  const item = formData.resource_type === 'GEAR_SHED'
    ? (formData.items?.join(', ') || '')
    : (formData.item || RESOURCE_DISPLAY_NAMES[formData.resource_type]);

  const params: OutlookCalendarParams = {
    subject: `${RESOURCE_DISPLAY_NAMES[formData.resource_type]} Reservation - Unit ${formData.rented_to}`,
    body: [
      `Reservation Details`,
      `-------------------`,
      `Unit: ${formData.rented_to}`,
      `Resource: ${item}`,
      `Type: ${RESOURCE_DISPLAY_NAMES[formData.resource_type]}`,
      ``,
      `Scheduled by: ${scheduledBy}`,
      formData.rental_notes ? `\nNotes: ${formData.rental_notes}` : '',
      ``,
      `---`,
      `Created from Property Master Book`,
    ].filter(Boolean).join('\n'),
    location: RESOURCE_LOCATIONS[formData.resource_type],
    startdt: formatDateForOutlook(formData.start_time),
    enddt: formatDateForOutlook(formData.end_time),
  };

  return buildOutlookUrl(params);
}
