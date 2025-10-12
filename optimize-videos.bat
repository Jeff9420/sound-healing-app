@echo off
REM Video Optimization Script for Sound Healing 2.0
REM Optimizes videos to ~3-5MB, 1920x1080, 30fps, seamless loops

echo ========================================
echo Video Optimization for Sound Healing 2.0
echo ========================================
echo.

REM Create output directory
if not exist "videos\optimized" mkdir "videos\optimized"

echo [1/9] Optimizing campfire-flames.mp4.mp4...
ffmpeg -y -i "videos\campfire-flames.mp4.mp4" -t 14 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\campfire-flames.mp4"
echo.

echo [2/9] Optimizing cosmic-stars.mp4.mp4...
ffmpeg -y -i "videos\cosmic-stars.mp4.mp4" -t 10 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\cosmic-stars.mp4"
echo.

echo [3/9] Optimizing dreamy-clouds.mp4.mp4 (trimming to 20s)...
ffmpeg -y -i "videos\dreamy-clouds.mp4.mp4" -t 20 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\dreamy-clouds.mp4"
echo.

echo [4/9] Optimizing energy-chakra.mp4.mp4...
ffmpeg -y -i "videos\energy-chakra.mp4.mp4" -t 10 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\energy-chakra.mp4"
echo.

echo [5/9] Optimizing flowing-stream.mp4.mp4 (trimming to 20s - MAJOR size reduction)...
ffmpeg -y -i "videos\flowing-stream.mp4.mp4" -t 20 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\flowing-stream.mp4"
echo.

echo [6/9] Optimizing forest-birds.mp4.mp4 (trimming to 20s)...
ffmpeg -y -i "videos\forest-birds.mp4.mp4" -t 20 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\forest-birds.mp4"
echo.

echo [7/9] Optimizing rain-drops.mp4.mp4...
ffmpeg -y -i "videos\rain-drops.mp4.mp4" -t 10 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\rain-drops.mp4"
echo.

echo [8/9] Optimizing temple-golden.mp4.mp4 (trimming to 20s)...
ffmpeg -y -i "videos\temple-golden.mp4.mp4" -t 20 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\temple-golden.mp4"
echo.

echo [9/9] Optimizing zen-bamboo.mp4.mp4 (upscaling to 1920x1080)...
ffmpeg -y -i "videos\zen-bamboo.mp4.mp4" -t 20 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black" -c:v libx264 -preset slow -crf 23 -b:v 3M -maxrate 3.5M -bufsize 7M -r 30 -pix_fmt yuv420p -an -movflags +faststart "videos\optimized\zen-bamboo.mp4"
echo.

echo ========================================
echo Optimization Complete!
echo ========================================
echo.
echo Optimized videos saved to: videos\optimized\
echo.
echo File sizes:
dir "videos\optimized\*.mp4" /o:n
echo.
echo Next steps:
echo 1. Review the optimized videos
echo 2. Upload to Archive.org
echo 3. Update video URLs in video-background-manager.js
echo.
pause
