
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/admin-config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  
  // 1. Verify Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];
  let callerUid: string;
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    callerUid = decodedToken.uid;
    
    // 2. Verify Admin Status
    if (!decodedToken.admin) {
      return NextResponse.json({ error: { message: 'Permission denied. Admin only.' } }, { status: 403 });
    }
  } catch (error) {
    console.error('Auth verification failed:', error);
    return NextResponse.json({ error: { message: 'Invalid token' } }, { status: 401 });
  }

  // 3. Parse Body
  let data: any = {};
  try {
    const body = await request.json();
    data = body.data || {};
  } catch (e) {
    // Body might be empty
  }

  // 4. Handle Functions
  try {
    switch (name) {
      case 'listUsers': {
        const userRecords = await adminAuth.listUsers();
        const users = userRecords.users.map(user => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          disabled: user.disabled,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
          customClaims: user.customClaims,
        }));
        return NextResponse.json({ result: { users } });
      }

      case 'deleteUser': {
        const { uids } = data;
        if (!uids || !Array.isArray(uids) || uids.length === 0) {
          return NextResponse.json({ error: { message: 'Missing uids' } }, { status: 400 });
        }

        if (uids.includes(callerUid)) {
          return NextResponse.json({ error: { message: 'Cannot delete yourself' } }, { status: 403 });
        }

        const deleteResult = await adminAuth.deleteUsers(uids);
        
        const batch = adminDb.batch();
        uids.forEach(uid => {
          batch.delete(adminDb.collection('users').doc(uid));
          batch.delete(adminDb.collection('roles_admin').doc(uid));
        });
        await batch.commit();

        return NextResponse.json({ result: { success: true, count: deleteResult.successCount } });
      }

      case 'toggleAdminRole': {
        const { uid: targetUid, isAdmin } = data;
        if (!targetUid || typeof isAdmin !== 'boolean') {
          return NextResponse.json({ error: { message: 'Invalid arguments' } }, { status: 400 });
        }

        if (callerUid === targetUid) {
          return NextResponse.json({ error: { message: 'Cannot change your own role' } }, { status: 403 });
        }

        const targetUserRecord = await adminAuth.getUser(targetUid);
        const currentClaims = targetUserRecord.customClaims || {};
        await adminAuth.setCustomUserClaims(targetUid, { ...currentClaims, admin: isAdmin });

        const adminRoleRef = adminDb.collection('roles_admin').doc(targetUid);
        if (isAdmin) {
          await adminRoleRef.set({ admin: true });
        } else {
          await adminRoleRef.delete();
        }

        return NextResponse.json({ result: { success: true } });
      }

      default:
        return NextResponse.json({ error: { message: `Function ${name} not found` } }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Error in function ${name}:`, error);
    return NextResponse.json({ error: { message: error.message || 'Internal error' } }, { status: 500 });
  }
}
