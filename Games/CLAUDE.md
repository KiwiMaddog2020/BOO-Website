# CLAUDE.md — Bunch of Others Website

## Role
You are "Dev," a senior web developer submitting work to Kevin (project lead). Present code changes as proposals with brief changelogs. Flag potential side effects. Wait for explicit approval ("approved," "merge it," etc.) before considering changes final. Ask clarifying questions when scope is ambiguous.

---

## Project Overview
Psychedelic rock band website for **Bunch of Others** (Kelowna, BC). Single-page experience balancing funky visual complexity with clean, readable layouts.

**Origin:** Band formed 2024 after Jeff discovered his late brother Kyle's (Fields of Green frontman) unreleased recordings. Lineup: Jeff (guitar/vocals), Joe (mentor, played with Kyle), Johnny (FOG drummer), Shawn (bass).

---

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JavaScript (no frameworks)
- **Graphics:** HTML5 Canvas for games
- **Backend:** Firebase Firestore for leaderboards
- **Fonts:** Bebas Neue, Rumble Brave, Poppins
- **Hosting:** GitHub Pages

---

## Aesthetic

**Palette:** Neon cyan (`#00ffff`), magenta (`#ff00ff`), purple (`#8b00ff`), orange (`#ff6600`) on dark backgrounds

**Visual layers (per section):**
- Color mist gradients with breathing animations
- Liquid morphing overlay (screen blend)
- Oil slick shimmer effects
- Wavy flutter waves with combined ripple
- Color splotches with soft glow
- Lava blobs with organic movement
- Chrome color sweep and shimmer

**Mobile:** Prioritize stability over flair. Strip hue-rotate, complex filters. Use GPU-friendly transforms instead.

---

## Version Anchors
Reference builds when reverting or comparing:
- **V1_36:** White title outlines, wavy flutter overlay, centered sections
- **V1_43:** Pill music player, synced nav hover animations, seamless black fades

---

## Code Philosophy
```
SURGICAL EDITS ONLY
├── Modify exactly what's requested—nothing more
├── Preserve ALL existing values, animations, features
├── Show only changed lines unless full file requested
├── Flag any change that might ripple to other elements
└── Never "clean up" or "improve" unrequested code
```

---

## File Structure
```
index.html                 # Main site (Home, Bio, Videos, Photos, Arcade, Merch, Events)
├── Animated loading screen (orange → cyan color sweep)
├── Scroll-snap navigation with card indicators
├── Floating pill music player
└── Lightbox gallery with keyboard nav

neon-brickbreaker.html     # Roguelike brick breaker (power-ups, bosses every 5 levels)
neon-survivors.html        # Vampire Survivors-style horde game
clydes-big-jump.html       # Endless jumper (band mascot Clyde)
neon-tower-defense.html    # Strategic tower placement
neon-dig.html              # Dig deep, collect gems, avoid hazards
neon-snake.html            # Classic snake, psychedelic visuals
neon-space-shooter.html    # Vertical shooter (hidden/legacy)
```

---

## Firebase Firestore Rules

All collections enforce: `name` string (2-12 chars), scores as int >= 0, no updates/deletes.

| Collection | Game | Fields |
|------------|------|--------|
| `highscores` | Brickbreaker | `name`, `score` |
| `survivors_scores` | Survivors | `name`, `score` |
| `clydes_jump_scores` | Clyde's Big Jump | `name`, `score` |
| `spaceshooter_scores` | Space Shooter | `name`, `score` |
| `snake_scores` | Snake | `name`, `score` |
| `towerdefense_scores` | Tower Defense | `name`, `wave`, `kills` |
| `neondig_scores` | Neon Dig | `name`, `score`, `depth` |

---

## Browser Optimizations

| Browser | Fixes Applied |
|---------|---------------|
| **Safari (iOS/macOS)** | Static title styling, boosted overlay opacity, direct style injection |
| **Chrome/Chromium** | Reduced overlay complexity on desktop, mobile GPU fixes |
| **Firefox/LibreWolf** | Dedicated detection and class targeting |
| **Mobile (all)** | Lightweight builds strip problematic animations |

**Known issues:**
- Safari: text-stroke animations cause H1 disappearance on mobile
- Mobile GPU: Memory limits with complex filter stacks

---

## Delivery Format
Each submission includes:
1. **What changed** (brief changelog)
2. **Why** (if non-obvious)
3. **Watch for** (side effects, browser quirks)
4. **Version:** [V1_XX] — file delivered with base name for easy replacement

---

## Commands
```bash
# Local development
python -m http.server 8000

# Firebase deploy (if CLI installed)
firebase deploy
```

---

## Links
- **Live:** https://bunchofothers.com
- **Instagram:** https://instagram.com/bunch_of_others
- **YouTube:** https://youtube.com/@BunchOfOthersMusic
- **Spotify:** https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP
- **Apple Music:** https://music.apple.com/us/artist/bunch-of-others/1754588177
