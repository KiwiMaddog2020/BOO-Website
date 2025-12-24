# Bunch of Others

Website for BOO — psychedelic rock from Kelowna, BC.

## The Story

BOO came together in 2024 after Jeff lost his brother Kyle, who fronted Fields of Green. Jeff found Kyle's unreleased recordings and picked up a guitar to bring those songs back to life. Joe (who played with Kyle and mentored Jeff), Johnny (Fields of Green's drummer), and Shawn on bass complete the lineup.

The music draws from good times, loss, love, and the need to create something others can connect with.

## The Site

Single-page psychedelic experience with layered visual effects, smooth transitions, and full mobile support. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

**Sections:** Home, Bio, Videos, Photos, Arcade, Merch, Events

### Core Features

- **Scroll-snap navigation** with smooth section transitions and card indicators
- **Floating pill music player** with track controls, progress bar, and volume slider
- **Animated loading screen** with color-sweep logo effect (hot orange → cool cyan)
- **Lightbox gallery** with keyboard navigation and download support
- **Lazy loading** with 300px preload margin for instant image reveals

### Visual Effects

Each section features multiple animated overlay layers:

- Color mist gradients with breathing animations
- Liquid morphing overlay with screen blend
- Oil slick shimmer effects
- Wavy flutter waves with combined ripple animations
- Color splotches with soft glow
- Lava blobs with organic movement
- Chrome color sweep and shimmer
- Per-section psychedelic backgrounds

### Browser Optimizations

- **Safari** (iOS/macOS): Static title styling, boosted overlay opacity, direct style injection
- **Chrome/Chromium**: Reduced overlay complexity on desktop, mobile GPU stability fixes
- **Firefox/LibreWolf**: Dedicated detection and class targeting
- **Mobile**: Lightweight builds strip problematic animations while preserving core aesthetic

## 🕹️ The Arcade

Six custom HTML5 games with global Firebase leaderboards:

| Game | Description |
|------|-------------|
| **Neon Brickbreaker** | Roguelike brick breaker with power-ups and boss fights every 5 levels |
| **Neon Survivors** | Vampire Survivors-style horde game — survive as long as you can |
| **Clyde's Big Jump** | Endless runner/jumper starring the band mascot |
| **Neon Tower Defense** | Strategic tower placement against neon waves |
| **Neon Dig** | Dig deep, collect gems, avoid hazards |
| **Neon Snake** | Classic snake with psychedelic visuals |

### Arcade Features

- Pill-style game selector with emoji icons
- Dynamic aspect ratio handling per game
- Fullscreen button with hybrid scaling (transform for desktop, pseudo-fullscreen for iOS)
- Touch scroll prevention — game interactions don't trigger page scrolling
- Keyboard input capture when game is focused

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Games:** HTML5 Canvas with custom physics
- **Leaderboards:** Firebase Firestore
- **Analytics:** Google Analytics
- **Palette:** Neon cyan (#0ff), magenta (#f0f), purple, orange on dark backgrounds
- **Fonts:** Bebas Neue, Rumble Brave, Tilt Neon, Poppins, Oxanium, Exo 2

## Files
```
index.html               # Main website
neon-brickbreaker.html   # Brick breaker game
neon-survivors.html      # Survivors game
clydes-big-jump.html     # Endless jumper
neon-tower-defense.html  # Tower defense
neon-dig.html            # Digging game
neon-snake.html          # Snake game
neon-space-shooter.html  # Space shooter (hidden)
```

## Running Locally

Just open `index.html` in a browser. For iframe/CORS issues:
```bash
python -m http.server 8000
# http://localhost:8000
```

## Links

- [Instagram](https://www.instagram.com/bunch_of_others/)
- [YouTube](https://www.youtube.com/@BunchOfOthersMusic)
- [Spotify](https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP)
- [Apple Music](https://music.apple.com/us/artist/bunch-of-others/1754588177)

---

© Bunch of Others. All rights reserved.

*Last updated: December 24, 2025*
