// Google Maps Integration Module for Pooler
// Allows users to switch between OpenStreetMap and Google Maps

class MapsIntegration {
    constructor(poolerApp) {
        this.poolerApp = poolerApp;
        this.currentProvider = 'openstreetmap'; // or 'google'
        this.googleMapsLoaded = false;
        this.googleMap = null;
    }

    // Load Google Maps API
    async loadGoogleMaps(apiKey) {
        if (this.googleMapsLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
            script.async = true;
            script.defer = true;

            window.initGoogleMaps = () => {
                this.googleMapsLoaded = true;
                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load Google Maps'));
            };

            document.head.appendChild(script);
        });
    }

    // Switch to Google Maps
    async switchToGoogleMaps(apiKey) {
        if (!this.googleMapsLoaded) {
            try {
                await this.loadGoogleMaps(apiKey);
            } catch (error) {
                console.error('Failed to load Google Maps:', error);
                alert('⚠️ Failed to load Google Maps. Please check your API key.');
                return;
            }
        }

        // Hide Leaflet map
        document.getElementById('map').style.display = 'none';

        // Create Google Maps container if it doesn't exist
        let googleMapDiv = document.getElementById('google-map');
        if (!googleMapDiv) {
            googleMapDiv = document.createElement('div');
            googleMapDiv.id = 'google-map';
            googleMapDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 0;
            `;
            document.body.appendChild(googleMapDiv);
        } else {
            googleMapDiv.style.display = 'block';
        }

        // Initialize Google Map
        const center = this.poolerApp.userLocation || { lat: 40.7128, lng: -74.0060 };

        this.googleMap = new google.maps.Map(googleMapDiv, {
            center: { lat: center.lat, lng: center.lng },
            zoom: 16,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });

        // Add user location marker
        if (this.poolerApp.userLocation) {
            new google.maps.Marker({
                position: { lat: center.lat, lng: center.lng },
                map: this.googleMap,
                title: 'You are here',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: 8
                }
            });
        }

        // Add poop markers
        this.addGoogleMapsMarkers();

        this.currentProvider = 'google';
        console.log('Switched to Google Maps');
    }

    // Switch back to OpenStreetMap
    switchToOpenStreetMap() {
        // Hide Google Maps
        const googleMapDiv = document.getElementById('google-map');
        if (googleMapDiv) {
            googleMapDiv.style.display = 'none';
        }

        // Show Leaflet map
        document.getElementById('map').style.display = 'block';

        // Refresh Leaflet map
        if (this.poolerApp.map) {
            this.poolerApp.map.invalidateSize();
        }

        this.currentProvider = 'openstreetmap';
        console.log('Switched to OpenStreetMap');
    }

    // Add poop markers to Google Maps
    addGoogleMapsMarkers() {
        if (!this.googleMap) return;

        const activeReports = this.poolerApp.poopReports.filter(r => r.status === 'active');

        activeReports.forEach(report => {
            const marker = new google.maps.Marker({
                position: { lat: report.lat, lng: report.lng },
                map: this.googleMap,
                title: `Poop Alert - ${report.severity}`,
                icon: {
                    url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><text y="40" font-size="40">💩</text></svg>')}`,
                    scaledSize: new google.maps.Size(40, 40)
                }
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
                content: this.createGoogleMapsPopup(report)
            });

            marker.addListener('click', () => {
                infoWindow.open(this.googleMap, marker);
            });
        });
    }

    createGoogleMapsPopup(report) {
        const timeSince = this.poolerApp.getTimeSince(report.timestamp);
        return `
            <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #8B4513;">💩 Poop Alert</h3>
                <p><strong>Severity:</strong> ${report.severity}</p>
                <p><strong>Location:</strong> ${report.locationType}</p>
                <p><strong>Reported:</strong> ${timeSince} ago</p>
                ${report.notes ? `<p><strong>Notes:</strong> ${report.notes}</p>` : ''}
                <p><strong>Confirmations:</strong> ${report.confirmations}</p>
            </div>
        `;
    }

    // Get directions to a poop location (to avoid it!)
    getDirections(report) {
        const origin = this.poolerApp.userLocation;
        if (!origin) {
            alert('⚠️ Your location is not available');
            return;
        }

        const destination = { lat: report.lat, lng: report.lng };

        if (this.currentProvider === 'google' && this.googleMap) {
            // Use Google Maps Directions
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(this.googleMap);

            directionsService.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.WALKING,
                avoidHighways: true
            }, (result, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);
                } else {
                    alert('⚠️ Could not get directions');
                }
            });
        } else {
            // Open in external maps app
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=walking`;
            window.open(url, '_blank');
        }
    }

    // Toggle between map providers
    toggleMapProvider() {
        if (this.currentProvider === 'openstreetmap') {
            // Prompt for Google Maps API key if not already set
            const apiKey = localStorage.getItem('googleMapsApiKey');
            if (!apiKey) {
                const newKey = prompt('Enter your Google Maps API Key:');
                if (newKey) {
                    localStorage.setItem('googleMapsApiKey', newKey);
                    this.switchToGoogleMaps(newKey);
                }
            } else {
                this.switchToGoogleMaps(apiKey);
            }
        } else {
            this.switchToOpenStreetMap();
        }
    }

    getCurrentProvider() {
        return this.currentProvider;
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapsIntegration;
}
