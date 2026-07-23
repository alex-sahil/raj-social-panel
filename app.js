import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
    doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- AUTHENTICATION LISTENERS ---
let currentUser = null;
let currentUserData = null;
let servicesList = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            const balanceElem = document.getElementById('userBalance');
            if (balanceElem) balanceElem.innerText = (currentUserData.balance || 0).toFixed(2);
        }

        // Load Services & User Orders
        loadServices();
        loadUserOrders(user.uid);
    } else {
        // Redirect to login if on dashboard or admin page
        const path = window.location.pathname;
        if (path.includes("dashboard.html") || path.includes("admin.html")) {
            window.location.href = "index.html";
        }
    }
});

// Logout Listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });
}

// --- ADMIN PANEL FUNCTIONS ---
// Add New Service (Admin)
const addServiceForm = document.getElementById('addServiceForm');
if (addServiceForm) {
    addServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('serviceCategory').value.trim();
        const name = document.getElementById('serviceName').value.trim();
        const rate = parseFloat(document.getElementById('serviceRate').value);
        const min = parseInt(document.getElementById('serviceMin').value);
        const max = parseInt(document.getElementById('serviceMax').value);

        try {
            await addDoc(collection(db, "services"), {
                category, name, rate, min, max, createdAt: serverTimestamp()
            });
            alert("সার্ভিস সফলভাবে অ্যাড হয়েছে!");
            addServiceForm.reset();
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// Add User Balance (Admin)
const addBalanceForm = document.getElementById('addBalanceForm');
if (addBalanceForm) {
    addBalanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('userEmailBalance').value.trim();
        const amount = parseFloat(document.getElementById('amountToAdd').value);

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("এই ইমেলের কোনো ইউজার পাওয়া যায়নি!");
                return;
            }

            querySnapshot.forEach(async (userDoc) => {
                const currentBal = userDoc.data().balance || 0;
                await updateDoc(doc(db, "users", userDoc.id), {
                    balance: currentBal + amount
                });
                alert(`ইউজারকে ₹${amount} ব্যালেন্স সফলভাবে দেওয়া হয়েছে!`);
                addBalanceForm.reset();
            });
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// --- USER DASHBOARD FUNCTIONS ---
// Load Services into Category & Service Select Box
async function loadServices() {
    const categorySelect = document.getElementById('categorySelect');
    const serviceSelect = document.getElementById('serviceSelect');

    if (!categorySelect || !serviceSelect) return;

    const q = collection(db, "services");
    onSnapshot(q, (snapshot) => {
        servicesList = [];
        categorySelect.innerHTML = '<option value="">Select Category...</option>';
        const categories = new Set();

        snapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            servicesList.push(data);
            categories.add(data.category);
        });

        categories.forEach((cat) => {
            categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    });

    // Category Change Listener
    categorySelect.addEventListener('change', (e) => {
        const selectedCat = e.target.value;
        serviceSelect.innerHTML = '<option value="">Select Service...</option>';

        const filteredServices = servicesList.filter(s => s.category === selectedCat);
        filteredServices.forEach(s => {
            serviceSelect.innerHTML += `<option value="${s.id}">${s.name} - ₹${s.rate} / 1000</option>`;
        });
    });

    // Calculate Charge Listener
    const orderQuantity = document.getElementById('orderQuantity');
    const totalChargeElem = document.getElementById('totalCharge');

    function calculateCharge() {
        const serviceId = serviceSelect.value;
        const qty = parseInt(orderQuantity.value) || 0;
        const selectedService = servicesList.find(s => s.id === serviceId);

        if (selectedService && qty > 0) {
            const charge = (qty / 1000) * selectedService.rate;
            totalChargeElem.innerText = charge.toFixed(2);
        } else {
            totalChargeElem.innerText = "0.00";
        }
    }

    serviceSelect.addEventListener('change', calculateCharge);
    orderQuantity.addEventListener('input', calculateCharge);
}

// Submit Order Logic
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceId = document.getElementById('serviceSelect').value;
        const link = document.getElementById('orderLink').value.trim();
        const quantity = parseInt(document.getElementById('orderQuantity').value);
        const selectedService = servicesList.find(s => s.id === serviceId);

        if (!selectedService) return alert("অনুগ্রহ করে একটি সার্ভিস সিলেক্ট করুন!");

        const charge = (quantity / 1000) * selectedService.rate;

        if (currentUserData.balance < charge) {
            alert("আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই! ব্যালেন্স অ্যাড করতে হেল্প বাটনে যোগাযোগ করুন।");
            return;
        }

        try {
            // Deduct User Balance
            const userRef = doc(db, "users", currentUser.uid);
            const newBalance = currentUserData.balance - charge;
            await updateDoc(userRef, { balance: newBalance });

            // Add Order to Firestore
            await addDoc(collection(db, "orders"), {
                userId: currentUser.uid,
                serviceName: selectedService.name,
                link: link,
                quantity: quantity,
                charge: charge,
                status: "Pending",
                createdAt: serverTimestamp()
            });

            alert("অর্ডার সফলভাবে প্লেস করা হয়েছে!");
            document.getElementById('userBalance').innerText = newBalance.toFixed(2);
            currentUserData.balance = newBalance;
            orderForm.reset();
            document.getElementById('totalCharge').innerText = "0.00";
        } catch (error) {
            alert("Order Error: " + error.message);
        }
    });
}

// Load Recent Orders
function loadUserOrders(userId) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    const q = query(collection(db, "orders"), where("userId", "==", userId));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No orders found</td></tr>';
            return;
        }

        tableBody.innerHTML = "";
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const badgeClass = data.status === "Completed" ? "status-completed" : "status-pending";

            tableBody.innerHTML += `
                <tr>
                    <td>#${index + 1}</td>
                    <td>${data.serviceName}</td>
                    <td>${data.quantity}</td>
                    <td>₹${data.charge.toFixed(2)}</td>
                    <td><span class="status-badge ${badgeClass}">${data.status}</span></td>
                </tr>
            `;
        });
    });
}
// Default Sample Categories & Services
const sampleServices = [
    { category: "⭐ World Cheap Services ⭐", name: "Instagram Followers [ Cheapest ]", rate: 10.50, min: 100, max: 100000, desc: "- 🚀 Fast Delivery\n- ⚡ Cheapest Rate\n- ❌ Non-Drop No Guarantee" },
    { category: "Instagram Followers (India) 🇮🇳", name: "Instagram Indian Followers [ Non-Drop 30 Days Refill ]", rate: 45.00, min: 50, max: 50000, desc: "- 🇮🇳 100% Real Indian Profiles\n- ♻️ 30 Days Refill Guarantee\n- ⚡ Speed: 5k-10k per day" },
    { category: "Instagram Followers Premium", name: "Instagram High Quality Followers [ Lifetime Guaranteed ]", rate: 85.00, min: 10, max: 200000, desc: "- 👑 Premium Quality Real Accounts\n- 🛡️ Lifetime Guarantee\n- ⚡ Drop Rate: 0%" },
    { category: "Instagram Likes [ Instant ] 🚀", name: "Instagram Real Post Likes [ Instant Start ]", rate: 5.20, min: 100, max: 50000, desc: "- ⚡ Instant Start\n- ❤️ Real Active Accounts\n- 🚀 Speed: 50k per day" },
    { category: "Instagram Reels Views ⚡ 👀", name: "Instagram Reels Views [ Super Fast ]", rate: 2.00, min: 1000, max: 1000000, desc: "- 👀 Viral Speed Views\n- ⚡ Instant Start" },
    { category: "Facebook Followers", name: "Facebook Profile / Page Followers [ Real ]", rate: 60.00, min: 100, max: 100000, desc: "- 👍 High Quality Profile Followers\n- ♻️ 30 Days Refill" },
    { category: "Facebook Post Like [ Slow ]", name: "Facebook Post Reaction / Likes", rate: 35.00, min: 50, max: 20000, desc: "- 👍 Real Profile Likes\n- 🐢 Slow & Natural Speed" },
    { category: "Telegram Channel / Group Members", name: "Telegram Channel Members [ Non-Drop ]", rate: 40.00, min: 100, max: 50000, desc: "- 📢 High Quality Members\n- ⚡ Fast Speed" }
];
