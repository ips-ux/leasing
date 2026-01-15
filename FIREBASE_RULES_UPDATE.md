# ACTION REQUIRED: Update Firestore Security Rules

To resolve the "Missing or insufficient permissions" error, you must manually update your Firestore Security Rules in the Firebase Console.

1.  Go to the **Firebase Console** (https://console.firebase.google.com/).
2.  Select your project.
3.  Navigate to **Firestore Database** > **Rules**.
4.  **Replace** the existing rules with the following code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base check: User must be authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Applicants Collection
    match /applicants/{applicantId} {
      allow read, write: if isAuthenticated();
      
      // Allow access to all subcollections
      match /{document=**} {
        allow read, write: if isAuthenticated();
      }
    }

    // Inquiries Collection
    match /inquiries/{inquiryId} {
      allow read, write: if isAuthenticated();
    }

    // Users Collection (for user profiles)
    match /users/{userId} {
      // Users can read all profiles (needed for dropdowns), but only write their own
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5.  Click **Publish**.

Once published, the "Missing or insufficient permissions" error will disappear, and the agent dropdown will populate correctly.
