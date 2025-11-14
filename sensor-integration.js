// Sensor and AR Integration Framework for Pooler
// Supports wearable sensors, AR glasses, and hyperspectral detection

class SensorIntegration {
    constructor(poolerApp) {
        this.poolerApp = poolerApp;
        this.sensors = {
            accelerometer: null,
            gyroscope: null,
            magnetometer: null,
            ambientLight: null
        };
        this.arEnabled = false;
        this.cameraStream = null;
        this.detectionModel = null;
    }

    // Initialize available sensors
    async initializeSensors() {
        console.log('[Sensors] Initializing device sensors...');

        // Check for Generic Sensor API support
        if ('Accelerometer' in window) {
            await this.initAccelerometer();
        }

        if ('Gyroscope' in window) {
            await this.initGyroscope();
        }

        if ('Magnetometer' in window) {
            await this.initMagnetometer();
        }

        if ('AmbientLightSensor' in window) {
            await this.initAmbientLight();
        }

        // Check for motion sensors (iOS/Android)
        if (window.DeviceMotionEvent) {
            this.initDeviceMotion();
        }

        // Check for orientation sensors
        if (window.DeviceOrientationEvent) {
            this.initDeviceOrientation();
        }

        console.log('[Sensors] Sensor initialization complete');
    }

    async initAccelerometer() {
        try {
            const sensor = new Accelerometer({ frequency: 60 });
            sensor.addEventListener('reading', () => {
                // Detect sudden stops (potential poop spotting moment)
                const magnitude = Math.sqrt(
                    sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2
                );

                // If user suddenly stopped walking (magnitude drop)
                if (this.detectSuddenStop(magnitude)) {
                    this.triggerPoopDetectionMode();
                }
            });
            sensor.start();
            this.sensors.accelerometer = sensor;
            console.log('[Sensors] Accelerometer initialized');
        } catch (error) {
            console.log('[Sensors] Accelerometer not available:', error.message);
        }
    }

    async initGyroscope() {
        try {
            const sensor = new Gyroscope({ frequency: 60 });
            sensor.addEventListener('reading', () => {
                // Detect head movement patterns that might indicate looking down at poop
                // (useful for AR glasses integration)
            });
            sensor.start();
            this.sensors.gyroscope = sensor;
            console.log('[Sensors] Gyroscope initialized');
        } catch (error) {
            console.log('[Sensors] Gyroscope not available:', error.message);
        }
    }

    async initMagnetometer() {
        try {
            const sensor = new Magnetometer({ frequency: 10 });
            sensor.start();
            this.sensors.magnetometer = sensor;
            console.log('[Sensors] Magnetometer initialized');
        } catch (error) {
            console.log('[Sensors] Magnetometer not available:', error.message);
        }
    }

    async initAmbientLight() {
        try {
            const sensor = new AmbientLightSensor({ frequency: 1 });
            sensor.addEventListener('reading', () => {
                // Adjust detection sensitivity based on lighting conditions
                this.adjustDetectionSensitivity(sensor.illuminance);
            });
            sensor.start();
            this.sensors.ambientLight = sensor;
            console.log('[Sensors] Ambient light sensor initialized');
        } catch (error) {
            console.log('[Sensors] Ambient light sensor not available:', error.message);
        }
    }

    initDeviceMotion() {
        window.addEventListener('devicemotion', (event) => {
            // Use device motion for step detection and movement patterns
            const acceleration = event.accelerationIncludingGravity;
            if (acceleration) {
                // Detect walking pattern
                this.analyzeWalkingPattern(acceleration);
            }
        });
        console.log('[Sensors] Device motion initialized');
    }

    initDeviceOrientation() {
        window.addEventListener('deviceorientation', (event) => {
            // Use orientation for AR compass and direction
            const heading = event.alpha; // 0-360 degrees
            const tilt = event.beta;     // -180 to 180 degrees
            const roll = event.gamma;    // -90 to 90 degrees

            // Update AR overlay if active
            if (this.arEnabled) {
                this.updateAROrientation(heading, tilt, roll);
            }
        });
        console.log('[Sensors] Device orientation initialized');
    }

    // Hyperspectral detection simulation
    async initHyperspectralDetection() {
        console.log('[Sensors] Initializing hyperspectral detection...');

        // Request camera access
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            // In a real implementation, this would use specialized hyperspectral cameras
            // or advanced computer vision models to detect poop based on spectral signatures

            console.log('[Sensors] Camera access granted for detection');
            this.startVisualDetection();

        } catch (error) {
            console.log('[Sensors] Camera access denied:', error.message);
        }
    }

    async startVisualDetection() {
        console.log('[Sensors] Starting visual detection...');

        // Create video element for processing
        const video = document.createElement('video');
        video.srcObject = this.cameraStream;
        video.play();

        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Process frames
        const processFrame = () => {
            if (!this.cameraStream) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Analyze for poop-like patterns
            if (this.detectPoopInFrame(imageData)) {
                this.handlePoopDetected();
            }

            requestAnimationFrame(processFrame);
        };

        video.addEventListener('playing', () => {
            processFrame();
        });
    }

    detectPoopInFrame(imageData) {
        // Simplified detection based on color analysis
        // In a real implementation, this would use ML models like TensorFlow.js
        // to detect poop based on shape, color, and texture

        const data = imageData.data;
        let brownPixels = 0;

        // Look for brown-ish colors (simplified detection)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect brown-ish colors (poop-like)
            if (r > 80 && r < 160 && g > 50 && g < 120 && b > 20 && b < 80) {
                brownPixels++;
            }
        }

        const brownPercentage = (brownPixels / (data.length / 4)) * 100;

        // If more than 2% of pixels are brown, potential poop detection
        return brownPercentage > 2;
    }

    // AR Integration for AR Glasses (Apple Vision Pro, Meta Quest, etc.)
    async initARMode() {
        console.log('[AR] Initializing AR mode...');

        // Check for WebXR support
        if (!navigator.xr) {
            console.log('[AR] WebXR not supported');
            return false;
        }

        try {
            const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');

            if (isARSupported) {
                this.arEnabled = true;
                console.log('[AR] AR mode supported and enabled');
                await this.startARSession();
                return true;
            } else {
                console.log('[AR] AR mode not supported on this device');
                return false;
            }
        } catch (error) {
            console.log('[AR] AR initialization error:', error.message);
            return false;
        }
    }

    async startARSession() {
        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local', 'hit-test']
            });

            console.log('[AR] AR session started');

            // Set up AR rendering loop
            session.requestAnimationFrame(this.onARFrame.bind(this));

            // Store session
            this.arSession = session;

        } catch (error) {
            console.log('[AR] Failed to start AR session:', error.message);
        }
    }

    onARFrame(time, frame) {
        // AR frame processing
        // Overlay poop markers in AR space

        const session = frame.session;
        session.requestAnimationFrame(this.onARFrame.bind(this));

        // Get viewer pose
        const pose = frame.getViewerPose(this.arReferenceSpace);

        if (pose) {
            // Render AR overlays for nearby poop reports
            this.renderAROverlays(pose);
        }
    }

    renderAROverlays(pose) {
        // Render poop warning overlays in AR space
        const nearbyReports = this.poolerApp.poopReports.filter(report => {
            if (report.status !== 'active') return false;

            const distance = this.poolerApp.calculateDistance(
                this.poolerApp.userLocation.lat,
                this.poolerApp.userLocation.lng,
                report.lat,
                report.lng
            );

            return distance <= 100; // Within 100 meters
        });

        // In a real AR implementation, this would render 3D overlays
        // showing poop locations in the user's field of view
        console.log(`[AR] Rendering ${nearbyReports.length} AR overlays`);
    }

    // AI/ML Model Integration for Dog Detection
    async loadPoopDetectionModel() {
        console.log('[ML] Loading poop detection model...');

        // In a real implementation, this would load a TensorFlow.js or ONNX model
        // trained to detect dogs pooping and poop on the ground

        // Simulated model loading
        return new Promise((resolve) => {
            setTimeout(() => {
                this.detectionModel = {
                    loaded: true,
                    version: '1.0.0',
                    accuracy: 0.85
                };
                console.log('[ML] Detection model loaded');
                resolve(this.detectionModel);
            }, 1000);
        });
    }

    // Smart Watch Integration (Apple Watch, Wear OS)
    async connectWearable() {
        console.log('[Wearable] Attempting to connect to wearable device...');

        // Check for Web Bluetooth API
        if (!navigator.bluetooth) {
            console.log('[Wearable] Web Bluetooth not supported');
            return false;
        }

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['heart_rate', 'battery_service']
            });

            console.log('[Wearable] Connected to:', device.name);

            // Listen for wearable button presses to quickly report poop
            device.addEventListener('gattserverdisconnected', () => {
                console.log('[Wearable] Disconnected');
            });

            return true;

        } catch (error) {
            console.log('[Wearable] Failed to connect:', error.message);
            return false;
        }
    }

    // Haptic feedback for proximity alerts
    triggerHapticAlert(intensity = 'medium') {
        if (!navigator.vibrate) return;

        const patterns = {
            light: [100],
            medium: [200, 100, 200],
            strong: [300, 100, 300, 100, 300]
        };

        navigator.vibrate(patterns[intensity] || patterns.medium);
    }

    // Utility methods
    detectSuddenStop(magnitude) {
        // Implementation for detecting sudden stops
        return false; // Placeholder
    }

    triggerPoopDetectionMode() {
        console.log('[Sensors] Sudden stop detected - activating detection mode');
        // Could trigger camera or prompt user to report
    }

    adjustDetectionSensitivity(illuminance) {
        // Adjust detection thresholds based on lighting
        console.log(`[Sensors] Adjusting sensitivity for ${illuminance} lux`);
    }

    analyzeWalkingPattern(acceleration) {
        // Analyze walking patterns to predict when user might encounter poop
    }

    updateAROrientation(heading, tilt, roll) {
        // Update AR overlay orientation
    }

    handlePoopDetected() {
        console.log('[Detection] ⚠️ POOP DETECTED IN VIEW!');

        // Trigger haptic feedback
        this.triggerHapticAlert('strong');

        // Show alert
        const alertPanel = document.getElementById('alertPanel');
        if (alertPanel) {
            document.getElementById('alertMessage').textContent = '⚠️ POOP DETECTED IN YOUR PATH!';
            alertPanel.classList.add('active', 'danger');
        }

        // Automatically suggest reporting
        if (confirm('💩 Poop detected by camera! Would you like to report it?')) {
            this.poolerApp.openReportModal();
        }
    }

    // Clean up
    stopAllSensors() {
        Object.values(this.sensors).forEach(sensor => {
            if (sensor) {
                try {
                    sensor.stop();
                } catch (e) {
                    console.log('Error stopping sensor:', e);
                }
            }
        });

        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }

        if (this.arSession) {
            this.arSession.end();
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SensorIntegration;
}
