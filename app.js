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
        const avgTime = document.getElementById('serviceAvgTime').value.trim();
        const desc = document.getElementById('serviceDesc').value.trim();

        try {
            await addDoc(collection(db, "services"), {
                category: category,
                name: name,
                rate: rate,
                min: min,
                max: max,
                avgTime: avgTime,
                desc: desc,
                createdAt: serverTimestamp()
            });

            alert("সার্ভিস সফলভাবে অ্যাড হয়েছে!");
            addServiceForm.reset();
        } catch (error) {
            alert("Error adding service: " + error.message);
        }
    });
}
