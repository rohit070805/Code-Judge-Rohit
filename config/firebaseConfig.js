const { initializeApp, cert } = require('firebase-admin/app');
const admin = require('firebase-admin');

const serviceAccount = require("../firebase-adminsdk.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

const fileUpload = (file, filename) => {
    bucket.file(filename).createWriteStream().end(file.buffer);
    file_url = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${filename}?alt=media`;
    return file_url;
}

module.exports = {fileUpload};