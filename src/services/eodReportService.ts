/**
 * EOD Report Service
 * Handles CRUD operations for End of Day reports in Firestore
 * Persistent fields: occupancy, fourWeekTrend, sixWeekTrend
 * Daily fields: traffic, leases, competition, reasonsNotLeasing, pendingApplications, finalAccountStatements, cancellationReason
 */

import { db } from '../firebase/config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { startOfDay, isAfter } from 'date-fns';

export interface EODReportData {
    // Persistent fields (carry over day-to-day)
    occupancy: string;
    fourWeekTrend: string;
    sixWeekTrend: string;

    // Daily fields (reset each day)
    traffic: string;
    leases: string;
    competition: string;
    reasonsNotLeasing: string;
    pendingApplications: string;
    finalAccountStatements: string;
    cancellationReason: string;

    // Metadata
    lastSubmitted: Timestamp;
}

const EOD_COLLECTION = 'eodReports';
const EOD_DOC_ID = 'current'; // Single document for current EOD data

/**
 * Get the current EOD report data
 * Automatically resets daily fields if it's a new day
 */
export async function getEODReport(): Promise<EODReportData> {
    try {
        const eodRef = doc(db, EOD_COLLECTION, EOD_DOC_ID);
        const eodSnap = await getDoc(eodRef);

        if (eodSnap.exists()) {
            const data = eodSnap.data() as EODReportData;

            // Check if we need to reset daily fields (new day)
            const lastSubmittedDate = data.lastSubmitted.toDate();
            const today = startOfDay(new Date());
            const lastSubmittedDay = startOfDay(lastSubmittedDate);

            if (isAfter(today, lastSubmittedDay)) {
                // It's a new day, reset daily fields but keep persistent ones
                return {
                    // Keep persistent fields
                    occupancy: data.occupancy,
                    fourWeekTrend: data.fourWeekTrend,
                    sixWeekTrend: data.sixWeekTrend,

                    // Reset daily fields with auto-populated values
                    traffic: '0',
                    leases: '0',
                    competition: 'N/A',
                    reasonsNotLeasing: 'N/A',
                    pendingApplications: 'N/A',
                    finalAccountStatements: 'N/A',
                    cancellationReason: 'N/A',

                    lastSubmitted: data.lastSubmitted,
                };
            }

            return data;
        }

        // Return empty data if no document exists
        return getEmptyEODReport();
    } catch (error) {
        console.error('Error fetching EOD report:', error);
        throw error;
    }
}

/**
 * Save EOD report data
 */
export async function saveEODReport(data: Omit<EODReportData, 'lastSubmitted'>): Promise<void> {
    try {
        const eodRef = doc(db, EOD_COLLECTION, EOD_DOC_ID);

        const reportData: EODReportData = {
            ...data,
            lastSubmitted: Timestamp.now(),
        };

        await setDoc(eodRef, reportData);
    } catch (error) {
        console.error('Error saving EOD report:', error);
        throw error;
    }
}

/**
 * Get empty EOD report structure
 */
function getEmptyEODReport(): EODReportData {
    return {
        occupancy: '',
        fourWeekTrend: '',
        sixWeekTrend: '',
        traffic: '0',
        leases: '0',
        competition: 'N/A',
        reasonsNotLeasing: 'N/A',
        pendingApplications: 'N/A',
        finalAccountStatements: 'N/A',
        cancellationReason: 'N/A',
        lastSubmitted: Timestamp.now(),
    };
}
