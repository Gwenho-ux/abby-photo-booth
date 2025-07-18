// QR Code generation for Photo Booth using modern qrcode library
function generateQRCode(photoData) {
    console.log('generateQRCode called with:', photoData);
    const qrCanvas = document.getElementById('qrCanvas');

    if (!qrCanvas) {
        console.error('QR canvas element not found');
        return;
    }

    try {
        // Determine which URL to use for QR code
        let qrUrl;
        let storageType;

        if (photoData.firebaseUrl) {
            // Use Firebase photo viewer page instead of direct URL
            let hostname = window.location.hostname;
            const protocol = window.location.protocol || 'http:';
            
            // Only add port for localhost development, not for production deployments
            let portPart = '';
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                const port = window.location.port || '8000';
                portPart = `:${port}`;
            }
            
            const encodedFirebaseUrl = encodeURIComponent(photoData.firebaseUrl);
            qrUrl = `${protocol}//${hostname}${portPart}/firebase-photo.html?firebase_url=${encodedFirebaseUrl}`;
            storageType = 'Firebase';
            console.log('Using Firebase photo viewer page for QR code:', qrUrl);
        } else {
            // Fallback to local viewer link
            let hostname = window.location.hostname;
            const protocol = window.location.protocol || 'http:';

            // Only add port for localhost development, not for production deployments
            let portPart = '';
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                const port = window.location.port || '8000';
                portPart = `:${port}`;
            }

            // Create a simple filename-based link
            const encodedFilename = encodeURIComponent(photoData.filename);
            qrUrl = `${protocol}//${hostname}${portPart}/view-photo.html?filename=${encodedFilename}`;
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
                dark: '#23456A',
                light: '#FFFFFF'
            },
            width: 320
        };

        // Generate QR code using modern library
        QRCode.toCanvas(qrCanvas, qrUrl, qrOptions, function (error) {
            if (error) {
                console.error('QR code generation failed:', error);
                handleQRError(error, photoData);
            } else {
                console.log('🎉 QR Code ready');

                // Style the canvas
                qrCanvas.style.borderRadius = '12px';
                qrCanvas.style.border = '3px solid #12ACEC';
                qrCanvas.style.boxShadow = '0 0 0 1px #23456A, 0 4px 12px rgba(18, 172, 236, 0.2)';
                qrCanvas.style.display = 'block';
                qrCanvas.style.margin = '0 auto';
            }
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        handleQRError(error, photoData);
    }
}

function handleQRError(error, photoData) {
    console.error('QR code error details:', error);

    // Hide canvas on error
    const qrCanvas = document.getElementById('qrCanvas');
    if (qrCanvas) {
        qrCanvas.style.display = 'none';
    }

    console.log(`QR Code generation failed, but photo saved successfully as: ${photoData.filename}`);
}

// Make function globally available
window.generateQRCode = generateQRCode; 
window.generateQRCode = generateQRCode; 