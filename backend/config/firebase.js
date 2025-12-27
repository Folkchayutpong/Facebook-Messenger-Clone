const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_BUCKET,
  });
}

const bucket = admin.storage().bucket();
console.log("🔥 Firebase initialized");
console.log("🪣 Bucket name:", bucket.name);

module.exports = { admin, bucket };
