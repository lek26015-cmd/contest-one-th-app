
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Helper to initialize Firebase app if not already initialized
function getDb() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getFirestore();
}

// This function is now only used for initial state checking, not mutation.
export async function getSavedCompetitionStatus(userId: string, competitionId: string): Promise<boolean> {
  if (!userId) return false;

  const db = getDb();
  const savedCompRef = doc(db, `users/${userId}/savedCompetitions`, competitionId);

  try {
    const docSnap = await getDoc(savedCompRef);
    return docSnap.exists();
  } catch (error) {
    // This could happen due to security rules on read, so we'll log and return false.
    // In a real app, you might want more robust error handling here.
    console.error("Could not get saved status:", error);
    return false;
  }
}

export function getSavedCompetitionsQuery(firestore: Firestore, userId: string) {
    if (!firestore || !userId) return null;
    return query(collection(firestore, `users/${userId}/savedCompetitions`), orderBy('savedAt', 'desc'));
}
