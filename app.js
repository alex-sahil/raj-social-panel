import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, setDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Google Sign In
const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in Firestore, if not create doc
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                await setDoc(userRef, {
                    name: user.displayName || "Google User",
                    email: user.email,
                    balance: 0.00,
                    role: "user",
                    createdAt: new Date()
                });
            }

            alert("Google Sign-In successful!");
            window.location.href = "dashboard.html";
        } catch (error) {
            alert("Google Sign-In Error: " + error.message);
        }
    });
}

// Register User (Email/Password)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                balance: 0.00,
                role: "user",
                createdAt: new Date()
            });

            alert("Registration successful!");
            window.location.href = "dashboard.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// Login User (Email/Password)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// Forgot Password
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent to your inbox!");
        } catch (error) {
            alert(error.message);
        }
    });
}
