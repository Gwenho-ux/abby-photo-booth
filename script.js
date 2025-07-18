// Photo Booth Application
class PhotoBoothApp {
    constructor() {
        this.webcam = null;
        this.overlayVideo = null;
        this.canvas = null;
        this.ctx = null;
        this.isCapturing = false;
        this.currentPhoto = null;
        this.countdownTimer = null;

        // Video sources - using WebM format
        this.idleVideo = 'overlays/idle.webm';
        this.poseVideos = [
            'overlays/pose1.webm',
            'overlays/pose2.webm'
            // Add more poses here as you create them:
            // 'overlays/pose3.webm',
            // 'overlays/pose4.webm',
            // 'overlays/pose5.webm'
        ];

        // Audio elements
        this.countdownSound = null;
        this.shutterSound = null;
        this.bgMusic = null;

        // Cloud storage removed

        // Initialize the app
        this.init();
    }

    async init() {
        try {
            // Get DOM elements
            this.webcam = document.getElementById('webcam');
            this.overlayVideo = document.getElementById('overlay');
            this.canvas = document.getElementById('captureCanvas');
            this.ctx = this.canvas.getContext('2d');

            // Get audio elements
            this.countdownSound = document.getElementById('countdownSound');
            this.shutterSound = document.getElementById('shutterSound');
            this.bgMusic = document.getElementById('bgMusic');

            // Set up event listeners
            this.setupEventListeners();

            // Cloud storage removed

            // Initialize webcam
            await this.initializeWebcam();

            // Wait a moment for webcam to fully initialize
            setTimeout(() => {
                // Start idle overlay
                this.startIdleOverlay();
            }, 500);

            // Background music disabled for now
            // this.setupBackgroundMusic();

            // Debug: Check overlay video element
            console.log('Overlay video element:', this.overlayVideo);
            console.log('Overlay video src:', this.overlayVideo.src);

            console.log('Photo booth initialized successfully');

            // Try to start idle video again in case it failed during init
            setTimeout(() => {
                if (!this.overlayVideo.src || this.overlayVideo.paused) {
                    console.log('Retrying idle video...');
                    this.startIdleOverlay();
                }
            }, 1000);

        } catch (error) {
            console.error('Error initializing photo booth:', error);
            this.showError('Failed to initialize photo booth. Please check camera permissions.');
        }
    }

    async initializeWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.webcam.srcObject = stream;
            this.webcam.play();

            // Update status only if the method exists
            if (this.updateStatus) {
                this.updateStatus('CAMERA READY', true);
            }

        } catch (error) {
            console.error('Error accessing webcam:', error);
            if (this.updateStatus) {
                this.updateStatus('CAMERA ERROR', false);
            }
            throw error;
        }
    }

    setupEventListeners() {
        // Capture button
        const captureBtn = document.getElementById('captureBtn');
        captureBtn.addEventListener('click', () => this.startCapture());

        // Action buttons
        const newPhotoBtn = document.getElementById('newPhotoBtn');
        newPhotoBtn.addEventListener('click', () => this.startNewPhoto());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isCapturing) {
                e.preventDefault();
                this.startCapture();
            }
        });

        // Handle video ended events
        this.overlayVideo.addEventListener('ended', () => {
            this.handleOverlayVideoEnded();
        });
    }

    setupBackgroundMusic() {
        // Play background music on first user interaction
        document.addEventListener('click', () => {
            if (this.bgMusic.paused) {
                this.bgMusic.play().catch(e => console.log('Background music failed to play'));
            }
        }, { once: true });
    }

    startIdleOverlay() {
        console.log('Starting idle overlay:', this.idleVideo);

        // Reset video element
        this.overlayVideo.pause();
        this.overlayVideo.currentTime = 0;

        this.overlayVideo.src = this.idleVideo;
        this.overlayVideo.loop = true;
        this.overlayVideo.style.display = 'block'; // Ensure it's visible
        this.overlayVideo.muted = true; // Ensure muted for autoplay

        // Add error event listener
        this.overlayVideo.addEventListener('error', (e) => {
            console.error('Video error:', e);
            console.error('Error details:', this.overlayVideo.error);
        }, { once: true });

        // Add load event listener
        this.overlayVideo.addEventListener('loadeddata', () => {
            console.log('Idle video loaded successfully');
            console.log('Video dimensions:', this.overlayVideo.videoWidth, 'x', this.overlayVideo.videoHeight);
            console.log('Video duration:', this.overlayVideo.duration);
        }, { once: true });

        // Force load
        this.overlayVideo.load();

        this.overlayVideo.play().then(() => {
            console.log('Idle overlay playing successfully');
        }).catch(e => {
            console.error('Idle overlay failed to play:', e);
            console.log('Video src:', this.overlayVideo.src);
            console.log('Video readyState:', this.overlayVideo.readyState);
        });
    }

    async startCapture() {
        if (this.isCapturing) return;

        this.isCapturing = true;
        const captureBtn = document.getElementById('captureBtn');
        captureBtn.disabled = true;

        try {
            // Stop idle overlay and start pose overlay
            this.overlayVideo.loop = false;
            this.overlayVideo.pause();

            // Select random pose video
            const randomPose = this.poseVideos[Math.floor(Math.random() * this.poseVideos.length)];
            console.log('🎭 Selected pose video:', randomPose);
            this.overlayVideo.src = randomPose;

            // Start pose video with fallback
            try {
                await this.overlayVideo.play();
                // Wait 2 seconds after video starts, then begin countdown
                setTimeout(() => {
                    this.startCountdown();
                }, 2000);
            } catch (videoError) {
                console.log('Pose video failed to load, starting countdown immediately');
                // If video fails, start countdown immediately
                setTimeout(() => {
                    this.startCountdown();
                }, 500);
            }

        } catch (error) {
            console.error('Error starting capture:', error);
            this.resetCapture();
        }
    }

    startCountdown() {
        const countdownDisplay = document.getElementById('countdown');
        const countdownNumber = countdownDisplay.querySelector('.countdown-number');

        let count = 3;

        const countdown = () => {
            if (count > 0) {
                countdownDisplay.style.display = 'block';
                countdownNumber.textContent = count;
                countdownNumber.style.animation = 'none';

                // Trigger reflow to restart animation
                countdownNumber.offsetHeight;
                countdownNumber.style.animation = 'countdownPulse 1s ease-out';

                // Play countdown sound
                if (this.countdownSound) {
                    this.countdownSound.currentTime = 0;
                    this.countdownSound.play().catch(e => console.log('Countdown sound failed'));
                }

                count--;
                setTimeout(countdown, 1000);
            } else {
                countdownDisplay.style.display = 'none';
                this.capturePhoto();
            }
        };

        countdown();
    }

    async capturePhoto() {
        console.log('capturePhoto function called');
        try {
            // Play shutter sound
            if (this.shutterSound) {
                this.shutterSound.currentTime = 0;
                this.shutterSound.play().catch(e => console.log('Shutter sound failed'));
            }

            // Show loading screen after shutter sound
            setTimeout(() => {
                this.showLoadingScreen();
            }, 200);

            console.log('Setting canvas dimensions...');
            // Set canvas dimensions to match video
            const videoRect = this.webcam.getBoundingClientRect();
            this.canvas.width = this.webcam.videoWidth;
            this.canvas.height = this.webcam.videoHeight;
            console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);

            // Draw webcam frame (unflipped for proper saved orientation)
            console.log('Drawing webcam frame...');
            this.ctx.drawImage(this.webcam, 0, 0, this.canvas.width, this.canvas.height);

            // Draw overlay video frame if playing (unflipped) matching CSS object-fit: cover behavior
            if (!this.overlayVideo.paused && !this.overlayVideo.ended) {
                console.log('Drawing overlay video frame...');
                
                // Get video's natural dimensions
                const videoWidth = this.overlayVideo.videoWidth;
                const videoHeight = this.overlayVideo.videoHeight;
                
                if (videoWidth && videoHeight) {
                    // Implement object-fit: cover behavior - scale to fill canvas, center and crop if needed
                    const canvasAspect = this.canvas.width / this.canvas.height;
                    const videoAspect = videoWidth / videoHeight;
                    
                    let drawWidth, drawHeight, drawX, drawY;
                    let sourceX = 0, sourceY = 0, sourceWidth = videoWidth, sourceHeight = videoHeight;
                    
                    if (videoAspect > canvasAspect) {
                        // Video is wider than canvas - crop sides (like CSS object-fit: cover)
                        drawWidth = this.canvas.width;
                        drawHeight = this.canvas.height;
                        drawX = 0;
                        drawY = 0;
                        
                        // Calculate which part of the video to use (crop horizontally)
                        const scaledVideoWidth = videoHeight * canvasAspect;
                        sourceX = (videoWidth - scaledVideoWidth) / 2;
                        sourceWidth = scaledVideoWidth;
                    } else {
                        // Video is taller than canvas - crop top/bottom (like CSS object-fit: cover)
                        drawWidth = this.canvas.width;
                        drawHeight = this.canvas.height;
                        drawX = 0;
                        drawY = 0;
                        
                        // Calculate which part of the video to use (crop vertically)
                        const scaledVideoHeight = videoWidth / canvasAspect;
                        sourceY = (videoHeight - scaledVideoHeight) / 2;
                        sourceHeight = scaledVideoHeight;
                    }
                    
                    // Draw video with object-fit: cover behavior (crop to fill)
                    this.ctx.drawImage(
                        this.overlayVideo,
                        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
                        drawX, drawY, drawWidth, drawHeight           // Destination rectangle
                    );
                    console.log(`Overlay drawn with cover behavior: source(${sourceX}, ${sourceY}, ${sourceWidth}x${sourceHeight}) -> dest(${drawX}, ${drawY}, ${drawWidth}x${drawHeight})`);
                } else {
                    // Fallback to original method if dimensions not available
                    this.ctx.drawImage(this.overlayVideo, 0, 0, this.canvas.width, this.canvas.height);
                }
            }

            // Add frame overlay
            console.log('Adding frame overlay...');
            await this.addFrameOverlay();

            // Convert to blob and save
            console.log('Converting to blob...');
            const blob = await this.canvasToBlob();
            console.log('Blob created:', blob);

            console.log('Saving photo...');
            const filename = await this.savePhoto(blob);
            console.log('Photo saved with filename:', filename);

            // Show result (this will hide the loading screen)
            console.log('Calling showPhotoResult...');
            this.showPhotoResult(blob, filename);

        } catch (error) {
            console.error('Error capturing photo:', error);
            this.hideLoadingScreen();
            this.showError('Failed to capture photo. Please try again.');
            this.resetCapture();
        }
    }

    async addFrameOverlay() {
        return new Promise((resolve) => {
            const frame = new Image();
            frame.onload = () => {
                // Draw frame overlay normally (no flip needed)
                this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
                resolve();
            };
            frame.onerror = () => {
                console.log('Frame overlay not found, continuing without frame');
                resolve();
            };
            frame.src = 'assets/frame.png';
        });
    }

    canvasToBlob() {
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    // Google Drive methods removed

    async savePhoto(blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `photo-${timestamp}.png`;

        try {
            // Create URL for display (no auto-download)
            const url = URL.createObjectURL(blob);

            // Convert blob to base64 for compatibility
            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
            const base64Data = await base64Promise;

            // Save photo to server for QR code access (local fallback)
            try {
                console.log('💾 Saving photo to server...');
                const serverSaveResult = await this.savePhotoToServer(base64Data, filename);
                console.log('✅ Photo saved to server:', serverSaveResult);
            } catch (serverError) {
                console.warn('⚠️ Failed to save photo to server:', serverError);
                // Continue even if server save fails
            }

            // Upload to Firebase Storage
            let firebaseUrl = null;
            try {
                console.log('🔥 Uploading to Firebase Storage...');
                if (window.uploadImageToFirebase) {
                    firebaseUrl = await window.uploadImageToFirebase(blob, filename);
                    if (firebaseUrl) {
                        console.log('✅ Photo uploaded to Firebase:', firebaseUrl);
                    } else {
                        console.warn('⚠️ Firebase upload returned null URL');
                    }
                } else {
                    console.warn('⚠️ Firebase upload function not available');
                }
            } catch (firebaseError) {
                console.error('❌ Firebase upload failed:', firebaseError);

                // Show user-friendly error message
                if (firebaseError.code === 'storage/unauthorized') {
                    console.error('🔒 Firebase not configured or unauthorized. Check FIREBASE_SETUP.md');
                } else if (firebaseError.message.includes('Firebase') || firebaseError.message.includes('storage')) {
                    console.error('🔥 Firebase configuration issue. Check your config in modules/firebase-storage.js');
                }

                // Continue with local storage even if Firebase fails
                console.log('📱 Continuing with local storage for QR code...');
            }

            // Store for later use
            this.currentPhoto = {
                blob: blob,
                filename: filename,
                url: url,
                base64: base64Data,
                firebaseUrl: firebaseUrl
            };

            return filename;

        } catch (error) {
            console.error('Error saving photo:', error);
            throw error;
        }
    }

    async savePhotoToServer(base64Data, filename) {
        try {
            const response = await fetch('/save-photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    photo: base64Data,
                    filename: filename
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                return result;
            } else {
                throw new Error(result.error || 'Unknown server error');
            }
        } catch (error) {
            console.error('Failed to save photo to server:', error);
            throw error;
        }
    }

    showPhotoResult(blob, filename) {
        console.log('showPhotoResult called with:', filename);
        
        // Hide loading screen first
        this.hideLoadingScreen();

        const photoResult = document.getElementById('photoResult');
        const capturedPhoto = document.getElementById('capturedPhoto');

        console.log('Photo result element:', photoResult);
        console.log('Captured photo element:', capturedPhoto);

        // Display the photo
        const url = URL.createObjectURL(blob);
        capturedPhoto.src = url;

        // Show result screen with a small delay for smooth transition
        setTimeout(() => {
            photoResult.style.display = 'flex';
            photoResult.classList.add('fade-in');

            console.log('📸 Photo result shown');

            // Generate QR code for local photo
            try {
                const photoData = {
                    blob: blob,
                    filename: filename,
                    url: url,
                    base64: this.currentPhoto?.base64,
                    firebaseUrl: this.currentPhoto?.firebaseUrl
                };

                console.log('📱 Generating QR code with data:', photoData);

                if (typeof generateQRCode === 'function') {
                    generateQRCode(photoData);
                } else {
                    console.error('generateQRCode function not available');
                }
            } catch (error) {
                console.error('QR code generation failed:', error);
            }
        }, 300);
    }



    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        console.log('📄 Showing loading screen');
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.add('fade-in');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        console.log('📄 Hiding loading screen');
        loadingScreen.classList.remove('fade-in');
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('fade-out');
        }, 300);
    }



    startNewPhoto() {
        // Hide loading screen if visible
        this.hideLoadingScreen();

        // Hide result screen
        const photoResult = document.getElementById('photoResult');
        photoResult.classList.remove('fade-in');
        photoResult.classList.add('fade-out');

        setTimeout(() => {
            photoResult.style.display = 'none';
            photoResult.classList.remove('fade-out');

            // Clean up current photo
            if (this.currentPhoto) {
                URL.revokeObjectURL(this.currentPhoto.url);
                this.currentPhoto = null;
            }

            // Reset and restart
            this.resetCapture();
            this.startIdleOverlay();
        }, 500);
    }

    resetCapture() {
        this.isCapturing = false;
        const captureBtn = document.getElementById('captureBtn');
        captureBtn.disabled = false;

        // Hide loading screen if visible
        this.hideLoadingScreen();

        // Hide countdown
        const countdownDisplay = document.getElementById('countdown');
        countdownDisplay.style.display = 'none';

        // Clear countdown timer
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    handleOverlayVideoEnded() {
        if (!this.overlayVideo.loop) {
            // Pose video ended, restart idle overlay
            this.startIdleOverlay();
        }
    }

    updateStatus(message, isActive) {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');

        // Only update if elements exist (header might be removed)
        if (statusText) {
            statusText.textContent = message;
        }

        if (statusIndicator) {
            if (isActive) {
                statusIndicator.classList.add('active');
            } else {
                statusIndicator.classList.remove('active');
            }
        }
    }

    showError(message) {
        // Simple error display - you can enhance this
        console.error(message);
        alert(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoBoothApp();
});

// Export for other modules
window.PhotoBoothApp = PhotoBoothApp; 