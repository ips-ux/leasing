import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration for the Scheduler's Firebase project
const schedulerConfig = {
    apiKey: "AIzaSyDjaqIfSrorLTCLUQQjEAt3lkYyyo6h8dw",
    authDomain: "ips-ux-scheduler.firebaseapp.com",
    projectId: "ips-ux-scheduler",
    storageBucket: "ips-ux-scheduler.firebasestorage.app",
    messagingSenderId: "24939687104",
    appId: "1:24939687104:web:d020687cf7cb9fd7271125",
    measurementId: "G-4KBZ1MJGLK"
};

// Initialize the secondary Firebase app
// We give it a name 'schedulerApp' to avoid conflict with the default app
const schedulerApp = initializeApp(schedulerConfig, 'schedulerApp');

export const schedulerDb = getFirestore(schedulerApp);
export const schedulerAuth = getAuth(schedulerApp);
