import 'server-only';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (!getApps().length) {
    try {
        if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            app = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                })
            });
        } else {
            // Fallback for environments where only standard credentials are used
            app = initializeApp();
        }
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
        throw error;
    }
} else {
    app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
