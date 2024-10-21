// Initialize the map and set its view to New York City's coordinates
const map = L.map('map').setView([40.7128, -74.0060], 10);

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Store all retailers for filtering and searching
let allRetailers = [];
let retailerTypes = new Set(); // To store unique retailer types

// Parse the CSV using PapaParse
Papa.parse('https://raw.githubusercontent.com/WolfGamer2/ez-pass/main/ezpass_retailers.csv', {
    download: true,
    header: true,
    complete: function(results) {
        console.log('Parsed Retailers:', results.data); // Check parsed data
        allRetailers = results.data;

        // Extract unique retailer types
        allRetailers.forEach(retailer => {
            if (retailer.TYPE) {
                retailerTypes.add(retailer.TYPE);
            }
        });

        // Populate the retailer type dropdown
        populateRetailerTypeDropdown();
        
        addRetailersToMap(allRetailers);
        renderChart(allRetailers);
    },
    error: function(error) {
        console.error('Error parsing CSV:', error);
    }
});

// Function to populate the retailer type dropdown
function populateRetailerTypeDropdown() {
    const retailerTypeSelect = document.getElementById('retailer-type');
    
    // Clear existing options
    retailerTypeSelect.innerHTML = '<option value="all">All</option>';
    
    // Add unique retailer types to dropdown
    retailerTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.replace('_', ' ').toUpperCase(); // Format type for display
        retailerTypeSelect.appendChild(option);
    });
}

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
        console.log(`Georeference for ${retailer.COMPANY}: ${georeference}`); // Log georeference
        if (georeference) {
            const coordinates = georeference.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
            if (coordinates) {
                const lon = parseFloat(coordinates[1]);
                const lat = parseFloat(coordinates[2]);

                // Add marker to the map
                const marker = L.marker([lat, lon]).addTo(map);
                console.log(`Marker added for ${retailer.COMPANY} at (${lat}, ${lon})`); // Log marker addition

                marker.bindPopup(`
                    <b>${retailer.COMPANY}</b><br>${retailer.STREET_1}, ${retailer.CITY}, ${retailer.STATE} ${retailer.ZIP_CODE}
                `);
            } else {
                console.error(`Failed to extract coordinates for ${retailer.COMPANY}`);
            }
        } else {
            console.error(`Georeference is missing for ${retailer.COMPANY}`);
        }
    });

    // Fit the map to the bounds of the markers
    if (retailers.length > 0) {
        const bounds = L.latLngBounds();
        retailers.forEach(retailer => {
            const georeference = retailer.Georeference;
            if (georeference) {
                const coordinates = georeference.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
                if (coordinates) {
                    const lon = parseFloat(coordinates[1]);
                    const lat = parseFloat(coordinates[2]);
                    bounds.extend([lat, lon]);
                }
            }
        });
        map.fitBounds(bounds); // Fit map to the bounds of the markers
    }
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
    const retailerCounts = {};

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
