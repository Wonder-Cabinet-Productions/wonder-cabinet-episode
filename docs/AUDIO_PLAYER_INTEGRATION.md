# Audio Player Integration Guide

This document explains how to use the WaveSurfer.js audio player in the Wonder Cabinet Ghost theme.

## Overview

The Wonder Cabinet theme includes a custom audio player for podcast episodes that:
- Displays a waveform visualization
- Uses brand colors (green progress, cream waveform)
- Provides skip back/forward controls
- Supports keyboard navigation
- Auto-detects audio from Ghost's audio card

## Setting Up Podcast Episodes

### 1. Tag Episodes with `#podcast`

To enable the audio player on a post, add the internal tag `#podcast`:

1. Open Ghost Admin → Post Editor
2. Click the settings (gear) icon
3. In the Tags field, type `#podcast` and press Enter
4. The `#` prefix makes it an internal tag (hidden from public)

### 2. Add Audio Content

Add audio to your post using Ghost's Audio card:

1. In the post editor, click the `+` button
2. Select "Audio" from the card menu
3. Upload your audio file or paste a URL

The theme will automatically detect this audio and use it in the WaveSurfer player.

## How It Works

### Template Logic

In `post.hbs`, the template checks for the `#podcast` tag:

```handlebars
{{#has tag="hash-podcast"}}
    {{> "audio-player-hero"}}
{{else}}
    {{!-- Standard post header --}}
{{/has}}
```

### Audio Detection

The `audioPlayer.js` module looks for audio URLs in this order:

1. **Ghost Audio Card**: `.kg-audio-card audio[src]`
2. **Data Attribute**: `[data-audio-url]` attribute on any element

```javascript
// From assets/js/audioPlayer.js
export function findAudioUrl() {
    const audioCard = document.querySelector('.kg-audio-card audio');
    if (audioCard && audioCard.src) {
        return audioCard.src;
    }
    // ... fallback checks
}
```

### WaveSurfer Configuration

The player uses Wonder Cabinet brand colors:

```javascript
WaveSurfer.create({
    container: waveformContainer,
    waveColor: 'rgba(255, 250, 235, 0.4)',    // Cream with transparency
    progressColor: '#10A544',                  // Brand green
    cursorColor: '#FFFAEB',                    // Cream
    barWidth: 3,
    barGap: 2,
    barRadius: 2,
    height: 60,
});
```

## Controls

| Control | Action |
|---------|--------|
| Play button | Toggle play/pause |
| Skip back button | Jump back 15 seconds |
| Skip forward button | Jump forward 30 seconds |
| Waveform click | Seek to position |
| Space/Enter key | Toggle play/pause |
| Left arrow | Seek back 5 seconds |
| Right arrow | Seek forward 5 seconds |

## Styling

The audio player hero includes:
- Green gradient background
- Episode artwork (300px on desktop, 200px on mobile)
- Episode metadata (tag, date)
- Title and excerpt
- Player controls and waveform

See `assets/css/components/audio-player.css` for all styles.

## Troubleshooting

### Audio Not Playing

1. **Check the tag**: Ensure the post has the `#podcast` internal tag
2. **Check audio card**: Ensure a Ghost Audio card exists in the post content
3. **Check browser console**: Look for errors related to audio loading

### Waveform Not Displaying

1. **WaveSurfer loading**: The library loads from CDN; check network connectivity
2. **Audio URL**: Verify the audio file URL is accessible
3. **CORS**: Ensure audio files allow cross-origin requests

### Player Shows "Audio unavailable"

This indicates the audio file couldn't be loaded. Check:
- Audio file URL is correct
- File exists and is accessible
- Server allows audio file requests

## Custom Audio URL

To use a custom audio URL instead of the Ghost audio card:

```handlebars
<div class="wc-audio-player" data-audio-url="https://example.com/episode.mp3">
    {{!-- Player controls here --}}
</div>
```

The JavaScript will detect the `data-audio-url` attribute as a fallback.

## Hiding Ghost's Default Player

When using WaveSurfer, Ghost's default audio card player is hidden via CSS:

```css
.wc-episode-notes .kg-audio-card {
    display: none;
}
```

This ensures only the custom waveform player is visible on podcast episodes.
