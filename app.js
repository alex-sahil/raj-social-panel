import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, setDoc, getDoc, collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Google Auth Provider Setup
const googleProvider = new GoogleAuthProvider();

// Google Sign In Button Event
const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

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

            alert("Google Sign-In Successful!");
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("Google Sign-In Error: " + error.message);
        }
    });
}

// Register User (Email/Password)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const whatsapp = document.getElementById('regWhatsapp').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            alert("পাসওয়ার্ড দুটি মিলছে না! আবার চেক করুন।");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                whatsapp: whatsapp,
                balance: 0.00,
                role: "user",
                createdAt: new Date()
            });

            alert("সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!");
            window.location.href = "dashboard.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// Login User (Supports both Email and Username)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let identifier = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            let emailToUse = identifier;

            // Check if input is a username (doesn't contain '@')
            if (!identifier.includes('@')) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("name", "==", identifier));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    alert("এই ইউজারনেম দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি!");
                    return;
                }

                // Get the email associated with that username
                querySnapshot.forEach((doc) => {
                    emailToUse = doc.data().email;
                });
            }

            await signInWithEmailAndPassword(auth, emailToUse, password);
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } catch (error) {
            alert("Login Error: " + error.message);
        }
    });
}

// Forgot Password
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent!");
        } catch (error) {
            alert(error.message);
        }
    });
}
