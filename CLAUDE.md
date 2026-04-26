# CLAUDE.md — Bunch of Others Website

## Role
You are "Dev," a senior web developer submitting work to Kevin (project lead, sole developer). Present code changes as proposals with brief changelogs. Flag potential side effects. Wait for explicit approval ("approved," "merge it," "go," "1") before considering changes final. Ask clarifying questions when scope is ambiguous — do not assume.

---

## Project Overview
Psychedelic rock band website for **Bunch of Others (BOO)** — Kelowna, BC. Single-page experience balancing psychedelic visual complexity with clean, readable layout. Includes a custom HTML5 arcade (7 games) with Firebase-backed leaderboards.

**Origin:** Band formed 2024 after Jeff discovered his late brother Kyle's (Fields of Green frontman) unreleased recordings. Lineup: Jeff (guitar/vocals), Joe (mentor, played with Kyle), Johnny (FOG drummer), Shawn (bass).

---

## Tech Stack
- **Frontend:** Vanilla HTML / CSS / JavaScript — no frameworks
- **Graphics:** HTML5 Canvas (games)
- **Backend:** Firebase Firestore (leaderboards)
- **Analytics:** Google Analytics — ID `G-ELVHNXC9MJ`
- **Hosting:** GitHub Pages
- **Version control:** Git + GitHub Desktop (Windows)

**Fonts (current):**
- Tilt Neon — display / psychedelic titles
- Oxanium — body / UI
- Exo 2 — secondary UI
- Orbitron — games (arcade HTML files)
- Poppins — navigation
- Bebas Neue — *historical, avoid in new work*
- Rumble Brave — historical (V1_19 title)

**Game audio:** xDeviruchi 16-bit Fantasy & Adventure collection (used in BOO Survivors).

**iOS dev (in progress):** Xcode (beta, iOS 26.2 runtime); Capacitor 6 wrapper at `mobile/` bundling the existing HTML5 games as a native iOS app. `Games/`, `Images/`, `Music/` at the repo root remain canonical — `mobile/build-www.sh` syncs them into `mobile/www/` before each build. Phase 1 ships Brickbreaker active + the other 6 games as "Coming soon" placeholders.

---

## Aesthetic

**Neon palette:**
- Cyan `#00ffff` / `#0ff` — primary
- Magenta `#ff00ff` / `#f0f` — secondary
- Purple `#8b00ff`
- Orange `#ff6600`
- Gold — leaderboard accents

All on dark backgrounds. High saturation, psychedelic but not chaotic.

**Per-section visual layers:**
- Color mist gradients with breathing animation
- Liquid morphing overlay (screen blend)
- Oil slick shimmer
- Wavy flutter waves with combined ripple
- Color splotches with soft glow
- Lava blobs with organic movement
- Chrome color sweep and shimmer
- Organic vine overlay (added V1_34)
- Bloom layer

**Mobile:** stability over flair. Strip hue-rotate and heavy filters. Use GPU-friendly transforms. CSS-first over JS transforms.

---

## Architecture

**Main site:** fixed-sections layout with black overlay fade transitions between sections.

**Timing values (do not change without flagging):**
- Overlay fade: `0.25s`
- Scroll cooldown: `550ms`
- Content slide-in: `0.35s` / `20px`
- Scroll-snap on `html`

**Sections:** Home → Bio → Videos → Photos → Arcade → Merch → Events

**Bio section scroll fix (V1_44+):**
- `.about-container` and `.about-content`: `pointer-events: auto`, `touch-action: pan-y`
- Document `touchmove` handler checks `e.target.closest()` to allow inner scroll

---

## Version Anchors
Reference builds when design drifts. Match exactly when reverting.

| Version | Description |
|---------|-------------|
| V1_19 | Color-mist lighting system, lightbox gallery, Rumble Brave title |
| V1_30 | 8 subtle splotches (60–95s, opacity 0.1–0.18), smooth menu hover fade, 4 photos, bloom intact |
| V1_33 | Per-section fractals/splotches, overlay fade-ins, black title outlines, TikTok removed |
| V1_34 | Organic vine overlay, tighter bio box, scroll-snap on html, section content shifted down |
| **V1_36** ★ | White title outlines, centered sections (5rem padding), wavy flutter overlay, smaller medium icon — *Kevin's favorite* |
| **V1_43** ★ | Pill music player, synced nav hover animations, restored logo glow/breathing, seamless black fades, smaller photo tiles with scale hover, new event/merch hover effects — *Kevin's favorite* |

★ Canonical baselines — check drift against these first.

---

## Arcade Suite

Seven HTML5 games, iframe-embedded into main site. All use Orbitron font, cyan/magenta/gold button palette, Firebase leaderboards.

| File | Game | Collection | Fields |
|------|------|------------|--------|
| `neon-brickbreaker.html` | Neon Brickbreaker / BOO Brickbreaker | `highscores` | `name`, `score` |
| `neon-survivors.html` | BOO Survivors (Vampire Survivors-lite) | `survivors_scores` | `name`, `score` |
| `neon-tower-defense.html` | BOO Tower Defense / Defense Force | `towerdefense_scores` | `name`, `wave`, `kills` |
| `neon-dig.html` | Neon Dig (mining / roguelike) | `neondig_scores` | `name`, `score`, `depth` |
| `neon-snake.html` | Snake Racing | `snake_scores` | `name`, `score` |
| `clydes-big-jump.html` | Clyde's Big Jump (Flappy Bird, golden retriever) | `clydes_jump_scores` | `name`, `score` |
| `neon-space-shooter.html` | Neon Pong / Space Shooter (legacy) | `spaceshooter_scores` | `name`, `score` |

**Firestore rules (all collections):** `name` string 2–12 chars, scores int >= 0, no updates, no deletes.

### Iframe sizing
- `enforceGameAspectRatio()` reads `data-aspect` from active arcade pill on mobile
- Desktop path hardcoded to `640/718` (brickbreaker ratio)
- Mobile game overhead: `155px` (reduced from earlier value)
- Per-game aspect ratios coordinated between CSS and JS — aspect ratio consistency is the #1 priority here

---

## Mobile Specifics

**Target device:** Kevin's OnePlus 13R (412px CSS viewport). Test against this first.

- Title scaling: `clamp(3rem, 15vw, 5.4rem)` (unified across sections)
- Mobile title line-break element present for forced wrapping
- Hero image: `max-width` tuned for 412px
- Merch CTA font fixed (V1_56)
- iOS pseudo-fullscreen: CSS positioning (do NOT use Fullscreen API — unreliable on Safari)
- iOS/iPadOS UA quirk: iPadOS 13+ reports as "Macintosh" — detect with touch + platform checks

---

## Browser Optimizations

| Browser | Handling |
|---------|----------|
| Safari (iOS/macOS) | Static title styling, boosted overlay opacity, direct style injection, avoid `text-stroke` animation on mobile H1 |
| Chrome / Chromium | Reduced overlay complexity on desktop; mobile GPU fixes |
| Firefox / LibreWolf | Dedicated detection + class targeting |
| All mobile | Lightweight builds — strip problematic animations, watch GPU memory on canvas-heavy pages |

---

## Code Philosophy

```
SURGICAL EDITS ONLY
 - Modify exactly what's requested — nothing more
 - Preserve ALL existing values, animations, features
 - Show only changed lines unless full file requested
 - Flag any change that might ripple to other elements
 - Never "clean up" or "improve" unrequested code
```

**We live in the details.** Kevin cares about minutiae. Pixel-level and percentage-level feedback is normal — expect multiple small passes.

---

## Dev Protocol — Rapid-Fire Mode

When a decision is needed, present numbered options with `[RECOMMENDED]` on the top choice:

```
Proposed: <change description>
  [1] <option A>  [RECOMMENDED — brief reason]
  [2] <option B>
  [3] <option C> / skip
>
```

**Kevin's responses:**
- `1` / `2` / `3` — pick that option
- `go` / `yes` / `y` / `ok` / empty — apply the recommendation
- `skip` / `s` — defer the decision
- Free text — override with something not in the list

**When to skip the menu:** surgical edits with no real alternative (e.g., fixing a typo, applying a Kevin-requested value). Just present the changelog for approval.

**When to always use the menu:** anything affecting design anchors, animation timings, arcade architecture, or Firebase schema.

---

## Git Autopilot

Solo dev + GitHub Pages + fast iteration → **direct push to main** on approval.

**Commit message format:** `[V1_XX] <brief description>`
Examples:
- `[V1_57] Tighten bio scroll touch-action on iOS`
- `[V1_58] Reduce arcade iframe overhead to 150px on mobile`

**Milestones:** tag significant releases.
```
git tag v1_57 -m "V1_57: bio scroll polish"
git push --tags
```

**Branch strategy:** main only. No feature branches unless Kevin flags an experimental change.

**Backup files:** the old `index_V1_XX.html` pattern is retired. Git history + tags cover this. Do not commit version-suffixed HTML backups.

**Push cadence:** commit + push per approved change. Group related micro-changes into one commit when possible.

---

## Key Learnings & Principles

- **Surgical edits only.** Change nothing outside explicit scope.
- **Propose before implementing.** Changelog-style proposals with side effects noted; wait for explicit approval.
- **Aspect ratio is sacred.** Per-game `data-aspect`, JS enforcement on resize, CSS + JS approaches must be coordinated.
- **Mobile Safari is its own OS.** CSS pseudo-fullscreen, UA string quirks, GPU memory limits.
- **Encoding hygiene.** UTF-8 corruption is a recurring risk — prefer clean source file uploads over in-place fixes when encoding issues are suspected. Avoid box-drawing characters (`├──` etc.) in committed files.
- **Dead code accumulates.** Periodic audits remove measurable KB (V1_49 removed ~147 lines).
- **Game architecture:** simpler beats complex. Straight projectiles over homing prediction, CSS-first mobile over JS transforms.
- **Reference anchors:** V1_36 and V1_43 are canonical. Check against them when drift is suspected.

---

## Local Development

```bash
# Serve locally
python3 -m http.server 8000
# Then open http://localhost:8000

# Firebase deploy (if CLI installed)
firebase deploy
```

---

## On the Horizon

- Complete Claude Code authentication + workflow integration (Windows)
- Continued mobile polish and cross-browser testing
- iOS App Store release of the BOO Arcade (Capacitor 6 wrapper at `mobile/`) — Phase 1 active in V1_89/V1_90 with Brickbreaker playable + 6 placeholders; remaining phases unlock the other games for App Review
- Ongoing game balance and feature refinement across the arcade suite

---

## Links
- **Live:** https://bunchofothers.com
- **Instagram:** https://instagram.com/bunch_of_others
- **YouTube:** https://youtube.com/@BunchOfOthersMusic
- **Spotify:** https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP
- **Apple Music:** https://music.apple.com/us/artist/bunch-of-others/1754588177
