Bunch of Others Website
/

# Bunch of Others
Website for BOO — psychedelic rock from Kelowna, BC.
## The Story
BOO came together in 2024 after Jeff lost his brother Kyle, who fronted Fields of Green. Jeff found Kyle's unreleased recordings and picked up a guitar to bring those songs back to life. Joe (who played with Kyle and mentored Jeff), Johnny (Fields of Green's drummer), and Shawn on bass complete the lineup.
The music draws from good times, loss, love, and the need to create something others can connect with.
## The Site
Single-page psychedelic experience with animated gradients, breathing effects, and layered visuals. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.
**Sections:** Home, Bio, Videos, Photos, Arcade, Merch, Events
- Scroll-snap navigation
- Floating music player
- Animated color-cycling effects
- Mobile-optimized with touch support
- Tested on Chrome, Safari, Firefox, Edge
## 🕹️ The Arcade
Five custom HTML5 games with global leaderboards:
| Game | What It Is |
|------|------------|
| **Neon Brickbreaker** | Roguelike brick breaker with power-ups and boss fights every 5 levels |
| **Neon Survivors** | Vampire Survivors-style horde game — stay alive as long as you can |
| **Clyde's Big Jump** | Endless runner/jumper starring the band mascot |
| **Neon Space Shooter** | Classic vertical shooter with upgrades |
| **Neon Snake** | Snake, but psychedelic |
All games run client-side (canvas + JS) with Firebase leaderboards.
## Files

index.html               # Main website
neon-brickbreaker.html   # Brick breaker game
neon-survivors.html      # Survivors game  
clydes-big-jump.html     # Endless jumper
neon-space-shooter.html  # Space shooter
neon-snake.html          # Snake

## Running Locally
Just open index.html in a browser. If iframes give you trouble:
bash
python -m http.server 8000
# http://localhost:8000

## Links
- [Instagram](https://www.instagram.com/bunch_of_others/)
- [YouTube](https://www.youtube.com/@BunchOfOthersMusic)
- [Spotify](https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP)
- [Apple Music](https://music.apple.com/us/artist/bunch-of-others/1754588177)
---
© Bunch of Others. All rights reserved.

Update our readme with the current features and changes
9:08 p.m.

This is a very large file. Let me look at specific sections to understand the key features. I can see it has:

    Loading screen with animated logo
    Color cycling animations
    Nav tap glow animation
    Chrome performance fixes
    Mobile optimizations
    Lazy loading
    Game scroll prevention

Let me also check the project files to see all the games and understand the full scope.

Let me check the project files and look at more of the index.html to capture all the features:

I now have a comprehensive understanding of the website features. Let me create an updated README that reflects:

    The story (unchanged)
    Updated site features:
        Animated loading screen with color sweep
        Scroll-snap navigation with card indicators
        Floating pill music player with track controls
        Multiple psychedelic overlay layers (color mist, liquid overlay, oil slick, wavy flutter, color splotches, lava blobs, chrome effects)
        Lightbox gallery with navigation
        Browser-specific optimizations (Safari, Chrome, Firefox, mobile)
        Mobile-optimized with touch support
    Updated Arcade section:
        6 games now (Neon Brickbreaker, Neon Survivors, Clyde's Big Jump, Neon Tower Defense, Neon Dig, Neon Snake - Space Shooter is hidden)
        Game selector with arcade pills
        Fullscreen support
        Touch prevention for mobile scrolling
    Sections: Home, Bio, Videos, Photos, Arcade, Merch (coming soon), Events, Logo Outro
    Technical details:
        Vanilla HTML/CSS/JavaScript
        Firebase for leaderboards
        Cross-browser compatibility
        Lazy loading
        GPU-accelerated animations

Let me create the updated README.

Now I have a comprehensive view. Let me create an updated README that accurately reflects the current state of the project:

I have presented the file to the user. Let me summarize what I changed.

Here's the updated README reflecting the current state of the project.

Key changes from the original:

    Expanded feature sections — Added details on the animated loading screen, card indicators, lightbox gallery, and lazy loading system
    Visual effects breakdown — Documented all the overlay layers (color mist, liquid overlay, oil slick, wavy flutter, lava blobs, chrome effects)
    Browser optimizations — Added section explaining Safari, Chrome, Firefox, and mobile-specific handling
    Updated arcade — Now lists 6 games (added Neon Tower Defense and Neon Dig, noted Space Shooter is hidden), plus documented the pill selector, fullscreen support, and touch scroll prevention
    Tech stack — Added Firebase and font details
    File structure — Updated to include all current game files

Readme
Document · MD 


Claude is AI and can make mistakes. Please double-check responses.
Readme · MD
Bunch of Others

Website for BOO — psychedelic rock from Kelowna, BC.
The Story

BOO came together in 2024 after Jeff lost his brother Kyle, who fronted Fields of Green. Jeff found Kyle's unreleased recordings and picked up a guitar to bring those songs back to life. Joe (who played with Kyle and mentored Jeff), Johnny (Fields of Green's drummer), and Shawn on bass complete the lineup.

The music draws from good times, loss, love, and the need to create something others can connect with.
The Site

Single-page psychedelic experience with layered visual effects, smooth transitions, and full mobile support. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

Sections: Home, Bio, Videos, Photos, Arcade, Merch, Events
Core Features

    Scroll-snap navigation with smooth section transitions and card indicators
    Floating pill music player with track controls, progress bar, and volume slider
    Animated loading screen with color-sweep logo effect (hot orange → cool cyan)
    Lightbox gallery with keyboard navigation and download support
    Lazy loading with 300px preload margin for instant image reveals

Visual Effects

Each section features multiple animated overlay layers:

    Color mist gradients with breathing animations
    Liquid morphing overlay with screen blend
    Oil slick shimmer effects
    Wavy flutter waves with combined ripple animations
    Color splotches with soft glow
    Lava blobs with organic movement
    Chrome color sweep and shimmer
    Per-section psychedelic backgrounds

Browser Optimizations

    Safari (iOS/macOS): Static title styling, boosted overlay opacity, direct style injection
    Chrome/Chromium: Reduced overlay complexity on desktop, mobile GPU stability fixes
    Firefox/LibreWolf: Dedicated detection and class targeting
    Mobile: Lightweight builds strip problematic animations while preserving core aesthetic

🕹️ The Arcade

Six custom HTML5 games with global Firebase leaderboards:
Game	Description
Neon Brickbreaker	Roguelike brick breaker with power-ups and boss fights every 5 levels
Neon Survivors	Vampire Survivors-style horde game — survive as long as you can
Clyde's Big Jump	Endless runner/jumper starring the band mascot
Neon Tower Defense	Strategic tower placement against neon waves
Neon Dig	Dig deep, collect gems, avoid hazards
Neon Snake	Classic snake with psychedelic visuals
Arcade Features

    Pill-style game selector with emoji icons
    Dynamic aspect ratio handling per game
    Fullscreen button with hybrid scaling (transform for desktop, pseudo-fullscreen for iOS)
    Touch scroll prevention — game interactions don't trigger page scrolling
    Keyboard input capture when game is focused

Tech Stack

    Frontend: Vanilla HTML, CSS, JavaScript
    Games: HTML5 Canvas with custom physics
    Leaderboards: Firebase Realtime Database
    Fonts: Bebas Neue, Rumble Brave, Poppins

Files

index.html               # Main website
neon-brickbreaker.html   # Brick breaker game
neon-survivors.html      # Survivors game
clydes-big-jump.html     # Endless jumper
neon-tower-defense.html  # Tower defense
neon-dig.html            # Digging game
neon-snake.html          # Snake game
neon-space-shooter.html  # Space shooter (hidden)

Running Locally

Just open index.html in a browser. For iframe/CORS issues:
bash

python -m http.server 8000
# http://localhost:8000

Links

    Instagram
    YouTube
    Spotify
    Apple Music

© Bunch of Others. All rights reserved.

