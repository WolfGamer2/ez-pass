const map = L.map('map').setView([40.7128, -74.0060], 10);

// OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let allRetailers = [];

Papa.parse('https://raw.githubusercontent.com/WolfGamer2/ez-pass/main/ezpass_retailers.csv', {
    download: true,
    header: true,
    complete: function(results) {
        console.log('Parsed Retailers:', results.data); // Check parsed data
        allRetailers = results.data;
        addRetailersToMap(allRetailers);
        renderChart(allRetailers);
    },
    error: function(error) {
        console.error('Error parsing CSV:', error);
    }
});

function getDirections(lat, lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

function addRetailersToMap(retailers) {
    map.eachLayer(function(layer) {
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

                // markers for places
                const marker = L.marker([lat, lon]).addTo(map);
                console.log(`Marker added for ${retailer.COMPANY} at (${lat}, ${lon})`); // Log marker addition

                marker.bindPopup(`
                    <b>${retailer.COMPANY}</b><br>${retailer.STREET_1}, ${retailer.CITY}, ${retailer.STATE} ${retailer.ZIP_CODE}
                    <button onclick="getDirections(${lat}, ${lon})">Get Directions</button>
                `);
            } else {
                console.error(`Failed to extract coordinates for ${retailer.COMPANY}`);
            }
        } else {
            console.error(`Georeference is missing for ${retailer.COMPANY}`);
        }
    });

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
        map.fitBounds(bounds); 
    }
}

document.getElementById('search-btn').addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filteredRetailers = allRetailers.filter(retailer =>
        retailer.COMPANY.toLowerCase().includes(searchQuery)
    );
    addRetailersToMap(filteredRetailers);
});

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
