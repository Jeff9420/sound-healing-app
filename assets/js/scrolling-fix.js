/**
 * Scrolling Fix - Remove overlay blocking and ensure smooth scrolling
 */

(function() {
    'use strict';

    function initScrollFix() {
        // Remove any blocking overlays that might prevent scrolling
        function removeBlockingOverlays() {
            // Check for player modal overlay that might be blocking
            const playerModalOverlay = document.querySelector('.player-modal-overlay');
            if (playerModalOverlay) {
                // Only hide if modal itself is not visible
                const playerModal = document.getElementById('playerModal');
                if (playerModal && !playerModal.classList.contains('show')) {
                    playerModalOverlay.style.display = 'none';
                    playerModalOverlay.style.pointerEvents = 'none';
                }
            }

            // Remove tutorial highlight if visible
            const tutorialHighlight = document.getElementById('tutorialHighlight');
            if (tutorialHighlight) {
                tutorialHighlight.style.display = 'none';
            }

            // Ensure loading screen is completely hidden
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                loadingScreen.style.visibility = 'hidden';
                loadingScreen.style.opacity = '0';
            }
        }

        // Ensure body scroll styles are correct
        function ensureScrollStyles() {
            const html = document.documentElement;
            const body = document.body;

            // Remove any position fixed that might be blocking scroll
            if (body.style.position === 'fixed') {
                body.style.position = '';
                body.style.top = '';
                body.style.width = '';
            }

            // Ensure proper overflow (avoid nested scrollbars)
            html.style.overflowX = 'hidden';
            html.style.overflowY = 'auto';
            body.style.overflowX = 'hidden';
            body.style.overflowY = 'visible';
        }

        // Initialize fixes immediately and then periodically
        removeBlockingOverlays();
        ensureScrollStyles();

        // Set up interval to ensure overlays don't reappear
        setInterval(() => {
            removeBlockingOverlays();
            ensureScrollStyles();
        }, 2000);

        // Also run on any scroll event to ensure smooth scrolling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                removeBlockingOverlays();
            }, 100);
        });
    }

    // Wait for DOM and initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollFix);
    } else {
        initScrollFix();
    }

    // Also initialize after a delay to catch any late-loading overlays
    setTimeout(initScrollFix, 1000);

})();
