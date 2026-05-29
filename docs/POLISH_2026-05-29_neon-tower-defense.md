# Polish — BOO Tower Defense (`Games/neon-tower-defense.html`)

**Date:** 2026-05-29 · **Scope:** Sound effects + SAFE polish, ONE file. Mechanics LOCKED (no tower/enemy stats, spawn, wave comp, economy, balance, difficulty, or canvas-size changes). No git, no server. Canvas size untouched (648×576; `BASE_WIDTH`/`BASE_HEIGHT` 648/576). 12,333 → 12,504 lines.

---

## 1 Audit (craft × fit + evidence)

**Craft (before):** A deep, polished tower-defense — 14 placeable towers (each a typed branch dispatched off `def.is*` flags / `tower.type`), a separate champion system (`striker`/`caster`/`legendary` via `championEffects`), inferno AOE zones, slot-reel upgrade picker with rarities, campaign (new map every 5 waves) + classic endless modes, leprechaun mini-events, megaboss spawns, HiDPI render-buffer scaling, a canvas-drawn HUD for fullscreen/iframe, and a Firebase leaderboard with local fallback (hardened V1_163). Mechanically ~8.5/10.

**Fit gap (the blocker):** The game was **completely silent** — no `AudioContext`, no `<audio>`, zero sound calls (grep confirmed). For a tower-defense whose entire loop is *place → fire → kill → upgrade*, silence is the single biggest fit miss. The owner's headline ask: **a distinct fire sound per tower TYPE.** Mobile WebView also needs a user-gesture audio unlock and a mute control that stays reachable in the fullscreen/iframe layout (where the DOM HUD is hidden and replaced by a canvas-drawn HUD).

**Secondary craft nits found:**
- Dead ternary: `gold = gameMode === 'campaign' ? 65 : 65;` — both arms identical (zero behavior change to collapse).
- Stale `// ====== TEST: Wave 30 test build ... ======` comment block left in `startGame()`.
- a11y: icon-only buttons with no accessible name — `#speedBtn` (`▶▶ 1x`), `#exitBtn` (`✕ EXIT`), three `✕` close buttons (`#tutorialClose`, `#placementCancel`, `#leaderboardClose`) and the `✓` placement-confirm. (The `↺`/`↻` rotate buttons already carry `title`.)
- No `prefers-reduced-motion` fallback for the ~17 decorative entrance/pulse keyframes (title pulse, slot shine, slot-roll, rarity pulses, transition pulses, tutorial fade, bounce arrow, input shake).

---

## 2 Per-tower fire sound map + event cues

A self-contained synth WebAudio engine (`SFX`) was inserted at the top of the main game `<script>`, immediately before the Firebase config block. Primitives (`tone`, `noise`, `gate`) + a per-tower `fire(type)` dispatcher + event cues; master gain `0.32 × vol`, mute persisted to `localStorage['towerdefense_muted']`; unlocked on first `pointerdown`/`touchstart`/`keydown`; suspended on tab-hide via `visibilitychange`. `window.SFX = SFX;` exposes it (module-local globals are not on `window` here). Each fire cue fires **once per actual shot** and is **throttled per type** by `gate('fire_'+type, minMs)` — towers fire fast, so this prevents a wall of noise.

### Tower fire cues — 13 distinct (the headline)

| Tower | `tower.type` | Fire path / dispatch | Cue (osc, sweep) | Wired at (unique anchor) |
|-------|--------------|----------------------|------------------|--------------------------|
| Blaster | `basic` | `fireProjectile` → shared push | square 660→520 | `SFX.fire(tower.type)` after `tower.lastFired = performance.now();` |
| Sniper | `sniper` | `fireProjectile` → shared push | saw 1400→300 | (same shared site) |
| Freezer | `freeze` | `fireProjectile` → shared push | sine 900→1500 | (same shared site) |
| Bomber | `splash` | `fireProjectile` → shared push | square 220→130 | (same shared site) |
| Minigun | `minigun` | `fireProjectile` → shared push | square 520 (150ms gate) | (same shared site) |
| Cannon | `cannon` | `fireProjectile` → shared push | saw 160→90 | (same shared site) |
| Poison | `poison` | `fireProjectile` → shared push | tri 400→280 + noise | (same shared site) |
| Chain | `chain` | `fireProjectile` → shared push | square 740→1100 | (same shared site) |
| Beam | `laser` | `isBeam` branch | saw 300→360 (150ms gate) | `SFX.fire('laser')` inside `if (tower.beamTarget !== bestTarget)` (**lock-change only**, not per damage tick) |
| Tesla Coil | `tesla` | `isTesla` branch | saw 1000→1600 + noise (110ms gate) | after `tower.teslaFireTime = now;` |
| Inferno | `inferno` | `isInferno` branch | square 180→110 (110ms gate) | after `tower.lastFired = now;` (boulder-fire) |
| Rail Gun | `railgun` | `isRailgun` branch | saw 1800→200 | after `tower.railFireTime = now;` |
| Nova | `nova` | `isNova` branch | sine 300→60 + noise | after `tower.novaFireTime = now;` |

**Confirmed:** the 13 case labels match the real `tower.type` strings exactly (cross-checked vs `TOWERS` keys + `data-tower` attrs). The 8 standard projectile towers all flow through the **single** `projectiles.push({ … type: tower.type … })` site in `fireProjectile`, so one `SFX.fire(tower.type)` there covers all eight, distinct per type. The **Buff Tower** (`buff`) is support — it never fires, so it has no fire case; it gets `buffPlace` on placement instead. The **champion** system (`striker`/`caster`/`legendary`) routes through `championEffects.push`, never `fireProjectile`/`projectiles.push`, so it never reaches the dispatcher (champion audio is deferred — MECH).

### Impact + event cues

| Event | Cue | Wired at (unique anchor) |
|-------|-----|--------------------------|
| Inferno boulder impact (zone create) | `infernoImpact` | both zone-create sites: reached-target impact **and** out-of-bounds fallback (one boulder hits exactly one) |
| Splash/AOE projectile impact | `splashImpact` (40ms gate) | after `createParticles(proj.x, proj.y, proj.color, 20)` in the `towerDef.splashRadius` branch |
| Place tower (success) | `buffPlace` if `buff` else `place` | after `createParticles(x, y, def.color, 8)` in the `if (gold >= cost)` block |
| Not-enough-gold (place) | `deny` | new `else { SFX.deny(); }` on the placement `if (gold >= cost)` |
| Not-enough-gold (shop) | `deny` | `if (gold < cost) { SFX.deny(); return; }` in `purchaseUpgrade` |
| Enemy death (normal/fast/tank/boss) | `enemyDeath(enemy.type)` | in the final `else` of the death block (type-aware: fast/tank vary) |
| Leprechaun death | `leprechaun` | in the `enemy.type === 'leprechaun'` branch (override — no stack) |
| Megaboss death | `bossDeath` | in the `enemy.type === 'megaboss'` branch (override — no stack) |
| Life lost / leak | `lifeLost` | after `lives -= livesLost;` |
| Megaboss spawn | `bossSpawn` | inside `if (wave >= 30 && roll < megabossChance) { type = 'megaboss'; }` |
| Wave start | `waveStart` | after `wave++;` in `startWave()` (single real start path; `confirmYes` calls it) |
| Wave clear | `waveClear` | after `waveInProgress = false;` in `waveComplete()` |
| Upgrade tower (shop) | `upgradeTower` | after `gold -= cost; towerLevels[type]++;` in `purchaseUpgrade` |
| Upgrade card pick (per-wave) | `cardPick` | before `choice.apply()` in `selectUpgrade` |
| Reroll | `reroll` | after the guard in `rerollUpgrades` |
| Stage clear (campaign) | `stageClear` | top of `triggerCampaignStageTransition` |
| Game over | `gameover` | after `gameRunning = false;` in `gameOver` |
| Leaderboard submit success | `submit` | before the V1_163-hardened `hideScoreModal()` (additive line; hardening untouched) |
| Leaderboard submit error | `submitError` | both validation `return`s (short name, profanity) |
| UI click | `uiClick` | one delegated `document` click listener matching `button, .menu-btn, .mode-btn, .tower-btn, .exit-btn, .speed-btn, .wave-btn, .back-btn, .tower-action-btn, .focus-option, .rotate-btn` |

**Design note (override, not stack):** `enemyDeath` is placed in the generic `else` branch only. Leprechaun and megaboss have their own dedicated cues in their branches, so each death plays exactly one sound — no double-trigger. (The brief suggested an unconditional call at `gold += goldEarned`; placing it in the `else` is the same intent with no overlap. Flagged.)

**Per-projectile hit sound:** intentionally **skipped** (too noisy) per the brief — only AOE/inferno impacts and the per-shot fire cues are wired.

### Mute button (STEP 4)

Added as an **independent body-level element** (`#muteBtn`, `position:fixed; top:8px; left:8px; z-index:9999`), a direct child of `<body>` **outside** `.game-wrapper`/`.game-container`, so it survives the `display:none` that hides the DOM HUD in fullscreen/iframe (`.game-container.fullscreen-mode .hud/.speed-btn/.exit-btn`). Top-left is collision-free in windowed mode (HUD is centered; speed/exit sit either side of center near x≈150, nowhere near 8px). Click uses `stopPropagation()` so the delegated UI-click listener never double-fires for it.

---

## 3 SAFE polish (applied)

- **Dead ternary collapsed:** `gold = gameMode === 'campaign' ? 65 : 65;` → `gold = 65;` (identical arms; zero behavior change).
- **Stale comment removed:** the `// ====== TEST: Wave 30 test build … ======` block in `startGame()`.
- **a11y `aria-label`s** added to icon-only controls: `#speedBtn` → "Game speed", `#exitBtn` → "Exit", `#tutorialClose`/`#leaderboardClose` → "Close", `#placementConfirm` → "Confirm placement", `#placementCancel` → "Cancel placement". (`#muteBtn` already has one.)
- **`prefers-reduced-motion: reduce`** block appended to `<style>`, `animation:none !important` on the ~17 decorative keyframe owners (upgrade title/subtitle/slot/shine/roll/icon/rarity pulses, map-transition overlay/text/progress-bar, tutorial-step, first-placement-arrow, score-input shake). Reveal/transition **logic is JS-driven** (`setTimeout`s still fire), so disabling the visuals is cosmetic only. **Canvas rendering untouched.**

---

## 4 Deferred / MECH (flagged, not applied)

- **Champion system audio** (`striker`/`caster`/`legendary`, `championEffects`, squirrel pets) — separate combat path; adding cues is more than audio plumbing and risks MECH. Deferred.
- **Victory / "you win" / endless-stage-clear nuance** — beyond the campaign `stageClear` already wired; touching win conditions is MECH.
- **Sell-tower / tower-move feedback** — no sell sound wired (sell is a mechanic surface; left alone).
- **Merging the two duplicate `document` `keydown` listeners** — a refactor, not audio/SAFE-polish. Deferred.
- **Per-projectile hit sound** — deliberately skipped (noise).
- No font/title/canvas-size/balance changes.

---

## 5 Validation (manual, no browser/git available here)

- `node --check` on the extracted inline scripts (head CORS block + main game script incl. the SFX engine): **both PASS** (no syntax errors).
- `window.SFX = SFX;` present (L3459). 32 `SFX.` occurrences total; call-site tally matches the cue map (6× `fire`, 2× each `infernoImpact`/`deny`/`submitError`, 1× each remaining cue + plumbing).
- Tag balance intact (2 `<script>`/`</script>`, 1 `<body>`/`</body>`); canvas still `648×576`.
- **Boot path to exercise audio in-app:** load → `#startBtn` → `#classicModeBtn` → `startGame()` runs (gold = 65). First sound on the first user gesture (unlock). Start first wave: `#waveBtn` → `#confirmYes` → `startWave()` (waveStart cue). Place a tower → place/deny cue + per-type fire cue once shooting; kill an enemy → enemyDeath cue; clear the wave → waveClear + upgrade picker (cardPick/reroll). Toggle `#muteBtn` → icon flips 🔊/🔇, persists across reload.

---

## 6 Re-rate

**Before:** ~8.5/10 craft, **silent** (hard fit blocker). **After:** the headline is delivered — 13 distinct per-tower fire cues, AOE/inferno impacts, full event coverage (place/deny/death/leak/boss/wave/upgrade/stage/gameover/leaderboard/UI), a persistent mute control visible in both layouts, mobile gesture-unlock + tab-hide suspend, plus reduced-motion + a11y label polish.

**Re-rate: 9/10.** No blockers. The remaining 1 point is the deferred champion-system audio and sell/victory feedback (MECH-adjacent, out of scope today).
