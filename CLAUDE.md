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

**Game audio (V1_386–V1_403):** all 7 games have original procedural chiptune soundtracks — NES-style Web Audio synthesis (duty-cycle pulse leads, triangle bass, noise drums), zero audio assets. Survivors' engine is embedded in its file (V1_386/387); the other 6 games share `Games/boo-music.js` with per-game composed track data. Standard structure per game: title theme on menus, in-game rotation (shuffled, 2 loops each), game-over sting that swells back into the title. **Survivors carries a 30-track catalog** (V1_414/V1_415): title (24-bar), 27 rotation-capable 32-bar tracks — the 12 meadow originals extended to 32 bars (V1_415, shipped bars byte-identical) plus 15 per-level compositions (V1_414, 5 per new level) — a maw boss override (V1_410), and the game-over sting. **Fade-out → fade-in transitions between rotation songs** (V1_395, `ROT_FADEOUT`/`ROT_GAP`/`ROT_FADEIN` dials); **per-level pools** (V1_414 semantic change: `LEVELS[].music` IS the pool, validated against `TRACKS`, fallback full-12 if <2 valid; meadow = all 12). Per-track `echoWet` works in both engines (V1_390 shared / V1_394 Survivors). Neon-dig has a boss-room override track (V1_390, `MUSIC.setOverride`). Pause/upgrade overlays low-pass duck the music; the mute button silences music+SFX; **all game music auto-yields while the site's `#audio-player` is playing** (same-origin parent check). Track data = per-bar note strings, validated to exactly 16 steps/bar.

**BOO Survivors progression system (V1_396–V1_427):** the flagship game is now a fully-fledged multi-level game — see `docs/PROGRESSION_DESIGN.md` (authoritative architecture, §8–§9 = current state; scored 93/100 vs Vampire Survivors base = 100 after the 90+ polish campaign). Meta save in `localStorage` key `survivors_meta` (versioned, additive-only, never re-locks). **28 achievements** gate unlocks (V1_420 drip-feed retune: session 1 = exactly 3 unlocks; raised run/lifetime thresholds; level-conditional runStat feats via optional `level:` tag — Marsh Endurance / Grave Vigil / Forged in Fire / Hellwalker; progress only counts on the matching world): fresh saves start with 10/25 weapons + 8/16 tomes + 1/6 levels + 1/9 sprites; locked content never appears in ANY offer surface (central `weaponOfferAllowed()` / `tomeOfferAllowed()` chokepoints — extend these, never bypass). **Evolutions (V1_417, wave 1 = 8 of 25 planned):** `EVOLUTIONS` registry — equipped base weapon at L20 + paired tome owned turns the next chest into an EVOLVE reveal; evolved = final form (no level-ups, never offered); recipes in the Info popup. **17 legendaries, one-of-each per run** (V1_418: splitFire removed; soulHarvest/spectralEcho/phantomStride/guardianWisp added; owned-filter at the `showLegendaryUpgrade()` chokepoint + chest preview; all-owned → blessing fallback). **Power ceiling (V1_416):** two-lane rule in `Player.applyPassives` — permanent stacking passes DR knees (`PERM_AS_KNEE`/`PERM_CRIT_KNEE`), temporary buffs stack after unscaled; strong/mid builds measured 7.5×→4.05×. **PLASM meta-currency + shop (V1_421):** Megabonk-style split — gold stays in-run; plasm drops from mini-bosses (2) / bosses (5), level clears credit 25 (+25 first), Maw seal 100, survival bonus floor(min/2); menu PLASM SHOP = 10 permanent stats × 5 ranks (~+20–25% at full board, 2,000 plasm total, full refund), applied at `startGame` THROUGH the V1_416 permanent lane. **Viewport-cutoff law (V1_422):** no screen/menu/overlay may clip content or exit buttons at any viewport — bounded max-height + inner scroll + pinned header/footer (the tome-editor recipe); gotcha: `backdrop-filter` on an overlay makes it the containing block for `position:fixed` children (blur belongs on a `::before` layer); audited 36 surfaces × 5 viewports. **Projectile glows baked (V1_423):** `_getProjectileGlowSprite(color)` halo cache replaced all per-frame shadowBlur in `Projectile.draw` (−70% whole-frame in dense scenes; perf law now fully enforced in every hot path). **Master code (V1_425):** tap the menu title 7× → enter `BOO-LEGENDS` → unlocks all content + marks clears + one-time +2,000 plasm (achievements stay earned honestly); code revealed in the achievements panel at 100% (all levels cleared + all weapons/tomes) for device transfer. **V1_426:** Flame Thrower base cone +35% reach / +36% arc (bench-trimmed to 1.19× at L7; flame now respects `ONSCREEN_RANGE_CAP` — it previously had no cap). **V1_427:** shop menu entry is titled UPGRADES (plasm kept as the currency + save keys); fresh saves start with meadow AND marsh (`STARTER_LEVELS`), `meadowCleared` is a pure badge. **RELICS (V1_434–V1_437, `docs/RELICS_DESIGN.md`):** chests now drop run-local passive items — 36 relics across 4 rarities (11/11/9/5, band-tour-junk flavor), luck-scaled rarity rolls (rare ×(1+L)/epic ×(1+1.5L)/legendary ×(1+2L)) + pity, free chests roll +0.25 luck; evolution/pot/blessing chest precedence untouched; single `relicStatTotals()` collector into `applyPassives` (atk-speed + crit-dmg through the V1_416 knees, both proven), event relics on single chokepoints; 6 tradeoff relics, Encore Flare revive, Platinum Record is the ONLY projectile source (shrine roll removed); rarity ceremony + pause RELICS strip + results-line; realistic-run ceiling measured median 1.05×/p90 1.17× vs 4.05× (theoretical all-max hoard economically unreachable — open Kevin call in design doc §10). Final system score 95/100 vs Megabonk rubric. **Run consumables (V1_431):** level-up REROLL/BANISH/SKIP charges (base 1/1/0 + UPGRADES shop rows), banish flows through the offer chokepoints; pre-game Edit Weapons/Tomes ban slots gated base 1+1 (shop-expandable to the old 5/3); shop = 15 rows, full board 2,590 plasm, master-code grant 2,600. **Game-over split (V1_432):** death → score modal → RESULTS screen (stats/plasm/next-unlock/CONTINUE) → menu screen. **Duplicate pause/mute fix (V1_424, index.html):** `resyncPaneFs()` re-hands fullscreen state to a swapped-in game (load listener + idempotent retry burst — the tail bridge script can miss a single early postMessage). **6 levels** (`LEVELS` registry: meadow / marsh / necropolis / ember / rift / inferno "Hellmouth", V1_407 endgame) with per-level spawn tables, tuning multipliers, theme tables (ground/flowers/motes/ambience — `COLORS` gameplay neon stays global), terrain variants (visual-only `waterStyle`/`deco` dispatch — collision semantics sacred), themed boss names+tints (`BOSS_IDENTITY`), and music subsets. **9 unlockable player sprites** (V1_406/V1_408, `PLAYER_SPRITES` registry: drawn inside the squash/lean transform, tint with the color picker; the `overHat()` pass draws horns/halo/flames/moss through-or-around the cowboy hat inside its tilt transform). **11 enemy kinds**: 4 legacy (untouched switch) + 7 registry-driven (`ENEMY_KINDS`), incl. ranged with first-class `enemyProjectiles` under the fun-not-annoying doctrine: projectile speed < player walk speed, everything telegraphed, no homing, global cap 24, ranged mobs hold ground. **Victory state**: every level's FINAL HORDE fires at 30:00; surviving 120s = LEVEL CLEARED (unlocks next level; KEEP GOING continues the endless escalation; FINISH RUN not counted as a perish). **THE MAW (V1_409/V1_410)**: true final boss behind a post-clear portal on Hellmouth only — 3 telegraphed phases (telemetry-instrumented, min 800ms warnings), win = SEALED + Legend sprite; own boss theme via `MUSIC.setOverride('maw')`; `MAW_HP` 220k (V1_413 measured — live dodge-uptime is the open tuning input). Perf law: NO per-frame `ctx.shadowBlur` in hot paths (enemy + ghost glows baked V1_411, −54% crowd draw; ghosts soft-capped at 12; `Projectile.draw` bake is the flagged #1 remaining perf item). Player damage is blocked while `gamePaused` (V1_402 victory/death race fix). 10-step How-to-Play tutorial covers all of this (V1_405 — overlay z-index must stay above the menu's 2000). Test seams: `META._warp/_sim/_reset`, `window.__P4/__P5/__MAW`.

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
| `neon-survivors.html` | BOO Survivors (Vampire Survivors-like; 6 levels + Maw finale, meta progression, evolutions, plasm shop as of V1_396–V1_422) | `survivors_scores` | `name`, `score` |
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

**V1_458 → V1_461 (site redesign pass):**

- **BOO Pinball removed (V1_458):** `Games/boo-pinball.html`, its arcade pill, the pinball E2E smoke test + the 600/900 aspect exception, and both pinball design docs are gone (git history keeps them). Every pill is back to the normalized 640/718 aspect; the arcade is 6 visible games + hidden Space Shooter.
- **Home hero (V1_459):** desktop editorial layout, fenced behind `(min-width: 1100px) and (orientation: landscape) and (hover: hover) and (pointer: fine)` so phones + iPads keep the hand-tuned stacked layout. Left column: eyebrow line, 2-line title (`.mobile-title-break` shown), "Listen on" platform pills (label only >=1500px), CTA row (`Enter the Arcade` gradient primary + `Upcoming Shows`; both are plain `#hash` anchors so they ride the existing fade transition). Right column: album art at `min(86%, 64vh, 36vw)` with a CSS-only spinning vinyl (`.hero-image-container::before`, `vinylSpin` 16s). All viewports: `.album-announcement` is now a neon chip pinned to the bottom of the cover, social pills get a glass border at rest, and the pill row joins the staggered reveal. Ultrawide content caps at ~1900px via `max(clamp(), calc((100vw - 1900px)/2))` side padding.
- **Site-wide (V1_460), same desktop fence:** Bio = the original centred text with two labelled headshots per side (see V1_461); Photos = 6x2 grid sized `min(84vw, 1640px, (62vh - 1rem) * 3)`; Events = Recent Releases | Upcoming Shows side by side (`h2:nth-of-type(n) + .events-container` grid areas) with upgraded event cards. Every viewport: `.coming-soon-sub` line under the merch banner (hidden in `?beta=pay`). Desktop-only elements (`.home-eyebrow`, `.home-cta-row`, `.about-portraits`) are `display:none` outside the fence.
- **Bio headshots + no tagline (V1_461):** Kevin review pass on V1_459/V1_460. The `.home-tagline` element and all of its CSS are gone (the hero grid drops the `tagline` row; the pills row margin grew to `clamp(1.8rem, 3.4vh, 3rem)`). The Bio `.about-lineup` card is replaced by `.about-portraits`: the text box reverts to its original centred 662px look, flanked on the same desktop fence by two labelled square headshots per side (`#about` grid `"heading heading heading"` / `"left story right"`; Jeff / Shawn left, Joe / Johnny right; name in Poppins 700 uppercase + a muted Oxanium role line). Portraits are cropped from `Images/BOO_BandShot.webp` into `Images/Headshots/{jeff,shawn,joe,johnny}.webp` (420x420 WebP q0.82). The portrait column max is `min(210px, 23vh)` so it never outgrows the text box on 768px-tall laptops. Phones + iPads keep the unchanged stacked bio.

---

## Links
- **Live:** https://bunchofothers.com
- **Instagram:** https://instagram.com/bunch_of_others
- **YouTube:** https://youtube.com/@BunchOfOthersMusic
- **Spotify:** https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP
- **Apple Music:** https://music.apple.com/us/artist/bunch-of-others/1754588177
