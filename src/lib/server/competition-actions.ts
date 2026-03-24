import 'server-only';
import { adminDb } from '../admin-config';
import type { Competition } from '../types';

export async function getCompetitionServer(id: string): Promise<Competition | null> {
  try {
    const docRef = adminDb.collection('competitions').doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Competition;
    }

    // Try searching by id field if not found by doc key
    const querySnap = await adminDb.collection('competitions').where('id', '==', id).limit(1).get();
    if (!querySnap.empty) {
      const firstDoc = querySnap.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as Competition;
    }

    return null;
  } catch (error) {
    console.error('Error fetching competition on server:', error);
    return null;
  }
}
