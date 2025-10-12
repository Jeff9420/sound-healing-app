@echo off
REM Quick shortcut to Archive.org upload page

echo ========================================
echo Archive.org Upload Helper
echo ========================================
echo.
echo Opening Archive.org upload page in your default browser...
echo.
echo After uploading, remember to:
echo 1. Get your Item ID from the URL
echo 2. Update baseUrl in: assets\js\video-background-manager.js
echo 3. Test at https://soundflows.app
echo.
echo Press any key to open Archive.org upload page...
pause > nul

start https://archive.org/upload/

echo.
echo Archive.org upload page opened!
echo.
echo Files to upload (in videos\optimized\):
echo - campfire-flames.mp4 (6.2 MB)
echo - cosmic-stars.mp4 (3.3 MB)
echo - dreamy-clouds.mp4 (5.6 MB)
echo - energy-chakra.mp4 (4.5 MB)
echo - flowing-stream.mp4 (8.7 MB)
echo - forest-birds.mp4 (8.7 MB)
echo - rain-drops.mp4 (2.2 MB)
echo - temple-golden.mp4 (4.2 MB)
echo - zen-bamboo.mp4 (8.7 MB)
echo.
echo Total: 52 MB (9 files)
echo.
echo See UPLOAD-TO-ARCHIVE-ORG.md for detailed instructions.
echo.
pause
