// Initialize the map and set its view to a default location (NYC coordinates)
const map = L.map('map').setView([40.7128, -74.0060], 10);

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Use PapaParse to parse the uploaded CSV
Papa.parse('ezpass_retailers.csv', {
    download: true,
    header: true, // Treat the first row as headers
    complete: function(results) {
        const data = results.data;
        addRetailersToMap(data); // Function to map the retailers
    },
    error: function(error) {
        console.error('Error parsing CSV:', error);
    }
});

// Function to add markers for each retailer on the map
function addRetailersToMap(retailers) {
    retailers.forEach(retailer => {
        // Extract latitude and longitude from the Georeference column
        const georeference = retailer.Georeference;
        if (georeference) {
            const coordinates = georeference.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
            const lon = coordinates[1]; // Longitude
            const lat = coordinates[2]; // Latitude

            // Add marker to the map
            const marker = L.marker([lat, lon]).addTo(map);

            // Add popup with retailer information
            marker.bindPopup(`<b>${retailer.COMPANY}</b><br>${retailer.STREET_1}, ${retailer.CITY}, ${retailer.STATE} ${retailer.ZIP_CODE}`);
        }
    });
}

// Search button functionality (add as needed)
document.getElementById('search-btn').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    alert(`Searching for retailers near: ${searchInput}`);
});
