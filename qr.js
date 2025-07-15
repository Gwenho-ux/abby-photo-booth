// QR Code generation for Photo Booth using modern qrcode library
function generateQRCode(photoData) {
    console.log('generateQRCode called with:', photoData);
    const qrCanvas = document.getElementById('qrCanvas');
    const qrStatus = document.getElementById('qrStatus');

    if (!qrCanvas) {
        console.error('QR canvas element not found');
        return;
    }

    if (!qrStatus) {
        console.error('QR status element not found');
        return;
    }

    // Clear existing status
    qrStatus.innerHTML = '';

    try {
        // Determine which URL to use for QR code
        let qrUrl;
        let storageType;

        if (photoData.firebaseUrl) {
            // Use Firebase Storage URL if available
            qrUrl = photoData.firebaseUrl;
            storageType = 'Firebase';
            console.log('Using Firebase Storage URL for QR code:', qrUrl);
        } else {
            // Fallback to local viewer link
            let hostname = window.location.hostname;

            // If hostname is localhost, try to get the actual IP
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // Try to get the actual IP from the user's network
                // This will still show localhost in the QR code, but we'll add a note
                hostname = window.location.hostname;
            }

            const port = window.location.port || '8000';
            const protocol = window.location.protocol || 'http:';

            // Create a simple filename-based link
            const encodedFilename = encodeURIComponent(photoData.filename);
            qrUrl = `${protocol}//${hostname}${port ? ':' + port : ''}/view-photo.html?filename=${encodedFilename}`;
            storageType = 'Local';
            console.log('Using local photo viewer link for QR code:', qrUrl);
        }

        console.log('Generating QR code for URL:', qrUrl);
        console.log('URL length:', qrUrl.length);

        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
            throw new Error('QRCode library not loaded');
        }

        // Configure QR code options
        const qrOptions = {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#2D1B2E',
                light: '#FFFFFF'
            },
            width: 200
        };

        // Generate QR code using modern library
        QRCode.toCanvas(qrCanvas, qrUrl, qrOptions, function (error) {
            if (error) {
                console.error('QR code generation failed:', error);
                handleQRError(error, photoData, qrStatus);
            } else {
                console.log('🎉 QR Code ready');

                // Style the canvas
                qrCanvas.style.borderRadius = '10px';
                qrCanvas.style.border = '3px solid #EE9ABF';
                qrCanvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                qrCanvas.style.display = 'block';
                qrCanvas.style.margin = '0 auto';

                // Update status
                updateQRStatus(qrStatus, storageType, true);
            }
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        handleQRError(error, photoData, qrStatus);
    }
}

function updateQRStatus(statusElement, storageType, success) {
    statusElement.style.cssText = `
            margin-top: 15px;
            font-size: 16px;
            color: #2D1B2E;
            text-align: center;
            font-weight: bold;
            font-family: 'Comic Sans MS', cursive;
            background: rgba(238, 154, 191, 0.1);
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #EE9ABF;
        `;

    if (success) {
        if (storageType === 'Firebase') {
            statusElement.innerHTML = '🔥 Scan to view your photo!<br><small>Stored in Firebase</small>';
        } else {
            statusElement.innerHTML = '📱 Scan to view your photo!<br><small>Stored locally</small>';
        }
    } else {
        statusElement.innerHTML = '❌ QR Code Error<br><small>Photo saved successfully</small>';
    }
}

function handleQRError(error, photoData, statusElement) {
    console.error('QR code error details:', error);

    // Hide canvas and show error message
    const qrCanvas = document.getElementById('qrCanvas');
    if (qrCanvas) {
        qrCanvas.style.display = 'none';
    }

    // Show error status
    statusElement.style.cssText = `
                color: #FF6B6B; 
                padding: 20px; 
                text-align: center;
                border: 2px solid #FF6B6B;
                border-radius: 10px;
                background: rgba(255, 107, 107, 0.1);
                font-family: 'Comic Sans MS', cursive;
        margin-top: 15px;
    `;

    statusElement.innerHTML = `
                ❌ QR Code Generation Failed<br>
        <small>Photo saved successfully as:</small><br>
                <strong>${photoData.filename}</strong>
        `;
}

// Make function globally available
window.generateQRCode = generateQRCode; 