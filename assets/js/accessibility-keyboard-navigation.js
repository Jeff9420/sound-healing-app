/**
 * Accessibility and Keyboard Navigation System
 * Implements comprehensive WCAG 2.1 AA compliant keyboard navigation and screen reader support
 *
 * @version 1.0.0
 * @date 2025-10-20
 */

class AccessibilityKeyboardNavigation {
    constructor() {
        this.isKeyboardMode = false;
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.ariaLiveRegion = null;
        this.ariaAlertRegion = null;
        this.announcementQueue = [];
        this.isAnnouncing = false;

        this.init();
    }

    init() {
        console.log('🎯 Initializing Accessibility Keyboard Navigation System...');

        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createAriaLiveRegions();
        this.setupKeyboardDetection();
        this.setupGlobalKeyboardHandlers();
        this.setupAudioPlayerKeyboardHandlers();
        this.setupModalKeyboardHandlers();
        this.setupFormKeyboardHandlers();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();

        console.log('✅ Accessibility Keyboard Navigation System initialized');
    }

    /**
     * Create ARIA live regions for screen reader announcements
     */
    createAriaLiveRegions() {
        // Check if regions already exist
        this.ariaLiveRegion = document.getElementById('ariaLiveRegion');
        this.ariaAlertRegion = document.getElementById('ariaAlertRegion');

        if (!this.ariaLiveRegion) {
            this.ariaLiveRegion = document.createElement('div');
            this.ariaLiveRegion.id = 'ariaLiveRegion';
            this.ariaLiveRegion.className = 'sr-only';
            this.ariaLiveRegion.setAttribute('aria-live', 'polite');
            this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.ariaLiveRegion);
        }

        if (!this.ariaAlertRegion) {
            this.ariaAlertRegion = document.createElement('div');
            this.ariaAlertRegion.id = 'ariaAlertRegion';
            this.ariaAlertRegion.className = 'sr-only';
            this.ariaAlertRegion.setAttribute('aria-live', 'assertive');
            this.ariaAlertRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.ariaAlertRegion);
        }
    }

    /**
     * Detect keyboard usage vs mouse/touch usage
     */
    setupKeyboardDetection() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardMode = true;
                document.body.classList.add('keyboard-mode');
            }
        });

        document.addEventListener('mousedown', () => {
            this.isKeyboardMode = false;
            document.body.classList.remove('keyboard-mode');
        });

        document.addEventListener('touchstart', () => {
            this.isKeyboardMode = false;
            document.body.classList.remove('keyboard-mode');
        });
    }

    /**
     * Setup global keyboard shortcuts
     */
    setupGlobalKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input field
            if (this.isInputFocused(e)) return;

            // Alt + H: Help/Keyboard shortcuts
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }

            // Alt + A: Focus audio player
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.focusAudioPlayer();
            }

            // Escape: Close modals or return focus
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }

            // Space/Enter: Activate focused element
            if (e.key === ' ' || e.key === 'Enter') {
                this.handleActivationKey(e);
            }
        });
    }

    /**
     * Setup audio player specific keyboard navigation
     */
    setupAudioPlayerKeyboardHandlers() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;

        audioPlayer.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.handlePreviousTrack();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.handleNextTrack();
                    break;
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.handlePlayPause();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.handleVolumeIncrease();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.handleVolumeDecrease();
                    break;
                case 'm':
                    e.preventDefault();
                    this.handleMuteToggle();
                    break;
                case 'f':
                    e.preventDefault();
                    this.handleForwardSeek();
                    break;
                case 'r':
                    e.preventDefault();
                    this.handleRewindSeek();
                    break;
                case 's':
                    e.preventDefault();
                    this.handleShuffleToggle();
                    break;
                case 'l':
                    e.preventDefault();
                    this.handleRepeatToggle();
                    break;
                case 't':
                    e.preventDefault();
                    this.handleSleepTimerToggle();
                    break;
            }
        });

        // Progress bar keyboard navigation
        const progressBar = audioPlayer.querySelector('.progress-bar');
        if (progressBar) {
            this.setupSliderKeyboardNavigation(progressBar, {
                minValue: 0,
                maxValue: 100,
                step: 5,
                onChange: (value) => this.seekTo(value)
            });
        }

        // Volume slider keyboard navigation
        const volumeSlider = audioPlayer.querySelector('#volumeSlider');
        if (volumeSlider) {
            this.setupSliderKeyboardNavigation(volumeSlider, {
                minValue: 0,
                maxValue: 100,
                step: 5,
                onChange: (value) => this.changeVolume(value)
            });
        }
    }

    /**
     * Setup slider keyboard navigation (volume, progress)
     */
    setupSliderKeyboardNavigation(slider, options) {
        slider.addEventListener('keydown', (e) => {
            let value = parseInt(slider.getAttribute('aria-valuenow') || slider.value);
            let changed = false;

            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                    e.preventDefault();
                    value = Math.max(options.minValue, value - options.step);
                    changed = true;
                    break;
                case 'ArrowRight':
                case 'ArrowUp':
                    e.preventDefault();
                    value = Math.min(options.maxValue, value + options.step);
                    changed = true;
                    break;
                case 'Home':
                    e.preventDefault();
                    value = options.minValue;
                    changed = true;
                    break;
                case 'End':
                    e.preventDefault();
                    value = options.maxValue;
                    changed = true;
                    break;
                case 'PageUp':
                    e.preventDefault();
                    value = Math.min(options.maxValue, value + (options.step * 10));
                    changed = true;
                    break;
                case 'PageDown':
                    e.preventDefault();
                    value = Math.max(options.minValue, value - (options.step * 10));
                    changed = true;
                    break;
            }

            if (changed) {
                slider.value = value;
                slider.setAttribute('aria-valuenow', value);
                slider.setAttribute('aria-valuetext', this.formatSliderValue(value, slider.id));
                if (options.onChange) {
                    options.onChange(value);
                }
            }
        });
    }

    /**
     * Format slider values for screen readers
     */
    formatSliderValue(value, sliderId) {
        switch(sliderId) {
            case 'volumeSlider':
                return `${value} percent volume`;
            default:
                return `${value} percent played`;
        }
    }

    /**
     * Setup modal keyboard navigation
     */
    setupModalKeyboardHandlers() {
        // Handle focus trap for modals
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('playlist-modal')) {
                        this.trapFocus(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Setup form keyboard handlers
     */
    setupFormKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // Handle form submission with Enter
            if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
                const form = e.target.closest('form');
                if (form) {
                    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                    if (submitButton) {
                        e.preventDefault();
                        submitButton.click();
                    }
                }
            }
        });
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Initialize all focusable elements
        this.updateFocusableElements();

        // Update focusable elements when DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
        });
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Announce page load
        setTimeout(() => {
            this.announce('Sound Healing Space loaded. Use Alt+H for keyboard shortcuts.');
        }, 1000);

        // Announce important state changes
        this.setupAudioStateAnnouncements();
        this.setupNavigationAnnouncements();
    }

    /**
     * Setup audio state announcements for screen readers
     */
    setupAudioStateAnnouncements() {
        // Listen for audio player state changes
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            const originalOnClick = playPauseBtn.onclick;
            playPauseBtn.onclick = (e) => {
                originalOnClick.call(playPauseBtn, e);
                setTimeout(() => {
                    const isPlaying = playPauseBtn.textContent.includes('⏸️') ||
                                    playPauseBtn.getAttribute('aria-label')?.includes('Pause');
                    const currentTrack = document.getElementById('currentTrack').textContent;
                    if (currentTrack && currentTrack !== '未播放') {
                        this.announce(isPlaying ? 'Playing' : 'Paused' + ': ' + currentTrack);
                    }
                }, 100);
            };
        }

        // Announce volume changes
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                const volume = volumeSlider.value;
                this.announce(`Volume ${volume}%`);
            });
        }

        // Announce playback speed changes
        const playbackRate = document.getElementById('playbackRate');
        if (playbackRate) {
            playbackRate.addEventListener('change', () => {
                this.announce(`Playback speed ${playbackRate.value}x`);
            });
        }
    }

    /**
     * Setup navigation announcements
     */
    setupNavigationAnnouncements() {
        // Announce when categories load
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
            const observer = new MutationObserver(() => {
                const categories = categoryGrid.querySelectorAll('.category-card');
                if (categories.length > 0) {
                    this.announce(`Loaded ${categories.length} audio categories`);
                }
            });
            observer.observe(categoryGrid, { childList: true });
        }

        // Announce when track list loads
        const trackList = document.getElementById('trackList');
        if (trackList) {
            const observer = new MutationObserver(() => {
                const tracks = trackList.querySelectorAll('.track-item');
                if (tracks.length > 0) {
                    this.announce(`Loaded ${tracks.length} tracks in playlist`);
                }
            });
            observer.observe(trackList, { childList: true });
        }
    }

    /**
     * Update list of focusable elements
     */
    updateFocusableElements() {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ];

        this.focusableElements = Array.from(
            document.querySelectorAll(focusableSelectors.join(', '))
        ).filter(element => {
            return !element.closest('[aria-hidden="true"]') &&
                   !element.closest('[disabled]') &&
                   getComputedStyle(element).display !== 'none' &&
                   getComputedStyle(element).visibility !== 'hidden';
        });
    }

    /**
     * Check if user is typing in an input field
     */
    isInputFocused(e) {
        const target = e.target;
        const inputTypes = ['input', 'textarea', 'select'];
        return inputTypes.includes(target.tagName.toLowerCase()) ||
               target.contentEditable === 'true';
    }

    /**
     * Handle escape key
     */
    handleEscapeKey() {
        // Close modals
        const modals = document.querySelectorAll('[role="dialog"]:not([style*="display: none"])');
        modals.forEach(modal => {
            const closeButton = modal.querySelector('.close, [aria-label*="Close"], [aria-label*="close"]');
            if (closeButton) {
                closeButton.click();
            }
        });

        // Close sleep timer
        const sleepTimerModal = document.getElementById('sleepTimerModal');
        if (sleepTimerModal && sleepTimerModal.style.display !== 'none') {
            sleepTimerModal.style.display = 'none';
        }

        // Return focus to main content
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.focus();
        }
    }

    /**
     * Handle activation keys (Space/Enter)
     */
    handleActivationKey(e) {
        const target = e.target;

        // Skip if already handled by element
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT') {
            return;
        }

        // Handle custom click handlers
        if (target.onclick || target.getAttribute('onclick')) {
            e.preventDefault();
            target.click();
        }
    }

    /**
     * Audio player action handlers
     */
    handlePreviousTrack() {
        if (typeof previousTrack === 'function') {
            previousTrack();
            this.announce('Previous track');
        }
    }

    handleNextTrack() {
        if (typeof nextTrack === 'function') {
            nextTrack();
            this.announce('Next track');
        }
    }

    handlePlayPause() {
        if (typeof togglePlayPause === 'function') {
            togglePlayPause();
        }
    }

    handleVolumeIncrease() {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            const newVolume = Math.min(100, parseInt(volumeSlider.value) + 5);
            volumeSlider.value = newVolume;
            volumeSlider.setAttribute('aria-valuenow', newVolume);
            volumeSlider.setAttribute('aria-valuetext', `${newVolume} percent volume`);
            if (typeof changeVolume === 'function') {
                changeVolume(newVolume);
            }
        }
    }

    handleVolumeDecrease() {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            const newVolume = Math.max(0, parseInt(volumeSlider.value) - 5);
            volumeSlider.value = newVolume;
            volumeSlider.setAttribute('aria-valuenow', newVolume);
            volumeSlider.setAttribute('aria-valuetext', `${newVolume} percent volume`);
            if (typeof changeVolume === 'function') {
                changeVolume(newVolume);
            }
        }
    }

    handleMuteToggle() {
        const volumeSlider = document.getElementById('volumeSlider');
        const currentVolume = volumeSlider ? parseInt(volumeSlider.value) : 70;

        if (currentVolume > 0) {
            volumeSlider.setAttribute('data-previous-volume', currentVolume);
            volumeSlider.value = 0;
            volumeSlider.setAttribute('aria-valuenow', 0);
            volumeSlider.setAttribute('aria-valuetext', 'Muted');
            this.announce('Muted');
        } else {
            const previousVolume = parseInt(volumeSlider.getAttribute('data-previous-volume') || 70);
            volumeSlider.value = previousVolume;
            volumeSlider.setAttribute('aria-valuenow', previousVolume);
            volumeSlider.setAttribute('aria-valuetext', `${previousVolume} percent volume`);
            this.announce('Unmuted');
        }

        if (typeof changeVolume === 'function') {
            changeVolume(volumeSlider.value);
        }
    }

    handleForwardSeek() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const currentValue = parseInt(progressBar.getAttribute('aria-valuenow') || 0);
            const newValue = Math.min(100, currentValue + 10);
            this.seekTo(newValue);
            this.announce(`Forward 10 seconds`);
        }
    }

    handleRewindSeek() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const currentValue = parseInt(progressBar.getAttribute('aria-valuenow') || 0);
            const newValue = Math.max(0, currentValue - 10);
            this.seekTo(newValue);
            this.announce(`Rewind 10 seconds`);
        }
    }

    handleShuffleToggle() {
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (shuffleBtn && typeof toggleShuffle === 'function') {
            toggleShuffle();
            const isActive = shuffleBtn.classList.contains('active');
            this.announce(`Shuffle ${isActive ? 'on' : 'off'}`);
        }
    }

    handleRepeatToggle() {
        const repeatBtn = document.getElementById('repeatBtn');
        if (repeatBtn && typeof toggleRepeat === 'function') {
            toggleRepeat();
            const isActive = repeatBtn.classList.contains('active');
            this.announce(`Repeat ${isActive ? 'on' : 'off'}`);
        }
    }

    handleSleepTimerToggle() {
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (sleepTimerBtn && typeof toggleSleepTimer === 'function') {
            toggleSleepTimer();
            this.announce('Sleep timer options opened');
        }
    }

    /**
     * Seek to position
     */
    seekTo(percentage) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', percentage);
            progressBar.setAttribute('aria-valuetext', `${percentage} percent played`);
            if (typeof seekTo === 'function') {
                // Create mock event for seekTo function
                const mockEvent = { preventDefault: () => {}, clientX: (percentage / 100) * progressBar.offsetWidth };
                seekTo(mockEvent);
            }
        }
    }

    /**
     * Change volume
     */
    changeVolume(volume) {
        if (typeof changeVolume === 'function') {
            changeVolume(volume);
        }
    }

    /**
     * Focus audio player
     */
    focusAudioPlayer() {
        const audioPlayer = document.getElementById('audioPlayer');
        const playPauseBtn = document.getElementById('playPauseBtn');

        if (audioPlayer) {
            if (playPauseBtn) {
                playPauseBtn.focus();
            } else {
                audioPlayer.focus();
            }
            this.announce('Audio player focused');
        }
    }

    /**
     * Trap focus within a modal
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function trapFocusHandler(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });

        // Focus first element
        firstElement.focus();
    }

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            'Alt + H: Show this help',
            'Alt + A: Focus audio player',
            'Space/Enter: Play/Pause',
            'Arrow Left/Right: Previous/Next track',
            'Arrow Up/Down: Volume up/down',
            'M: Mute/Unmute',
            'F: Forward 10 seconds',
            'R: Rewind 10 seconds',
            'S: Toggle shuffle',
            'L: Toggle repeat',
            'T: Toggle sleep timer',
            'Escape: Close modals/Return focus'
        ];

        const helpText = 'Keyboard Shortcuts:\n' + shortcuts.join('\n');
        this.alert(helpText);
    }

    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        if (!this.ariaLiveRegion) return;

        // Queue announcement if currently announcing
        if (this.isAnnouncing) {
            this.announcementQueue.push({ message, priority });
            return;
        }

        this.isAnnouncing = true;
        const region = priority === 'assertive' ? this.ariaAlertRegion : this.ariaLiveRegion;

        region.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            region.textContent = '';
            this.isAnnouncing = false;

            // Process next announcement in queue
            if (this.announcementQueue.length > 0) {
                const next = this.announcementQueue.shift();
                this.announce(next.message, next.priority);
            }
        }, 1000);
    }

    /**
     * Alert message immediately (high priority)
     */
    alert(message) {
        this.announce(message, 'assertive');
    }

    /**
     * Get current keyboard mode
     */
    getKeyboardMode() {
        return this.isKeyboardMode;
    }

    /**
     * Enable/disable keyboard mode
     */
    setKeyboardMode(enabled) {
        this.isKeyboardMode = enabled;
        if (enabled) {
            document.body.classList.add('keyboard-mode');
        } else {
            document.body.classList.remove('keyboard-mode');
        }
    }
}

// Initialize the accessibility system
window.accessibilityKeyboardNavigation = new AccessibilityKeyboardNavigation();

// Export for global use
window.Announce = (message, priority) => {
    window.accessibilityKeyboardNavigation.announce(message, priority);
};

window.AnnounceAlert = (message) => {
    window.accessibilityKeyboardNavigation.alert(message);
};

window.FocusAudioPlayer = () => {
    window.accessibilityKeyboardNavigation.focusAudioPlayer();
};

window.ShowKeyboardShortcuts = () => {
    window.accessibilityKeyboardNavigation.showKeyboardShortcuts();
};