import 'server-only';
import { adminAuth } from '../admin-config';
import { cookies } from 'next/headers';

/**
 * Verifies the user's session and returns their decoded token.
 * Throws an error if the user is not authenticated.
 */
export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;
  
  if (!token) {
    throw new Error('Unauthorized: No session found');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Unauthorized: Invalid session');
  }
}

/**
 * Checks if the current user has admin privileges.
 * Throws an error if not an admin.
 */
export async function requireAdmin() {
  const token = await verifySession();
  if (token.admin !== true) {
    throw new Error('Forbidden: Admin access required');
  }
  return token;
}

/**
 * Checks if the current user is either an admin or the owner of a resource.
 */
export async function requireAdminOrOwner(ownerId: string) {
  const token = await verifySession();
  if (token.admin === true || token.uid === ownerId) {
    return token;
  }
  throw new Error('Forbidden: Access denied');
}
