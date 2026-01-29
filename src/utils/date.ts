import { Timestamp } from 'firebase/firestore';

/**
 * Converts a Firestore Timestamp (stored at midnight UTC) to a local Date
 * that preserves the intended date regardless of the user's timezone.
 *
 * This is necessary because dates are stored at midnight UTC (e.g., Jan 12th 00:00:00 UTC).
 * When converted to local time in timezones west of UTC (like PST/PDT), this would show
 * as the previous day (Jan 11th). This function extracts the UTC date components
 * and creates a new Date that will display correctly in the local timezone.
 */
export const timestampToLocalDate = (timestamp: Timestamp | Date | string): Date => {
  let date: Date;

  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  // Extract the UTC date components (the "true" date that was intended)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Create a new date using local timezone but with the UTC date values
  // This ensures "Jan 12th UTC" displays as "Jan 12th" regardless of local timezone
  return new Date(year, month, day);
};
