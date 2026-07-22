// Firebase SDK Modules Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase Configuration (Updated with your original credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDwBxEiWermQ3xqZ0JN8rlKUfpLPH7zOrU",
  authDomain: "raj-social-panel-80680.firebaseapp.com",
  projectId: "raj-social-panel-80680",
  storageBucket: "raj-social-panel-80680.firebasestorage.app",
  messagingSenderId: "12577949197",
  appId: "1:12577949197:web:f4eb59761b003dbe853744",
  measurementId: "G-20JY74T8YW"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
