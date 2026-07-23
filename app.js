// Function to handle service change and update Description/Time dynamically
const serviceSelect = document.getElementById('serviceSelect');
const descBox = document.getElementById('serviceDescription');
const avgTimeBox = document.getElementById('avgTime');
const minMaxText = document.getElementById('minMaxText');

if (serviceSelect) {
    serviceSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const selectedService = servicesList.find(s => s.id === selectedId);

        if (selectedService) {
            // Update Description (Format newlines to HTML break lines)
            if (descBox) {
                const formattedDesc = (selectedService.desc || "No description available.")
                    .replace(/\n/g, '<br>');
                descBox.innerHTML = formattedDesc;
            }

            // Update Average Time
            if (avgTimeBox) {
                avgTimeBox.innerText = selectedService.avgTime || "Instant";
            }

            // Update Min / Max
            if (minMaxText) {
                minMaxText.innerText = `Min: ${selectedService.min || 10} - Max: ${selectedService.max || 100000}`;
            }
        } else {
            if (descBox) descBox.innerHTML = "Select a service to view details.";
            if (avgTimeBox) avgTimeBox.innerText = "--";
            if (minMaxText) minMaxText.innerText = "Min: 0 - Max: 0";
        }
    });
}
