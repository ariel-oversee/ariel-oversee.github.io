# 💩 Pooler - Community Poop Alert System

A revolutionary crowdsourced poop detection and alert system that helps keep communities clean!

🌐 **[Launch Pooler App](https://ariel-oversee.github.io/)**

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://ariel-oversee.github.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## What is Pooler?

Pooler is like "Waze for Poop" - a community-driven Progressive Web App that:
- 🚨 Alerts you when you're near dog poop
- 📍 Lets you report poop locations
- 🏛️ Notifies municipalities for cleanup
- 🌍 Uses crowdsourced data to keep streets clean

## Features

✨ **Real-time proximity alerts** - Get notified within 50m of reported poop
🗺️ **Interactive map with poop markers** - OpenStreetMap & Google Maps support
📱 **Progressive Web App** - Install on your phone, works offline
📍 **GPS-based reporting** - One-tap reporting from your location
🏛️ **Municipality notifications** - Direct alerts to local authorities
🔬 **AR & sensor integration** - Framework for smart glasses and wearables
🔄 **Cross-device sync** - Share reports via GitHub Gist or JSONBin.io

## Quick Start

### For Users

1. Visit [https://ariel-oversee.github.io/](https://ariel-oversee.github.io/)
2. Allow location access
3. **Setup cross-device sync** (Settings ⚙️ > Option 2) so reports appear for all users
4. Report poop when you see it
5. Receive alerts when approaching reported locations

📖 **[Read Full User Guide](POOLER_README.md)**

### For Developers

```bash
# Clone the repository
git clone https://github.com/ariel-oversee/ariel-oversee.github.io.git
cd ariel-oversee.github.io

# Start local server
python -m http.server 8000
# OR
npx serve .

# Open in browser
open http://localhost:8000
```

No build process required - pure vanilla JavaScript!

## Documentation

### For Users
- **[User Guide](POOLER_README.md)** - Complete user documentation with setup instructions

### For Developers
- **[Architecture Documentation](ARCHITECTURE.md)** - Technical architecture and system design
- **[API Documentation](API.md)** - Complete API reference for all JavaScript classes
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to Pooler
- **[AI Assistant Instructions](CLAUDE.md)** - Guidelines for AI assistants working with this codebase

## Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Maps:** Leaflet.js (OpenStreetMap), Google Maps API
- **Storage:** localStorage (client-side), IndexedDB (planned)
- **PWA:** Service Workers, Web App Manifest
- **Sync:** GitHub Gist API, JSONBin.io API, Custom backends
- **Advanced:** Generic Sensor API, WebXR, Web Bluetooth

## Project Structure

```
ariel-oversee.github.io/
├── index.html              # Main application UI
├── app.js                  # Core application logic (PoolerApp)
├── backend-sync.js         # Cross-device sync (BackendSync)
├── maps-integration.js     # Map providers (MapsIntegration)
├── sensor-integration.js   # Advanced detection (SensorIntegration)
├── service-worker.js       # PWA functionality
├── manifest.json           # PWA manifest
├── README.md               # This file
├── POOLER_README.md        # User documentation
├── ARCHITECTURE.md         # Technical architecture
├── API.md                  # API documentation
├── CONTRIBUTING.md         # Contribution guidelines
└── CLAUDE.md               # AI assistant instructions
```

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Core App | ✅ | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ✅ | ❌ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Geolocation | ✅ | ✅ | ✅ | ✅ |
| Sensor API | ✅ | ❌ | ❌ | ✅ |
| WebXR (AR) | ✅ | ❌ | ❌ | ✅ |
| Web Bluetooth | ✅ | ❌ | ❌ | ✅ |

## Contributing

We welcome contributions! Here's how:

1. **Report bugs** - [Open an issue](https://github.com/ariel-oversee/ariel-oversee.github.io/issues)
2. **Suggest features** - [Start a discussion](https://github.com/ariel-oversee/ariel-oversee.github.io/discussions)
3. **Submit PRs** - Read our [Contributing Guide](CONTRIBUTING.md) first
4. **Test the app** - Use it and provide feedback
5. **Spread the word** - Share with your community

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Interactive map with markers
- [x] Geolocation tracking
- [x] Report submission
- [x] Proximity alerts
- [x] PWA installation
- [x] Cross-device sync

### Phase 2: Enhancement (Next)
- [ ] Backend API for data sync
- [ ] User accounts and profiles
- [ ] Gamification & rewards
- [ ] Municipality dashboard
- [ ] Multi-language support

### Phase 3: Advanced (Future)
- [ ] AI/ML poop detection
- [ ] AR glasses integration
- [ ] Smart watch app
- [ ] Real-time P2P sync
- [ ] Blockchain incentives

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical roadmap.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenStreetMap** contributors for mapping data
- **Leaflet.js** team for excellent mapping library
- **Community** for reporting and confirming poop locations
- **You** for caring about clean streets! 💚

## Contact & Support

- **Issues:** [GitHub Issues](https://github.com/ariel-oversee/ariel-oversee.github.io/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ariel-oversee/ariel-oversee.github.io/discussions)
- **Live Demo:** [ariel-oversee.github.io](https://ariel-oversee.github.io/)

## Fun Facts

- The average dog produces 274 pounds of poop per year
- Dog poop is one of the top contributors to urban water pollution
- A single gram of dog waste contains 23 million fecal coliform bacteria
- **Pooler helps prevent all of this!** 🌍

---

**Built with 💩 by the community, for the community.**

*Remember: A cleaner city starts with reporting!*
