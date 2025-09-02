/**
 * Firebase Configuration and Initialization
 * BiteBase Intelligence Firebase Setup
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
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
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// Initialize services
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);
functions = getFunctions(app, 'us-central1');

// Initialize Analytics (only in browser)
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const isEmulatorConnected = {
    auth: false,
    firestore: false,
    storage: false,
    functions: false,
  };

  // Auth emulator
  if (!isEmulatorConnected.auth) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      isEmulatorConnected.auth = true;
      console.log('Connected to Auth emulator');
    } catch (error) {
      console.warn('Failed to connect to Auth emulator:', error);
    }
  }

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

  // Storage emulator
  if (!isEmulatorConnected.storage) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      isEmulatorConnected.storage = true;
      console.log('Connected to Storage emulator');
    } catch (error) {
      console.warn('Failed to connect to Storage emulator:', error);
    }
  }

  // Functions emulator
  if (!isEmulatorConnected.functions) {
    try {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      isEmulatorConnected.functions = true;
      console.log('Connected to Functions emulator');
    } catch (error) {
      console.warn('Failed to connect to Functions emulator:', error);
    }
  }
}

// Export Firebase services
export { app, auth, db, storage, functions, analytics };

// Export Firebase types for TypeScript
export type { 
  User,
  UserCredential,
  AuthError,
} from 'firebase/auth';

export type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore';

export type {
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
} from 'firebase/storage';

export type {
  HttpsCallable,
  HttpsCallableResult,
} from 'firebase/functions';

// Utility functions
export const isEmulator = process.env.NODE_ENV === 'development';

export const getErrorMessage = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
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
