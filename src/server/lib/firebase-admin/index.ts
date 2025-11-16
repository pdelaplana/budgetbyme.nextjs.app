import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getFunctions } from 'firebase-admin/functions';
import { getStorage } from 'firebase-admin/storage';

async function getServiceAccountCredentials() {
  // Priority 1: Check for environment variables (Vercel deployment)
  if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    console.log(
      '🔄 Firebase Admin: Using credentials from environment variable',
    );
    try {
      return JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
    } catch (error) {
      console.error(
        '❌ Firebase Admin: Failed to parse FIREBASE_ADMIN_CREDENTIALS',
        error,
      );
      throw new Error(
        'Invalid FIREBASE_ADMIN_CREDENTIALS environment variable',
      );
    }
  }

  // Priority 2: Check for individual environment variables (alternative format)
  if (
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    console.log(
      '🔄 Firebase Admin: Using credentials from individual environment variables',
    );
    return {
      type: 'service_account',
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // Priority 3: Local development file
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Firebase Admin: Using local credentials for development');
    try {
      const credentialsPath = `${process.cwd()}/.secrets/firebase-adminsdk.json`;
      console.log('📄 Firebase Admin: Credentials path:', credentialsPath);
      return credentialsPath;
    } catch (error) {
      console.warn('⚠️ Firebase Admin: Local credentials file not found', error);
    }
  }

  // Priority 4: Google Secret Manager (Google Cloud deployment)
  try {
    console.log('🔄 Firebase Admin: Fetching credentials from Secret Manager');
    // Import Secret Manager only when needed
    const {
      SecretManagerServiceClient,
    } = require('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();

    const secretName =
      process.env.FIREBASE_ADMIN_SECRET_NAME ||
      'firebase-admin-sdk-credentials';
    const secretVersion = process.env.FIREBASE_ADMIN_SECRET_VERSION || 'latest';
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error(
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set',
      );
    }

    const name = `projects/${projectId}/secrets/${secretName}/versions/${secretVersion}`;
    console.log('📄 Firebase Admin: Secret path:', name);

    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString();

    console.log('✅ Firebase Admin: Credentials fetched from Secret Manager');
    return JSON.parse(payload);
  } catch (error) {
    console.error(
      '❌ Firebase Admin: Error fetching credentials from Secret Manager:',
      error,
    );
    throw new Error(
      `Could not initialize Firebase Admin: credentials unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Initialize Firebase Admin SDK
async function initializeFirebaseAdmin() {
  const apps = getApps();

  if (apps.length > 0) {
    console.log('✅ Firebase Admin: Using existing app');
    return apps[0];
  }

  try {
    console.log('🔄 Firebase Admin: Initializing...');
    const credentials = await getServiceAccountCredentials();
    console.log('✅ Firebase Admin: Credentials loaded');

    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
      throw new Error(
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set',
      );
    }

    console.log('📄 Firebase Admin: Storage bucket:', storageBucket);

    const app = initializeApp({
      credential: cert(credentials),
      storageBucket: storageBucket,
    });

    console.log('✅ Firebase Admin: App initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin: Initialization failed:', error);
    throw new Error(
      `Firebase Admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export const firebaseAdminApp = await initializeFirebaseAdmin();

export const auth = getAuth(firebaseAdminApp);

export const db = getFirestore(firebaseAdminApp);

// Initialize storage with error handling
let storageInstance: ReturnType<typeof getStorage>;
try {
  storageInstance = getStorage(firebaseAdminApp);
  console.log('✅ Firebase Admin: Storage initialized');
} catch (error) {
  console.error('❌ Firebase Admin: Storage initialization failed:', error);
  throw error;
}
export const storage = storageInstance;

export const functions = getFunctions(firebaseAdminApp);
