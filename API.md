# Pooler API Documentation

This document provides comprehensive API documentation for Pooler's JavaScript classes and methods.

## Table of Contents
- [PoolerApp](#poolerapp)
- [BackendSync](#backendsync)
- [MapsIntegration](#mapsintegration)
- [SensorIntegration](#sensorintegration)
- [Data Models](#data-models)

## PoolerApp

Main application class that coordinates all subsystems.

### Constructor

```javascript
const app = new PoolerApp();
```

**Parameters:** None

**Returns:** PoolerApp instance

**Description:** Initializes the Pooler application, loads existing reports from localStorage, and starts all subsystems.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `map` | L.Map | Leaflet map instance |
| `userLocation` | Object | Current user coordinates `{lat, lng}` |
| `userMarker` | L.Marker | Map marker for user location |
| `poopReports` | Array | All poop reports |
| `markers` | Array | Map markers for reports |
| `watchId` | Number | Geolocation watch ID |
| `alertRadius` | Number | Alert distance in meters (default: 50) |
| `activeAlerts` | Set | Currently active alert IDs |
| `backendSync` | BackendSync | Sync module instance |

### Methods

#### init()

```javascript
app.init()
```

Initializes the application and all subsystems.

**Parameters:** None

**Returns:** void

**Side Effects:**
- Initializes map
- Starts location tracking
- Sets up event listeners
- Starts proximity monitoring
- Initializes backend sync

---

#### initMap()

```javascript
app.initMap()
```

Initializes the Leaflet map with OpenStreetMap tiles.

**Parameters:** None

**Returns:** void

**Side Effects:**
- Creates map instance centered on NYC (default)
- Adds OpenStreetMap tile layer
- Renders existing report markers

---

#### startLocationTracking()

```javascript
app.startLocationTracking()
```

Requests location permission and starts continuous tracking.

**Parameters:** None

**Returns:** void

**Side Effects:**
- Requests geolocation permission
- Starts watching position
- Updates map center on location change
- Triggers proximity checks

**Error Handling:**
- Shows error if permission denied
- Falls back gracefully if geolocation unsupported

---

#### addPoopReport(report)

```javascript
app.addPoopReport({
    lat: 40.7128,
    lng: -74.0060,
    severity: 'medium',
    locationType: 'sidewalk',
    notes: 'Near oak tree',
    notifyMunicipality: true
})
```

Adds a new poop report to the system.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| report.lat | Number | Yes | Latitude (-90 to 90) |
| report.lng | Number | Yes | Longitude (-180 to 180) |
| report.severity | String | Yes | `low`, `medium`, `high`, or `hazard` |
| report.locationType | String | Yes | `sidewalk`, `park`, `street`, or `other` |
| report.notes | String | No | Additional details |
| report.notifyMunicipality | Boolean | No | Whether to notify authorities |

**Returns:** Object - The created report with generated ID and timestamp

**Side Effects:**
- Adds report to `poopReports` array
- Saves to localStorage
- Adds marker to map
- Triggers backend sync (if enabled)
- Updates UI statistics
- Sends municipality notification (if requested)

**Example:**

```javascript
const report = app.addPoopReport({
    lat: 40.7128,
    lng: -74.0060,
    severity: 'high',
    locationType: 'park',
    notes: 'Large dog, fresh',
    notifyMunicipality: true
});

console.log(report.id); // "550e8400-e29b-41d4-a716-446655440000"
```

---

#### checkProximityAlerts()

```javascript
app.checkProximityAlerts()
```

Checks if user is within alert radius of any reports.

**Parameters:** None

**Returns:** void

**Side Effects:**
- Calculates distance to all reports
- Shows alert if within radius
- Plays sound and vibration (if supported)
- Adds report ID to activeAlerts

**Algorithm:** Uses Haversine formula for distance calculation

---

#### confirmReport(reportId)

```javascript
app.confirmReport('550e8400-e29b-41d4-a716-446655440000')
```

Confirms an existing report, increasing its credibility.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| reportId | String | Yes | UUID of report to confirm |

**Returns:** Boolean - True if successful, false if report not found

**Side Effects:**
- Increments report.confirmations
- Updates marker color/size
- Saves to localStorage
- Syncs to backend

---

#### markAsCleaned(reportId)

```javascript
app.markAsCleaned('550e8400-e29b-41d4-a716-446655440000')
```

Marks a report as cleaned, removing it from active alerts.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| reportId | String | Yes | UUID of report to mark cleaned |

**Returns:** Boolean - True if successful, false if report not found

**Side Effects:**
- Sets report.status to 'cleaned'
- Removes from map
- Removes from activeAlerts
- Saves to localStorage
- Syncs to backend

---

#### updateSettings(settings)

```javascript
app.updateSettings({
    alertRadius: 100,
    notificationsEnabled: true
})
```

Updates application settings.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| settings.alertRadius | Number | No | Alert radius in meters |
| settings.notificationsEnabled | Boolean | No | Enable/disable notifications |
| settings.municipality | Object | No | Municipality contact info |

**Returns:** void

**Side Effects:**
- Updates app properties
- Saves to localStorage
- Rechecks proximity alerts if radius changed

---

#### saveReports()

```javascript
app.saveReports()
```

Saves all reports to localStorage.

**Parameters:** None

**Returns:** void

**Storage Key:** `poopReports`

---

#### loadReports()

```javascript
app.loadReports()
```

Loads reports from localStorage.

**Parameters:** None

**Returns:** Array - Loaded reports

**Side Effects:**
- Populates `poopReports` array
- Adds markers to map

---

## BackendSync

Handles cross-device data synchronization.

### Constructor

```javascript
const sync = new BackendSync(poolerApp);
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| poolerApp | PoolerApp | Yes | Reference to main app instance |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `poolerApp` | PoolerApp | Reference to main app |
| `syncEnabled` | Boolean | Whether sync is active |
| `syncMethod` | String | `github-gist`, `jsonbin`, or `custom` |
| `syncInterval` | Number | Interval timer ID |
| `lastSyncTime` | Number | Timestamp of last sync |

### Methods

#### initializeSync()

```javascript
await sync.initializeSync()
```

Initializes sync based on configured method.

**Parameters:** None

**Returns:** Promise<void>

**Throws:** Error if initialization fails

**Side Effects:**
- Establishes connection to backend
- Starts periodic sync (every 30 seconds)
- Downloads existing reports

---

#### setupGitHubGistSync(token, gistId)

```javascript
await sync.setupGitHubGistSync('ghp_xxxxxxxxxxxx', 'abc123...')
```

Configures GitHub Gist as sync backend.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | String | Yes | GitHub Personal Access Token with `gist` scope |
| gistId | String | No | Existing gist ID (creates new if omitted) |

**Returns:** Promise<Object> - Gist configuration `{gistId, token}`

**Side Effects:**
- Saves config to localStorage
- Creates gist if gistId not provided
- Starts sync

**Example:**

```javascript
const config = await sync.setupGitHubGistSync('ghp_abc123...');
console.log('Syncing to gist:', config.gistId);
```

---

#### setupJSONBinSync(apiKey, binId)

```javascript
await sync.setupJSONBinSync('$2a$10...', '60f7b...')
```

Configures JSONBin.io as sync backend.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| apiKey | String | Yes | JSONBin.io API key |
| binId | String | No | Existing bin ID (creates new if omitted) |

**Returns:** Promise<Object> - Bin configuration `{binId, apiKey}`

---

#### setupCustomBackend(apiUrl, authToken)

```javascript
await sync.setupCustomBackend('https://api.example.com/pooler', 'Bearer xyz...')
```

Configures custom backend API.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| apiUrl | String | Yes | Backend API base URL |
| authToken | String | No | Authorization token |

**Returns:** Promise<Object> - Backend configuration

**Expected Endpoints:**
- `GET {apiUrl}/reports` - Fetch reports
- `POST {apiUrl}/reports` - Create report
- `PUT {apiUrl}/reports/:id` - Update report
- `DELETE {apiUrl}/reports/:id` - Delete report

---

#### uploadReports()

```javascript
await sync.uploadReports()
```

Uploads local reports to backend.

**Parameters:** None

**Returns:** Promise<void>

**Side Effects:**
- Merges local reports with remote
- Updates lastSyncTime
- Shows sync status in UI

---

#### downloadReports()

```javascript
const reports = await sync.downloadReports()
```

Downloads reports from backend.

**Parameters:** None

**Returns:** Promise<Array> - Array of report objects

**Side Effects:**
- Merges remote reports with local
- Updates map markers
- Deduplicates based on ID

---

#### disableSync()

```javascript
sync.disableSync()
```

Disables sync and clears configuration.

**Parameters:** None

**Returns:** void

**Side Effects:**
- Stops periodic sync
- Clears sync config from localStorage
- Sets syncEnabled to false

---

## MapsIntegration

Abstraction layer for map providers.

### Constructor

```javascript
const maps = new MapsIntegration(poolerApp);
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| poolerApp | PoolerApp | Yes | Reference to main app instance |

### Methods

#### switchToGoogleMaps(apiKey)

```javascript
await maps.switchToGoogleMaps('AIzaSy...')
```

Switches from OpenStreetMap to Google Maps.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| apiKey | String | Yes | Google Maps API key |

**Returns:** Promise<void>

**Side Effects:**
- Loads Google Maps JavaScript API
- Recreates map with Google tiles
- Migrates all markers to new map

---

#### getDirections(destination)

```javascript
const directions = await maps.getDirections({
    lat: 40.7128,
    lng: -74.0060
})
```

Gets directions to a location (avoiding poop reports).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| destination | Object | Yes | `{lat, lng}` coordinates |

**Returns:** Promise<Object> - Directions object

**Note:** Only available with Google Maps

---

## SensorIntegration

Framework for advanced detection capabilities.

### Constructor

```javascript
const sensors = new SensorIntegration(poolerApp);
```

### Methods

#### initializeSensors()

```javascript
await sensors.initializeSensors()
```

Initializes all available sensors.

**Parameters:** None

**Returns:** Promise<Array> - Array of initialized sensor names

**Side Effects:**
- Requests sensor permissions
- Initializes accelerometer, gyroscope, etc.
- Logs unsupported sensors

---

#### initARMode()

```javascript
const supported = await sensors.initARMode()
```

Enables AR mode for smart glasses.

**Parameters:** None

**Returns:** Promise<Boolean> - True if AR supported

**Side Effects:**
- Requests XR permission
- Starts AR session
- Overlays poop markers in view

**Supported Devices:**
- Apple Vision Pro
- Meta Quest 3
- HoloLens 2

---

#### initHyperspectralDetection()

```javascript
await sensors.initHyperspectralDetection()
```

Enables camera-based poop detection (experimental).

**Parameters:** None

**Returns:** Promise<void>

**Side Effects:**
- Requests camera permission
- Starts video stream
- Analyzes frames for poop signatures

**Note:** Accuracy varies, experimental feature

---

#### connectWearable()

```javascript
const device = await sensors.connectWearable()
```

Connects to wearable device via Bluetooth.

**Parameters:** None

**Returns:** Promise<BluetoothDevice> - Connected device

**Side Effects:**
- Shows Bluetooth pairing dialog
- Establishes connection
- Enables quick reporting from wearable

**Supported Devices:**
- Apple Watch
- Wear OS devices
- Fitness trackers with Bluetooth

---

## Data Models

### Report Object

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  lat: 40.7128,
  lng: -74.0060,
  severity: "medium",
  locationType: "sidewalk",
  notes: "Near the oak tree",
  notifyMunicipality: true,
  timestamp: "2025-12-24T09:00:00.000Z",
  reportedBy: "anonymous-a1b2c3",
  status: "active",
  confirmations: 0,
  cleanupRequested: false
}
```

**Field Descriptions:**

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| id | String | UUID v4 | Unique identifier |
| lat | Number | -90 to 90 | Latitude |
| lng | Number | -180 to 180 | Longitude |
| severity | String | low, medium, high, hazard | Urgency level |
| locationType | String | sidewalk, park, street, other | Location category |
| notes | String | Any text | Optional description |
| notifyMunicipality | Boolean | true/false | Send to authorities |
| timestamp | String | ISO 8601 | Report creation time |
| reportedBy | String | anonymous-* | Anonymous user ID |
| status | String | active, cleaned, disputed | Current status |
| confirmations | Number | 0+ | Number of confirmations |
| cleanupRequested | Boolean | true/false | Cleanup notification sent |

### User Settings Object

```javascript
{
  alertRadius: 50,
  notificationsEnabled: true,
  municipality: {
    name: "City of Example",
    email: "public.works@example.gov",
    phone: "+1-555-0100"
  }
}
```

### Sync Configuration Object

```javascript
{
  method: "github-gist",
  gistId: "abc123...",
  token: "ghp_...",
  syncInterval: 30000,
  lastSync: 1703419200000
}
```

## Error Handling

### Common Errors

```javascript
// Location permission denied
{
  code: 1,
  message: "User denied geolocation"
}

// Network error during sync
{
  code: "NETWORK_ERROR",
  message: "Failed to connect to backend"
}

// Invalid API credentials
{
  code: "AUTH_ERROR",
  message: "Invalid API key or token"
}

// Sensor not supported
{
  code: "NOT_SUPPORTED",
  message: "Generic Sensor API not available"
}
```

## Events

Pooler uses custom events for loose coupling:

```javascript
// Listen for new reports
document.addEventListener('pooler:reportAdded', (event) => {
  console.log('New report:', event.detail.report);
});

// Listen for proximity alerts
document.addEventListener('pooler:proximityAlert', (event) => {
  console.log('Near poop:', event.detail.distance, 'meters');
});

// Listen for sync status
document.addEventListener('pooler:syncComplete', (event) => {
  console.log('Synced', event.detail.reportCount, 'reports');
});
```

## Rate Limits

### GitHub Gist API
- **Authenticated:** 5,000 requests/hour
- **Unauthenticated:** 60 requests/hour

### JSONBin.io
- **Free Tier:** 10,000 requests/month
- **Pro Tier:** Unlimited

### Custom Backend
- Depends on your implementation

## Best Practices

1. **Always check for null/undefined before accessing properties**
   ```javascript
   if (app.userLocation) {
     console.log(app.userLocation.lat);
   }
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
     await sync.uploadReports();
   } catch (error) {
     console.error('Sync failed:', error);
     // Continue without sync
   }
   ```

3. **Validate coordinates**
   ```javascript
   function isValidCoordinate(lat, lng) {
     return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
   }
   ```

4. **Debounce frequent operations**
   ```javascript
   const debouncedCheck = debounce(() => {
     app.checkProximityAlerts();
   }, 1000);
   ```

5. **Clean up listeners**
   ```javascript
   if (app.watchId) {
     navigator.geolocation.clearWatch(app.watchId);
   }
   ```

## Examples

### Complete Usage Example

```javascript
// Initialize app
const app = new PoolerApp();

// Wait for location
app.on('locationReady', async () => {
  // Set up sync
  const sync = new BackendSync(app);
  await sync.setupGitHubGistSync('ghp_your_token');

  // Add a report
  const report = app.addPoopReport({
    lat: app.userLocation.lat,
    lng: app.userLocation.lng,
    severity: 'medium',
    locationType: 'sidewalk',
    notifyMunicipality: true
  });

  console.log('Report created:', report.id);

  // Enable AR mode (if supported)
  const sensors = new SensorIntegration(app);
  const arSupported = await sensors.initARMode();
  if (arSupported) {
    console.log('AR mode active!');
  }
});
```

---

**For more information, see:**
- [Architecture Documentation](ARCHITECTURE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [User Guide](POOLER_README.md)
