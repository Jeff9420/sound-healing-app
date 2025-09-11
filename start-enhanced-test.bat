@echo off
echo ========================================
echo  Enhanced UI Test Server - Archive.org
echo ========================================
echo.
echo Starting test server for enhanced UI...
echo Testing Archive.org external storage integration
echo.

cd /d "%~dp0"

echo Checking if Python is available...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Trying Node.js...
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Neither Python nor Node.js found.
        echo Please install one of them to run the test server.
        echo.
        echo Opening test file directly in browser...
        start test-enhanced-ui.html
        goto end
    ) else (
        echo Starting Node.js server...
        echo const http = require('http'), fs = require('fs'), path = require('path'); > temp-server.js
        echo const server = http.createServer((req, res) => { >> temp-server.js
        echo   let filePath = req.url === '/' ? 'test-enhanced-ui.html' : req.url.slice(1); >> temp-server.js
        echo   const extname = path.extname(filePath).toLowerCase(); >> temp-server.js
        echo   const mimeTypes = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp3': 'audio/mpeg'}; >> temp-server.js
        echo   const contentType = mimeTypes[extname] ^|^| 'application/octet-stream'; >> temp-server.js
        echo   fs.readFile(filePath, (err, content) => { >> temp-server.js
        echo     if (err) { res.writeHead(404); res.end('Not Found'); return; } >> temp-server.js
        echo     res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' }); >> temp-server.js
        echo     res.end(content); >> temp-server.js
        echo   }); >> temp-server.js
        echo }); >> temp-server.js
        echo server.listen(8080, () => console.log('Test server running at http://localhost:8080')); >> temp-server.js
        
        start http://localhost:8080
        node temp-server.js
        del temp-server.js >nul 2>&1
    )
) else (
    echo Starting Python server...
    start http://localhost:8080/test-enhanced-ui.html
    python -m http.server 8080 2>nul || python -m SimpleHTTPServer 8080
)

:end
echo.
echo ========================================
echo Test server stopped.
echo ========================================
pause