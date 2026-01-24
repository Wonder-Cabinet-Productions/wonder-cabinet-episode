# Audio Player Integration (WaveSurfer.js)

Guide to integrating WaveSurfer.js for podcast episode audio players in the wonder-cabinet theme.

## Overview

[WaveSurfer.js](https://wavesurfer.xyz/) is a customizable audio waveform visualization library. It creates interactive waveform displays that users can click to seek through audio.

## Installation

### Via npm

```bash
npm install wavesurfer.js
```

Then import in your JavaScript:

```javascript
// assets/js/index.js
import WaveSurfer from 'wavesurfer.js';
```

### Via CDN (Alternative)

Add to `default.hbs` before `{{ghost_foot}}`:

```html
<script src="https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js"></script>
```

## Basic Implementation

### HTML Structure

Add a container in your post template:

```handlebars
{{!-- post.hbs or a custom template --}}
{{#post}}
    {{#if feature_image}}
        {{!-- Check if post has audio tag for podcast episodes --}}
        {{#has tag="hash-audio"}}
            <div class="audio-player" data-audio="{{feature_image}}">
                <div id="waveform-{{id}}"></div>
                <div class="audio-controls">
                    <button class="play-pause">Play</button>
                    <span class="current-time">0:00</span>
                    <span class="duration">0:00</span>
                </div>
            </div>
        {{/has}}
    {{/if}}
{{/post}}
```

### JavaScript Initialization

```javascript
// assets/js/audioPlayer.js
import WaveSurfer from 'wavesurfer.js';

export default function initAudioPlayer() {
    const containers = document.querySelectorAll('.audio-player');

    containers.forEach(container => {
        const waveformId = container.querySelector('[id^="waveform-"]').id;
        const audioUrl = container.dataset.audio;

        const wavesurfer = WaveSurfer.create({
            container: `#${waveformId}`,
            waveColor: '#4F4A85',
            progressColor: '#383351',
            url: audioUrl,
            height: 80,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
        });

        // Play/pause button
        const playButton = container.querySelector('.play-pause');
        playButton.addEventListener('click', () => {
            wavesurfer.playPause();
        });

        // Update button text
        wavesurfer.on('play', () => playButton.textContent = 'Pause');
        wavesurfer.on('pause', () => playButton.textContent = 'Play');

        // Update time displays
        wavesurfer.on('audioprocess', () => {
            container.querySelector('.current-time').textContent =
                formatTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on('ready', () => {
            container.querySelector('.duration').textContent =
                formatTime(wavesurfer.getDuration());
        });
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
```

### Import in Main Entry

```javascript
// assets/js/index.js
import '../css/index.css';
import initAudioPlayer from './audioPlayer';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAudioPlayer);
```

## Getting Audio URL from Ghost

Ghost stores audio in several ways. Here's how to access it:

### From Post HTML Content

If audio is embedded via Ghost's audio card:

```javascript
// Extract audio URL from Ghost's audio card
const audioCard = document.querySelector('.kg-audio-card audio');
if (audioCard) {
    const audioUrl = audioCard.src;
}
```

### From Custom Field (via Code Injection)

Store audio URL in post code injection, then read it:

```handlebars
{{!-- In post template --}}
<div id="audio-player"
     data-audio-url="{{#if @custom.audio_url}}{{@custom.audio_url}}{{/if}}">
</div>
```

### From Tag Metadata

Use a specific tag pattern:

```handlebars
{{#has tag="hash-podcast"}}
    {{!-- This post is a podcast episode --}}
{{/has}}
```

## Styling

### Basic CSS

```css
/* assets/css/components/audio-player.css */
.audio-player {
    margin: 2rem 0;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 8px;
}

.audio-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

.play-pause {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    background: var(--ghost-accent-color);
    color: white;
    cursor: pointer;
    font-weight: 600;
}

.play-pause:hover {
    opacity: 0.9;
}

.current-time,
.duration {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}
```

### Waveform Customization

WaveSurfer accepts many styling options:

```javascript
WaveSurfer.create({
    container: '#waveform',

    // Colors
    waveColor: '#ddd',           // Unplayed portion
    progressColor: '#3eb0ef',     // Played portion
    cursorColor: '#333',         // Playhead

    // Dimensions
    height: 80,                  // Waveform height in pixels
    barWidth: 2,                 // Width of each bar
    barGap: 1,                   // Gap between bars
    barRadius: 2,                // Rounded corners

    // Behavior
    normalize: true,             // Normalize volume peaks
    hideScrollbar: true,         // Hide horizontal scrollbar
    autoCenter: true,            // Keep playhead centered

    // Responsive
    responsive: true,            // Redraw on window resize
    fillParent: true,            // Fill container width
});
```

## WaveSurfer Plugins

### Minimap

Show a small overview of the entire waveform:

```javascript
import WaveSurfer from 'wavesurfer.js';
import Minimap from 'wavesurfer.js/dist/plugins/minimap.esm.js';

const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    plugins: [
        Minimap.create({
            height: 20,
            waveColor: '#ddd',
            progressColor: '#999',
        }),
    ],
});
```

### Regions

Allow users to select and loop portions:

```javascript
import Regions from 'wavesurfer.js/dist/plugins/regions.esm.js';

const regions = wavesurfer.registerPlugin(Regions.create());

// Add a region
regions.addRegion({
    start: 10,      // Start time in seconds
    end: 30,        // End time
    color: 'rgba(0, 123, 255, 0.2)',
    drag: true,
    resize: true,
});
```

### Timeline

Show time markers below waveform:

```javascript
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    plugins: [
        Timeline.create({
            container: '#timeline',
        }),
    ],
});
```

## Performance Considerations

### Lazy Loading

Only initialize players when visible:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initializePlayer(entry.target);
            observer.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('.audio-player').forEach(el => {
    observer.observe(el);
});
```

### Pre-computed Peaks

For large files, pre-compute waveform peaks server-side:

```javascript
WaveSurfer.create({
    container: '#waveform',
    url: '/audio/episode.mp3',
    peaks: [/* pre-computed peak data */],
});
```

## Integration with Ghost Audio Card

If using Ghost's native audio card, enhance it with WaveSurfer:

```javascript
document.querySelectorAll('.kg-audio-card').forEach(card => {
    const audio = card.querySelector('audio');
    if (!audio) return;

    // Create waveform container
    const waveformDiv = document.createElement('div');
    waveformDiv.className = 'wavesurfer-container';
    card.insertBefore(waveformDiv, audio);

    // Initialize WaveSurfer with existing audio element
    const wavesurfer = WaveSurfer.create({
        container: waveformDiv,
        media: audio,  // Use existing audio element
        height: 60,
    });

    // Hide original audio controls
    audio.controls = false;
});
```

## Events Reference

Common WaveSurfer events:

| Event | Description |
|-------|-------------|
| `ready` | Waveform is drawn, audio is ready |
| `play` | Playback started |
| `pause` | Playback paused |
| `finish` | Playback reached end |
| `audioprocess` | Fires during playback (for time updates) |
| `seeking` | User is seeking |
| `interaction` | User clicked on waveform |
| `error` | Error loading audio |

```javascript
wavesurfer.on('ready', () => console.log('Ready to play'));
wavesurfer.on('error', (error) => console.error('Error:', error));
```
