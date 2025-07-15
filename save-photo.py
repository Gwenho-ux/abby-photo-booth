#!/usr/bin/env python3
"""
Photo saving endpoint for the photo booth
This script handles photo uploads and serves them back
"""
import os
import json
import base64
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import mimetypes
import threading
import time

class PhotoHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle photo upload requests"""
        if self.path == '/save-photo':
            try:
                # Read the request body
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length == 0:
                    self.send_error(400, 'No content provided')
                    return
                
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                try:
                    data = json.loads(post_data.decode('utf-8'))
                except json.JSONDecodeError:
                    self.send_error(400, 'Invalid JSON data')
                    return
                
                # Extract photo data and filename
                photo_data = data.get('photo', '')
                filename = data.get('filename', 'photo.png')
                
                if not photo_data:
                    self.send_error(400, 'No photo data provided')
                    return
                
                # Remove data URL prefix if present
                if photo_data.startswith('data:image/'):
                    photo_data = photo_data.split(',', 1)[1]
                
                # Decode base64
                try:
                    photo_binary = base64.b64decode(photo_data)
                except Exception as e:
                    self.send_error(400, f'Invalid base64 data: {str(e)}')
                    return
                
                # Create photos directory if it doesn't exist
                photos_dir = 'photos'
                if not os.path.exists(photos_dir):
                    os.makedirs(photos_dir)
                    print(f"Created photos directory: {photos_dir}")
                
                # Save the file
                filepath = os.path.join(photos_dir, filename)
                try:
                    with open(filepath, 'wb') as f:
                        f.write(photo_binary)
                    print(f"Photo saved: {filepath} ({len(photo_binary)} bytes)")
                except Exception as e:
                    self.send_error(500, f'Failed to save photo: {str(e)}')
                    return
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                # Get server host for URL
                host = self.headers.get('Host', 'localhost:8000')
                
                response = {
                    'success': True,
                    'filename': filename,
                    'url': f'http://{host}/photos/{filename}',
                    'size': len(photo_binary)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                print(f"Error processing photo upload: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {'success': False, 'error': str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_error(404, 'Endpoint not found')

    def do_GET(self):
        """Handle photo serving requests"""
        if self.path.startswith('/photos/'):
            filename = self.path[8:]  # Remove '/photos/' prefix
            
            # Security check: prevent directory traversal
            if '..' in filename or filename.startswith('/'):
                self.send_error(400, 'Invalid filename')
                return
            
            filepath = os.path.join('photos', filename)
            
            if os.path.exists(filepath) and os.path.isfile(filepath):
                try:
                    # Get file size and content type
                    file_size = os.path.getsize(filepath)
                    content_type, _ = mimetypes.guess_type(filepath)
                    if not content_type:
                        content_type = 'application/octet-stream'
                    
                    # Send headers
                    self.send_response(200)
                    self.send_header('Content-Type', content_type)
                    self.send_header('Content-Length', str(file_size))
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Cache-Control', 'public, max-age=3600')  # Cache for 1 hour
                    self.end_headers()
                    
                    # Send file content
                    with open(filepath, 'rb') as f:
                        self.wfile.write(f.read())
                    
                    print(f"Served photo: {filepath} ({file_size} bytes)")
                    
                except Exception as e:
                    print(f"Error serving photo {filepath}: {e}")
                    self.send_error(500, f'Error serving photo: {str(e)}')
            else:
                self.send_error(404, f'Photo not found: {filename}')
        else:
            self.send_error(404, 'Endpoint not found')

    def log_message(self, format, *args):
        """Custom log message format"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def run_photo_server(port=8001):
    """Run the photo server"""
    server = HTTPServer(('localhost', port), PhotoHandler)
    print(f"📸 Photo server starting on http://localhost:{port}")
    print(f"📤 POST /save-photo - Upload photos")
    print(f"📥 GET /photos/<filename> - Serve photos")
    print(f"📁 Photos directory: {os.path.abspath('photos')}")
    print(f"🛑 Press Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Photo server stopped")
        server.shutdown()

if __name__ == '__main__':
    # Create photos directory if it doesn't exist
    if not os.path.exists('photos'):
        os.makedirs('photos')
        print("Created photos directory")
    
    run_photo_server() 