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
- **Backend:** Firebase Firestore (leaderboards) — SDK 10.14.1 (V1_105)
- **Analytics:** Google Analytics — ID `G-ELVHNXC9MJ`
- **Hosting:** GitHub Pages
- **Version control:** Git + GitHub Desktop (Windows)
- **Tests (V1_104+):** Playwright E2E (`tests/e2e/critical-paths.spec.js`); 18 tests across 3 viewports (chromium / mobile-android / mobile-ios). CI deploy is gated on this suite passing (V1_166)
- **CI:** GitHub Actions — `.github/workflows/test.yml` runs Playwright on push/PR to `main`
- **PWA (V1_116+):** `manifest.webmanifest` makes the site installable on Android + iOS Add-to-Home-Screen
- **SEO/discovery (V1_108):** `sitemap.xml`, `robots.txt`, JSON-LD `MusicGroup` schema; `humans.txt` credits (V1_121)

**Fonts (current):**
- Tilt Neon — display / psychedelic titles (declared)
- Oxanium — body / UI; **unified font across all 7 arcade games (CSS + canvas) per V1_245**
- Exo 2 — secondary UI
- Orbitron — *historical games font; replaced by Oxanium across the arcade in V1_245 — avoid in new work*
- Poppins — navigation (loaded via Google Fonts)
- Rumble Brave — home h1 + section h2 headers (V1_110 promoted this from historical; declared with cursive fallback per V1_123 — Kevin prefers the system-cursive look it falls back to)
- Bebas Neue — *historical, avoid in new work*

**Game audio (V1_386–V1_403):** all 7 games have original procedural chiptune soundtracks — NES-style Web Audio synthesis (duty-cycle pulse leads, triangle bass, noise drums), zero audio assets. Survivors' engine is embedded in its file (V1_386/387); the other 6 games share `Games/boo-music.js` with per-game composed track data. Standard structure per game: title theme on menus, in-game rotation (shuffled, 2 loops each), game-over sting that swells back into the title. **Survivors runs a 12-song in-game rotation** (V1_391/V1_394, ~12 min shuffled cycle; the six V1_394 tracks are longer 24-bar forms) with **fade-out → fade-in transitions between rotation songs** (V1_395, `ROT_FADEOUT`/`ROT_GAP`/`ROT_FADEIN` dials) and **per-level mood subsets** (V1_403, `LEVELS[].music` filters the pool; meadow = all 12). Per-track `echoWet` works in both engines (V1_390 shared / V1_394 Survivors). Neon-dig has a boss-room override track (V1_390, `MUSIC.setOverride`). Pause/upgrade overlays low-pass duck the music; the mute button silences music+SFX; **all game music auto-yields while the site's `#audio-player` is playing** (same-origin parent check). Track data = per-bar note strings, validated to exactly 16 steps/bar.

**BOO Survivors progression system (V1_396–V1_413):** the flagship game is now a fully-fledged multi-level game — see `docs/PROGRESSION_DESIGN.md` (authoritative architecture, §8 = current state; scored 93/100 vs Vampire Survivors base = 100 after the 90+ polish campaign). Meta save in `localStorage` key `survivors_meta` (versioned, additive-only, never re-locks). **25 achievements** gate unlocks: fresh saves start with 10/25 weapons + 8/16 tomes + 1/6 levels + 1/9 sprites; locked content never appears in ANY offer surface (central `weaponOfferAllowed()` / `tomeOfferAllowed()` chokepoints — extend these, never bypass). **6 levels** (`LEVELS` registry: meadow / marsh / necropolis / ember / rift / inferno "Hellmouth", V1_407 endgame) with per-level spawn tables, tuning multipliers, theme tables (ground/flowers/motes/ambience — `COLORS` gameplay neon stays global), terrain variants (visual-only `waterStyle`/`deco` dispatch — collision semantics sacred), themed boss names+tints (`BOSS_IDENTITY`), and music subsets. **9 unlockable player sprites** (V1_406/V1_408, `PLAYER_SPRITES` registry: drawn inside the squash/lean transform, tint with the color picker; the `overHat()` pass draws horns/halo/flames/moss through-or-around the cowboy hat inside its tilt transform). **11 enemy kinds**: 4 legacy (untouched switch) + 7 registry-driven (`ENEMY_KINDS`), incl. ranged with first-class `enemyProjectiles` under the fun-not-annoying doctrine: projectile speed < player walk speed, everything telegraphed, no homing, global cap 24, ranged mobs hold ground. **Victory state**: every level's FINAL HORDE fires at 30:00; surviving 120s = LEVEL CLEARED (unlocks next level; KEEP GOING continues the endless escalation; FINISH RUN not counted as a perish). **THE MAW (V1_409/V1_410)**: true final boss behind a post-clear portal on Hellmouth only — 3 telegraphed phases (telemetry-instrumented, min 800ms warnings), win = SEALED + Legend sprite; own boss theme via `MUSIC.setOverride('maw')`; `MAW_HP` 220k (V1_413 measured — live dodge-uptime is the open tuning input). Perf law: NO per-frame `ctx.shadowBlur` in hot paths (enemy + ghost glows baked V1_411, −54% crowd draw; ghosts soft-capped at 12; `Projectile.draw` bake is the flagged #1 remaining perf item). Player damage is blocked while `gamePaused` (V1_402 victory/death race fix). 10-step How-to-Play tutorial covers all of this (V1_405 — overlay z-index must stay above the menu's 2000). Test seams: `META._warp/_sim/_reset`, `window.__P4/__P5/__MAW`.

**iOS dev (in progress):** Xcode (beta, iOS 26.2 runtime); Capacitor 6 wrapper at `mobile/` bundling the existing HTML5 games as a native iOS app. `Games/`, `Images/`, `Music/` at the repo root remain canonical — `mobile/build-www.sh` syncs them into `mobile/www/` before each build. Phase 2 (V1_96+) activates all 7 games in the arcade menu; V1_92 added custom radial-halo icon + animated splash; V1_97/V1_98 unified game sizing with an 8%-per-side letterbox cap for fullscreen.

---

## Aesthetic

**Neon palette** (values reflect actual usage in `index.html` as of V1_175):
- Cyan `#00ffff` / `#0ff` — primary
- Pink / magenta `#ff1493` — secondary (dominant in code; `#ff00ff` appears only rarely)
- Purple `#9b30ff` — accent (the historical `#8b00ff` is documented-but-unused)
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

Seven HTML5 games, iframe-embedded into main site. All use Oxanium font (unified V1_245), cyan/magenta/gold button palette, Firebase leaderboards.

| File | Game | Collection | Fields |
|------|------|------------|--------|
| `neon-brickbreaker.html` | Neon Brickbreaker / BOO Brickbreaker | `highscores` | `name`, `score` |
| `neon-survivors.html` | BOO Survivors (Vampire Survivors-like; 5 levels + meta progression as of V1_396+) | `survivors_scores` | `name`, `score` |
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

**Rapid-Fire Mode is always on (the default).** When a decision is needed, present the options as **clickable cards via the AskUserQuestion tool** — not a plain-text `[1]/[2]/[3]` list. Conventions:

- Put the recommended option **first** and mark it `(Recommended)` in the label, with a brief reason in its description.
- Include a "skip / defer" option when deferring is reasonable. (Kevin can always pick "Other" to free-text an override.)
- One question = one decision. For several independent decisions, batch them as multiple questions in a single AskUserQuestion call (up to 4).
- `go` / `yes` / `y` / `ok` / empty still means "apply the recommendation."

**When to skip the cards:** surgical edits with no real alternative (e.g., fixing a typo, applying a Kevin-requested value). Just present the changelog for approval — no AskUserQuestion needed.

**When to always use the cards:** anything affecting design anchors, animation timings, arcade architecture, Firebase schema, or game balance.

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
# Serve locally (pick one)
python3 -m http.server 8000        # then open http://localhost:8000
npm run serve                       # serve on :4747 (no clipboard) via package.json

# Run Playwright E2E tests (V1_104+)
npm run test:e2e                    # headless across all 3 projects
npm run test:e2e:ui                 # interactive UI mode
npm run test:e2e:headed             # headed mode (watch the browser run)

# Firebase deploy (if CLI installed)
firebase deploy
```

---

## On the Horizon

- Complete Claude Code authentication + workflow integration (Windows)
- Continued mobile polish and cross-browser testing
- iOS App Store release of the BOO Arcade (Capacitor 6 wrapper at `mobile/`) — Phase 2 active as of V1_96 with all 7 games playable; V1_97–V1_102 polished sizing, fullscreen letterbox, and section wallpapers ahead of App Review
- Ongoing game balance and feature refinement across the arcade suite

**Recently shipped (V1_104 → V1_168):**

- **Testing/CI:** Playwright E2E suite (17 tests / 50 runs across chromium + mobile-android + mobile-ios) wired to GitHub Actions on every push/PR to `main`
- **Performance:** Firebase 9.22.0 → 10.14.1 (V1_105); preconnect/dns-prefetch (V1_106); deferred Firebase via `requestIdleCallback` (V1_109); `loading="lazy"` on iframes (V1_112); `width`/`height`/`decoding=async` on photos (V1_113)
- **A11y:** `aria-label` on arcade pills + lightbox (V1_107); skip-to-content + `<main id="main-content">` (V1_114/V1_115); PWA manifest (V1_116); error suppressor scoped to CORS (V1_117); `aria-current="page"` on nav (V1_118); `<header role="banner">` landmark (V1_119); `lang="en-CA"` (V1_121)
- **SEO:** JSON-LD `MusicGroup` + `sitemap.xml` + `robots.txt` (V1_108); `humans.txt` credits (V1_121)
- **Visual polish:** Rumble Brave promoted to active header font (V1_110, V1_122/V1_123 settled font story); section h2 + home h1 margin nudges (V1_124–V1_127)

**V1_128 → V1_168:**

- **Mobile nav redesign (V1_149):** hamburger + fullscreen overlay menu (chromatic-shimmer vertical stack); tap-split touch handling
- **Performance (V1_150):** all JPGs → WebP @ q70 (~30% byte reduction; 78 refs updated)
- **A11y (V1_151):** universal `:focus-visible` neon ring on keyboard nav
- **iPad (V1_153 → V1_160):** dedicated spacing/breakpoint matrix for iPad mini landscape + iPad Pro portrait; viewport breakpoint hardening; navigation lock
- **Content (V1_155):** Okanagan Tattoo Show event
- **Music player (V1_161, V1_165):** mobile toggle single debounced handler; V1_165 stopped page-init from clobbering the saved preference
- **Polish round (V1_162 → V1_168, Opus 4.8):** fixed stacked-`requestAnimationFrame` loops in Space Shooter + Brickbreaker (compounding speed after "play again"); hardened all 7 leaderboard renders against malformed docs; iOS-WebView `localStorage` boot guards; lightbox arrow-key guard; CI deploy now **gated on the E2E suite** (V1_166); `firestore.rules` + `firebase.json` added to version control (V1_167); docs truth pass (V1_168). Full audit + remaining rounds: `docs/POLISH_2026-05-28_whole-boo-website.md`

**V1_240 → V1_248 (Opus 4.8 — arcade upgrade-screen / font / UX pass):**

- **Upgrade screens unified to the "Goldmine" (neon-dig) look (V1_240, V1_242, V1_243):** radial-gradient + `blur(12px)` backdrop, Oxanium type, thin glowing slot cards. Covers Survivors (level-up + shrine / leprechaun / legendary reward overlays), Snake, Space Shooter, Brickbreaker, and Tower Defense — TD's single `.upgrade-overlay` serves between-rounds, leprechaun-kill, and campaign stage transitions. Brickbreaker tick sound applied everywhere.
- **Goldmine combat sounds (V1_241):** gated boss-hit / boss-attack / boss-surface / enemy-spawn / enemy-death cues (SFX only, no logic change).
- **Tower Defense UX (V1_244):** tower-button emoji nudged down 2px; title screen contained to its window (`justify-content: safe center` + `overflow-y: auto`) so the START → mode-select screen no longer clips on short / landscape windows.
- **Fonts unified to Oxanium (V1_245):** all 7 games now load + use Oxanium for both CSS and canvas-drawn text (was a mix of Orbitron / Arial / monospace / Tilt Neon / Bebas Neue). Fixed Survivors (declared Orbitron) and Space Shooter (declared Oxanium) silently falling back to monospace because the font was never loaded.
- **Font pass finished (V1_247, V1_248):** V1_245 had skipped TD + Goldmine (only their upgrade overlays were Oxanium). TD's `.game-title` was still inheriting `'Segoe UI'` from its body — the "wrong title font." Converted both games' body + remaining canvas `Arial`/bare-`sans-serif` strings, then removed Goldmine's last `Exo 2` (body + stat-panel labels + font link). All 7 games are now **100% Oxanium** (CSS + canvas); titles already uniform at 42px / 4px letter-spacing (32px mobile). Exo 2 remains the site's secondary-UI font on the main page only.

---

## Links
- **Live:** https://bunchofothers.com
- **Instagram:** https://instagram.com/bunch_of_others
- **YouTube:** https://youtube.com/@BunchOfOthersMusic
- **Spotify:** https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP
- **Apple Music:** https://music.apple.com/us/artist/bunch-of-others/1754588177
