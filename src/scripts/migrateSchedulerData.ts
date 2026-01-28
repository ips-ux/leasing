/**
 * Data Migration Script
 * Migrates scheduler data from old Firebase project (ips-ux-scheduler) to new project
 *
 * Usage:
 *   npx tsx src/scripts/migrateSchedulerData.ts
 *
 * Collections to migrate:
 *   - reservations
 *   - items
 *   - staff
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';

// Load .env.local file manually
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Old scheduler Firebase config
const oldConfig = {
  apiKey: "AIzaSyDjaqIfSrorLTCLUQQjEAt3lkYyyo6h8dw",
  authDomain: "ips-ux-scheduler.firebaseapp.com",
  projectId: "ips-ux-scheduler",
  storageBucket: "ips-ux-scheduler.firebasestorage.app",
  messagingSenderId: "24939687104",
  appId: "1:24939687104:web:d020687cf7cb9fd7271125",
  measurementId: "G-4KBZ1MJGLK"
};

// New main project Firebase config (from .env.local)
const newConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
};

// Initialize both Firebase apps
const oldApp = initializeApp(oldConfig, 'oldSchedulerApp');
const newApp = initializeApp(newConfig, 'newMainApp');

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

interface MigrationResult {
  collectionName: string;
  documentsCount: number;
  success: boolean;
  error?: string;
}

/**
 * Migrate a single collection from old DB to new DB
 */
async function migrateCollection(collectionName: string): Promise<MigrationResult> {
  console.log(`\nMigrating collection: ${collectionName}`);

  try {
    // Read all documents from old collection
    const oldCollectionRef = collection(oldDb, collectionName);
    const snapshot = await getDocs(oldCollectionRef);

    console.log(`  Found ${snapshot.docs.length} documents to migrate`);

    if (snapshot.docs.length === 0) {
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
      const newDocRef = doc(newDb, collectionName, docId);
      await setDoc(newDocRef, docData);

      migratedCount++;
      if (migratedCount % 10 === 0) {
        console.log(`  Migrated ${migratedCount}/${snapshot.docs.length} documents`);
      }
    }

    console.log(`  ✓ Successfully migrated ${migratedCount} documents`);

    return {
      collectionName,
      documentsCount: migratedCount,
      success: true,
    };
  } catch (error: any) {
    console.error(`  ✗ Error migrating ${collectionName}:`, error.message);
    return {
      collectionName,
      documentsCount: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main migration function
 */
async function migrateAllData() {
  console.log('=================================================');
  console.log('Scheduler Data Migration Script');
  console.log('=================================================');
  console.log('Old Project:', oldConfig.projectId);
  console.log('New Project:', newConfig.projectId);
  console.log('=================================================');

  // Validate configuration
  if (!newConfig.apiKey || !newConfig.projectId) {
    console.error('Error: Missing Firebase configuration in .env.local');
    console.error('Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.');
    process.exit(1);
  }

  const collectionsToMigrate = ['reservations', 'items', 'staff'];
  const results: MigrationResult[] = [];

  for (const collectionName of collectionsToMigrate) {
    const result = await migrateCollection(collectionName);
    results.push(result);
  }

  // Print summary
  console.log('\n=================================================');
  console.log('Migration Summary');
  console.log('=================================================');

  let totalDocs = 0;
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result) => {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.collectionName}: ${result.documentsCount} documents`);

    if (result.success) {
      successCount++;
      totalDocs += result.documentsCount;
    } else {
      failureCount++;
      console.log(`  Error: ${result.error}`);
    }
  });

  console.log('=================================================');
  console.log(`Total: ${totalDocs} documents migrated`);
  console.log(`Success: ${successCount}/${collectionsToMigrate.length} collections`);

  if (failureCount > 0) {
    console.log(`Failed: ${failureCount} collections`);
    process.exit(1);
  } else {
    console.log('\n✓ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Firebase Console');
    console.log('2. Delete src/firebase/scheduler-config.ts');
    console.log('3. Delete integrate_then_remove_this_directory/ folder');
    process.exit(0);
  }
}

// Run migration
migrateAllData().catch((error) => {
  console.error('Fatal error during migration:', error);
  process.exit(1);
});
