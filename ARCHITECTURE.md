# Pooler - Technical Architecture

This document provides a comprehensive technical overview of the Pooler application architecture.

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Storage Architecture](#storage-architecture)
- [API Integration](#api-integration)
- [Performance Considerations](#performance-considerations)

## Overview

Pooler is a Progressive Web Application (PWA) built with vanilla JavaScript, designed for community-driven poop detection and reporting. The architecture emphasizes:
- **Client-side processing** - All core logic runs in the browser
- **Offline-first** - Works without internet connection
- **Progressive enhancement** - Gracefully degrades based on browser capabilities
- **Modular design** - Clear separation of concerns across modules

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│                   (index.html + CSS)                     │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Core Application                        │
│                      (app.js)                            │
│  ┌─────────────┬──────────────┬────────────────────┐   │
│  │ Map Manager │ Alert System │ Report Management  │   │
│  └─────────────┴──────────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │              │              │
┌────────┴────┐  ┌──────┴──────┐  ┌───┴──────────┐
│   Maps      │  │   Backend   │  │   Sensor     │
│ Integration │  │    Sync     │  │ Integration  │
│ (maps-*.js) │  │ (backend-*.js)│ │ (sensor-*.js)│
└─────────────┘  └─────────────┘  └──────────────┘
         │              │              │
┌────────┴───────────────┴──────────────┴─────────┐
│           Browser APIs & Storage                 │
│  ┌──────────┬──────────┬──────────┬───────────┐ │
│  │ Geoloc   │ Service  │ Local    │ Generic   │ │
│  │ API      │ Worker   │ Storage  │ Sensors   │ │
│  └──────────┴──────────┴──────────┴───────────┘ │
└──────────────────────────────────────────────────┘
```

## Core Components

### 1. PoolerApp (app.js)

**Purpose:** Central application coordinator

**Key Responsibilities:**
- Initializes and coordinates all subsystems
- Manages application state
- Handles user interactions
- Coordinates between modules

**Key Methods:**
```javascript
init()                    // Initialize application
initMap()                 // Set up map interface
startLocationTracking()   // Begin GPS tracking
addPoopReport(report)     // Add new report
checkProximityAlerts()    // Monitor user proximity to reports
```

**State Management:**
- Reports stored in `this.poopReports` array
- User location in `this.userLocation`
- Active alerts tracked in `this.activeAlerts` Set
- Map markers in `this.markers` array

### 2. Maps Integration (maps-integration.js)

**Purpose:** Abstraction layer for map providers

**Features:**
- Supports OpenStreetMap (via Leaflet.js) and Google Maps
- Provider-agnostic API
- Seamless provider switching
- Custom marker management

**Key Methods:**
```javascript
switchToGoogleMaps(apiKey)  // Switch from OSM to Google Maps
addMarker(lat, lng, options) // Add marker to map
getDirections(destination)   // Get navigation directions
```

**Dependencies:**
- Leaflet.js for OpenStreetMap
- Google Maps JavaScript API (optional)

### 3. Backend Sync (backend-sync.js)

**Purpose:** Cross-device data synchronization

**Supported Backends:**
1. **GitHub Gist** - Free, uses GitHub as storage
2. **JSONBin.io** - Third-party JSON storage service
3. **Custom API** - User-provided backend endpoint

**Sync Flow:**
```
1. Auto-sync on app start (if configured)
2. Periodic polling (every 30 seconds)
3. Immediate sync on new report
4. Conflict resolution (newest wins)
```

**Key Methods:**
```javascript
initializeSync()              // Set up sync connection
uploadReports()               // Push local reports to backend
downloadReports()             // Fetch reports from backend
setupGitHubGistSync(token)    // Configure GitHub Gist sync
```

### 4. Sensor Integration (sensor-integration.js)

**Purpose:** Framework for advanced detection capabilities

**Capabilities:**
- Wearable device integration
- AR glasses support (WebXR)
- Camera-based detection (experimental)
- Hyperspectral imaging
- Smart watch integration

**Key Methods:**
```javascript
initializeSensors()              // Initialize available sensors
initHyperspectralDetection()     // Start camera-based detection
initARMode()                     // Enable AR overlay
connectWearable()                // Connect smart watch/wearable
```

**Browser API Usage:**
- Generic Sensor API
- WebXR Device API
- Web Bluetooth API
- MediaDevices API (camera)

### 5. Service Worker (service-worker.js)

**Purpose:** Enable PWA functionality

**Features:**
- Offline support via caching
- Background sync (when available)
- Push notification support
- Asset caching strategy

**Cache Strategy:**
- Cache-first for static assets
- Network-first for API calls
- Fallback to offline page

## Data Flow

### Report Submission Flow

```
User Action
    ↓
Report Form Submission
    ↓
Validation & Processing (app.js)
    ↓
├─→ Save to localStorage
├─→ Add marker to map
├─→ Upload to backend (if sync enabled)
└─→ Update UI statistics
```

### Proximity Alert Flow

```
Location Update
    ↓
GPS Position Change
    ↓
Calculate Distance to All Reports
    ↓
Distance < Alert Radius?
    ├─→ YES: Trigger Alert
    │     ├─→ Visual notification
    │     ├─→ Audio alert (if supported)
    │     └─→ Haptic feedback (mobile)
    └─→ NO: Continue monitoring
```

### Sync Flow

```
Periodic Sync Timer (30s)
    ↓
Backend Sync Check
    ↓
├─→ Upload local reports
│   └─→ POST to backend
├─→ Download remote reports
│   └─→ GET from backend
└─→ Merge & Deduplicate
    └─→ Update map markers
```

## Storage Architecture

### localStorage Schema

```javascript
{
  "poopReports": [
    {
      "id": "uuid-v4",
      "lat": 40.7128,
      "lng": -74.0060,
      "severity": "medium",
      "locationType": "sidewalk",
      "notes": "Optional description",
      "notifyMunicipality": true,
      "timestamp": "2025-12-24T09:00:00Z",
      "reportedBy": "anonymous-user-id",
      "status": "active",
      "confirmations": 0,
      "cleanupRequested": false
    }
  ],
  "poolerSyncConfig": {
    "method": "github-gist",
    "gistId": "abc123...",
    "token": "github_pat_..."
  },
  "userSettings": {
    "alertRadius": 50,
    "notificationsEnabled": true,
    "municipality": {
      "name": "City of Example",
      "email": "public.works@example.gov"
    }
  }
}
```

### IndexedDB (Future Enhancement)

For scalability, future versions may use IndexedDB for:
- Larger datasets (>5MB)
- Spatial indexing for faster queries
- Offline report queue
- Historical data retention

## API Integration

### GitHub Gist API

**Endpoint:** `https://api.github.com/gists`

**Authentication:** Personal Access Token with `gist` scope

**Operations:**
```javascript
// Create Gist
POST /gists
{
  "description": "Pooler Reports",
  "public": false,
  "files": {
    "pooler-reports.json": {
      "content": "{...reports...}"
    }
  }
}

// Update Gist
PATCH /gists/{gist_id}
{
  "files": {
    "pooler-reports.json": {
      "content": "{...updated-reports...}"
    }
  }
}

// Get Gist
GET /gists/{gist_id}
```

### JSONBin.io API

**Endpoint:** `https://api.jsonbin.io/v3`

**Authentication:** API Key in `X-Master-Key` header

**Operations:**
```javascript
// Create Bin
POST /b
Headers: { "X-Master-Key": "api-key" }
Body: {...reports...}

// Update Bin
PUT /b/{bin_id}
Headers: { "X-Master-Key": "api-key" }
Body: {...reports...}

// Read Bin
GET /b/{bin_id}
Headers: { "X-Master-Key": "api-key" }
```

### Custom Backend API

**Expected Endpoints:**

```
GET /reports          - Fetch all reports
POST /reports         - Create new report
PUT /reports/:id      - Update report
DELETE /reports/:id   - Remove report
```

**Request/Response Format:**
```javascript
// POST /reports
Request: {
  "lat": 40.7128,
  "lng": -74.0060,
  "severity": "medium",
  "locationType": "sidewalk",
  "timestamp": "2025-12-24T09:00:00Z"
}

Response: {
  "id": "server-generated-id",
  "status": "success"
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Maps module loads only when needed
   - Sensor integration loaded on demand
   - Deferred loading of non-critical features

2. **Efficient Proximity Calculations**
   - Uses Haversine formula for distance
   - Cached calculations for static reports
   - Throttled location updates (1s intervals)

3. **Map Performance**
   - Marker clustering for dense areas
   - Viewport-based rendering
   - Tile caching via service worker

4. **Memory Management**
   - Report limit: 10,000 per device
   - Automatic cleanup of old reports (>30 days)
   - Marker pooling and reuse

### Scalability Limits

**Current Architecture:**
- Max reports: ~10,000 (localStorage limit ~5-10MB)
- Concurrent users: Unlimited (no backend required)
- Sync frequency: Every 30 seconds
- Geographic scope: Unlimited

**Future Scaling Solutions:**
- IndexedDB for larger datasets
- Server-side spatial indexing
- Geographic sharding
- WebSocket for real-time updates

## Security Considerations

### Data Privacy
- No personal information collected
- Anonymous user IDs (randomly generated)
- Location data never sent to third parties
- No tracking or analytics

### Backend Security
- API keys stored in localStorage (encrypted in future)
- HTTPS-only connections
- Rate limiting recommended for custom backends
- Token validation on all sync operations

### Input Validation
- Coordinate bounds checking
- Severity level enumeration
- XSS prevention (sanitized inputs)
- Report submission rate limiting

## Browser Compatibility

### Required APIs
- ✅ Geolocation API (all modern browsers)
- ✅ localStorage (all modern browsers)
- ✅ Service Workers (Chrome, Firefox, Safari, Edge)
- ✅ Leaflet.js (all modern browsers)

### Optional APIs
- ⚠️ Generic Sensor API (Chrome, Edge only)
- ⚠️ WebXR (Chrome, Edge only)
- ⚠️ Web Bluetooth (Chrome, Edge only)
- ⚠️ Vibration API (Mobile browsers only)

## Future Architecture Enhancements

### Planned Improvements
1. **Real-time Sync** - WebSocket/Server-Sent Events
2. **Spatial Indexing** - Geohash or S2 geometry
3. **ML Model Integration** - TensorFlow.js for detection
4. **P2P Data Sharing** - WebRTC for decentralized sync
5. **Municipality Dashboard** - Admin interface for cleanup tracking
6. **GraphQL API** - More flexible data querying

### Technical Debt
- [ ] Migrate from localStorage to IndexedDB
- [ ] Add unit tests (Jest/Mocha)
- [ ] Implement proper error boundaries
- [ ] Add loading states for async operations
- [ ] Improve accessibility (ARIA labels)
- [ ] Add i18n support for multiple languages

## Contributing to Architecture

When proposing architecture changes, consider:
1. Backward compatibility with existing data
2. Browser support implications
3. Performance impact
4. Security implications
5. Maintenance complexity

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
