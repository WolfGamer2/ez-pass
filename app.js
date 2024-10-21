// Initialize the map and set its view to a default location (NYC coordinates)
const map = L.map('map').setView([40.7128, -74.0060], 10);

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch E-ZPass Retailers Locations Data
fetch('https://data.ny.gov/resource/y59h-w6v4.json')
    .then(response => response.json())
    .then(data => {
        // Add retailers to the map after data is fetched
        addRetailersToMap(data);
    })
    .catch(error => console.error('Error fetching retailer data:', error));

// Function to add markers for each retailer on the map
function addRetailersToMap(retailers) {
    retailers.forEach(retailer => {
        // Check if latitude and longitude are available
        if (retailer.location_1) {
            const lat = retailer.location_1.latitude;
            const lon = retailer.location_1.longitude;
            const marker = L.marker([lat, lon]).addTo(map);

            // Add a popup to show retailer information
            marker.bindPopup(`<b>${retailer.retailer_name}</b><br>${retailer.location_1.human_address}`);
        }
    });
}

// Search button functionality (to add in the future)
document.getElementById('search-btn').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    alert(`Searching for retailers near: ${searchInput}`);
    // In future steps, you can integrate geocoding to search and update the map based on user input
});
