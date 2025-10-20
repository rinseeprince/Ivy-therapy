# Asset Placeholders - TODO

This file contains instructions for replacing placeholder assets with your actual media files.

## Required Assets

### 1. Hero Video Loop (`/public/hero-loop.webm`)
**Status:** 🔴 MISSING - Currently showing placeholder

**Requirements:**
- Format: WebM or MP4 (WebM preferred for size)
- Codec: H.264 or VP9
- Duration: 5-8 seconds (looping seamlessly)
- Dimensions: 1170x2532px (or similar portrait aspect ratio)
- File size: ~1-2MB max
- Content: Screen recording of your app's main UI/conversation interface
- No audio track needed (video is muted)

**Where to add:** 
Place the file at `/public/hero-loop.webm`

**Used in:** `app/page.tsx` - HeroSection component


### 2. Hero Poster Image (`/public/hero-screen.png`)
**Status:** 🔴 MISSING - Currently showing placeholder

**Requirements:**
- Format: PNG or WebP
- Dimensions: 1170x2532px (matches video dimensions)
- Content: A still frame from your app's UI (preferably the first frame of hero-loop.webm)
- Use as: Video poster/fallback

**Where to add:** 
Place the file at `/public/hero-screen.png`

**Used in:** `app/page.tsx` - HeroSection component (video poster attribute)


## Optional Enhancements

### Additional Video Formats (for better browser support)
- `/public/hero-loop.mp4` - H.264 MP4 version for Safari fallback
- `/public/hero-loop.webp` - Animated WebP for modern browsers

### Optimization Tips
1. **Video encoding:**
   ```bash
   # Using FFmpeg to create optimized WebM:
   ffmpeg -i input.mov -c:v libvpx-vp9 -crf 30 -b:v 0 -an -vf "scale=1170:2532" hero-loop.webm
   
   # Create MP4 fallback:
   ffmpeg -i input.mov -c:v libx264 -crf 23 -preset slow -an -vf "scale=1170:2532" hero-loop.mp4
   ```

2. **Image optimization:**
   ```bash
   # Create optimized PNG:
   ffmpeg -i hero-loop.webm -frames:v 1 -vf "scale=1170:2532" hero-screen.png
   
   # Or use ImageOptim, TinyPNG, or similar tools
   ```

## Current State

The homepage is fully functional with placeholder content. The device frame will display:
- A gradient background with an icon when videos are missing
- Your actual video loop once you add the files

All animations, layouts, and interactions are production-ready.

