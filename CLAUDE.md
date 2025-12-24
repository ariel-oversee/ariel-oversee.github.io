# Claude AI Assistant Instructions

This file contains repository-specific instructions for AI assistants (like Claude) working with the Pooler codebase.

## Repository Overview

**Project Name:** Pooler - Community Poop Alert System
**Type:** Progressive Web App (PWA)
**Tech Stack:** Vanilla JavaScript, HTML5, CSS3, Leaflet.js
**Deployment:** GitHub Pages
**Primary File:** index.html

## Project Purpose

Pooler is a community-driven poop detection and alert system - essentially "Waze for Poop". It helps users:
- Report dog poop locations
- Receive proximity alerts
- Contribute to cleaner communities
- Notify municipalities for cleanup

## Architecture Overview

### Core Components

1. **app.js** - Main application logic (PoolerApp class)
   - Manages map, reports, alerts, and user tracking
   - Central coordinator for all subsystems

2. **backend-sync.js** - Cross-device synchronization (BackendSync class)
   - Supports GitHub Gist, JSONBin.io, and custom backends
   - Handles data sync every 30 seconds

3. **maps-integration.js** - Map provider abstraction (MapsIntegration class)
   - Supports OpenStreetMap (default) and Google Maps
   - Handles directions and marker management

4. **sensor-integration.js** - Advanced detection framework (SensorIntegration class)
   - AR glasses support (WebXR)
   - Wearable device integration
   - Camera-based detection (experimental)

5. **service-worker.js** - PWA functionality
   - Offline support
   - Asset caching
   - Background sync

### Data Storage

- **Primary:** localStorage (client-side only)
- **Sync:** Optional backend (GitHub Gist, JSONBin.io, or custom)
- **Future:** IndexedDB for larger datasets

### Key Technologies

- Leaflet.js for OpenStreetMap integration
- Geolocation API for tracking
- Service Workers for PWA
- Generic Sensor API, WebXR, Web Bluetooth (optional advanced features)

## Development Guidelines

### Code Style

- **Language:** Vanilla JavaScript (ES6+)
- **Naming:** PascalCase for classes, camelCase for functions/variables
- **Structure:** Class-based architecture
- **Comments:** Explain WHY, not WHAT
- **Line Length:** Aim for <100 characters

### Important Conventions

1. **No Build Process** - Direct browser execution, no transpilation
2. **No Dependencies** - Except Leaflet.js (CDN)
3. **Progressive Enhancement** - Graceful degradation for unsupported features
4. **Offline First** - Must work without internet after initial load

### File Modification Guidelines

When modifying code:

1. **Read Before Writing** - Always read the full file first
2. **Preserve Structure** - Maintain existing class structure and patterns
3. **Test All Paths** - Consider both success and error cases
4. **Browser Compatibility** - Test in Chrome, Firefox, Safari
5. **Mobile First** - Ensure mobile responsiveness

### Common Patterns

**Adding a New Report:**
```javascript
addPoopReport(report) {
    // 1. Validate
    if (!report.lat || !report.lng) return;

    // 2. Add to array
    this.poopReports.push(report);

    // 3. Save to storage
    this.saveReports();

    // 4. Add marker to map
    this.addMarkerForReport(report);

    // 5. Sync to backend (if enabled)
    if (this.backendSync?.syncEnabled) {
        this.backendSync.uploadReports();
    }

    // 6. Update UI
    this.updateStats();
}
```

**Proximity Checking:**
```javascript
checkProximityAlerts() {
    if (!this.userLocation) return;

    this.poopReports.forEach(report => {
        const distance = this._calculateDistance(
            this.userLocation.lat,
            this.userLocation.lng,
            report.lat,
            report.lng
        );

        if (distance < this.alertRadius) {
            this.showAlert(report, distance);
        }
    });
}
```

## Testing Instructions

### Manual Testing Checklist

Before committing changes:

1. **Core Functionality**
   - [ ] Map loads successfully
   - [ ] Location tracking works
   - [ ] Reports can be submitted
   - [ ] Proximity alerts trigger
   - [ ] Settings persist

2. **Browser Testing**
   - [ ] Chrome (desktop & mobile)
   - [ ] Firefox
   - [ ] Safari (desktop & iOS)
   - [ ] Edge

3. **Error Handling**
   - [ ] Location permission denied
   - [ ] Offline mode
   - [ ] Invalid inputs
   - [ ] API failures

### Test Locally

```bash
# Start local server
python -m http.server 8000

# Open browser
open http://localhost:8000

# Check console for errors
# Test on mobile using local IP
```

## Common Tasks

### Adding a New Feature

1. **Understand Architecture** - Read ARCHITECTURE.md
2. **Check Existing Code** - Look for similar patterns
3. **Plan Integration** - Consider where it fits
4. **Implement Incrementally** - Small, testable changes
5. **Update Documentation** - Update relevant .md files
6. **Test Thoroughly** - Manual testing in multiple browsers

### Fixing a Bug

1. **Reproduce** - Verify you can reproduce the issue
2. **Locate Source** - Use browser DevTools to find error
3. **Minimal Fix** - Change only what's necessary
4. **Regression Test** - Ensure fix doesn't break other features
5. **Document** - Add comment if the fix is non-obvious

### Refactoring Code

1. **Preserve Behavior** - Ensure functionality stays the same
2. **Extract Gradually** - Move code in small steps
3. **Test After Each Step** - Verify nothing broke
4. **Update Comments** - Reflect new structure
5. **Consider Backwards Compatibility** - Don't break stored data

## File-Specific Notes

### app.js
- Main application entry point
- Contains PoolerApp class (~500 lines)
- Avoid making it longer - extract to new modules instead
- All state management happens here

### backend-sync.js
- Handles async operations
- Always use try/catch for network requests
- Non-blocking initialization (don't block app start)
- Graceful degradation if sync fails

### maps-integration.js
- Provider-agnostic map interface
- Lazy-loaded (not critical for app start)
- Handle both Leaflet and Google Maps APIs

### sensor-integration.js
- Experimental features
- Check for API availability before use
- Fail silently if unsupported
- Log warnings, don't throw errors

### service-worker.js
- Cache strategy: cache-first for assets, network-first for API
- Update cache version when assets change
- Handle offline scenarios gracefully

## Data Format

### Report Object Structure

```javascript
{
  id: "uuid-v4",                    // Unique identifier
  lat: 40.7128,                     // Latitude
  lng: -74.0060,                    // Longitude
  severity: "medium",               // low|medium|high|hazard
  locationType: "sidewalk",         // sidewalk|park|street|other
  notes: "Optional description",    // User notes
  notifyMunicipality: true,         // Boolean
  timestamp: "2025-12-24T09:00:00Z", // ISO 8601
  reportedBy: "anonymous-id",       // Anonymous user ID
  status: "active",                 // active|cleaned|disputed
  confirmations: 0,                 // Confirmation count
  cleanupRequested: false           // Cleanup status
}
```

## API Integration

### GitHub Gist (Recommended)

- **Endpoint:** `https://api.github.com/gists`
- **Auth:** Personal Access Token (PAT) with `gist` scope
- **Rate Limit:** 5000 requests/hour for authenticated users
- **Usage:** Store reports in a private gist as JSON

### JSONBin.io

- **Endpoint:** `https://api.jsonbin.io/v3`
- **Auth:** API key in `X-Master-Key` header
- **Free Tier:** 10,000 requests/month
- **Usage:** Simple JSON storage service

## Security Considerations

### What NOT to Commit

- API keys (except example placeholders)
- Personal access tokens
- Real user data
- Credentials of any kind

### Privacy Best Practices

- Never collect personal information
- Use anonymous user IDs
- Don't track users beyond location for alerts
- Clear about data collection in UI

## Deployment

### GitHub Pages Configuration

- **Branch:** Automatic deployment from `main` branch
- **URL:** https://ariel-oversee.github.io/
- **Build:** None required (static site)
- **Cache:** Service worker handles caching

### Making Changes

1. Test locally first
2. Commit to feature branch
3. Create pull request
4. After merge, auto-deploys to GitHub Pages
5. Verify deployment at live URL

## Debugging Tips

### Enable Debug Mode

```javascript
// In browser console
localStorage.setItem('pooler_debug', 'true');
location.reload();
```

### Check Storage

```javascript
// View all reports
JSON.parse(localStorage.getItem('poopReports'));

// View sync config
JSON.parse(localStorage.getItem('poolerSyncConfig'));

// Clear all data
localStorage.clear();
```

### Mock Location

```javascript
// Override for testing
navigator.geolocation.getCurrentPosition = (success) => {
    success({
        coords: {
            latitude: 40.7128,  // NYC coordinates
            longitude: -74.0060
        }
    });
};
```

## Common Issues & Solutions

### Map Not Loading
- **Cause:** Internet connection required for tiles
- **Solution:** Check network tab, verify tile URLs

### Location Not Working
- **Cause:** Permission denied or insecure context
- **Solution:** Use HTTPS or localhost, check permissions

### Sync Not Working
- **Cause:** Invalid API credentials
- **Solution:** Verify token/API key, check network logs

### Service Worker Issues
- **Cause:** Cached old version
- **Solution:** Application > Clear storage, hard refresh

## Questions to Ask Before Making Changes

1. **Does this fit the project philosophy?** (Simple, client-side, no backend required)
2. **Will this work offline?** (PWA requirement)
3. **Is this mobile-friendly?** (Primary use case)
4. **Does this require new dependencies?** (Avoid if possible)
5. **Is this backwards compatible?** (With stored data)
6. **Have I tested in Safari?** (Often the problematic browser)

## AI Assistant Specific Notes

When working with this codebase:

- **Always read files before editing** - Don't assume structure
- **Test your changes** - Actually run the code locally
- **Be conservative** - Don't over-engineer or add unnecessary features
- **Respect the architecture** - Maintain existing patterns
- **Document your changes** - Update relevant .md files
- **Think mobile-first** - Most users will be on phones
- **Consider offline scenarios** - App must work without connection
- **Preserve user data** - Never break localStorage schema

## Resources

- **User Guide:** POOLER_README.md
- **Architecture:** ARCHITECTURE.md
- **Contributing:** CONTRIBUTING.md
- **Live App:** https://ariel-oversee.github.io/
- **Repository:** https://github.com/ariel-oversee/ariel-oversee.github.io

## Contact

For questions or clarifications:
- Open a GitHub Issue
- Start a GitHub Discussion
- Check existing documentation first

---

**Last Updated:** 2025-12-24
**Version:** 1.0
**Maintainer:** ariel-oversee
