/**
 * Data Migration Page
 * Browser-based tool to migrate scheduler data and seed initial data
 */

import { useState } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { schedulerDb } from '../firebase/scheduler-config';
import { db } from '../firebase/config';
import { Button } from '../components/ui';
import { createEmailTemplate } from '../firebase/firestore';
import toast from 'react-hot-toast';

// Import raw HTML templates for seeding
import requestIncomeEmail from '../content/request-income.html?raw';
import applicationApprovedEmail from '../content/application-approved-email.html?raw';
import finalStepsEmail from '../content/final-steps-email.html?raw';
import transferRequestEmail from '../content/transfer-request-form.html?raw';
import transferIncomeEmail from '../content/transfer-income-request.html?raw';
import transferInfoEmail from '../content/transfer-info-update.html?raw';

const SEED_TEMPLATES = [
  { title: 'Request Income', buttonText: 'REQ INC', htmlContent: requestIncomeEmail, linkedSubStepIds: ['1a'] },
  { title: 'Application Approved', buttonText: 'APP APRVD', htmlContent: applicationApprovedEmail, linkedSubStepIds: ['2d'] },
  { title: 'Final Steps', buttonText: 'FINAL STEPS', htmlContent: finalStepsEmail, linkedSubStepIds: ['4c', 't5c'] },
  { title: 'Transfer Request Form', buttonText: 'XFER REQ', htmlContent: transferRequestEmail, linkedSubStepIds: ['t1a'] },
  { title: 'Transfer Income Request', buttonText: 'XFER INC', htmlContent: transferIncomeEmail, linkedSubStepIds: ['t3a'] },
  { title: 'Transfer Info Update', buttonText: 'XFER INFO', htmlContent: transferInfoEmail, linkedSubStepIds: ['t4a'] },
];

interface MigrationResult {
  collectionName: string;
  documentsCount: number;
  success: boolean;
  error?: string;
}

export const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const migrateCollection = async (collectionName: string): Promise<MigrationResult> => {
    setCurrentStep(`Reading ${collectionName} from old project...`);

    try {
      const oldCollectionRef = collection(schedulerDb, collectionName);
      const snapshot = await getDocs(oldCollectionRef);
      const docCount = snapshot.docs.length;
      setCurrentStep(`Found ${docCount} ${collectionName} documents. Writing to new project...`);

      if (docCount === 0) {
        return { collectionName, documentsCount: 0, success: true };
      }

      let migratedCount = 0;
      for (const docSnapshot of snapshot.docs) {
        const newDocRef = doc(db, collectionName, docSnapshot.id);
        await setDoc(newDocRef, docSnapshot.data());
        migratedCount++;
        if (migratedCount % 5 === 0) {
          setCurrentStep(`Migrating ${collectionName}: ${migratedCount}/${docCount} documents...`);
        }
      }

      return { collectionName, documentsCount: migratedCount, success: true };
    } catch (error: any) {
      console.error(`Error migrating ${collectionName}:`, error);
      return { collectionName, documentsCount: 0, success: false, error: error.message };
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResults([]);
    setCurrentStep('Starting migration...');

    const collectionsToMigrate = ['reservations', 'items', 'staff'];
    const migrationResults: MigrationResult[] = [];

    try {
      for (const name of collectionsToMigrate) {
        const result = await migrateCollection(name);
        migrationResults.push(result);
      }

      setResults(migrationResults);
      setCurrentStep('');

      const successCount = migrationResults.filter((r) => r.success).length;
      const totalDocs = migrationResults.reduce((sum, r) => sum + r.documentsCount, 0);

      if (successCount === collectionsToMigrate.length) {
        toast.success(`Migration complete! ${totalDocs} documents migrated.`);
      } else {
        toast.error('Migration completed with errors. Check results below.');
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(`Migration failed: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSeedTemplates = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      let count = 0;
      for (const template of SEED_TEMPLATES) {
        await createEmailTemplate(template);
        count++;
      }
      setSeedResult(`✓ Successfully seeded ${count} email templates`);
      toast.success(`Seeded ${count} email templates!`);
    } catch (error: any) {
      console.error('Seed error:', error);
      setSeedResult(`✗ Error: ${error.message}`);
      toast.error(`Failed to seed templates: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-neuro-bg p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neuro-primary mb-2">
            Data Migration & Seeding
          </h1>
          <p className="text-neuro-secondary">
            Migrate data from old projects and seed initial data into the current project.
          </p>
        </div>

        {/* Seed Email Templates Card */}
        <div className="bg-neuro-element rounded-neuro-lg shadow-neuro-flat p-6 mb-6">
          <h2 className="text-xl font-semibold text-neuro-primary mb-4">📧 Seed Email Templates</h2>
          <p className="text-neuro-secondary mb-4">
            Populate Firestore with the {SEED_TEMPLATES.length} existing email templates
            (Application Approved, Final Steps, Request Income, Transfer Request, etc.).
          </p>
          <p className="text-sm text-warning mb-4 font-medium">
            ⚠️ Running this multiple times will create duplicate templates. Only run once.
          </p>

          <Button
            onClick={handleSeedTemplates}
            variant="primary"
            isLoading={isSeeding}
            disabled={isSeeding}
          >
            {isSeeding ? 'Seeding...' : 'Seed Email Templates'}
          </Button>

          {seedResult && (
            <div className={`mt-4 p-4 rounded-neuro-md border-l-4 ${
              seedResult.startsWith('✓')
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <p className="font-medium">{seedResult}</p>
            </div>
          )}
        </div>

        {/* Warning Card */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-neuro-lg shadow-neuro-flat p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">⚠️ Scheduler Migration</h2>
          <p className="text-yellow-700 mb-2">
            This tool requires <strong>temporarily opening</strong> the Firestore rules on the old scheduler project.
          </p>
          <p className="text-sm text-yellow-600">
            After migration, remember to restore the security rules on both projects!
          </p>
        </div>

        {/* Migration Card */}
        <div className="bg-neuro-element rounded-neuro-lg shadow-neuro-flat p-6 mb-6">
          <h2 className="text-xl font-semibold text-neuro-primary mb-4">Run Migration</h2>

          <div className="mb-4">
            <p className="text-neuro-secondary mb-2">Collections to migrate:</p>
            <ul className="list-disc list-inside text-neuro-secondary space-y-1 ml-4">
              <li>reservations (all amenity bookings)</li>
              <li>items (gear shed inventory)</li>
              <li>staff (staff member records)</li>
            </ul>
          </div>

          <Button
            onClick={handleMigrate}
            variant="primary"
            isLoading={isMigrating}
            disabled={isMigrating}
          >
            {isMigrating ? 'Migrating...' : 'Start Migration'}
          </Button>

          {currentStep && (
            <div className="mt-4 p-4 bg-neuro-blue/10 rounded-neuro-md border-l-4 border-neuro-blue">
              <p className="text-neuro-primary font-medium">{currentStep}</p>
            </div>
          )}
        </div>

        {/* Results Card */}
        {results.length > 0 && (
          <div className="bg-neuro-element rounded-neuro-lg shadow-neuro-flat p-6">
            <h2 className="text-xl font-semibold text-neuro-primary mb-4">Migration Results</h2>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.collectionName}
                  className={`p-4 rounded-neuro-md ${
                    result.success
                      ? 'bg-green-50 border-l-4 border-green-500'
                      : 'bg-red-50 border-l-4 border-red-500'
                  }`}
                >
                  <p className="font-semibold text-neuro-primary">
                    {result.success ? '✓' : '✗'} {result.collectionName}
                  </p>
                  <p className="text-sm text-neuro-secondary">
                    {result.documentsCount} documents migrated
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
