// Initialize the map and set its view to a default location
const map = L.map('map').setView([40.7128, -74.0060], 10); // Default to NYC coordinates

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Placeholder E-ZPass retailer data (replace this with actual dataset fetching later)
const retailers = [
    {
        name: "Retailer 1",
        lat: 40.7128,
        lon: -74.0060,
        address: "123 Main St, New York, NY"
    },
    {
        name: "Retailer 2",
        lat: 40.7306,
        lon: -73.9352,
        address: "456 Elm St, Brooklyn, NY"
    }
];

// Function to add markers for retailers
function addRetailersToMap(retailers) {
    retailers.forEach(retailer => {
        const marker = L.marker([retailer.lat, retailer.lon]).addTo(map);
        marker.bindPopup(`<b>${retailer.name}</b><br>${retailer.address}`);
    });
}

// Add retailers to map
addRetailersToMap(retailers);

// Search button functionality (this will be updated to actually query based on input)
document.getElementById('search-btn').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    alert(`Searching for retailers near: ${searchInput}`);
    // In the future, you can add geocoding to find retailers near the search location
});
