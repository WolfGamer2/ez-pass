// Initialize the map and set its view to New York City's coordinates
const map = L.map('map').setView([40.7128, -74.0060], 10);

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Parse the CSV using PapaParse
Papa.parse('ezpass_retailers.csv', {
    download: true,
    header: true, // First row is the header
    complete: function(results) {
        const data = results.data;
        addRetailersToMap(data); // Function to plot retailers on map
    },
    error: function(error) {
        console.error('Error parsing CSV:', error);
    }
});

// Function to add markers for each retailer on the map
function addRetailersToMap(retailers) {
    retailers.forEach(retailer => {
        // Extract the latitude and longitude from the Georeference column
        const georeference = retailer.Georeference;
        if (georeference) {
            // Extract coordinates from 'POINT (lon lat)' format
            const coordinates = georeference.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
            if (coordinates) {
                const lon = parseFloat(coordinates[1]);
                const lat = parseFloat(coordinates[2]);

                // Add a marker to the map at the retailer's location
                const marker = L.marker([lat, lon]).addTo(map);

                // Add a popup showing the retailer's name and address
                marker.bindPopup(`<b>${retailer.COMPANY}</b><br>${retailer.STREET_1}, ${retailer.CITY}, ${retailer.STATE} ${retailer.ZIP_CODE}`);
            }
        }
    });
}

// Search button functionality (optional)
document.getElementById('search-btn').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    alert(`Searching for retailers near: ${searchInput}`);
});
