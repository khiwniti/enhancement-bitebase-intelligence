/**
 * Firebase Configuration for hosting and Firestore only
 * BiteBase Intelligence - Backend functions replaced with Python FastAPI
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// Initialize services (only what we need)
db = getFirestore(app);

// Initialize Analytics (only in browser)
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Connect to emulators in development (only Firestore)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const isEmulatorConnected = {
    firestore: false,
  };

  // Firestore emulator
  if (!isEmulatorConnected.firestore) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      isEmulatorConnected.firestore = true;
      console.log('Connected to Firestore emulator');
    } catch (error) {
      console.warn('Failed to connect to Firestore emulator:', error);
    }
  }
}

// Export Firebase services (limited set)
export { app, db, analytics };

// Export Firebase types for TypeScript
export type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore';

// Utility functions
export const isEmulator = process.env.NODE_ENV === 'development';

export const getErrorMessage = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'not-found':
        return 'The requested resource was not found.';
      case 'unavailable':
        return 'Service is currently unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return error?.message || 'An unexpected error occurred.';
};

// Firebase Data Connect configuration
export const dataConnectConfig = {
  connector: process.env.NEXT_PUBLIC_FIREBASE_DATA_CONNECT_CONNECTOR_ID || 'example',
  service: process.env.NEXT_PUBLIC_FIREBASE_DATA_CONNECT_SERVICE_ID || 'enhancement-bitebase-intelligence',
  location: process.env.NEXT_PUBLIC_FIREBASE_DATA_CONNECT_LOCATION || 'us-central1',
};

// Default export
export default app;
