/**
 * Data Migration Page
 * Browser-based tool to migrate scheduler data from old Firebase project to new one
 * TEMPORARY: Uses open Firebase rules (no auth required)
 */

import { useState } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { schedulerDb } from '../firebase/scheduler-config';
import { db } from '../firebase/config';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

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

  const migrateCollection = async (collectionName: string): Promise<MigrationResult> => {
    setCurrentStep(`Reading ${collectionName} from old project...`);

    try {
      // Read all documents from old collection
      const oldCollectionRef = collection(schedulerDb, collectionName);
      const snapshot = await getDocs(oldCollectionRef);

      const docCount = snapshot.docs.length;
      setCurrentStep(`Found ${docCount} ${collectionName} documents. Writing to new project...`);

      if (docCount === 0) {
        return {
          collectionName,
          documentsCount: 0,
          success: true,
        };
      }

      // Write each document to new collection with same ID
      let migratedCount = 0;
      for (const docSnapshot of snapshot.docs) {
        const docId = docSnapshot.id;
        const docData = docSnapshot.data();

        // Write to new DB with same document ID
        const newDocRef = doc(db, collectionName, docId);
        await setDoc(newDocRef, docData);

        migratedCount++;
        if (migratedCount % 5 === 0) {
          setCurrentStep(
            `Migrating ${collectionName}: ${migratedCount}/${docCount} documents...`
          );
        }
      }

      return {
        collectionName,
        documentsCount: migratedCount,
        success: true,
      };
    } catch (error: any) {
      console.error(`Error migrating ${collectionName}:`, error);
      return {
        collectionName,
        documentsCount: 0,
        success: false,
        error: error.message,
      };
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResults([]);
    setCurrentStep('Starting migration...');

    const collectionsToMigrate = ['reservations', 'items', 'staff'];
    const migrationResults: MigrationResult[] = [];

    try {
      for (const collectionName of collectionsToMigrate) {
        const result = await migrateCollection(collectionName);
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

  return (
    <div className="min-h-screen bg-neuro-bg p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neuro-primary mb-2">
            Scheduler Data Migration
          </h1>
          <p className="text-neuro-secondary">
            Migrate data from old scheduler project (ips-ux-scheduler) to the new main project
            (b85-leasing-tool)
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-neuro-lg shadow-neuro-flat p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">⚠️ Important</h2>
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

          <div className="mb-4">
            <p className="text-sm text-neuro-accent">
              <strong>Note:</strong> Documents will be copied with the same IDs. This operation
              is safe to run multiple times.
            </p>
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
                  <div className="flex items-center justify-between">
                    <div>
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
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-neuro-mint/20 rounded-neuro-md">
              <h3 className="font-semibold text-neuro-primary mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside text-neuro-secondary space-y-1 ml-2">
                <li><strong className="text-red-600">RESTORE SECURITY RULES</strong> on both Firebase projects</li>
                <li>Verify data in Firebase Console for b85-leasing-tool project</li>
                <li>Test the scheduler functionality with migrated data</li>
                <li>Delete src/firebase/scheduler-config.ts file</li>
                <li>Delete integrate_then_remove_this_directory/ folder</li>
                <li>Remove this migration page from the app</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
