# 💩 Pooler - Community Poop Alert System

Welcome to **Pooler**, the revolutionary crowdsourced poop detection and alert system that helps keep our communities clean and safe!

## 🌟 Overview

Pooler is a Progressive Web App (PWA) that enables users to:
- **Report** dog poop locations in real-time
- **Receive alerts** when approaching reported poop
- **Contribute** to cleaner communities through crowdsourced data
- **Notify municipalities** about cleanup needs
- **Use advanced sensors** and AR technology for automatic detection (future)

Think of it as "Waze for Poop" - a community-driven navigation system that helps you avoid unpleasant surprises on your walks!

## ✨ Key Features

### 🗺️ Interactive Map System
- **Real-time location tracking** with GPS precision
- **Interactive markers** showing poop locations
- **Severity indicators** (Low, Medium, High, Hazard)
- **OpenStreetMap** integration by default
- **Google Maps** support (optional, requires API key)

### 📍 Proximity Alerts
- **Automatic alerts** when within 50m of reported poop
- **Visual notifications** with distance indicators
- **Audio alerts** (when supported)
- **Haptic feedback** on mobile devices
- **Customizable alert radius** in settings

### 📝 Easy Reporting
- **One-tap reporting** from your current location
- **Severity levels** to prioritize cleanup
- **Location types** (sidewalk, park, street, etc.)
- **Optional notes** for additional context
- **Confirmation system** to verify reports

### 🏛️ Municipality Integration
- **Direct notifications** to local authorities
- **Cleanup tracking** system
- **Incentivized reporting** framework (ready for implementation)
- **Data export** capabilities for municipal planning

### 📱 Progressive Web App
- **Install as native app** on iOS and Android
- **Offline functionality** with service worker
- **Push notifications** for nearby alerts
- **Responsive design** for all screen sizes
- **Fast and lightweight** - no app store required!

### 🔬 Advanced Detection (Framework Ready)
- **Sensor integration** for wearable devices
- **AR glasses support** (Apple Vision Pro, Meta Quest compatible)
- **Hyperspectral detection** via camera (experimental)
- **AI/ML models** for automatic poop recognition
- **Smart watch** quick reporting
- **Computer vision** for dog behavior detection

## 🚀 Getting Started

### For Users

1. **Visit the app**: Navigate to your Pooler deployment URL
2. **Allow location access**: Grant permission when prompted
3. **Explore the map**: See existing poop reports in your area
4. **Report poop**: Tap the floating 💩 button to submit a report
5. **Stay alert**: Receive notifications when approaching reported locations

### For Developers

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ariel-oversee/ariel-oversee.github.io.git
   cd ariel-oversee.github.io
   ```

2. **Deploy to GitHub Pages**:
   - The app is already configured for GitHub Pages
   - Push to the `main` branch to deploy
   - Access at: `https://ariel-oversee.github.io/`

3. **Local Development**:
   ```bash
   # Serve locally with any HTTP server
   python -m http.server 8000
   # OR
   npx serve .
   ```

4. **Access locally**:
   Open `http://localhost:8000` in your browser

## 📖 User Guide

### Reporting Poop

1. Tap the floating **💩 button** in the bottom-right corner
2. Select the **severity level**:
   - **Low**: Small or old poop
   - **Medium**: Fresh, average-sized
   - **High**: Large or multiple poops
   - **Hazard**: Blocking the path or major issue
3. Choose the **location type** (sidewalk, park, etc.)
4. Add **optional notes** for context
5. Check **"Notify Municipality"** if you want local authorities alerted
6. Tap **"Submit Report"**

### Confirming Reports

- Click on any poop marker on the map
- Tap **"✓ Confirm"** if you also see the poop
- This increases report credibility and priority

### Marking as Cleaned

- Click on a poop marker
- Tap **"🧹 Cleaned"** if you've cleaned it up or verified it's gone
- This removes the alert and helps keep data accurate

### Settings

Tap the **⚙️ Settings** button to:
- Adjust alert radius (default: 50 meters)
- Configure notification preferences
- Manage municipality contacts
- View your contribution statistics

## 🗺️ Map Providers

### OpenStreetMap (Default)
- Free and open-source
- No API key required
- Great community-maintained data
- Works out of the box

### Google Maps (Optional)
1. Obtain a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key)
2. Tap the **🔍 Filter** button > "Switch Map Provider"
3. Enter your API key when prompted
4. Enjoy Google's advanced mapping features!

## 🔬 Advanced Features

### Sensor Integration

Enable sensor features for enhanced detection:

```javascript
// Initialize sensors
const sensors = new SensorIntegration(poolerApp);
await sensors.initializeSensors();

// Enable camera detection
await sensors.initHyperspectralDetection();

// Connect wearable device
await sensors.connectWearable();
```

### AR Mode

For AR glasses (Apple Vision Pro, Meta Quest):

```javascript
// Initialize AR mode
const sensors = new SensorIntegration(poolerApp);
const arSupported = await sensors.initARMode();

if (arSupported) {
  console.log('AR mode active! Poop warnings will appear in your view');
}
```

### Google Maps Integration

```javascript
// Switch to Google Maps
const maps = new MapsIntegration(poolerApp);
await maps.switchToGoogleMaps('YOUR_API_KEY');

// Get directions (to avoid poop!)
maps.getDirections(reportObject);
```

## 🏗️ Architecture

### File Structure

```
pooler/
├── index.html              # Main HTML with UI
├── app.js                  # Core application logic
├── maps-integration.js     # Google Maps integration
├── sensor-integration.js   # Sensors, AR, ML framework
├── service-worker.js       # PWA offline support
├── manifest.json          # PWA manifest
└── POOLER_README.md       # This file
```

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Maps**: Leaflet.js (OpenStreetMap) + Google Maps API
- **Storage**: localStorage (client-side)
- **PWA**: Service Workers, Web App Manifest
- **Sensors**: Generic Sensor API, WebXR, Web Bluetooth
- **Future**: TensorFlow.js for ML detection

## 🎯 Data Model

### Poop Report Structure

```javascript
{
  id: "unique_id",
  lat: 40.7128,
  lng: -74.0060,
  severity: "medium",           // low, medium, high, hazard
  locationType: "sidewalk",     // sidewalk, park, street, other
  notes: "Near the oak tree",
  notifyMunicipality: true,
  timestamp: "2025-01-14T10:30:00Z",
  reportedBy: "user_12345",
  status: "active",             // active, cleaned, disputed
  confirmations: 1,
  cleanupRequested: true
}
```

## 🔒 Privacy & Data

### What We Store
- Poop locations (lat/lng coordinates only)
- Report metadata (severity, type, notes)
- Anonymous user IDs (randomly generated)
- No personal information

### Where It's Stored
- **Locally**: In your browser's localStorage
- **No server**: Currently no backend database
- **Your device only**: Data stays on your device

### Future P2P Sync
- WebRTC peer-to-peer sharing planned
- Blockchain integration possible for incentives
- Fully decentralized architecture

## 🌐 Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Core App | ✅ | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ✅ | ❌ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Geolocation | ✅ | ✅ | ✅ | ✅ |
| Sensor API | ✅ | ❌ | ❌ | ✅ |
| WebXR (AR) | ✅ | ❌ | ❌ | ✅ |
| Web Bluetooth | ✅ | ❌ | ❌ | ✅ |

## 🚧 Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Interactive map with markers
- [x] Geolocation tracking
- [x] Report submission
- [x] Proximity alerts
- [x] PWA installation
- [x] Municipality notifications

### Phase 2: Enhancement (Next)
- [ ] Backend API for data sync
- [ ] User accounts and profiles
- [ ] Gamification & rewards
- [ ] Social sharing
- [ ] Multi-language support
- [ ] Municipality dashboard

### Phase 3: Advanced (Future)
- [ ] AI/ML poop detection
- [ ] AR glasses integration
- [ ] Smart watch app
- [ ] Wearable sensor support
- [ ] Blockchain incentives
- [ ] Real-time P2P sync

### Phase 4: Scale (Vision)
- [ ] Municipal partnerships
- [ ] Cleanup crew dispatch
- [ ] Analytics & heatmaps
- [ ] Public health integration
- [ ] Smart city APIs
- [ ] Global deployment

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Report bugs**: Open an issue with details
2. **Suggest features**: Share your ideas in discussions
3. **Submit PRs**: Fork, code, test, submit!
4. **Test the app**: Use it and provide feedback
5. **Spread the word**: Share with your community

### Development Setup

```bash
# Clone the repo
git clone https://github.com/ariel-oversee/ariel-oversee.github.io.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Test thoroughly

# Commit and push
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Create a Pull Request
```

## 📄 License

This project is released under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** contributors for mapping data
- **Leaflet.js** team for excellent mapping library
- **Community** for reporting and confirming poop locations
- **You** for caring about clean streets! 💚

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/ariel-oversee/ariel-oversee.github.io/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ariel-oversee/ariel-oversee.github.io/discussions)

## 💡 Fun Facts

- The average dog produces 274 pounds of poop per year
- Dog poop is one of the top contributors to urban water pollution
- A single gram of dog waste contains 23 million fecal coliform bacteria
- **Pooler helps prevent all of this!** 🌍

---

**Built with 💩 by the community, for the community.**

*Remember: A cleaner city starts with reporting!*
