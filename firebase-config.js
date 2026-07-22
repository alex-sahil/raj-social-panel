// Firebase SDK Modules Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvvZHosL4lmwqCngT0Sk0kQ_jXLFEVGEc",
    authDomain: "raj-social-panel-80680.firebaseapp.com",
    projectId: "raj-social-panel-80680",
    storageBucket: "raj-social-panel-80680.firebasestorage.app",
    messagingSenderId: "52377949397",
    appId: "1:52377949397:web:f8dc0590b8f0a0cc81374d",
    measurementId: "G-39JTY197F7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
