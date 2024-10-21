// Initialize the map and set its view to New York City's coordinates
const map = L.map('map').setView([40.7128, -74.0060], 10);

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Store all retailers for filtering and searching
let allRetailers = [];

// Parse the CSV using PapaParse
Papa.parse('https://github.com/WolfGamer2/ez-pass/blob/main/ezpass_retailers.csv', {
    download: true,
    header: true, // First row is the header
    complete: function(results) {
        allRetailers = results.data;
        addRetailersToMap(allRetailers);
        renderChart(allRetailers);
    },
    error: function(error) {
        console.error('Error parsing CSV:', error);
    }
});

// Function to add markers for each retailer on the map
function addRetailersToMap(retailers) {
    // Clear existing markers if any
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    retailers.forEach(retailer => {
        const georeference = retailer.Georeference;
        if (georeference) {
            const coordinates = georeference.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
            if (coordinates) {
                const lon = parseFloat(coordinates[1]);
                const lat = parseFloat(coordinates[2]);

                // Use the default Leaflet marker
                const marker = L.marker([lat, lon]).addTo(map); // No custom icon

                marker.bindPopup(`
                    <b>${retailer.COMPANY}</b><br>${retailer.STREET_1}, ${retailer.CITY}, ${retailer.STATE} ${retailer.ZIP_CODE}
                    <form id="review-form">
                        <textarea placeholder="Leave a review"></textarea>
                        <button type="submit">Submit</button>
                    </form>
                    <button onclick="getDirections(${lat}, ${lon})">Get Directions</button>
                `).on('popupopen', function() {
                    document.getElementById('review-form').onsubmit = function(e) {
                        e.preventDefault();
                        const review = this.querySelector('textarea').value;
                        alert(`Review submitted: ${review}`);
                        // Logic to save the review can be added here
                    };
                });
            }
        }
    });
}

// Function to get driving directions
function getDirections(lat, lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

// Search button functionality
document.getElementById('search-btn').addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filteredRetailers = allRetailers.filter(retailer =>
        retailer.COMPANY.toLowerCase().includes(searchQuery)
    );
    addRetailersToMap(filteredRetailers);
});

// Filter by retailer type
document.getElementById('retailer-type').addEventListener('change', function() {
    const selectedType = this.value;
    const filteredRetailers = allRetailers.filter(retailer =>
        selectedType === 'all' || retailer.TYPE === selectedType
    );
    addRetailersToMap(filteredRetailers);
});

// Function to render data visualization
function renderChart(retailers) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const retailerCounts = {
        gas_station: 0,
        convenience_store: 0,
        // Add other types as needed
    };

    retailers.forEach(retailer => {
        retailerCounts[retailer.TYPE] = (retailerCounts[retailer.TYPE] || 0) + 1;
    });

    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(retailerCounts),
            datasets: [{
                label: '# of Retailers',
                data: Object.values(retailerCounts),
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
