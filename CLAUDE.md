# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **声音疗愈 (Sound Healing)** web application - a local audio player with immersive background scenes and playlist functionality. The app features 213+ audio files across 9 categories (Animal sounds, Chakra, Fire, Hypnosis, Meditation, Rain, Running water, Singing bowl sound, Subconscious Therapy) with full-screen animated backgrounds that automatically match the playing audio type.

## Core Architecture

### Audio System (3-Layer Architecture)
1. **AudioManager** (`assets/js/audio-manager.js`) - Core audio management with format detection, playlist control, and browser compatibility handling
2. **PlaylistUI** (`assets/js/playlist-ui.js`) - Category browsing and track selection interface
3. **BackgroundSceneManager** (`assets/js/background-scene-manager.js`) - Canvas-based animated scenes that auto-switch based on audio category

### Configuration System
- **`assets/js/audio-config.js`** - Central configuration file mapping audio categories to actual files in `assets/audio/` folders
- Audio files are organized by category folders, with each folder representing a playlist
- Configuration auto-generated from actual file system structure

### Key Components
- **App Controller** (`assets/js/app.js`) - Main application orchestrator
- **UI Controller** (`assets/js/ui-controller.js`) - Global controls and volume management  
- **Theme Manager** (`assets/js/theme-manager.js`) - Dark/light theme switching
- **Performance Monitor** (`assets/js/performance-monitor.js`) - Memory and performance tracking
- **Sleep Timer** (`assets/js/sleep-timer.js`) - Auto-stop functionality

## Audio File Management

### File Structure
```
assets/audio/
├── Animal sounds/     # 26 files
├── Chakra/           # 7 files  
├── Fire/             # 4 files
├── hypnosis/         # 70 files
├── meditation/       # 14 files
├── Rain/             # 14 files
├── running water/    # 6 files
├── Singing bowl sound/ # 61 files
└── Subconscious Therapy/ # 11 files
```

### Format Compatibility
- **Primary format**: MP3 (91.5% of files)
- **Compatibility issue**: Some legacy WMA files exist but have browser support limitations
- **AudioManager automatically detects supported formats** and handles graceful degradation

### File Naming Convention
- Files have had numeric prefixes removed for cleaner presentation
- Chinese filenames are preserved as they exist in the actual audio folders
- Configuration file maps English category keys to Chinese display names

## Development Commands

### Testing Audio Functionality
- Open `quick-audio-test.html` - Quick test of key audio files
- Open `browser-audio-test.html` - Comprehensive browser compatibility testing
- Open `test-english-filenames.html` - Filename validation tool

### Updating Audio Configuration
When audio files change, regenerate the config:
```python
# Use the pattern from previous update_config.py scripts
python update_config.py  # Scans audio folders and regenerates audio-config.js
```

### File Operations
```python 
# Use the pattern from previous rename_files.py scripts
python rename_files.py  # Batch rename files (remove prefixes, etc.)
```

## Scene System Architecture

### Background Scene Mapping
Each audio category automatically triggers a matching scene:
- **Animal sounds** → Forest scene (leaves, green tones)
- **Chakra** → Energy scene (chakra colors, energy particles) 
- **Fire** → Fire scene (flame colors, spark particles)
- **Rain** → Rain scene (water drops, blue tones)
- **hypnosis** → Cosmic scene (purple/space theme, stars)
- And more...

### Scene Configuration
Scene parameters defined in `BackgroundSceneManager.sceneConfigs`:
- `colors` - Particle color palette
- `particles` - Particle type ('leaves', 'drops', 'sparks', etc.)
- `particleCount` - Number of active particles
- `bgGradient` - Background gradient colors

## Audio Manager Features

### Playlist Functionality  
- **Auto-playlist mode** - When browsing categories, tracks auto-play in sequence
- **Shuffle and repeat modes** - Configurable playback options
- **Progress tracking** - Real-time progress updates with seek functionality
- **Format detection** - Automatically detects browser-supported audio formats

### Key Methods
```javascript
// Core playback control
audioManager.playTrack(trackId, categoryKey, fileName)
audioManager.playPlaylist(categoryKey, startIndex)

// Progress control  
audioManager.seekTo(percentage)
audioManager.startProgressUpdate() / stopProgressUpdate()

// Format support
audioManager.detectSupportedFormats()
```

## Configuration Updates

### Adding New Audio Files
1. Add audio files to appropriate category folder in `assets/audio/`
2. Run audio configuration update script to regenerate `audio-config.js`
3. Test in `quick-audio-test.html`

### Adding New Categories
1. Create new folder in `assets/audio/`
2. Add category mapping in configuration update script
3. Add scene configuration in `BackgroundSceneManager.sceneConfigs`
4. Update UI to handle new category

## Performance Considerations

- **Memory monitoring** via PerformanceMonitor tracks audio instance usage
- **Audio instances are reused** to prevent memory leaks
- **Scene animations use requestAnimationFrame** for smooth performance
- **Large audio collections (213+ files) handled efficiently** through lazy loading

## Browser Compatibility

### Supported Formats by Priority
1. **MP3** - Universal support (primary format)
2. **WAV** - Good support  
3. **OGG** - Firefox/Chrome
4. **WMA** - Limited support (Edge only)

### Testing Requirements
Always test in multiple browsers, especially:
- Chrome (primary target)
- Firefox 
- Safari (especially audio autoplay policies)
- Edge (for WMA compatibility testing)

## Deployment Notes

- This is a **static web application** - no server-side requirements
- Audio files must be served over HTTPS for full functionality
- See `DEPLOYMENT.md` for complete production deployment guide
- Service Worker caching implemented for offline functionality

## Common Issues & Solutions

### Audio Not Playing
1. Check browser console for format support warnings
2. Verify file exists in correct category folder
3. Check `audio-config.js` matches actual file structure
4. Test with `browser-audio-test.html`

### Scene Not Switching
1. Verify category key matches exactly in `BackgroundSceneManager.sceneConfigs`
2. Check that AudioManager is firing category change events
3. Canvas element must be present with id `backgroundCanvas`

### Configuration Sync Issues
- Audio configuration (`audio-config.js`) must match actual file structure
- Use provided Python scripts to auto-generate config from file system
- File names are case-sensitive and must match exactly