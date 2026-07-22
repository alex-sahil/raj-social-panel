// Register User (Email/Password) with Confirm Password & WhatsApp check
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const whatsapp = document.getElementById('regWhatsapp').value;
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
