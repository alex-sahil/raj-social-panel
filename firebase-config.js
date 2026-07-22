// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtG7O8Z6GdWLnoYPMtMZaEXMsfV9kw39Y",
  authDomain: "raj-social-panel.firebaseapp.com",
  projectId: "raj-social-panel",
  storageBucket: "raj-social-panel.firebasestorage.app",
  messagingSenderId: "185556471630",
  appId: "1:185556471630:web:6e4825fef2541a4b65d81f",
  measurementId: "G-0YZ9MBKKDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
