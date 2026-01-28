# Wonder Cabinet Audio Player

Full-featured podcast audio player using WaveSurfer.js v7 for waveform visualization.

## Features

| Feature | Description |
|---------|-------------|
| **Waveform Visualization** | Interactive WaveSurfer.js waveform with brand colors |
| **Play/Pause** | Central play button with visual state toggle |
| **Skip Controls** | Skip back 15s, skip forward 30s |
| **Speed Control** | 7 speeds: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x |
| **Keyboard Shortcuts** | Space/K (play), J/L (skip), arrows (speed), M (mute), Home/0/End |
| **Screen Reader Support** | ARIA live region announces all player actions |
| **Time Display** | MM:SS or HH:MM:SS (automatic for episodes > 60min) |
| **Transcript Toggle** | Auto-detects "Transcript" headings, creates collapsible section |
| **Analytics** | Plausible, Simple Analytics, GA4 event tracking |
| **Mobile Responsive** | Shorter waveform (48px vs 64px), no keyboard hints |
| **Error States** | Placeholder and error UI with retry button |

## Files

| File | Purpose |
|------|---------|
| `assets/js/audio-player.js` | Main player JavaScript (~800 lines) |
| `partials/audio-player-hero.hbs` | Player HTML template |
| `assets/css/screen.css` | Player styles (search for "Audio Player") |

## HTML Structure

The player is rendered in `partials/audio-player-hero.hbs`:

```handlebars
<section class="wc-audio-hero" id="wc-audio-player">
    <div class="wc-audio-hero-bg">...</div>
    <div class="wc-audio-hero-inner gh-inner">
        <!-- Episode artwork -->
        <div class="wc-audio-hero-artwork">...</div>

        <!-- Episode info and player -->
        <div class="wc-audio-hero-content">
            <span class="wc-audio-hero-date">{{date}}</span>
            <h1 class="wc-audio-hero-title">{{title}}</h1>

            <!-- Waveform -->
            <div id="wc-waveform" class="wc-audio-waveform"></div>

            <!-- Controls -->
            <div class="wc-audio-controls">
                <button id="wc-skip-back">...</button>
                <button id="wc-play-btn">...</button>
                <button id="wc-skip-forward">...</button>
                <button id="wc-speed-btn">1x</button>
                <div class="wc-audio-time">
                    <span id="wc-current-time">0:00</span>
                    <span>/</span>
                    <span id="wc-duration">0:00</span>
                </div>
            </div>
        </div>
    </div>
</section>
```

## Element IDs

| ID | Element |
|----|---------|
| `#wc-audio-player` | Main container |
| `#wc-waveform` | WaveSurfer container |
| `#wc-play-btn` | Play/pause button |
| `#wc-skip-back` | Skip back button |
| `#wc-skip-forward` | Skip forward button |
| `#wc-speed-btn` | Speed control button |
| `#wc-speed-display` | Speed text (inside speed button) |
| `#wc-current-time` | Current time display |
| `#wc-duration` | Duration display |
| `#wc-player-announcer` | Screen reader announcements (auto-created) |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `J` or `←` | Skip back 15 seconds |
| `L` or `→` | Skip forward 30 seconds |
| `↑` | Increase speed |
| `↓` | Decrease speed |
| `M` | Toggle mute |
| `Home` or `0` | Jump to start |
| `End` | Jump to end |

Shortcuts are disabled when an input field is focused.

## Audio URL Detection

The player automatically finds audio from (in order):

1. `data-audio-url` attribute on `#wc-audio-player`
2. Any element with `[data-audio-url]` attribute
3. Ghost's `.kg-audio-card audio` element
4. Standard `audio` element in `.gh-content` or `.wc-episode-notes-content`

## Analytics Events

The player fires these analytics events (to Plausible, Simple Analytics, or GA4):

| Event | Data | When |
|-------|------|------|
| `episode_view` | title, url | Page load (once) |
| `play` | episode | First play only |
| `pause` | episode, position | Each pause |
| `complete` | episode | Playback reaches end |
| `speed_change` | speed | Speed button clicked |
| `skip_back` | seconds | Skip back triggered |
| `skip_forward` | seconds | Skip forward triggered |

On localhost, events log to browser console.

## Transcript Toggle

If the episode notes contain a heading with "transcript" in the text:

1. The heading and all following content (until next H2) are wrapped
2. A toggle button replaces the heading
3. Content is collapsed by default
4. Click to expand/collapse with smooth animation

Example headings that trigger the toggle:
- "Transcript"
- "Full Transcript"
- "Episode Transcript"

## WaveSurfer Configuration

```javascript
const CONFIG = {
    skipBackSeconds: 15,
    skipForwardSeconds: 30,
    speedOptions: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    waveformHeight: 64,        // Desktop
    waveformHeightMobile: 48,  // Mobile (< 768px)
    waveColor: 'rgba(255, 250, 235, 0.4)',
    progressColor: '#10A544',
    cursorColor: '#10A544'
};
```

## Styling Classes

| Class | Purpose |
|-------|---------|
| `.wc-audio-hero` | Main section container |
| `.wc-audio-controls` | Control buttons container |
| `.wc-audio-play` | Play button |
| `.wc-audio-play.is-playing` | Playing state |
| `.wc-audio-skip` | Skip buttons |
| `.wc-audio-speed` | Speed button |
| `.wc-audio-time` | Time display container |
| `.wc-player-keyboard-hints` | Keyboard hints (desktop only) |
| `.wc-player-placeholder` | No audio placeholder |
| `.wc-player-error` | Error state |
| `.wc-transcript-section` | Transcript wrapper |
| `.wc-transcript-toggle` | Transcript toggle button |
| `.wc-transcript-content` | Collapsible transcript |
| `.sr-only` | Screen reader only utility |

## Error States

### No Audio Available

If no audio URL is found, displays a placeholder with play icon and message.

### Audio Load Error

If WaveSurfer fails to load audio, displays error message with "Try Again" button.

## Accessibility

- All buttons have `aria-label` attributes
- Speed button updates `aria-label` when speed changes
- Screen reader announcements for:
  - "Playing" / "Paused"
  - "Skipped back/forward X seconds"
  - "Speed increased/decreased to Xx"
  - "Muted" / "Unmuted"
  - "Jumped to start/end"
- Keyboard hints use `aria-hidden="true"`
- Transcript toggle uses `aria-expanded` and `aria-controls`

## Building

After modifying CSS or JS:

```bash
npx gulp build
```

This compiles `assets/css/screen.css` → `assets/built/screen.css`.

## Loading WaveSurfer

WaveSurfer.js is loaded via CDN in `default.hbs` (or `post.hbs`):

```html
<script src="https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js"></script>
```

The player script checks for `typeof WaveSurfer` before initializing.
