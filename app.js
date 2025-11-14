// Pooler App - Community Poop Alert System
// Main Application Logic

class PoolerApp {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.userMarker = null;
        this.poopReports = [];
        this.markers = [];
        this.watchId = null;
        this.alertRadius = 50; // meters
        this.activeAlerts = new Set();

        // Load existing reports from localStorage
        this.loadReports();

        // Initialize the app
        this.init();
    }

    init() {
        // Initialize map
        this.initMap();

        // Request location permission and start tracking
        this.startLocationTracking();

        // Set up event listeners
        this.setupEventListeners();

        // Start proximity monitoring
        this.startProximityMonitoring();

        // Update stats
        this.updateStats();
    }

    initMap() {
        // Initialize Leaflet map centered on default location (will update when user location is found)
        this.map = L.map('map').setView([40.7128, -74.0060], 15); // Default: NYC

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add custom poop icon definition
        this.poopIcon = L.divIcon({
            className: 'poop-marker',
            html: '<div style="font-size: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">💩</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Add user location icon
        this.userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="font-size: 30px; animation: pulse 2s infinite;">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Add CSS for pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    startLocationTracking() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('❌ Geolocation not supported');
            return;
        }

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => this.handleLocationUpdate(position),
            (error) => this.handleLocationError(error),
            { enableHighAccuracy: true, maximumAge: 10000 }
        );

        // Watch position for continuous updates
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handleLocationUpdate(position),
            (error) => this.handleLocationError(error),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    }

    handleLocationUpdate(position) {
        const { latitude, longitude, accuracy } = position.coords;

        this.userLocation = { lat: latitude, lng: longitude, accuracy };

        // Update or create user marker
        if (this.userMarker) {
            this.userMarker.setLatLng([latitude, longitude]);
        } else {
            this.userMarker = L.marker([latitude, longitude], { icon: this.userIcon })
                .addTo(this.map)
                .bindPopup('📍 You are here');

            // Center map on user location
            this.map.setView([latitude, longitude], 16);
        }

        // Add accuracy circle
        if (this.accuracyCircle) {
            this.accuracyCircle.setLatLng([latitude, longitude]);
            this.accuracyCircle.setRadius(accuracy);
        } else {
            this.accuracyCircle = L.circle([latitude, longitude], {
                radius: accuracy,
                color: '#4285F4',
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                weight: 1
            }).addTo(this.map);
        }

        this.updateLocationStatus(`📍 Accurate to ${Math.round(accuracy)}m`);
    }

    handleLocationError(error) {
        console.error('Location error:', error);
        let message = '❌ Location error';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = '❌ Location permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                message = '❌ Location unavailable';
                break;
            case error.TIMEOUT:
                message = '❌ Location timeout';
                break;
        }
        this.updateLocationStatus(message);
    }

    updateLocationStatus(status) {
        document.getElementById('locationStatus').textContent = status;
    }

    setupEventListeners() {
        // Report button
        document.getElementById('reportBtn').addEventListener('click', () => {
            this.openReportModal();
        });

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeReportModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeReportModal();
        });

        // Report form submission
        document.getElementById('reportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });

        // Alert panel close
        document.getElementById('closeAlert').addEventListener('click', () => {
            this.hideAlert();
        });

        // Control buttons
        document.getElementById('centerBtn').addEventListener('click', () => {
            if (this.userLocation) {
                this.map.setView([this.userLocation.lat, this.userLocation.lng], 16);
            }
        });

        document.getElementById('filterBtn').addEventListener('click', () => {
            this.showFilterOptions();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // Close modal on background click
        document.getElementById('reportModal').addEventListener('click', (e) => {
            if (e.target.id === 'reportModal') {
                this.closeReportModal();
            }
        });
    }

    openReportModal() {
        if (!this.userLocation) {
            alert('⚠️ Please wait for your location to be determined');
            return;
        }
        document.getElementById('reportModal').classList.add('active');
    }

    closeReportModal() {
        document.getElementById('reportModal').classList.remove('active');
        document.getElementById('reportForm').reset();
    }

    submitReport() {
        if (!this.userLocation) {
            alert('⚠️ Location not available');
            return;
        }

        const severity = document.getElementById('severity').value;
        const locationType = document.getElementById('locationType').value;
        const notes = document.getElementById('notes').value;
        const notifyMunicipality = document.getElementById('notifyMunicipality').checked;

        const report = {
            id: Date.now().toString(),
            lat: this.userLocation.lat,
            lng: this.userLocation.lng,
            severity,
            locationType,
            notes,
            notifyMunicipality,
            timestamp: new Date().toISOString(),
            reportedBy: this.getUserId(),
            status: 'active',
            confirmations: 1,
            cleanupRequested: notifyMunicipality
        };

        // Add report to array
        this.poopReports.push(report);

        // Save to localStorage
        this.saveReports();

        // Add marker to map
        this.addPoopMarker(report);

        // Update stats
        this.updateStats();

        // Close modal
        this.closeReportModal();

        // Show success message
        this.showSuccessMessage('✅ Report submitted successfully!');

        // If municipality notification is requested
        if (notifyMunicipality) {
            this.notifyMunicipality(report);
        }

        // Share with nearby users (simulate P2P sharing)
        this.broadcastReport(report);
    }

    addPoopMarker(report) {
        const severityEmoji = {
            low: '💩',
            medium: '💩💩',
            high: '💩💩💩',
            hazard: '⚠️💩'
        };

        const icon = L.divIcon({
            className: 'poop-marker',
            html: `<div style="font-size: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${severityEmoji[report.severity] || '💩'}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([report.lat, report.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createPopupContent(report));

        // Add click event to show report details
        marker.on('click', () => {
            this.showReportDetails(report);
        });

        // Store marker reference
        this.markers.push({ id: report.id, marker });

        // Add radius circle for high severity
        if (report.severity === 'hazard') {
            L.circle([report.lat, report.lng], {
                radius: this.alertRadius,
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(this.map);
        }
    }

    createPopupContent(report) {
        const timeSince = this.getTimeSince(report.timestamp);
        return `
            <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #8B4513;">💩 Poop Alert</h3>
                <p><strong>Severity:</strong> ${report.severity}</p>
                <p><strong>Location:</strong> ${report.locationType}</p>
                <p><strong>Reported:</strong> ${timeSince} ago</p>
                ${report.notes ? `<p><strong>Notes:</strong> ${report.notes}</p>` : ''}
                <p><strong>Confirmations:</strong> ${report.confirmations}</p>
                <div style="margin-top: 10px; display: flex; gap: 5px;">
                    <button onclick="poolerApp.confirmReport('${report.id}')" style="flex: 1; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ✓ Confirm
                    </button>
                    <button onclick="poolerApp.markCleaned('${report.id}')" style="flex: 1; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🧹 Cleaned
                    </button>
                </div>
            </div>
        `;
    }

    getTimeSince(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    }

    confirmReport(reportId) {
        const report = this.poopReports.find(r => r.id === reportId);
        if (report) {
            report.confirmations++;
            this.saveReports();
            this.updateMarkerPopup(reportId);
            this.showSuccessMessage('✅ Report confirmed!');
        }
    }

    markCleaned(reportId) {
        const report = this.poopReports.find(r => r.id === reportId);
        if (report) {
            report.status = 'cleaned';
            report.cleanedAt = new Date().toISOString();
            this.saveReports();
            this.removeMarker(reportId);
            this.updateStats();
            this.showSuccessMessage('🎉 Thanks for keeping it clean!');
        }
    }

    updateMarkerPopup(reportId) {
        const markerObj = this.markers.find(m => m.id === reportId);
        const report = this.poopReports.find(r => r.id === reportId);
        if (markerObj && report) {
            markerObj.marker.setPopupContent(this.createPopupContent(report));
        }
    }

    removeMarker(reportId) {
        const markerObj = this.markers.find(m => m.id === reportId);
        if (markerObj) {
            this.map.removeLayer(markerObj.marker);
            this.markers = this.markers.filter(m => m.id !== reportId);
        }
    }

    startProximityMonitoring() {
        // Check proximity every 2 seconds
        setInterval(() => {
            if (this.userLocation) {
                this.checkProximityAlerts();
            }
        }, 2000);
    }

    checkProximityAlerts() {
        const activeReports = this.poopReports.filter(r => r.status === 'active');

        for (const report of activeReports) {
            const distance = this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lng,
                report.lat,
                report.lng
            );

            if (distance <= this.alertRadius && !this.activeAlerts.has(report.id)) {
                this.showProximityAlert(report, distance);
                this.activeAlerts.add(report.id);

                // Play alert sound (if available)
                this.playAlertSound();
            } else if (distance > this.alertRadius && this.activeAlerts.has(report.id)) {
                this.activeAlerts.delete(report.id);
            }
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for calculating distance between two points
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    showProximityAlert(report, distance) {
        const alertPanel = document.getElementById('alertPanel');
        const alertMessage = document.getElementById('alertMessage');
        const alertDistance = document.getElementById('alertDistance');

        alertMessage.textContent = `⚠️ Poop ahead on ${report.locationType}!`;
        alertDistance.textContent = `Distance: ${Math.round(distance)}m`;

        alertPanel.classList.add('active', 'danger');

        // Vibrate if available
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (alertPanel.classList.contains('active')) {
                this.hideAlert();
            }
        }, 10000);
    }

    hideAlert() {
        document.getElementById('alertPanel').classList.remove('active', 'danger');
    }

    playAlertSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    notifyMunicipality(report) {
        // Simulate municipality notification
        const municipalityData = {
            reportId: report.id,
            location: { lat: report.lat, lng: report.lng },
            severity: report.severity,
            timestamp: report.timestamp,
            notes: report.notes
        };

        // In a real implementation, this would send to a municipality API
        console.log('Municipality notification sent:', municipalityData);

        // Store municipality notifications
        const notifications = JSON.parse(localStorage.getItem('municipalityNotifications') || '[]');
        notifications.push(municipalityData);
        localStorage.setItem('municipalityNotifications', JSON.stringify(notifications));

        this.showSuccessMessage('📧 Municipality has been notified!');
    }

    broadcastReport(report) {
        // Simulate P2P broadcast (in real app, would use WebRTC or similar)
        // For now, just save to localStorage which other users could sync from
        const broadcastData = {
            type: 'new_report',
            report: report,
            timestamp: Date.now()
        };

        // Store in a broadcast queue
        const queue = JSON.parse(localStorage.getItem('broadcastQueue') || '[]');
        queue.push(broadcastData);
        localStorage.setItem('broadcastQueue', JSON.stringify(queue));

        console.log('Report broadcast to nearby users:', report.id);
    }

    showSuccessMessage(message) {
        // Create temporary success toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 9999;
            animation: slideDown 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    updateStats() {
        const activeReports = this.poopReports.filter(r => r.status === 'active').length;
        document.getElementById('totalReports').textContent = this.poopReports.length;
        document.getElementById('activeAlerts').textContent = activeReports;
    }

    saveReports() {
        localStorage.setItem('poopReports', JSON.stringify(this.poopReports));
    }

    loadReports() {
        const saved = localStorage.getItem('poopReports');
        if (saved) {
            this.poopReports = JSON.parse(saved);
            // Add markers for existing reports
            this.poopReports.forEach(report => {
                if (report.status === 'active') {
                    this.addPoopMarker(report);
                }
            });
        }
    }

    getUserId() {
        let userId = localStorage.getItem('poolerUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('poolerUserId', userId);
        }
        return userId;
    }

    showFilterOptions() {
        alert('🔍 Filter Options:\n\n• Show only high severity\n• Show recent reports\n• Show cleaned locations\n\n(Coming soon!)');
    }

    showSettings() {
        const currentRadius = this.alertRadius;
        const newRadius = prompt(`⚙️ Settings\n\nAlert Radius (meters):\nCurrent: ${currentRadius}m\n\nEnter new value:`, currentRadius);

        if (newRadius && !isNaN(newRadius)) {
            this.alertRadius = parseInt(newRadius);
            localStorage.setItem('alertRadius', this.alertRadius);
            this.showSuccessMessage(`✅ Alert radius set to ${this.alertRadius}m`);
        }
    }

    showReportDetails(report) {
        // Show detailed report view
        console.log('Report details:', report);
    }
}

// Initialize app when DOM is ready
let poolerApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        poolerApp = new PoolerApp();
    });
} else {
    poolerApp = new PoolerApp();
}

// Make poolerApp available globally for popup button callbacks
window.poolerApp = poolerApp;
