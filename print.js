// Print functionality for macOS
class PhotoPrinter {
    constructor() {
        this.isElectron = typeof window !== 'undefined' && window.process && window.process.type;
        this.isPrinting = false;
    }

    async printPhoto(blob, filename) {
        if (this.isPrinting) {
            console.log('Already printing, please wait...');
            return;
        }

        this.isPrinting = true;
        
        try {
            // Convert blob to base64 for processing
            const base64 = await this.blobToBase64(blob);
            
            if (this.isElectron) {
                // If running in Electron, use Node.js capabilities
                await this.printWithElectron(base64, filename);
            } else {
                // For web browser, show instructions or use alternative method
                await this.printWithBrowser(blob, filename);
            }
            
        } catch (error) {
            console.error('Error printing photo:', error);
            throw error;
        } finally {
            this.isPrinting = false;
        }
    }

    async printWithElectron(base64Data, filename) {
        const { ipcRenderer } = window.require('electron');
        
        try {
            // Send print request to main process
            const result = await ipcRenderer.invoke('print-photo', {
                imageData: base64Data,
                filename: filename
            });
            
            if (result.success) {
                console.log('Photo printed successfully');
                this.showPrintStatus('Photo sent to printer successfully!', 'success');
            } else {
                throw new Error(result.error || 'Print failed');
            }
            
        } catch (error) {
            console.error('Electron print error:', error);
            this.showPrintStatus('Print failed: ' + error.message, 'error');
            throw error;
        }
    }

    async printWithBrowser(blob, filename) {
        // For web browser, we'll simulate the print process
        // In a real implementation, you'd need a server endpoint
        
        try {
            // Create a temporary image element for printing
            const img = new Image();
            const url = URL.createObjectURL(blob);
            
            img.onload = () => {
                // Create a new window for printing
                const printWindow = window.open('', '_blank');
                
                if (printWindow) {
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Photo Print - ${filename}</title>
                            <style>
                                body {
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    min-height: 100vh;
                                    background: white;
                                }
                                img {
                                    max-width: 100%;
                                    max-height: 100%;
                                    border: 1px solid #ccc;
                                }
                                @media print {
                                    body { margin: 0; padding: 0; }
                                    img { width: 100%; height: auto; }
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${url}" alt="${filename}">
                            <script>
                                window.onload = function() {
                                    window.print();
                                    setTimeout(() => window.close(), 1000);
                                };
                            </script>
                        </body>
                        </html>
                    `);
                    
                    printWindow.document.close();
                    this.showPrintStatus('Print dialog opened', 'info');
                } else {
                    // Fallback: direct print
                    this.directPrint(img);
                }
                
                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 5000);
            };
            
            img.src = url;
            
        } catch (error) {
            console.error('Browser print error:', error);
            this.showPrintStatus('Print failed: ' + error.message, 'error');
            throw error;
        }
    }

    directPrint(img) {
        // Direct print method
        const printContent = img.outerHTML;
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Photo Print</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                        @media print {
                            body { margin: 0; padding: 0; }
                            img { width: 100%; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
        } else {
            // Last resort: try to print current window
            window.print();
        }
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    showPrintStatus(message, type = 'info') {
        // Create a temporary status message
        const statusDiv = document.createElement('div');
        statusDiv.className = `print-status print-status-${type}`;
        statusDiv.textContent = message;
        
        // Style the status message
        Object.assign(statusDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '5px',
            color: 'white',
            fontFamily: 'Orbitron, monospace',
            fontSize: '14px',
            zIndex: '9999',
            backgroundColor: type === 'success' ? '#00ff00' : 
                           type === 'error' ? '#ff0000' : '#00ffff',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            border: '1px solid currentColor'
        });
        
        document.body.appendChild(statusDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 3000);
    }

    // Method to check if printing is available
    isPrintingAvailable() {
        return typeof window !== 'undefined' && 
               (window.print || this.isElectron);
    }

    // Method to get available printers (for Electron)
    async getAvailablePrinters() {
        if (this.isElectron) {
            try {
                const { ipcRenderer } = window.require('electron');
                return await ipcRenderer.invoke('get-printers');
            } catch (error) {
                console.error('Error getting printers:', error);
                return [];
            }
        }
        return [];
    }
}

// Create global instance
const photoPrinter = new PhotoPrinter();

// Export for use in other modules
window.photoPrinter = photoPrinter;

// Main print function for external use
async function printPhoto(blob, filename) {
    try {
        await photoPrinter.printPhoto(blob, filename);
    } catch (error) {
        console.error('Print failed:', error);
        // You might want to show a user-friendly error message here
    }
}

// Export the main function
window.printPhoto = printPhoto; 