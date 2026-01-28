# Scheduler Data Migration

This directory contains the script to migrate scheduler data from the old Firebase project (`ips-ux-scheduler`) to the new main project (`b85-leasing-tool`).

## Prerequisites

Before running the migration, you need to:

### 1. Update Firebase Security Rules (TEMPORARILY)

You need to temporarily open up read/write permissions on both Firebase projects during migration.

**On OLD project (ips-ux-scheduler):**
- Go to Firebase Console: https://console.firebase.google.com/project/ips-ux-scheduler
- Navigate to Firestore Database → Rules
- Temporarily set rules to:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEMPORARY - for migration only
    }
  }
}
```
- Click "Publish"

**On NEW project (b85-leasing-tool):**
- Go to Firebase Console: https://console.firebase.google.com/project/b85-leasing-tool
- Navigate to Firestore Database → Rules
- Temporarily set rules to:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEMPORARY - for migration only
    }
  }
}
```
- Click "Publish"

### 2. Verify Environment Variables

Make sure `.env.local` contains all required variables:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Running the Migration

```bash
npx tsx src/scripts/migrateSchedulerData.ts
```

The script will:
1. Connect to both Firebase projects
2. Read all documents from `reservations`, `items`, and `staff` collections in the old project
3. Write each document to the new project with the same document IDs
4. Display progress and a summary

## After Migration

### 1. Verify the Data
- Go to Firebase Console for the new project
- Check that all collections have the expected documents
- Spot-check a few documents to ensure data integrity

### 2. Restore Firebase Security Rules

**IMPORTANT:** After successful migration, restore proper security rules on both projects.

Example production rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Clean Up Old Files

Once migration is verified:
```bash
# Delete the old scheduler config
rm src/firebase/scheduler-config.ts

# Delete the old standalone app directory
rm -rf integrate_then_remove_this_directory/
```

### 4. Update Code References

The new integrated scheduler should now use the main Firebase config (`src/firebase/config.ts`) instead of the old separate config.

All hooks and services have already been updated to use the main database instance.

## Troubleshooting

### "Missing or insufficient permissions" Error

This means the Firebase rules are blocking access. Make sure you've temporarily opened up the rules as described in step 1.

### "Project not found" Error

Verify that the Firebase configuration in `.env.local` is correct and matches your Firebase project settings.

### Partial Migration

If the migration fails partway through, the script can be safely re-run. It will overwrite existing documents with the same IDs, so there's no risk of duplicates.

## Collections Being Migrated

- **reservations**: All amenity reservations (Guest Suite, Sky Lounge, Gear Shed)
- **items**: Gear shed inventory items
- **staff**: Staff member records for assignment tracking
