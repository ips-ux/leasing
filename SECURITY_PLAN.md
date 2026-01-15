# Security Improvement Plan

Since your application is a client-side Single Page Application (SPA) hosted on GitHub Pages, your Firebase configuration (API Key, Project ID, etc.) is publicly visible in the browser's source code. **This is normal for Firebase**, but it means you must rely on server-side security rules and restrictions to protect your data.

## 1. API Key Restrictions (Critical)
You must restrict your Firebase API Key in the Google Cloud Console to prevent unauthorized use on other domains.

**Action Items:**
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select your Firebase project.
3. Find the "Browser key" (or the key matching your `VITE_FIREBASE_API_KEY`).
4. Click the **Edit** (pencil) icon.
5. Under **Application restrictions**, select **HTTP referrers (web sites)**.
6. Add the following entries:
   - `https://ips-ux.github.io/*`
   - `http://localhost:5173/*` (for local development)
   - `https://<your-project-id>.firebaseapp.com/*` (optional, if you use Firebase Hosting)
7. Under **API restrictions**, select **Restrict key** and select only the APIs you use:
   - Identity Toolkit API (Authentication)
   - Cloud Firestore API
   - Firebase Installations API
8. Click **Save**.

## 2. Firestore Security Rules (Critical)
You need to enforce strict rules so that only authenticated (and authorized) users can read/write data.

**Current Status:** You likely have "Test Mode" rules (allow all) or default locked rules.
**Action:** Update your Firestore Rules in the Firebase Console.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user matches the requested userId
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Applicants: Only authenticated users can read/write
    // (You might want to restrict this further if you have roles)
    match /applicants/{applicantId} {
      allow read, write: if isAuthenticated();
      
      // Sub-collections
      match /1_Profile/{docId} { allow read, write: if isAuthenticated(); }
      match /2_Income/{docId} { allow read, write: if isAuthenticated(); }
      // ... add other sub-collections as needed
    }

    // Inquiries: Only authenticated users
    match /inquiries/{inquiryId} {
      allow read, write: if isAuthenticated();
    }

    // Users: Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## 3. Authentication Settings
Since you want to manually create accounts, you should disable public sign-ups if possible, or strictly control it via rules.

**Action Items:**
1. Go to the **Firebase Console** > **Authentication** > **Settings**.
2. Ensure **"Email/Password"** provider is enabled.
3. (Optional) If you want to strictly prevent anyone from signing up even via the API, you can disable "Email/Password" sign-up in the code (which we did) and use **Firebase Admin SDK** or the Console to create users.
   - *Note:* The "Email/Password" provider in Firebase Console generally allows `createUserWithEmailAndPassword` if the API key is valid. To truly block it, you might need to use **Identity Platform** (GCIP) blocking functions, but that's advanced.
   - **Simpler approach:** Since we removed the UI for sign-up, only someone with technical skills who finds your API key could try to create an account. If they do, they still won't have access to data if you implement **Role-Based Access Control (RBAC)** in your security rules (e.g., `allow read: if request.auth.token.admin == true`).

## 4. GitHub Repository Security
Since you pushed to a public repository (`ips-ux/leasing`):
- **Code Visibility:** Your code is public. Ensure no hardcoded secrets (AWS keys, private keys, service account JSONs) are in the code.
- **Environment Variables:** We verified `src/firebase/config.ts` uses `import.meta.env`, which is good.
- **Repo Settings:** If this tool contains proprietary logic, consider making the GitHub repository **Private**. GitHub Pages can still publish from a private repo (requires Pro plan) or you can use a different host (like Vercel or Netlify) connected to a private repo.

## 5. Data Backups
- Enable **Google Cloud Firestore backups** to protect against accidental data loss or malicious deletion.

## 6. Login Security Enhancements (Implemented)
To prevent brute-force attacks and improve security posture on the login page:
- **Client-Side Rate Limiting**: Implemented a lockout mechanism (5 failed attempts = 60-second lockout) using local storage.
- **Generic Error Messages**: All login failures return "Invalid email or password" to prevent user enumeration.
- **Input Validation**: Strict email format validation before request submission.
- **Content Security Policy (CSP)**: Added strict CSP headers in `index.html` to mitigate XSS attacks.
- **Autocomplete Attributes**: Correctly configured to assist password managers and prevent browser confusion.

## Summary of Immediate Next Steps
1. **Apply API Key Restrictions** in Google Cloud Console.
2. **Deploy Firestore Rules** via Firebase Console.
3. **Verify no secrets** are in the git history (we did a quick check, but be vigilant).
