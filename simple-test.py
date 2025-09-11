#!/usr/bin/env python3
"""
Simple Test Server for Enhanced UI
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'text/javascript')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css')
        elif self.path.endswith('.mp3'):
            self.send_header('Content-Type', 'audio/mpeg')
        elif self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def start_server():
    PORT = 8080
    
    try:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        print("========================================")
        print("Enhanced UI Test Server - Archive.org")
        print("========================================")
        print("")
        print("Starting test server...")
        print("Testing Archive.org external storage integration")
        print("")
        
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"Server running at: http://localhost:{PORT}")
            print(f"Test page: http://localhost:{PORT}/test-enhanced-ui.html")
            print(f"Main app: http://localhost:{PORT}/index.html")
            print("")
            print("Testing features:")
            print("- Archive.org connection monitoring")
            print("- Enhanced audio UI components")
            print("- External storage loading & retry")
            print("- Module integration status")
            print("")
            print("Press Ctrl+C to stop server")
            print("========================================")
            print("")
            
            def open_browser():
                time.sleep(2)
                print("Opening browser...")
                try:
                    webbrowser.open(f'http://localhost:{PORT}/test-enhanced-ui.html')
                except Exception as e:
                    print(f"Could not open browser: {e}")
                    print(f"Please visit: http://localhost:{PORT}/test-enhanced-ui.html")
            
            browser_thread = threading.Thread(target=open_browser)
            browser_thread.daemon = True
            browser_thread.start()
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nShutting down server...")
                httpd.shutdown()
                print("Server stopped")
                
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Port {PORT} is already in use")
            print("Please close other servers or change PORT")
        else:
            print(f"Failed to start server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()