#!/usr/bin/env python3
"""
Enhanced UI Test Server - Archive.org
启动测试服务器，验证Archive.org外部存储集成
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """支持CORS的HTTP请求处理器"""
    
    def end_headers(self):
        # 添加CORS头部，支持跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # 设置正确的MIME类型
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
        """处理OPTIONS预检请求"""
        self.send_response(200)
        self.end_headers()

def start_server():
    """启动测试服务器"""
    PORT = 8080
    
    try:
        # 切换到项目目录
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        print("========================================")
        print("  Enhanced UI Test Server - Archive.org")
        print("========================================")
        print()
        print("Starting test server for enhanced UI...")
        print("Testing Archive.org external storage integration")
        print()
        
        # 创建服务器
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"✅ 测试服务器运行在: http://localhost:{PORT}")
            print(f"📄 测试页面: http://localhost:{PORT}/test-enhanced-ui.html")
            print(f"🏠 主应用: http://localhost:{PORT}/index.html")
            print()
            print("🔧 测试功能:")
            print("  - Archive.org连接状态监控")
            print("  - 增强的音频UI组件")
            print("  - 外部存储加载与重试机制")
            print("  - 模块集成状态检查")
            print()
            print("按 Ctrl+C 停止服务器")
            print("========================================")
            print()
            
            # 延迟打开浏览器
            def open_browser():
                time.sleep(2)
                print("🌐 正在打开浏览器...")
                try:
                    webbrowser.open(f'http://localhost:{PORT}/test-enhanced-ui.html')
                except Exception as e:
                    print(f"⚠️ 无法自动打开浏览器: {e}")
                    print(f"请手动访问: http://localhost:{PORT}/test-enhanced-ui.html")
            
            # 在后台线程中打开浏览器
            browser_thread = threading.Thread(target=open_browser)
            browser_thread.daemon = True
            browser_thread.start()
            
            try:
                # 启动服务器
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n\n🛑 正在关闭服务器...")
                httpd.shutdown()
                print("✅ 服务器已关闭")
                
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ 端口 {PORT} 已被占用")
            print("请尝试关闭其他服务器，或修改PORT变量使用不同端口")
        else:
            print(f"❌ 启动服务器失败: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 意外错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()