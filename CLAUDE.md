# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **SoundFlows (声音疗愈)** v3.1.0 - An enterprise-grade modern web application for sound healing and meditation. The app features 213+ high-quality audio files hosted on Internet Archive, Canvas-based animated backgrounds, and supports 5 languages with full PWA capabilities.

### Target Audience & Language Priority
**IMPORTANT**:
- **Primary Users**: International/Overseas users (English-speaking)
- **Default Language**: English (`en-US`) - ALL configurations should prioritize English
- **Secondary Markets**: Chinese, Japanese, Korean, Spanish speakers
- **Development Principle**: Always configure with English/international users as the primary target

### Current Production Status
- **Version**: v3.1.0 (Security-hardened)
- **Live Site**: https://soundflows.app
- **Architecture**: Modern static site with distributed resources
- **Deployment**: GitHub → Vercel CI/CD

### Resource Distribution
- **Audio**: Internet Archive (https://archive.org/download/sound-healing-collection/)
- **Frontend**: Vercel Edge Network
- **Code**: GitHub repository

## Development Principles

### Language & Localization Policy
**CRITICAL**: This project targets **international/overseas users primarily**

**Configuration Priority**:
1. ✅ **Always default to English (`en-US`)**
2. ✅ **All documentation, comments, and examples should be in English first**
3. ✅ **Error messages, console logs should prioritize English**
4. ✅ **Email templates, notifications default to English**
5. ✅ **Analytics and reporting in English**
6. ⚠️ Chinese, Japanese, Korean, Spanish are **secondary markets only**

**When to use English vs Chinese**:
- ✅ Code comments: English
- ✅ Git commit messages: English
- ✅ API responses: English
- ✅ Developer documentation: English
- ✅ User-facing content: English (with i18n support for other languages)
- ⚠️ Project folder name exception: 声音疗愈 (historical reasons, but use "SoundFlows" in all configs)

## Multilingual System (i18n)

### Language Configuration
- **Default Language**: English (`en-US`) - All new users see English interface by default
- **Supported Languages**: 5 languages with complete translations
  - **English (`en-US`)** - Primary language, default, fallback language
  - Chinese (`zh-CN`) - Simplified Chinese with full interface support
  - Japanese (`ja-JP`) - Japanese with proper typography support
  - Korean (`ko-KR`) - Korean with native font support
  - Spanish (`es-ES`) - Spanish with locale-specific formatting

### Core Files
- **`assets/js/i18n-system.js`** - Main internationalization system with language detection, translation loading, and dynamic content updates
- **`assets/js/i18n-translations-addon.js`** - Extended translation data for authentication interface and additional features
- **Translation System**: Maps `data-i18n` attributes in HTML to translated text content

### Language Detection Priority
1. **localStorage** - User's saved language preference
2. **Browser Language** - Auto-detect from `navigator.language`
3. **Default Fallback** - English (`en-US`)

### Development Commands for Language Updates
```bash
# Test multilingual functionality
# Open browser developer tools and verify:
# 1. All data-i18n elements are translated
# 2. Language switching works correctly
# 3. localStorage saves language preference
# 4. SEO meta tags update dynamically

# Add new translations:
# 1. Update translation data in i18n-system.js getTranslationData()
# 2. Add new keys to all 5 language sections
# 3. Test with: window.i18n.changeLanguage('en-US')
```

## Core Architecture

### Audio & Visual System (3-Layer Architecture)
1. **AudioManager** (`assets/js/audio-manager.js`) - Core audio management with format detection, playlist control, and browser compatibility handling
2. **PlaylistUI** (`assets/js/playlist-ui.js`) - Category browsing and track selection interface
3. **BackgroundSceneManager** (`assets/js/background-scene-manager.js`) - Canvas animated scenes that auto-switch based on audio category

### Configuration System
- **`assets/js/audio-config.js`** - Central configuration file mapping audio categories to Archive.org URLs
  - **Audio files**: Hosted on Internet Archive (https://archive.org/download/sound-healing-collection/)
- Audio files are organized by category folders, with each folder representing a playlist
- Configuration auto-generated from actual file system structure

### Key Components
- **App Controller** (`assets/js/app.js`) - Main application orchestrator
- **UI Controller** (`assets/js/ui-controller.js`) - Global controls and volume management
- **Theme Manager** (`assets/js/theme-manager.js`) - Dark/light theme switching
- **Performance Monitor** (`assets/js/performance-monitor.js`) - Memory and performance tracking
- **Sleep Timer** (`assets/js/sleep-timer.js`) - Auto-stop functionality
- **Firebase Auth UI** (`assets/js/firebase-auth-ui.js`) - User authentication system
- **Email Integration Handler** (`assets/js/email-integration-handler.js`) - Email service coordination
- **Daily Meditation Reminder** (`assets/js/daily-meditation-reminder.js`) - Daily notification system
- **Weekly Digest Email** (`assets/js/weekly-digest-email.js`) - Weekly report generation

## Audio File Management

### File Hosting Structure
**IMPORTANT**: Audio files are hosted on Internet Archive, NOT locally
- **Archive.org URL**: https://archive.org/download/sound-healing-collection/
- **Local folders**: `assets/audio/` - Reference only, actual files hosted on Archive.org

### Archive.org Folder Structure
```
https://archive.org/download/sound-healing-collection/
├── animal-sounds/        # 26 files (renamed from "Animal sounds")
├── chakra/              # 7 files (renamed from "Chakra")
├── fire-sounds/         # 4 files (renamed from "Fire")
├── hypnosis/            # 70 files
├── meditation/          # 14 files
├── rain-sounds/         # 14 files (renamed from "Rain")
├── water-sounds/        # 6 files (renamed from "running water")
├── singing-bowls/       # 61 files (renamed from "Singing bowl sound")
└── subconscious-therapy/ # 11 files (renamed from "Subconscious Therapy")
```

### Format Compatibility
- **Primary format**: MP3 (100% of files on Archive.org)
- **No local WMA files**: All legacy formats converted to MP3 for Archive.org
- **AudioManager automatically detects supported formats** and handles graceful degradation

### File Naming Convention
- Files have had numeric prefixes removed for cleaner presentation
- Chinese filenames are preserved as they exist in the Archive.org collection
- **Folder mapping**: `audio-config.js` maps category keys to Archive.org folder names

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

## Background Scene System

### Canvas Animation System
**BackgroundSceneManager** provides Canvas-based animated scenes:
- **Auto-switching**: Scenes automatically switch based on selected audio category
- **Scene parameters**: Defined in `BackgroundSceneManager.sceneConfigs`
  - `colors` - Particle color palette
  - `particles` - Particle type ('leaves', 'drops', 'sparks', etc.)
  - `particleCount` - Number of active particles
  - `bgGradient` - Background gradient colors
- **Performance optimized**: Uses requestAnimationFrame for smooth 60fps animations
- **Responsive**: Adapts to different screen sizes and aspect ratios

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
1. **Upload to Archive.org**: Add audio files to the Internet Archive collection
2. Update `audio-config.js`: Add new filenames to appropriate category
3. Test in `quick-audio-test.html`

### Adding New Categories
1. **Upload to Archive.org**: Create new folder and upload audio files
2. Update `audio-config.js`: Add new category with Archive.org folder mapping
3. Add scene configuration in `BackgroundSceneManager.sceneConfigs`
4. Update UI to handle new category

## Performance Considerations

- **Memory monitoring** via PerformanceMonitor tracks audio instance usage
- **Audio instances are reused** to prevent memory leaks
- **Scene animations use requestAnimationFrame** for smooth performance
- **Large audio collections (213+ files) handled efficiently** through lazy loading
- **Canvas rendering optimized** for 60fps animations across all devices

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

### Production Deployment Status
- **✅ Successfully deployed**: https://soundflows.app
- **Platform**: Vercel with GitHub integration
- **Deployment Method**: GitHub → Vercel auto-deploy (RECOMMENDED)
- **Domain**: Custom domain `soundflows.app` configured with Vercel

### Current Deployment Process (Automated)
1. **Commit to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes description"
   git push origin main
   ```

2. **GitHub triggers Vercel auto-deploy**:
   - Automatic build and deployment
   - Updates live site at https://soundflows.app
   - Takes 2-3 minutes to complete

### ⚠️ Important Notes
- **DO NOT use `vercel --prod --yes` directly** - creates temporary URLs
- **USE GitHub push** - updates the actual domain
- All changes should go through GitHub for consistency

### Key Deployment Requirements
- **Directory Structure**: Must have `assets/js/` and `assets/css/` (NOT root-level `js/` and `css/`)
- **Vercel Configuration**: Simplified `vercel.json` without builds configuration
- **HTTPS Required**: Audio files must be served over HTTPS for full functionality
- **Service Worker**: Caching implemented for offline functionality

See `DEPLOYMENT.md` for complete deployment guide and troubleshooting

## Common Issues & Solutions

### Audio Not Playing
1. **Check Archive.org URLs**: Verify audio-config.js uses `https://archive.org/download/sound-healing-collection/`
2. **Check AUDIO_CONFIG loading**: Open console and verify `window.AUDIO_CONFIG` is defined
3. **Test Archive.org links**: Verify URLs are accessible in browser
4. Check browser console for format support warnings
5. Test with `browser-audio-test.html`

### Scene Not Switching
1. Verify category key matches exactly in `BackgroundSceneManager.sceneConfigs`
2. Check that AudioManager is firing category change events
3. Canvas element must be present with id `backgroundCanvas`
4. Check browser console for scene initialization errors

### Configuration Sync Issues
- **Audio**: Must match Archive.org collection structure
- File names are case-sensitive and must match exactly
- Verify `audio-config.js` category keys match scene configuration

## Email System (Formspree Integration)

### Email Service Configuration
- **Provider**: Formspree (no API key required)
- **Form ID**: mldpqopn (stored in localStorage)
- **Free Tier**: 50 emails/month
- **Endpoint**: https://formspree.io/f/mldpqopn

### Email Types
1. **Welcome Email** - Sent automatically on user registration
   - Supports 5 languages
   - Includes platform introduction and features
   - Triggered by `userRegistered` event

2. **Password Reset Email** - Sent when user requests password reset
   - Includes secure reset link
   - 24-hour expiration
   - Triggered by `passwordResetRequested` event

3. **Daily Reminder Email** - Sent based on user's reminder settings
   - Includes streak tracking
   - Daily inspirational quotes
   - Triggered by `dailyReminderTriggered` event

4. **Weekly Digest Email** - Sent every Sunday at 9 AM (default)
   - Usage statistics and insights
   - Most played tracks and categories
   - Achievement badges
   - Triggered by `weeklyDigestGenerated` event

### Email Implementation
- **Event-driven architecture**: Custom events trigger email sending
- **Multilingual templates**: Support for zh-CN and en-US
- **Local logging**: Email logs stored in localStorage (last 100 emails)
- **No phone verification required**: Unlike Mailgun/SendGrid/Brevo

### Email Configuration Files
- **`assets/js/email-integration-handler.js`** - Central email coordination
- **`assets/js/email-service-formspree.js`** - Formspree service implementation
- **`quick-formspree-config.js`** - Form ID configuration

### Testing Email System
- Use `formspree-email-test.html` for comprehensive testing
- Test all email types with custom parameters
- View real-time sending statistics
- Batch testing available

## User Authentication System

### Firebase Authentication Integration
- **Authentication Methods**:
  - Google OAuth (one-click login)
  - Email/Password registration
  - Anonymous browsing mode
  - Password reset via email

### Implementation Files
- **`assets/js/firebase-auth-ui.js`** - Authentication UI and logic
- **`assets/js/firebase-auth.js`** - Core Firebase auth functions

### User Data Management
- User profile information stored in Firebase
- Local preferences saved in localStorage
- Session persistence across browser refreshes
- Automatic UI updates on auth state changes

## User Features

### Daily Meditation Reminder
- **Browser Notifications**: Native browser notification API
- **Streak Tracking**: Consecutive days counter
- **Achievement System**: Milestone badges for streaks
- **Email Reminders**: Integrated with email system
- **Custom Time**: User configurable reminder time

### Weekly Statistics and Reports
- **Play History**: Last 100 audio plays tracked
- **Usage Metrics**: Total sessions, minutes, favorites
- **Category Preferences**: Most used audio categories
- **Progress Tracking**: Meditation journey visualization
- **Email Digest**: Weekly summary sent via email

### User Preferences
- **Language Settings**: 5 language options with instant switching
- **Theme Selection**: Dark/light mode toggle
- **Volume Control**: Persistent volume level
- **Playback Settings**: Speed, loop, shuffle preferences
- **Privacy Settings**: Data export and deletion options

## Performance Optimization

### Caching Strategy
- **Service Worker**: Offline PWA functionality
- **Audio Preloading**: Smart preloading of next tracks
- **Local Storage**: User settings and preferences

### Bundle Optimization
- **Code Splitting**: Dynamic imports for non-critical modules
- **Tree Shaking**: Unused code elimination
- **Minification**: JS/CSS compression
- **Image Optimization**: WebP format with fallbacks

### Monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Global error handling
- **User Analytics**: GA4, Amplitude, Clarity integration
- **Memory Usage**: Audio instance management