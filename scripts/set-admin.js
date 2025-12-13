const admin = require('firebase-admin');
const path = require('path');

// Check for service account key
const serviceAccountPath = path.join(__dirname, '../service-account.json');
let serviceAccount;

try {
    serviceAccount = require(serviceAccountPath);
} catch (e) {
    console.error('Error: service-account.json not found in the root directory.');
    console.error('Please download it from Firebase Console > Project settings > Service accounts');
    console.error('And save it as "service-account.json" in the project root.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];

if (!uid) {
    console.error('Error: Please provide a UID.');
    console.error('Usage: node scripts/set-admin.js <UID>');
    process.exit(1);
}

async function setAdmin() {
    try {
        // 1. Set Custom Claim
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`✅ Successfully set admin claim for user ${uid}`);

        // 2. Update Firestore (for consistency with app logic)
        const db = admin.firestore();
        await db.collection('roles_admin').doc(uid).set({ admin: true });
        console.log(`✅ Successfully updated Firestore roles_admin/${uid}`);

        console.log('\n🎉 Done! Please refresh your browser to see the changes.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting admin:', error);
        process.exit(1);
    }
}

setAdmin();
