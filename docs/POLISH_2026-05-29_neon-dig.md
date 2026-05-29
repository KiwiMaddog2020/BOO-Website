# Polish — Neon Dig (`Games/neon-dig.html`) — 2026-05-29

Audio + SAFE polish pass. **Mechanics locked**: no dig-speed, depth, spawn, loot,
scoring, balance, difficulty, or canvas-size changes. All edits surgical, anchored
on unique code snippets (never line numbers — the engine insert shifts everything).
No git, no server run. Did not re-touch V1_163 leaderboard hardening, V1_173
debug-key gating, or the V1_174 CORS handler.

---

## 1 Audit

Neon Dig — the deepest game in the arcade (a mining / roguelike descent with
~14.8k lines: per-material blocks, gem tiers, fuel, hazards, bombs, chain crystals,
magnet ore, alien nodes, mystery blocks, depth charges, locked boss gates, boss
battles, a slot-machine upgrade selector, a surface shop, and a Firebase
leaderboard) — was **completely silent**. Every one of those beats is a natural
audio cue, and the headline opportunity was distinct **per-material dig feedback**:
dirt vs. rock vs. hard rock vs. unstable vs. gems should each sound different.

Non-audio gaps found: the tutorial's step-1 "Rock" label carried a UTF-8 mojibake
artifact (`�ite;` before `🪨 Rock`); the pause control was a `<div>` (not keyboard-
focusable); three icon-only `✕` close buttons lacked `aria-label`s; and there was
no `prefers-reduced-motion` handling for the dozen looping decorative CSS keyframes.

Pre-audio craft: high. Pre-audio *fit* for an arcade title: weak — a silent mining
game with this much tactile interaction reads as broken.

---

## 2 Material dig sound map + event cues

Synth WebAudio engine (no asset files) inserted at the very top of the main game
IIFE, immediately after `'use strict';` and before the Firebase config / all game
state — so `SFX` is in scope for every function. Module-local globals here are NOT
on `window`, so `window.SFX = SFX;` is added per spec. Master gain 0.32, mute
persisted to `localStorage['neondig_muted']`, audio unlocked on first
pointer/touch/key and suspended on tab-hide. Primitives (`tone`/`noise`/`gate`)
kept EXACT as specified; cues verbatim. Digging is continuous, so dig cues are
throttled internally via `gate('dig', 85)` etc.

### Material dig cues — wired in `completeDig`, right after `createDigParticles(...)`

`world[ty][tx] = TILE.AIR;` → `createDigParticles(...)` is the plain-block funnel.
Gems, fuel, and unstable rock all *fall through* to this point (they don't early-
`return`), so the per-material map below is the correct single home for them.
Special blocks (bomb, cherry bomb, chest, upgrade chest, alien node, chain crystal,
bounce/depth charge, mystery block, magnet ore) `return` earlier and are wired at
their own sites.

| Tile (confirmed `TILE` constant) | Cue |
|-----------------------------------|-----|
| `TILE.GEM_EPIC` | `SFX.gemEpic()` (two-note shimmer) |
| `TILE.GEM_RARE` | `SFX.gemRare()` |
| `TILE.GEM_COMMON` | `SFX.gemCommon()` |
| `TILE.FUEL` | `SFX.digFuel()` |
| `TILE.HARD_ROCK` | `SFX.digHard()` (gated 95ms) |
| `TILE.UNSTABLE` | `SFX.digUnstable()` |
| `TILE.ROCK` | `SFX.digRock()` (gated 85ms) |
| else (DIRT + any other plain block) | `SFX.digDirt()` (gated 85ms) |

### Special-block + event cues (anchored on unique snippets)

| Event | Cue | Anchor |
|-------|-----|--------|
| Bomb explosion | `SFX.bomb()` | first line of `explodeBomb(...)` — **one cue per trigger** (clears 5×5 in a loop) |
| Cherry bomb | `SFX.cherryBomb()` | first line of `explodeCherryBomb(...)` |
| Depth charge | `SFX.depthCharge()` | first line of `triggerDepthCharge(...)` (clears 7 below) |
| Chain crystal | `SFX.chainCrystal()` | first line of `triggerChainCrystalExplosion(...)` (internally gated 55ms) |
| Magnet pull | `SFX.magnetOre()` | first line of `triggerMagnetPull(...)` (covers MAGNET_ORE break + mystery-block magnet roll) |
| Alien node | `SFX.alienNode()` | after `world[ty][tx] = TILE.AIR;` in the `TILE.ALIEN_NODE` block (one cue, many gems) |
| Mystery block | `SFX.mysteryBlock()` | after `world[ty][tx] = TILE.AIR;` in the `TILE.MYSTERY_BLOCK` block |
| Gem chest open | `SFX.chestOpen()` | first line of `openChest(...)` |
| Upgrade chest | `SFX.upgradeChest()` | first line of `openUpgradeChest(...)` |
| Bedrock reject | `SFX.bedrockClank()` | `if (tile === TILE.BEDROCK) { SFX.bedrockClank(); return; }` in `dig()` (gated 160ms) |
| Gate locked | `SFX.gateLocked()` | just before `createFloatingText('🔒 LOCKED!', ...)` |
| Gate unlocked | `SFX.gateUnlock()` | first line of `triggerGateUnlockAnimation(...)` |
| Fever activate | `SFX.fever()` | first line of `activateFeverMode()` |
| Hazard hit (lava/gas) | `SFX.hazard()` | first line of the `TILE.LAVA || TILE.GAS` block, before `hull -= damage` |
| Enemy contact damage | `SFX.damage()` | before the enemy-contact `hull -= damage` (after the `// Take damage from enemy` comment) |
| Low hull warning | `SFX.lowHealth()` | inside the `hullPercent < 0.30` render block (gated 1.2s — safe per frame) |
| Low fuel warning | `SFX.lowFuel()` | inside the `fuelPercent < 0.30` render block (gated 1.2s) |
| Drill overheat | `SFX.overheat()` | after `drillOverheated = true;` |
| Depth milestone | `SFX.depthMilestone()` | inside `if (currentDepth > maxDepthThisRun)` (gated 1.5s) |
| Boss intro | `SFX.bossIntro()` | first line of `startBossBattle()` |
| Boss victory | `SFX.bossVictory()` | first line of `triggerBossVictory()` |
| Teleport from boss | `SFX.teleport()` | first line of `teleportFromBoss()` |
| Death animation | `SFX.death()` | after `deathAnimationActive = true;` |
| Game over | `SFX.gameover()` | first line of `gameOver()` |
| Leaderboard submit OK | `SFX.submit()` | inside `if (success) { ... }` before `hideScoreModal()` |
| Shop buy (success only) | `SFX.buy()` | before `return true;` in `buyShopUpgrade()` (after points deducted) |
| Upgrade selected | `SFX.selectUpgrade()` | after `upgradeSelected = true;` in `selectUpgrade()` |
| UI click (menu/close/nav) | `SFX.uiClick()` | one delegated `document` click listener (see below) |

**Chain-reaction safety:** bomb / cherry bomb / depth charge / magnet pull / chain
crystal / alien node all clear many tiles in a loop — each emits exactly **one**
cue at the trigger (function entry or the single break site), never one per tile.

**Delegated UI-click listener** is scoped to buttons WITHOUT a dedicated cue
(`.menu-btn, .surface-upgrade-btn, .tutorial-nav-btn, .leaderboard-close,
.shop-close, .tutorial-close, .skip`) to avoid double-firing alongside
buy/submit/select/boss cues. The mute button calls `stopPropagation()` and is
excluded; the pause button is intentionally silent.

**Mute control:** a real `<button id="muteBtn">` sibling to the pause button,
offset to `left:50px` so it never overlaps pause. Glyph toggles 🔊/🔇, persists,
`aria-pressed` reflects state. Also bound to the **M** key (guarded with
`!window.DEBUG_KEYS` so it never clobbers the V1_173-gated debug `M` teleport).

---

## 3 SAFE polish

- **Mojibake fix.** Tutorial step 1 read `🪨 Rock` with a stray `�ite;`
  (`ef bf bd 69 74 65 3b` = U+FFFD replacement char + literal "ite;") in front.
  Replaced the span text so it cleanly reads `🪨 Rock`. Verified no other U+FFFD
  bytes remain anywhere in the file. No box-drawing chars introduced.
- **`#pauseBtn` → real `<button>`.** Was a `<div class="pause-btn">`; now
  `<button class="pause-btn" type="button" aria-label="Pause">`. The `.pause-btn`
  CSS targets the class (fixed 36×36 flex box, `display:none`→`flex` via
  `.visible`), so layout is unchanged; all JS uses `classList` / `textContent` /
  `style.display` which behave identically on a button.
- **a11y labels.** Added `type="button"` + `aria-label` to the three icon-only `✕`
  buttons: `#leaderboardClose` ("Close leaderboard"), `#tutorialClose`
  ("Close tutorial"), `#shopClose` ("Close shop"). The mute button ships with its
  own `aria-label`.
- **`prefers-reduced-motion`.** New `@media (prefers-reduced-motion: reduce)` block
  sets `animation: none !important` on the 12 decorative looping keyframes
  (`.upgrade-title`, `.upgrade-slot.rolling .upgrade-content`, `.boss-intro-icon`,
  `.boss-victory-title`, `.boss-victory-key`, `.score-input.error`,
  `.tutorial-step`, `.alien-key`, `.upgrade-arrow.visible` + its tail/head,
  `.tutorial-joystick-thumb`, `.tutorial-finger`). Each selector is written as its
  own ungrouped rule and verified to exist in the stylesheet (avoids the silent-
  dead-rule failure mode). Functional fuel/hull `criticalPulse` warnings and all
  **canvas** rendering are deliberately untouched.

---

## 4 Deferred / MECH-flagged (NOT applied — owner's call)

- **"GOLDMINE" → "Neon Dig" title rename.** Branding decision. Left as-is.
- **Oxanium / Exo 2 → Orbitron font swap.** The arcade house font is Orbitron, but
  swapping is a visual/owner decision, not a SAFE edit. Left as-is.

No mechanics were touched: dig times, depth/spawn/loot tables, scoring, fuel/heat
balance, difficulty, and canvas dimensions (`540×500`, `BASE_WIDTH/HEIGHT`) are all
byte-for-byte unchanged.

---

## 5 Validation

- `node --check` on the extracted main inline script (12,550 lines): **PASS**.
  Head Firebase-loader script also checked: PASS.
- `window.SFX = SFX;` present (one assignment).
- 36 distinct cue methods invoked across the file; every `SFX.<method>` call site
  has a matching definition in the engine (no typos / undefined refs — verified by
  set-diff of called vs. defined method names).
- All `TILE` constants referenced in wiring (GEM_EPIC/RARE/COMMON, FUEL, HARD_ROCK,
  UNSTABLE, ROCK, BEDROCK, LAVA, GAS, ALIEN_NODE, MYSTERY_BLOCK) confirmed against
  the frozen `TILE` enum.
- Canvas size untouched.
- **Manual boot path (for Kevin):** open the page → `#startBtn` ("start game")
  calls `startGame` → hold **ArrowDown / S** to dig and you should hear distinct
  dirt/rock cues; dig sideways into colored tiles for gem chimes; the 🔊 button
  (top-left, right of pause) and **M** key toggle mute (persists across reloads).

---

## 6 Re-rate

| Axis | Before | After |
|------|--------|-------|
| Craft | 8.5/10 | 9/10 |
| Fit (arcade audio + a11y) | 5/10 | 9/10 |

**Headline delivered:** distinct per-material dig feedback (dirt / rock / hard rock
/ unstable / three gem tiers / fuel) plus full event coverage — bombs, hazards,
chests, gates, fever, boss arcs, depth milestones, death, leaderboard, shop.

**Blockers to a clean 10:** (1) the deferred title rename and font swap are the two
remaining *fit* items, both owner-gated; (2) cues are unverified by ear in this
environment (no audio in headless check) — needs a quick in-browser listen pass to
confirm mix levels feel right against the existing screen-shake/flash feedback.
