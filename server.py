#!/usr/bin/env python3
"""
Combined Photo Booth Server with Google Drive Integration
Handles both static file serving and photo upload to Google Drive
"""
import os
import json
import base64
import mimetypes
import time
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote

# Google Drive API configuration
GOOGLE_DRIVE_CONFIG = {
    'API_KEY': 'AIzaSyATB51jLbee0k8vD3fK2UfQQdjiIrzbTuk',
    'CLIENT_ID': '751539621815-45lui9b58ururmqehocre941cev1uto2.apps.googleusercontent.com',
    'FOLDER_ID': '1VF61BhNpZ4IJBOLOra-_sGpgvUqsJNaf',
    'UPLOAD_URL': 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    'PERMISSIONS_URL': 'https://www.googleapis.com/drive/v3/files/{}/permissions'
}

class GoogleDriveUploader:
    """Handle Google Drive upload operations"""
    
    def __init__(self):
        self.access_token = None
    
    def get_access_token(self):
        """Get OAuth2 access token for Google Drive API"""
        # This is a simplified approach - in production, you'd implement proper OAuth2 flow
        # For now, we'll rely on the frontend to handle authentication
        return None
    
    def upload_to_drive(self, photo_data, filename):
        """Upload photo to Google Drive"""
        try:
            # For server-side implementation, we'll save locally and let frontend handle Google Drive
            # This maintains the existing functionality while frontend handles the Google Drive upload
            
            # Create photos directory if it doesn't exist
            photos_dir = 'photos'
            if not os.path.exists(photos_dir):
                os.makedirs(photos_dir)
            
            # Save locally as backup
            local_filepath = os.path.join(photos_dir, filename)
            with open(local_filepath, 'wb') as f:
                f.write(photo_data)
            
            print(f"📸 Photo saved locally: {local_filepath}")
            
            # Return success - frontend will handle Google Drive upload
            return {
                'success': True,
                'filename': filename,
                'local_path': local_filepath,
                'message': 'Photo saved - Google Drive upload will be handled by frontend'
            }
            
        except Exception as e:
            print(f"❌ Error saving photo: {e}")
            return {
                'success': False,
                'error': str(e)
            }

class PhotoBoothHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.drive_uploader = GoogleDriveUploader()
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests - mainly for photo uploads"""
        if self.path == '/save-photo':
            self.handle_photo_upload()
        else:
            self.send_error(404, 'POST endpoint not found')

    def do_GET(self):
        """Handle GET requests - serve static files and photos"""
        if self.path.startswith('/photos/'):
            self.serve_photo()
        else:
            self.serve_static_file()

    def handle_photo_upload(self):
        """Handle photo upload requests with Google Drive integration"""
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
            
            # Save photo (locally as backup, Google Drive upload handled by frontend)
            upload_result = self.drive_uploader.upload_to_drive(photo_binary, filename)
            
            if not upload_result['success']:
                self.send_error(500, f'Failed to save photo: {upload_result["error"]}')
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
                'local_url': f'http://{host}/photos/{filename}',  # Local backup URL
                'size': len(photo_binary),
                'message': 'Photo saved successfully - Google Drive upload will be handled by frontend',
                'google_drive_ready': True  # Signal to frontend to handle Google Drive upload
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"❌ Error processing photo upload: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode('utf-8'))

    def serve_photo(self):
        """Serve photos from the photos directory"""
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
                
                print(f"📥 Served photo: {filepath} ({file_size} bytes)")
                
            except Exception as e:
                print(f"❌ Error serving photo {filepath}: {e}")
                self.send_error(500, f'Error serving photo: {str(e)}')
        else:
            self.send_error(404, f'Photo not found: {filename}')

    def serve_static_file(self):
        """Serve static files (HTML, CSS, JS, etc.)"""
        # Parse the URL path
        url_path = urlparse(self.path).path
        
        # Default to index.html for root path
        if url_path == '/':
            url_path = '/index.html'
        
        # Remove leading slash and decode URL
        file_path = unquote(url_path[1:])
        
        # Security check: prevent directory traversal
        if '..' in file_path or file_path.startswith('/'):
            self.send_error(400, 'Invalid file path')
            return
        
        # Check if file exists
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            self.send_error(404, f'File not found: {file_path}')
            return
        
        try:
            # Get file size and content type
            file_size = os.path.getsize(file_path)
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'text/plain'
            
            # Send headers
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Access-Control-Allow-Origin', '*')
            
            # Add cache headers for static assets
            if file_path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg')):
                self.send_header('Cache-Control', 'public, max-age=3600')
            
            self.end_headers()
            
            # Send file content
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
            
            print(f"📄 Served: {file_path} ({file_size} bytes)")
            
        except Exception as e:
            print(f"❌ Error serving file {file_path}: {e}")
            self.send_error(500, f'Error serving file: {str(e)}')

    def log_message(self, format, *args):
        """Custom log message format"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def run_server(port=8000):
    """Run the photo booth server"""
    # Create photos directory if it doesn't exist
    if not os.path.exists('photos'):
        os.makedirs('photos')
        print("📁 Created photos directory")
    
    server = HTTPServer(('localhost', port), PhotoBoothHandler)
    
    print("🚀 Photo Booth Server Starting...")
    print("=" * 40)
    print(f"🌐 Server URL: http://localhost:{port}")
    print(f"📸 Photo uploads: POST /save-photo")
    print(f"📥 Photo access: GET /photos/<filename>")
    print(f"📄 Static files: GET /<filename>")
    print(f"📁 Photos directory: {os.path.abspath('photos')}")
    print("=" * 40)
    print("🌟 Open your browser to: http://localhost:8000")
    print("🔧 Press Ctrl+C to stop the server")
    print("")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Photo Booth Server stopped")
        server.shutdown()

if __name__ == '__main__':
    run_server() 