import {
  collection,
  query,
  where,
  Firestore,
  addDoc,
} from 'firebase/firestore';


export function getSubmissionsQuery(firestore: Firestore, userId: string) {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'submissions'), where('userId', '==', userId));
}
