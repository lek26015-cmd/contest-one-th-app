import 'server-only';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (!getApps().length) {
    try {
        app = initializeApp();
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
        throw error;
    }
} else {
    app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
