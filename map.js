// Initialize the map 
var map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// stages from files
function loadStages() {
    var stageFiles = [
        'gpx/day1.gpx', 
        'gpx/day2.gpx', 
        'gpx/day3.gpx', 
        'gpx/day4_to_camban_bothy.gpx',
        'gpx/day5.gpx', 
        'gpx/day6.gpx', 
        'gpx/day7.gpx', 
        'gpx/day8.gpx'
    ];
    var loadedStages = 0;
    var allBounds = [];

    stageFiles.forEach(function(file, index) {
        new L.GPX(file, {
            async: true,
            marker_options: {
                startIconUrl: null,
                endIconUrl: null,
                wptIconUrls: null
            },
            polyline_options: {
                color: 'blue',
                weight: 3,
                opacity: 0.7,
                className: 'clickable-line'
            }
        }).on('loaded', function(e) {
            var stage = e.target;
            var polyline = stage.getLayers().find(layer => layer instanceof L.Polyline);
            
            if (polyline) {
                polyline.on('click', function() {
                    window.location.href = 'stages.html#day' + (index + 1);
                });
                
                polyline.on('mouseover', function() {
                    this.setStyle({ weight: 5, opacity: 1 });
                });
                polyline.on('mouseout', function() {
                    this.setStyle({ weight: 3, opacity: 0.7 });
                });
            }

            allBounds.push(stage.getBounds());
            loadedStages++;

            if (loadedStages === stageFiles.length) {
                var totalBounds = L.latLngBounds(allBounds[0]);
                allBounds.forEach(bound => totalBounds.extend(bound));
                map.fitBounds(totalBounds);
            }
        }).addTo(map);
    });
}

// shelters
function loadShelters() {
    var houseIcon = L.icon({
        iconUrl: 'images/house.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });

    fetch('gpx/shelters.gpx')
        .then(response => response.text())
        .then(gpxStr => {
            const parser = new DOMParser();
            const gpx = parser.parseFromString(gpxStr, 'text/xml');
            const waypoints = gpx.getElementsByTagName('wpt');

            Array.from(waypoints).forEach(wpt => {
                const lat = parseFloat(wpt.getAttribute('lat'));
                const lon = parseFloat(wpt.getAttribute('lon'));
                const name = wpt.getElementsByTagName('name')[0].textContent;
                const desc = wpt.getElementsByTagName('desc')[0]?.textContent;
                
                // Extract URL and create popup content
                const urlMatch = desc.match(/Click here \((.*?)\)/);
                if (urlMatch && urlMatch[1]) {
                    const url = urlMatch[1];
                    const popupContent = `
                        <b>${name}</b><br>
                        <a href="${url}" target="_blank">Click here</a> for more information.
                    `;
                    
                    const marker = L.marker([lat, lon], {
                        icon: houseIcon
                    });

                    marker.bindPopup(popupContent);
                    marker.addTo(map);
                }
            });
        })
        .catch(err => console.error('Error loading shelters:', err));
}

// Shops
function loadShops() {
    var shopIcon = L.icon({
        iconUrl: 'images/shop.png', // Use the shop icon image
        iconSize: [18, 18], // Icon size
        iconAnchor: [9, 9], // Anchor point of the icon
        popupAnchor: [0, -9] // Popup position relative to the icon
    });

    fetch('gpx/shops.gpx') // Fetch the shops.gpx file
        .then(response => response.text())
        .then(gpxStr => {
            const parser = new DOMParser();
            const gpx = parser.parseFromString(gpxStr, 'text/xml');
            const waypoints = gpx.getElementsByTagName('wpt');

            Array.from(waypoints).forEach(wpt => {
                const lat = parseFloat(wpt.getAttribute('lat'));
                const lon = parseFloat(wpt.getAttribute('lon'));
                const name = wpt.getElementsByTagName('name')[0]?.textContent || 'Shop';

                // Create marker without links
                const marker = L.marker([lat, lon], {
                    icon: shopIcon
                });

                // Bind a simple popup with the shop name
                marker.bindPopup(`<b>${name}</b>`);
                marker.addTo(map);
            });
        })
        .catch(err => console.error('Error loading shops:', err));
}


// Load everything
loadStages();
loadShelters();
loadShops();


