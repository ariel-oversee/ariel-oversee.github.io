// Pooler Backend Sync Module
// Enables cross-device data synchronization

class BackendSync {
    constructor(poolerApp) {
        this.poolerApp = poolerApp;
        this.syncEnabled = false;
        this.syncMethod = null; // 'firebase', 'supabase', 'custom', or 'github-gist'
        this.syncInterval = null;
        this.lastSyncTime = 0;

        // Load sync configuration
        this.loadSyncConfig();

        // Auto-initialize if configured
        if (this.syncMethod) {
            this.initializeSync();
        }
    }

    loadSyncConfig() {
        const config = JSON.parse(localStorage.getItem('poolerSyncConfig') || '{}');
        this.syncMethod = config.method || null;
        this.syncConfig = config;
    }

    saveSyncConfig(method, config) {
        const syncConfig = {
            method: method,
            ...config
        };
        localStorage.setItem('poolerSyncConfig', JSON.stringify(syncConfig));
        this.syncMethod = method;
        this.syncConfig = syncConfig;
    }

    // Initialize sync based on configured method
    async initializeSync() {
        console.log(`[Sync] Initializing ${this.syncMethod} sync...`);

        try {
            switch (this.syncMethod) {
                case 'firebase':
                    await this.initFirebaseSync();
                    break;
                case 'github-gist':
                    await this.initGitHubGistSync();
                    break;
                case 'custom':
                    await this.initCustomSync();
                    break;
                case 'simple':
                    await this.initSimpleSync();
                    break;
                default:
                    console.log('[Sync] No sync method configured');
                    return false;
            }

            this.syncEnabled = true;
            this.startAutoSync();
            console.log('[Sync] Sync initialized successfully');
            return true;

        } catch (error) {
            console.error('[Sync] Failed to initialize:', error);
            this.showSyncError(error.message);
            return false;
        }
    }

    // Simple sync using a public JSON API (easiest for testing)
    async initSimpleSync() {
        // Use JSONBin.io or similar free JSON storage
        // For now, we'll simulate with a shared namespace
        this.syncEndpoint = this.syncConfig.endpoint || 'https://api.jsonbin.io/v3/b/';
        this.syncKey = this.syncConfig.key;

        if (!this.syncKey) {
            throw new Error('JSONBin API key required. Get one free at jsonbin.io');
        }

        console.log('[Sync] Simple sync configured');
    }

    // GitHub Gist as database (free, no signup needed if you have GitHub)
    async initGitHubGistSync() {
        this.gistId = this.syncConfig.gistId;
        this.githubToken = this.syncConfig.githubToken;

        if (!this.gistId) {
            // Create a new gist for this Pooler instance
            if (this.githubToken) {
                await this.createGist();
            } else {
                throw new Error('GitHub token required to create sync storage');
            }
        }

        console.log('[Sync] GitHub Gist sync configured:', this.gistId);
    }

    async createGist() {
        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Pooler - Community Poop Reports Database',
                public: false,
                files: {
                    'pooler-reports.json': {
                        content: JSON.stringify({ reports: [], lastUpdate: Date.now() })
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create GitHub Gist');
        }

        const data = await response.json();
        this.gistId = data.id;

        // Save gist ID to config
        this.syncConfig.gistId = this.gistId;
        this.saveSyncConfig('github-gist', this.syncConfig);

        console.log('[Sync] Created new Gist:', this.gistId);
    }

    // Firebase Realtime Database (popular choice)
    async initFirebaseSync() {
        // Dynamically load Firebase SDK
        if (!window.firebase) {
            await this.loadFirebaseSDK();
        }

        const firebaseConfig = this.syncConfig.firebase;
        if (!firebaseConfig) {
            throw new Error('Firebase configuration required');
        }

        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.database = firebase.database();
        this.reportsRef = this.database.ref('pooler-reports');

        // Listen for real-time updates
        this.reportsRef.on('value', (snapshot) => {
            this.handleReportUpdate(snapshot.val());
        });

        console.log('[Sync] Firebase sync configured');
    }

    async loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
            script.onload = () => {
                const dbScript = document.createElement('script');
                dbScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
                dbScript.onload = resolve;
                dbScript.onerror = reject;
                document.head.appendChild(dbScript);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Custom backend API
    async initCustomSync() {
        this.apiEndpoint = this.syncConfig.apiEndpoint;
        this.apiKey = this.syncConfig.apiKey;

        if (!this.apiEndpoint) {
            throw new Error('Custom API endpoint required');
        }

        console.log('[Sync] Custom backend configured:', this.apiEndpoint);
    }

    // Upload local reports to backend
    async uploadReports() {
        if (!this.syncEnabled) return;

        console.log('[Sync] Uploading local reports...');

        const reports = this.poolerApp.poopReports;

        try {
            switch (this.syncMethod) {
                case 'simple':
                    await this.uploadToJSONBin(reports);
                    break;
                case 'github-gist':
                    await this.uploadToGist(reports);
                    break;
                case 'firebase':
                    await this.uploadToFirebase(reports);
                    break;
                case 'custom':
                    await this.uploadToCustomAPI(reports);
                    break;
            }

            this.lastSyncTime = Date.now();
            console.log('[Sync] Upload successful');

        } catch (error) {
            console.error('[Sync] Upload failed:', error);
        }
    }

    // Download reports from backend
    async downloadReports() {
        if (!this.syncEnabled) return;

        console.log('[Sync] Downloading reports...');

        try {
            let reports;

            switch (this.syncMethod) {
                case 'simple':
                    reports = await this.downloadFromJSONBin();
                    break;
                case 'github-gist':
                    reports = await this.downloadFromGist();
                    break;
                case 'firebase':
                    // Firebase uses real-time listeners, no need to poll
                    return;
                case 'custom':
                    reports = await this.downloadFromCustomAPI();
                    break;
            }

            if (reports && reports.length > 0) {
                this.mergeReports(reports);
            }

            this.lastSyncTime = Date.now();
            console.log('[Sync] Download successful:', reports.length, 'reports');

        } catch (error) {
            console.error('[Sync] Download failed:', error);
        }
    }

    // JSONBin.io methods
    async uploadToJSONBin(reports) {
        const response = await fetch(this.syncEndpoint + this.syncKey, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': this.syncConfig.masterKey
            },
            body: JSON.stringify({
                reports: reports,
                lastUpdate: Date.now()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to upload to JSONBin');
        }
    }

    async downloadFromJSONBin() {
        const response = await fetch(this.syncEndpoint + this.syncKey + '/latest', {
            headers: {
                'X-Master-Key': this.syncConfig.masterKey
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download from JSONBin');
        }

        const data = await response.json();
        return data.record.reports || [];
    }

    // GitHub Gist methods
    async uploadToGist(reports) {
        const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'pooler-reports.json': {
                        content: JSON.stringify({
                            reports: reports,
                            lastUpdate: Date.now()
                        }, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to upload to Gist');
        }
    }

    async downloadFromGist() {
        const response = await fetch(`https://api.github.com/gists/${this.gistId}`);

        if (!response.ok) {
            throw new Error('Failed to download from Gist');
        }

        const data = await response.json();
        const content = data.files['pooler-reports.json'].content;
        const parsed = JSON.parse(content);

        return parsed.reports || [];
    }

    // Firebase methods
    async uploadToFirebase(reports) {
        // Upload each report with its ID as key
        const updates = {};
        reports.forEach(report => {
            updates[report.id] = report;
        });

        await this.reportsRef.update(updates);
    }

    handleReportUpdate(data) {
        if (!data) return;

        const reports = Object.values(data);
        this.mergeReports(reports);
    }

    // Custom API methods
    async uploadToCustomAPI(reports) {
        const response = await fetch(`${this.apiEndpoint}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ reports })
        });

        if (!response.ok) {
            throw new Error('Failed to upload to custom API');
        }
    }

    async downloadFromCustomAPI() {
        const response = await fetch(`${this.apiEndpoint}/reports`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download from custom API');
        }

        const data = await response.json();
        return data.reports || [];
    }

    // Merge remote reports with local reports
    mergeReports(remoteReports) {
        const localReports = this.poolerApp.poopReports;
        const localIds = new Set(localReports.map(r => r.id));

        let newReports = 0;

        remoteReports.forEach(remoteReport => {
            if (!localIds.has(remoteReport.id)) {
                // New report from another user
                this.poolerApp.poopReports.push(remoteReport);

                if (remoteReport.status === 'active') {
                    this.poolerApp.addPoopMarker(remoteReport);
                }

                newReports++;
            } else {
                // Update existing report if remote is newer
                const localReport = localReports.find(r => r.id === remoteReport.id);
                if (new Date(remoteReport.timestamp) > new Date(localReport.timestamp)) {
                    Object.assign(localReport, remoteReport);
                    this.poolerApp.updateMarkerPopup(remoteReport.id);
                }
            }
        });

        if (newReports > 0) {
            console.log(`[Sync] Added ${newReports} new reports`);
            this.poolerApp.updateStats();
            this.poolerApp.saveReports();

            // Show notification
            this.showSyncNotification(`📥 ${newReports} new poop alert${newReports > 1 ? 's' : ''} nearby!`);
        }
    }

    // Start automatic sync every 30 seconds
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Initial sync
        this.downloadReports();

        // Periodic sync
        this.syncInterval = setInterval(() => {
            this.downloadReports();
        }, 30000); // 30 seconds

        console.log('[Sync] Auto-sync started (30s interval)');
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('[Sync] Auto-sync stopped');
    }

    // When user creates a new report, upload immediately
    async syncNewReport(report) {
        if (!this.syncEnabled) return;

        try {
            // Add to remote immediately
            await this.uploadReports();
            console.log('[Sync] New report synced:', report.id);
        } catch (error) {
            console.error('[Sync] Failed to sync new report:', error);
        }
    }

    showSyncNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #2196F3;
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showSyncError(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
        `;
        notification.textContent = '⚠️ Sync error: ' + message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }

    // Setup wizard for easy configuration
    async setupWizard() {
        const method = prompt(
            '🔄 Choose Sync Method:\n\n' +
            '1. GitHub Gist (Free, requires GitHub account)\n' +
            '2. JSONBin.io (Free, requires API key from jsonbin.io)\n' +
            '3. Custom API (Your own backend)\n' +
            '4. Skip (local only)\n\n' +
            'Enter 1, 2, 3, or 4:'
        );

        switch (method) {
            case '1':
                await this.setupGitHubSync();
                break;
            case '2':
                await this.setupJSONBinSync();
                break;
            case '3':
                await this.setupCustomSync();
                break;
            default:
                alert('Sync disabled. Reports will only be stored locally.');
                return false;
        }

        return true;
    }

    async setupGitHubSync() {
        const token = prompt(
            '🔑 GitHub Personal Access Token:\n\n' +
            '1. Go to: github.com/settings/tokens\n' +
            '2. Generate new token (classic)\n' +
            '3. Select "gist" scope\n' +
            '4. Paste token below:'
        );

        if (!token) {
            alert('Setup cancelled');
            return false;
        }

        this.saveSyncConfig('github-gist', {
            githubToken: token
        });

        await this.initializeSync();
        alert('✅ GitHub Gist sync enabled! Your reports will now sync across devices.');
        return true;
    }

    async setupJSONBinSync() {
        alert(
            '📝 JSONBin.io Setup:\n\n' +
            '1. Go to: jsonbin.io\n' +
            '2. Sign up (free)\n' +
            '3. Create a new bin\n' +
            '4. Copy the Bin ID and API Key'
        );

        const binId = prompt('Enter your Bin ID:');
        const apiKey = prompt('Enter your API Key (X-Master-Key):');

        if (!binId || !apiKey) {
            alert('Setup cancelled');
            return false;
        }

        this.saveSyncConfig('simple', {
            key: binId,
            masterKey: apiKey
        });

        await this.initializeSync();
        alert('✅ JSONBin sync enabled! Your reports will now sync across devices.');
        return true;
    }

    async setupCustomSync() {
        const endpoint = prompt('Enter your API endpoint URL:');
        const apiKey = prompt('Enter your API key (optional):');

        if (!endpoint) {
            alert('Setup cancelled');
            return false;
        }

        this.saveSyncConfig('custom', {
            apiEndpoint: endpoint,
            apiKey: apiKey
        });

        await this.initializeSync();
        alert('✅ Custom sync enabled!');
        return true;
    }

    getSyncStatus() {
        if (!this.syncEnabled) {
            return '❌ Sync disabled (local only)';
        }

        const timeSince = Date.now() - this.lastSyncTime;
        const secondsAgo = Math.floor(timeSince / 1000);

        return `✅ Synced ${secondsAgo}s ago via ${this.syncMethod}`;
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackendSync;
}
