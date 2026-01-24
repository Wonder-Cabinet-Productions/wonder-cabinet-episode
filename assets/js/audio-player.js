/**
 * Wonder Cabinet Audio Player
 * Custom WaveSurfer.js integration for podcast episodes
 */

(function() {
    'use strict';

    // Wait for DOM and WaveSurfer to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initAudioPlayer();
    });

    function initAudioPlayer() {
        const playerContainer = document.getElementById('wc-audio-player');
        if (!playerContainer) return;

        // Find audio source - check for Ghost's audio card or data attribute
        let audioUrl = playerContainer.dataset.audioUrl;

        if (!audioUrl) {
            // Try to find Ghost's native audio card
            const audioCard = document.querySelector('.kg-audio-card audio');
            if (audioCard) {
                audioUrl = audioCard.src || audioCard.querySelector('source')?.src;
            }
        }

        if (!audioUrl) {
            console.warn('Wonder Cabinet: No audio source found');
            playerContainer.classList.add('wc-audio-player--no-audio');
            return;
        }

        // Initialize WaveSurfer
        const wavesurfer = WaveSurfer.create({
            container: '#wc-waveform',
            waveColor: 'rgba(255, 250, 235, 0.4)',
            progressColor: '#10A544',
            cursorColor: '#10A544',
            cursorWidth: 2,
            barWidth: 3,
            barGap: 2,
            barRadius: 2,
            height: 60,
            normalize: true,
            hideScrollbar: true,
            interact: true,
        });

        // Load audio
        wavesurfer.load(audioUrl);

        // Get control elements
        const playBtn = document.getElementById('wc-play-btn');
        const playIcon = document.getElementById('wc-play-icon');
        const pauseIcon = document.getElementById('wc-pause-icon');
        const currentTimeEl = document.getElementById('wc-current-time');
        const durationEl = document.getElementById('wc-duration');
        const skipBackBtn = document.getElementById('wc-skip-back');
        const skipForwardBtn = document.getElementById('wc-skip-forward');

        // Format time helper
        function formatTime(seconds) {
            if (isNaN(seconds) || seconds === Infinity) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }

        // Play/Pause toggle
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                wavesurfer.playPause();
            });
        }

        // Skip controls
        if (skipBackBtn) {
            skipBackBtn.addEventListener('click', function() {
                wavesurfer.skip(-15);
            });
        }

        if (skipForwardBtn) {
            skipForwardBtn.addEventListener('click', function() {
                wavesurfer.skip(30);
            });
        }

        // WaveSurfer events
        wavesurfer.on('ready', function() {
            if (durationEl) {
                durationEl.textContent = formatTime(wavesurfer.getDuration());
            }
            playerContainer.classList.add('wc-audio-player--ready');
        });

        wavesurfer.on('audioprocess', function() {
            if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(wavesurfer.getCurrentTime());
            }
        });

        wavesurfer.on('seeking', function() {
            if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(wavesurfer.getCurrentTime());
            }
        });

        wavesurfer.on('play', function() {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            playBtn?.classList.add('is-playing');
        });

        wavesurfer.on('pause', function() {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            playBtn?.classList.remove('is-playing');
        });

        wavesurfer.on('finish', function() {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            playBtn?.classList.remove('is-playing');
        });

        wavesurfer.on('error', function(err) {
            console.error('Wonder Cabinet Audio Error:', err);
            playerContainer.classList.add('wc-audio-player--error');
        });
    }
})();
