#!/bin/bash

# Photo Booth Launch Script
echo "🚀 Starting Photo Booth Server..."
echo "=================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "📍 Starting combined server on http://localhost:8000"
    echo "✅ Camera access will be available"
    echo "📸 Photo upload and serving enabled"
    echo "🔧 To stop the server, press Ctrl+C"
    echo ""
    echo "🌟 Open your browser to: http://localhost:8000"
    echo ""
    
    # Start the combined Photo Booth server
    python3 server.py
elif command -v python &> /dev/null; then
    echo "📍 Starting combined server on http://localhost:8000"
    echo "✅ Camera access will be available"
    echo "📸 Photo upload and serving enabled"
    echo "🔧 To stop the server, press Ctrl+C"
    echo ""
    echo "🌟 Open your browser to: http://localhost:8000"
    echo ""
    
    # Start the combined Photo Booth server
    python server.py
else
    echo "❌ Python not found!"
    echo "Please install Python 3 to run the photo booth server."
    echo ""
    echo "Fallback options:"
    echo "1. Install Python 3 (recommended)"
    echo "2. Use Node.js: npm install -g http-server && npx http-server"
    echo "3. Use PHP: php -S localhost:8000"
    echo ""
    echo "⚠️  Note: Without Python, photo upload functionality will not work!"
    echo "   You can still use the app but QR codes won't work for local photos."
fi
