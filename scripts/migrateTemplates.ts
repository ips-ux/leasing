/**
 * Migration Script: Populate Firestore with Email Templates
 * 
 * This script migrates the existing HTML email templates from static files
 * to Firestore, making them editable via the Template Editor UI.
 * 
 * Run this script once to initialize the templates in Firestore:
 * node scripts/migrateTemplates.js
 */

import { db } from '../src/firebase/config';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import requestIncomeEmail from '../src/content/request-income.html?raw';
import applicationApprovedEmail from '../src/content/application-approved-email.html?raw';
import finalStepsEmail from '../src/content/final-steps-email.html?raw';

const templates = [
    {
        id: 'request-income',
        name: 'Request Income Email',
        content: requestIncomeEmail,
    },
    {
        id: 'application-approved',
        name: 'Application Approved Email',
        content: applicationApprovedEmail,
    },
    {
        id: 'final-steps',
        name: 'Final Steps Email',
        content: finalStepsEmail,
    },
];

async function migrateTemplates() {
    console.log('Starting template migration...');

    for (const template of templates) {
        try {
            const templateRef = doc(db, 'emailTemplates', template.id);
            await setDoc(templateRef, {
                id: template.id,
                name: template.name,
                content: template.content,
                lastModified: Timestamp.now(),
                modifiedBy: 'system',
            });
            console.log(`✓ Migrated template: ${template.name}`);
        } catch (error) {
            console.error(`✗ Failed to migrate template: ${template.name}`, error);
        }
    }

    console.log('Template migration complete!');
}

migrateTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
