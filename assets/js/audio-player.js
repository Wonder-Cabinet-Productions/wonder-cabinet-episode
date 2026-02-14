/**
 * Wonder Cabinet Audio Player
 * Full-featured podcast player with WaveSurfer.js v7
 *
 * Features:
 * - Waveform visualization with brand colors
 * - Play/pause controls
 * - Speed control (0.5x - 2x, 7 speeds)
 * - Skip forward/back (15s back, 30s forward)
 * - Keyboard shortcuts (Space, K, J, L, arrows, M, Home, End)
 * - Screen reader announcements (ARIA live region)
 * - HH:MM:SS time format for episodes > 60 minutes
 * - Transcript section detection and toggle
 * - Analytics integration (Plausible, Simple Analytics, GA4)
 * - Mobile-responsive waveform (64px desktop, 48px mobile)
 * - Error and placeholder states
 */

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================

    const CONFIG = {
        skipBackSeconds: 15,
        skipForwardSeconds: 30,
        speedOptions: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        defaultSpeed: 1,
        waveformHeight: 64,
        waveformHeightMobile: 48,
        // Brand colors from CLAUDE.md
        waveColor: 'rgba(255, 250, 235, 0.4)',
        progressColor: '#10A544',
        cursorColor: '#10A544'
    };

    // Store wavesurfer instance globally within IIFE for keyboard access
    let wavesurferInstance = null;
    let currentSpeed = CONFIG.defaultSpeed;

    // ========================================
    // ANALYTICS
    // ========================================

    // Tracking flags to prevent duplicate events
    let hasTrackedView = false;
    let hasTrackedPlay = false;
    let hasTrackedComplete = false;

    /**
     * Privacy-friendly analytics wrapper
     * Supports Plausible, Simple Analytics, and Google Analytics 4
     */
    function trackEvent(eventName, eventData) {
        eventData = eventData || {};

        // Plausible Analytics
        if (typeof window.plausible !== 'undefined') {
            window.plausible(eventName, { props: eventData });
            return;
        }

        // Simple Analytics
        if (typeof window.sa_event !== 'undefined') {
            window.sa_event(eventName, eventData);
            return;
        }

        // Google Analytics 4
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', eventName, eventData);
            return;
        }

        // Fallback: log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.debug('[Analytics]', eventName, eventData);
        }
    }

    /**
     * Get episode title for analytics
     */
    function getEpisodeTitle() {
        const titleEl = document.querySelector('.wc-audio-hero-title, .wc-player-title');
        return titleEl ? titleEl.textContent.trim() : document.title;
    }

    /**
     * Track episode page view (once per page load)
     */
    function trackEpisodeView() {
        if (hasTrackedView) return;
        hasTrackedView = true;
        trackEvent('episode_view', {
            title: getEpisodeTitle(),
            url: window.location.pathname
        });
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Format seconds to MM:SS or HH:MM:SS display
     * Automatically uses HH:MM:SS for episodes > 60 minutes
     */
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return hrs + ':' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        }
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    /**
     * Check if we're on mobile
     */
    function isMobile() {
        return window.innerWidth <= 767;
    }

    /**
     * Generate an array of placeholder waveform peaks.
     * Uses a sine-based pattern with variation for a natural look
     * while WaveSurfer waits for real peaks data to load.
     */
    function generatePlaceholderPeaks(count) {
        var peaks = [];
        for (var i = 0; i < count; i++) {
            var base = 0.3 + 0.4 * Math.abs(Math.sin(i * 0.15));
            var variation = 0.1 * Math.sin(i * 0.7) + 0.05 * Math.sin(i * 1.3);
            peaks.push(Math.min(1, Math.max(0.05, base + variation)));
        }
        return peaks;
    }

    // ========================================
    // AUDIO PLAYER INITIALIZATION
    // ========================================

    /**
     * Initialize the audio player
     */
    function initAudioPlayer() {
        const playerContainer = document.getElementById('wc-audio-player');
        const waveformContainer = document.getElementById('wc-waveform');
        const playBtn = document.getElementById('wc-play-btn');

        // Exit if player elements aren't present
        if (!playerContainer || !waveformContainer || !playBtn) {
            console.log('Wonder Cabinet: Audio player elements not found on this page');
            return;
        }

        // Check if WaveSurfer is loaded
        if (typeof WaveSurfer === 'undefined') {
            console.warn('Wonder Cabinet: WaveSurfer.js not loaded');
            showPlayerError(waveformContainer, 'Audio player library not loaded');
            return;
        }

        // Try to find audio URL from the page
        const audioUrl = findAudioUrl(playerContainer);

        if (!audioUrl) {
            console.log('Wonder Cabinet: No audio URL found for this episode');
            showPlayerPlaceholder(waveformContainer);
            return;
        }

        // Safety net: ensure <main> reflects has-audio state
        var main = document.getElementById('main-content');
        if (main) {
            main.classList.remove('wc-audio-unresolved');
            main.classList.add('wc-has-audio');
        }

        // Check for pre-generated peaks JSON (avoids CORS issues for waveform)
        var peaksDataEl = document.querySelector('.wc-audio-player[data-peaks-url]');
        var peaksUrl = peaksDataEl ? peaksDataEl.dataset.peaksUrl : null;

        // Create a hidden <audio> element for MediaElement backend.
        // PRX/Podtrac audio URLs redirect through multiple domains that
        // don't send CORS headers, so WaveSurfer's default fetch()-based
        // decoding fails. Using an <audio> element bypasses CORS for
        // playback while still allowing WaveSurfer to render a waveform
        // from pre-generated peaks or a placeholder visualization.
        var audio = new Audio();
        audio.preload = 'metadata';
        audio.src = audioUrl;

        // Create WaveSurfer instance with brand styling, using <audio> backend
        var wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: CONFIG.waveColor,
            progressColor: CONFIG.progressColor,
            cursorColor: CONFIG.cursorColor,
            cursorWidth: 2,
            barWidth: 3,
            barGap: 2,
            barRadius: 0,
            height: isMobile() ? CONFIG.waveformHeightMobile : CONFIG.waveformHeight,
            normalize: true,
            hideScrollbar: true,
            interact: true,
            media: audio,
            // Provide placeholder peaks so WaveSurfer renders bars immediately.
            // Real peaks from data-peaks-url replace these once loaded.
            peaks: [generatePlaceholderPeaks(200)]
        });

        // Store instance for keyboard shortcuts
        wavesurferInstance = wavesurfer;

        // If real peaks JSON is available, fetch and reload with accurate waveform
        if (peaksUrl) {
            fetch(peaksUrl)
                .then(function(r) { return r.json(); })
                .then(function(peaks) {
                    wavesurfer.load(audioUrl, peaks.data ? [peaks.data] : [peaks]);
                })
                .catch(function(err) {
                    console.log('Wonder Cabinet: Using placeholder waveform (peaks not available)');
                });
        }

        // Initialize all controls
        initPlayPauseControl(wavesurfer, playBtn);
        initTimeDisplay(wavesurfer);
        initSpeedControl(wavesurfer);
        initSkipControls(wavesurfer);
        initKeyboardShortcuts(wavesurfer);

        // Track whether the media element can actually play
        var mediaCanPlay = false;
        audio.addEventListener('canplay', function() {
            mediaCanPlay = true;
        });

        // Handle errors gracefully — but don't nuke the player if
        // the underlying <audio> element is working fine. WaveSurfer
        // fires decode errors when it can't access audio data for
        // waveform rendering (CORS), but playback still works.
        wavesurfer.on('error', function(error) {
            console.warn('Wonder Cabinet Audio Error:', error);
            if (!mediaCanPlay) {
                // Audio truly failed to load — show error state
                showPlayerError(waveformContainer, 'Unable to load audio');
                playerContainer.classList.add('wc-audio-player--error');
            } else {
                // Waveform decode failed but playback works — leave player functional
                console.log('Wonder Cabinet: Waveform decode failed (CORS), but playback is available');
            }
        });

        // Mark as ready when loaded
        wavesurfer.on('ready', function() {
            playerContainer.classList.add('wc-audio-player--ready');
            console.log('Wonder Cabinet: Audio player initialized with:', audioUrl);
        });
    }

    // ========================================
    // PLAY/PAUSE CONTROL
    // ========================================

    /**
     * Initialize play/pause button
     */
    function initPlayPauseControl(wavesurfer, playBtn) {
        const playIcon = document.getElementById('wc-play-icon');
        const pauseIcon = document.getElementById('wc-pause-icon');

        playBtn.addEventListener('click', function() {
            wavesurfer.playPause();
        });

        wavesurfer.on('play', function() {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            playBtn.classList.add('is-playing');
            playBtn.setAttribute('aria-label', 'Pause episode');
            playBtn.setAttribute('aria-pressed', 'true');
            announceToScreenReader('Playing');

            // Analytics: track first play only
            if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackEvent('play', { episode: getEpisodeTitle() });
            }
        });

        wavesurfer.on('pause', function() {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            playBtn.classList.remove('is-playing');
            playBtn.setAttribute('aria-label', 'Play episode');
            playBtn.setAttribute('aria-pressed', 'false');
            announceToScreenReader('Paused');

            // Analytics: track pause with current position
            trackEvent('pause', {
                episode: getEpisodeTitle(),
                position: Math.round(wavesurfer.getCurrentTime())
            });
        });

        wavesurfer.on('finish', function() {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            playBtn.classList.remove('is-playing');
            playBtn.setAttribute('aria-label', 'Play episode');
            playBtn.setAttribute('aria-pressed', 'false');

            // Analytics: track completion
            if (!hasTrackedComplete) {
                hasTrackedComplete = true;
                trackEvent('complete', { episode: getEpisodeTitle() });
            }
        });
    }

    // ========================================
    // TIME DISPLAY
    // ========================================

    /**
     * Initialize time display (combined "current / duration" in a single span)
     * Uses single element: #wc-time-display
     */
    function initTimeDisplay(wavesurfer) {
        const timeDisplay = document.getElementById('wc-time-display');

        if (!timeDisplay) return;

        function updateTimeDisplay() {
            var current = formatTime(wavesurfer.getCurrentTime());
            var duration = formatTime(wavesurfer.getDuration());
            timeDisplay.textContent = current + ' / ' + duration;
        }

        // Update on playback
        wavesurfer.on('audioprocess', updateTimeDisplay);

        // Set duration when ready
        wavesurfer.on('ready', function() {
            timeDisplay.textContent = '0:00 / ' + formatTime(wavesurfer.getDuration());
        });

        // Update on seek
        wavesurfer.on('seeking', updateTimeDisplay);
    }

    // ========================================
    // SPEED CONTROL
    // ========================================

    /**
     * Initialize playback speed control
     */
    function initSpeedControl(wavesurfer) {
        const speedBtn = document.getElementById('wc-speed-btn');
        const speedDisplay = document.getElementById('wc-speed-display');

        if (!speedBtn) {
            // Speed button not in HTML - that's okay, keyboard shortcuts still work
            return;
        }

        // Update display
        updateSpeedDisplay(speedDisplay);

        // Cycle through speeds on click
        speedBtn.addEventListener('click', function() {
            cycleSpeed(wavesurfer, speedDisplay);
        });
    }

    /**
     * Cycle through playback speeds
     */
    function cycleSpeed(wavesurfer, speedDisplay) {
        const currentIndex = CONFIG.speedOptions.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % CONFIG.speedOptions.length;
        currentSpeed = CONFIG.speedOptions[nextIndex];

        wavesurfer.setPlaybackRate(currentSpeed);
        updateSpeedDisplay(speedDisplay);

        // Announce to screen readers
        announceToScreenReader('Playback speed: ' + currentSpeed + 'x');

        // Analytics
        trackEvent('speed_change', { speed: currentSpeed });
    }

    /**
     * Update speed display text
     */
    function updateSpeedDisplay(speedDisplay) {
        if (!speedDisplay) return;
        speedDisplay.textContent = currentSpeed + 'x';

        const speedBtn = document.getElementById('wc-speed-btn');
        if (speedBtn) {
            speedBtn.setAttribute('aria-label', 'Playback speed: ' + currentSpeed + 'x');
        }
    }

    /**
     * Increase playback speed
     */
    function increaseSpeed(wavesurfer) {
        const speedDisplay = document.getElementById('wc-speed-display');
        const currentIndex = CONFIG.speedOptions.indexOf(currentSpeed);
        if (currentIndex < CONFIG.speedOptions.length - 1) {
            currentSpeed = CONFIG.speedOptions[currentIndex + 1];
            wavesurfer.setPlaybackRate(currentSpeed);
            updateSpeedDisplay(speedDisplay);
            announceToScreenReader('Speed increased to ' + currentSpeed + 'x');
        }
    }

    /**
     * Decrease playback speed
     */
    function decreaseSpeed(wavesurfer) {
        const speedDisplay = document.getElementById('wc-speed-display');
        const currentIndex = CONFIG.speedOptions.indexOf(currentSpeed);
        if (currentIndex > 0) {
            currentSpeed = CONFIG.speedOptions[currentIndex - 1];
            wavesurfer.setPlaybackRate(currentSpeed);
            updateSpeedDisplay(speedDisplay);
            announceToScreenReader('Speed decreased to ' + currentSpeed + 'x');
        }
    }

    // ========================================
    // SKIP CONTROLS
    // ========================================

    /**
     * Initialize skip forward/back controls
     */
    function initSkipControls(wavesurfer) {
        const skipBackBtn = document.getElementById('wc-skip-back');
        const skipForwardBtn = document.getElementById('wc-skip-forward');

        if (skipBackBtn) {
            skipBackBtn.addEventListener('click', function() {
                skipBack(wavesurfer);
            });
        }

        if (skipForwardBtn) {
            skipForwardBtn.addEventListener('click', function() {
                skipForward(wavesurfer);
            });
        }
    }

    /**
     * Skip backward by configured seconds
     */
    function skipBack(wavesurfer) {
        const currentTime = wavesurfer.getCurrentTime();
        const newTime = Math.max(0, currentTime - CONFIG.skipBackSeconds);
        wavesurfer.seekTo(newTime / wavesurfer.getDuration());
        announceToScreenReader('Skipped back ' + CONFIG.skipBackSeconds + ' seconds');
        // Analytics
        trackEvent('skip_back', { seconds: CONFIG.skipBackSeconds });
    }

    /**
     * Skip forward by configured seconds
     */
    function skipForward(wavesurfer) {
        const currentTime = wavesurfer.getCurrentTime();
        const duration = wavesurfer.getDuration();
        const newTime = Math.min(duration, currentTime + CONFIG.skipForwardSeconds);
        wavesurfer.seekTo(newTime / duration);
        announceToScreenReader('Skipped forward ' + CONFIG.skipForwardSeconds + ' seconds');
        // Analytics
        trackEvent('skip_forward', { seconds: CONFIG.skipForwardSeconds });
    }

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================

    /**
     * Initialize keyboard shortcuts for audio control
     */
    function initKeyboardShortcuts(wavesurfer) {
        document.addEventListener('keydown', function(e) {
            // Don't trigger if user is typing in an input
            if (isInputFocused()) return;

            // Don't trigger if player isn't loaded
            if (!wavesurfer || !wavesurferInstance) return;

            switch (e.key) {
                case ' ':
                case 'k':
                    // Space or K: Play/Pause
                    e.preventDefault();
                    wavesurfer.playPause();
                    break;

                case 'ArrowLeft':
                case 'j':
                    // Left arrow or J: Skip back
                    e.preventDefault();
                    skipBack(wavesurfer);
                    break;

                case 'ArrowRight':
                case 'l':
                    // Right arrow or L: Skip forward
                    e.preventDefault();
                    skipForward(wavesurfer);
                    break;

                case 'ArrowUp':
                    // Up arrow: Increase speed
                    e.preventDefault();
                    increaseSpeed(wavesurfer);
                    break;

                case 'ArrowDown':
                    // Down arrow: Decrease speed
                    e.preventDefault();
                    decreaseSpeed(wavesurfer);
                    break;

                case 'm':
                    // M: Toggle mute
                    e.preventDefault();
                    toggleMute(wavesurfer);
                    break;

                case '0':
                case 'Home':
                    // 0 or Home: Go to start
                    e.preventDefault();
                    wavesurfer.seekTo(0);
                    announceToScreenReader('Jumped to start');
                    break;

                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    // Number keys 1-9: Seek to 10%-90% of duration
                    e.preventDefault();
                    var percent = parseInt(e.key, 10) * 10;
                    wavesurfer.seekTo(percent / 100);
                    announceToScreenReader('Jumped to ' + percent + ' percent');
                    break;

                case 'End':
                    // End: Go to end (paused)
                    e.preventDefault();
                    wavesurfer.seekTo(0.999);
                    wavesurfer.pause();
                    announceToScreenReader('Jumped to end');
                    break;
            }
        });

        // Keyboard shortcuts still work; visible hints removed for minimal UI
    }

    /**
     * Check if an input element is focused
     */
    function isInputFocused() {
        const activeElement = document.activeElement;
        const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTypes.includes(activeElement.tagName) ||
               activeElement.isContentEditable;
    }

    // ========================================
    // MUTE CONTROL
    // ========================================

    let isMuted = false;
    let previousVolume = 1;

    /**
     * Toggle mute state
     */
    function toggleMute(wavesurfer) {
        if (isMuted) {
            wavesurfer.setVolume(previousVolume);
            isMuted = false;
            announceToScreenReader('Unmuted');
        } else {
            previousVolume = wavesurfer.getVolume();
            wavesurfer.setVolume(0);
            isMuted = true;
            announceToScreenReader('Muted');
        }
    }

    // ========================================
    // ACCESSIBILITY HELPERS
    // ========================================

    /**
     * Announce message to screen readers
     */
    function announceToScreenReader(message) {
        let announcer = document.getElementById('wc-player-announcer');

        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'wc-player-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }

        // Clear and set message (triggers announcement)
        announcer.textContent = '';
        setTimeout(function() {
            announcer.textContent = message;
        }, 50);
    }

    // ========================================
    // ERROR & PLACEHOLDER STATES
    // ========================================

    /**
     * Show placeholder when no audio is available.
     * Reinforces page-level wc-no-audio class so the fallback header shows.
     */
    function showPlayerPlaceholder(container) {
        // Hide the waveform section entirely via CSS
        var player = document.getElementById('wc-audio-player');
        if (player) player.classList.add('wc-audio-player--no-audio');

        // Safety net: ensure <main> reflects no-audio state
        // (inline script should have already set this, but reinforce)
        var main = document.getElementById('main-content');
        if (main) {
            main.classList.remove('wc-audio-unresolved');
            main.classList.add('wc-no-audio');
        }
    }

    /**
     * Show error state when audio fails to load
     */
    function showPlayerError(container, message) {
        container.innerHTML =
            '<div class="wc-player-error">' +
                '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                    '<circle cx="12" cy="12" r="10"/>' +
                    '<line x1="12" y1="8" x2="12" y2="12"/>' +
                    '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
                '</svg>' +
                '<p>' + (message || 'Unable to load audio waveform') + '</p>' +
                '<button class="wc-player-retry-btn" onclick="location.reload()">Try Again</button>' +
            '</div>';
    }

    // ========================================
    // AUDIO URL DETECTION
    // ========================================

    /**
     * Find audio URL from the page content
     */
    function findAudioUrl(playerContainer) {
        // Check for data-audio-url attribute on player container
        if (playerContainer && playerContainer.dataset.audioUrl) {
            return playerContainer.dataset.audioUrl;
        }

        // Check for custom audio player div with data-audio-url (imported episodes)
        const customPlayer = document.querySelector('.wc-audio-player[data-audio-url], [data-audio-url]');
        if (customPlayer && customPlayer.dataset.audioUrl) {
            return customPlayer.dataset.audioUrl;
        }

        // Check for Ghost audio card
        const audioCard = document.querySelector('.kg-audio-card audio source, .kg-audio-card audio');
        if (audioCard) {
            return audioCard.src || audioCard.querySelector('source')?.src;
        }

        // Check for standard HTML5 audio element
        const audioElement = document.querySelector('.gh-content audio, .wc-episode-notes-content audio');
        if (audioElement) {
            return audioElement.src || audioElement.querySelector('source')?.src;
        }

        // Check for PRX embed iframe (informational only)
        const prxEmbed = document.querySelector('iframe[src*="prx.org"], iframe[src*="play.prx.org"]');
        if (prxEmbed) {
            console.log('Wonder Cabinet: PRX embed detected - audio extraction requires API integration');
        }

        return null;
    }

    // ========================================
    // TRANSCRIPT TOGGLE FUNCTIONALITY
    // ========================================

    /**
     * Initialize transcript section toggle
     */
    function initTranscriptToggle() {
        const notesContent = document.querySelector('.wc-episode-notes-content');
        if (!notesContent) return;

        const transcriptHeading = findTranscriptHeading(notesContent);

        if (transcriptHeading) {
            wrapTranscriptSection(transcriptHeading);
        }
    }

    /**
     * Find a heading that indicates the start of a transcript
     */
    function findTranscriptHeading(container) {
        const headings = container.querySelectorAll('h2, h3, h4');

        for (var i = 0; i < headings.length; i++) {
            var heading = headings[i];
            var text = heading.textContent.toLowerCase();
            if (text.includes('transcript') || text.includes('full transcript') || text.includes('episode transcript')) {
                return heading;
            }
        }

        return null;
    }

    /**
     * Wrap transcript content in a collapsible section
     */
    function wrapTranscriptSection(transcriptHeading) {
        var transcriptContent = [];
        var sibling = transcriptHeading.nextElementSibling;

        while (sibling) {
            if (sibling.tagName === 'H2') break;
            transcriptContent.push(sibling);
            sibling = sibling.nextElementSibling;
        }

        if (transcriptContent.length === 0) return;

        var section = document.createElement('div');
        section.className = 'wc-transcript-section';

        var toggle = document.createElement('button');
        toggle.className = 'wc-transcript-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML =
            '<span>Show Transcript</span>' +
            '<svg class="wc-transcript-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
                '<polyline points="6 9 12 15 18 9"></polyline>' +
            '</svg>';

        var contentWrapper = document.createElement('div');
        contentWrapper.className = 'wc-transcript-content';
        contentWrapper.id = 'transcript-content';

        var contentInner = document.createElement('div');
        contentInner.className = 'wc-transcript-inner';

        for (var i = 0; i < transcriptContent.length; i++) {
            contentInner.appendChild(transcriptContent[i]);
        }

        contentWrapper.appendChild(contentInner);
        section.appendChild(toggle);
        section.appendChild(contentWrapper);

        transcriptHeading.parentNode.insertBefore(section, transcriptHeading);
        transcriptHeading.remove();

        toggle.setAttribute('aria-controls', 'transcript-content');

        toggle.addEventListener('click', function() {
            var isOpen = toggle.classList.toggle('is-open');
            contentWrapper.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            var toggleText = toggle.querySelector('span');
            toggleText.textContent = isOpen ? 'Hide Transcript' : 'Show Transcript';
        });

        console.log('Wonder Cabinet: Transcript toggle initialized');
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    /**
     * Wait for WaveSurfer to be available with timeout
     * Handles async CDN loading with fallback
     */
    function waitForWaveSurfer(callback, maxWait) {
        maxWait = maxWait || 10000; // 10 second max wait
        var startTime = Date.now();
        var checkInterval = 100; // Check every 100ms

        function check() {
            if (typeof WaveSurfer !== 'undefined') {
                callback(true);
            } else if (Date.now() - startTime >= maxWait) {
                console.warn('Wonder Cabinet: WaveSurfer.js not available after ' + (maxWait / 1000) + 's');
                callback(false);
            } else {
                setTimeout(check, checkInterval);
            }
        }
        check();
    }

    function init() {
        // Track page view (Analytics)
        trackEpisodeView();

        // Initialize transcript toggle (doesn't need WaveSurfer)
        initTranscriptToggle();

        // Wait for WaveSurfer then initialize player
        waitForWaveSurfer(function(available) {
            if (available) {
                initAudioPlayer();
            } else {
                // Show graceful fallback - WaveSurfer not available
                var waveformContainer = document.getElementById('wc-waveform');
                if (waveformContainer) {
                    showPlayerError(waveformContainer, 'Audio player temporarily unavailable. Please refresh the page.');
                }
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
