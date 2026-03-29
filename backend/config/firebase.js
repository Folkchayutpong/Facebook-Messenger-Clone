const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_BUCKET,
    });
    console.log("🔥 Firebase connected successfully");
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err.message);
    throw err;
  }
}
const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
