const admin = require('firebase-admin');

// TODO: Download your Service Account JSON from Firebase Console -> Project Settings -> Service Accounts
// Place it in the backend folder as 'serviceAccountKey.json'
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully");
} catch (e) {
  console.warn("⚠️ Firebase Admin SDK NOT initialized. Missing serviceAccountKey.json. Firebase logins will fail.");
}

module.exports = admin;
