
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";

initializeApp();

export const makeFirstAdmin = onCall({ cors: true }, async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) {
        // Not authenticated, return immediately.
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const auth = getAuth();
    const firestore = getFirestore();

    // Check if the user already has the admin claim.
    const userRecord = await auth.getUser(uid);
    if (userRecord.customClaims?.['admin']) {
        const adminRoleRef = firestore.collection('roles_admin').doc(uid);
        // Ensure the roles_admin document exists if claim is present.
        if (!(await adminRoleRef.get()).exists) {
            await adminRoleRef.set({ admin: true });
        }
        return { isAdmin: true, message: "User is already an admin." };
    }

    // Check if any *other* users exist in the system.
    // We list up to 2 users. If there's 1 or fewer, this user is the first.
    const userListResult = await auth.listUsers(2);

    // If the current user is the ONLY user in the system, they are the first user. Promote them.
    if (userListResult.users.length <= 1) {
        // Make sure the one user found is the current user, just in case.
        if (userListResult.users.length === 0 || userListResult.users[0].uid === uid) {
            // Set custom claim and create a corresponding document in roles_admin.
            await auth.setCustomUserClaims(uid, { admin: true });
            const adminRoleRef = firestore.collection('roles_admin').doc(uid);
            await adminRoleRef.set({ admin: true });
            return { isAdmin: true, message: "User is the first user, promoted to admin." };
        }
    }

    // If we're here, it means there are other users, so this user is not the first.
    return { isAdmin: false, message: "User is not the first user, cannot be promoted to admin." };
});

export const listUsers = onCall({ cors: true }, async (request: CallableRequest) => {
    const callerUid = request.auth?.uid;
    if (!callerUid) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const auth = getAuth();
    try {
        const callerUserRecord = await auth.getUser(callerUid);
        if (!callerUserRecord.customClaims?.admin) {
            throw new HttpsError('permission-denied', 'Only admins can list users.');
        }

        const userRecords = await auth.listUsers();
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

        return { users };
    } catch (error: any) {
        console.error("Error listing users:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError('internal', 'An error occurred while trying to list users.');
    }
});


export const deleteUser = onCall({ cors: true }, async (request: CallableRequest) => {
    const callerUid = request.auth?.uid;
    const targetUids = request.data.uids; // Expecting an array of uids

    if (!callerUid) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    if (!targetUids || !Array.isArray(targetUids) || targetUids.length === 0) {
        throw new HttpsError('invalid-argument', 'The function must be called with an array of "uids".');
    }

    const auth = getAuth();
    const firestore = getFirestore();

    try {
        const callerUserRecord = await auth.getUser(callerUid);
        if (!callerUserRecord.customClaims?.admin) {
            throw new HttpsError('permission-denied', 'Only admins can delete users.');
        }

        // Prevent user from deleting themselves
        if (targetUids.includes(callerUid)) {
            throw new HttpsError('permission-denied', 'You cannot delete your own account through this function.');
        }

        // Delete from Firebase Authentication
        const deleteResult = await auth.deleteUsers(targetUids);

        // Batch delete from Firestore
        const batch = firestore.batch();
        targetUids.forEach(uid => {
            batch.delete(firestore.collection('users').doc(uid));
            batch.delete(firestore.collection('roles_admin').doc(uid));
        });
        await batch.commit();

        if (deleteResult.failureCount > 0) {
            console.warn(`Failed to delete ${deleteResult.failureCount} users.`);
            // Optionally, you can check deleteResult.errors for details
        }

        return { success: true, message: `Successfully deleted ${deleteResult.successCount} users.` };

    } catch (error: any) {
        console.error("Error deleting users:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError('internal', 'An error occurred while trying to delete users.');
    }
});


export const toggleAdminRole = onCall({ cors: true }, async (request: CallableRequest) => {
    const callerUid = request.auth?.uid;
    const { uid: targetUid, isAdmin } = request.data;

    if (!callerUid) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    if (callerUid === targetUid) {
        throw new HttpsError('permission-denied', 'You cannot change your own admin status.');
    }

    if (typeof targetUid !== 'string' || typeof isAdmin !== 'boolean') {
        throw new HttpsError('invalid-argument', 'The function must be called with a "uid" (string) and "isAdmin" (boolean).');
    }

    const auth = getAuth();
    try {
        const callerUserRecord = await auth.getUser(callerUid);
        if (!callerUserRecord.customClaims?.admin) {
            throw new HttpsError('permission-denied', 'Only admins can change user roles.');
        }

        // Get current claims and merge with the new admin claim
        const targetUserRecord = await auth.getUser(targetUid);
        const currentClaims = targetUserRecord.customClaims || {};

        await auth.setCustomUserClaims(targetUid, { ...currentClaims, admin: isAdmin });

        // You might want to update a Firestore document as well for rules or client-side checks
        const firestore = getFirestore();
        const adminRoleRef = firestore.collection('roles_admin').doc(targetUid);
        if (isAdmin) {
            await adminRoleRef.set({ admin: true });
        } else {
            await adminRoleRef.delete();
        }

        return { success: true, message: `Successfully set admin status for user ${targetUid} to ${isAdmin}.` };
    } catch (error: any) {
        console.error("Error toggling admin role:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError('internal', 'An error occurred while trying to update user role.');
    }
});
