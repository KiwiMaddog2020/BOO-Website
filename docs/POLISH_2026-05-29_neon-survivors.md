# Polish — BOO Survivors (`Games/neon-survivors.html`)

**Date:** 2026-05-29 · **Scope:** Sound effects + SAFE polish, ONE file. Mechanics LOCKED (no physics/spawn/speed/score/balance/weapon-stat changes). No git, no server, canvas size untouched (800×820). 22,568 → 22,762 lines.

---

## 1 Audit (craft × fit + evidence)

**Craft (before):** The marquee of the BOO arcade — a feature-rich Vampire-Survivors-lite. 20 distinct weapons (each a typed class method dispatched off `weaponDef.type`), passive tomes, legendary chests with slot-reel reveals, shrines, multi-phase bosses, leprechauns, HiDPI render-buffer scaling, Firebase leaderboard with local fallback, settings overlay with zoom/damage-numbers/FPS toggles. Visually and mechanically ~8.5/10.

**Fit gap (the blocker):** The game was **completely silent.** No `AudioContext`, no `<audio>`, zero sound calls (grep confirmed). Two **dead sliders** sat in the Settings → Audio section: `#musicVolumeSlider` and `#sfxVolumeSlider`. Both wrote to `settings.{music,sfx}Volume` and persisted to `localStorage['booSurvivorsSettings']` but were wired to **nothing** — a broken promise to the player. For the arcade's flagship, where the owner explicitly wants **a distinct sound for every weapon**, this is the single biggest fit miss. Mobile WebView also needs a user-gesture audio unlock and a mute control for App Review.

**Secondary craft nits found:**
- a11y: the pause control is a `<div>` (`#pauseBtn`) with no `role`/label/keyboard affordance; the two settings gears (`⚙`) and two modal close buttons (`✕`, `#tutorialClose` / `#leaderboardClose`) were icon-only with no accessible name.
- No `prefers-reduced-motion` fallback for the ~40 decorative menu/overlay entrance + pulse keyframe animations (title glow, upgrade/shrine/chest/legendary/tombstone/score/leaderboard/tutorial enters, `startingPulse`, etc.).
- Dead dispatch branch: `case 'chain'` → `fireChain` exists but **no weapon uses `type: 'chain'`** (all 20 weapon defs enumerated; Chain Lightning is `type: 'chainlightning'` → `fireChainLightning`). Left as-is (out of audio scope; flagged below).

---

## 2 Sound design — cues wired (tables)

A self-contained synth WebAudio engine (`SFX`) was inserted at the top of the main `<script>`, immediately after `const ctx = canvas.getContext('2d');`. Primitives (`tone`, `noise`, `gate`) + 21 weapon cues + event cues; master gain `0.32 × vol`, mute persisted to `localStorage['survivors_muted']`; unlocked on first `pointerdown`/`touchstart`/`keydown`. Each weapon cue fires **once per shot at the per-shot commit line** (never per-projectile, never per-frame).

### Weapon cues — 21 distinct (20 weapons + mine-blast variant)

| # | Weapon | Type | Method | Cue | Anchor (unique snippet) |
|---|--------|------|--------|-----|-------------------------|
| 1 | Energy Bolt | projectile | `fireProjectile` | `wEnergyBolt` | after `state.lastFire = now;` + `const pierce = 1 + Math.floor(level / 3);` |
| 2 | Plasma Shield | orbit | `updateOrbit` | `wPlasmaOrbit` (gated 90ms) | after `enemy.orbHitCooldown = 250;` (per orb-hit) |
| 3 | Boom Box | aoe | `fireAOE` | `wBoomBox` | after `state.lastFire = now;` + `const radius = def.baseRadius + level * 10;` |
| 4 | Beam | beam | `updateBeam` | `wBeam` (gated 360ms) | after `beam.lastTick = now;` |
| 5 | Star Field | starfall | `updateStarfall` | `wStarField` | after `state.lastTick = now;` + `... level * 15;` |
| 6 | Void Daggers | daggers | `fireDaggers` | `wVoidDaggers` | after `state.lastFire = now;` + `const daggerCount = def.baseDaggers ...` |
| 7 | Flame Thrower | flame | `updateFlame` | `wFlame` (gated 240ms) | after `state.lastFire = now;` + `// Find the direction with the most enemies` |
| 8 | Black Squirrel | squirrel | `fireSquirrel` | `wSquirrel` | after `sq.squirrelState = 'winding';` (pounce start) |
| 9 | Lightning Strike | thunder | `fireThunder` | `wThunder` | after `state.lastFire = now;` + `const strikeCount = def.baseStrikes ...` |
| 10 | Toxic Aura | aura | `updateAura` | `wToxic` | after `state.lastTick = now;` + `state.auraRadius = radius;` |
| 11 | Ice Shards | ice | `fireIceShards` | `wIce` | after `state.lastFire = now;` + `const pierce = 1 + Math.floor(level / 4);` |
| 12 | Meteor Strike | meteor | `fireMeteor` | `wMeteor` | after `state.lastFire = now;` + `const blastRadius = def.blastRadius + level * 5;` |
| 13 | Ghost Orbs | homing | `fireSpiritOrbs` | `wGhost` | after `state.lastFire = now;` + `const orbCount = def.baseOrbs ...` |
| 14 | Boomerang | boomerang | `fireBoomerang` | `wBoomerang` | after `state.lastFire = now;` + `const count = def.baseCount ...` |
| 15 | Chain Lightning | chainlightning | `fireChainLightning` | `wChain` | after `state.lastFire = now;` + `const chainCount = def.baseChains ...` |
| 16 | Spectral Arrows | arrows | `fireArrows` | `wArrow` | after `state.lastFire = now;` + `state.burstShots++;` |
| 17 | Gravity Well | gravity | `fireGravityWell` | `wGravity` | after `state.lastFire = now;` + `// Initialize wells array` |
| 18 | Ricochet Disc | ricochet | `fireRicochetDisc` | `wRicochet` | after `state.lastFire = now;` + `const bounces = def.baseBounces ...` |
| 19 | Pulse Mine (drop) | mine | `dropMine` | `wMineDrop` | after `state.lastFire = now;` + `const blastRadius = def.blastRadius + level * 5;` |
| 19b | Pulse Mine (blast) | mine | `updateMines` | `wMineBlast` | after `mine.exploded = true;` (per detonation) |
| 20 | Shotgun | shotgun | `fireShotgun` | `wShotgun` | after `state.lastFire = now;` + `... (level - 1) * 0.06);` |

### Event cues

| Event | Cue | Anchor (unique snippet) |
|-------|-----|-------------------------|
| Enemy hit | `hit` (gated 55ms) | after `spawnDamageNumber(...)` in `Enemy.takeDamage` (block w/ `incomingDamage`) |
| Enemy death | `kill` (gated 40ms) | after `kills++;` in `Enemy.die()` (block w/ `killCount`) |
| Player hurt (no shield) | `hurt` | after `this.hp -= reducedDamage;` |
| Player hurt (shield overflow) | `hurt` | after shield-overflow `this.hp -= overflow;` branch |
| Plasma shield absorb (charge) | `shieldBlock` (gated 60ms) | after `weaponState.shieldCharges--;` in `tryShieldBlock` |
| Generic shield full-absorb | `shieldBlock` | after `this.shieldHp -= reducedDamage;` (full absorb) |
| Player death | `playerDeath` | after `startDeathAnimation(this.x, this.y);` |
| Level-up | `levelup` | before `showUpgradeSelection();` |
| Upgrade chosen | `confirm` | after `gamePaused = false;` in `selectUpgrade` |
| XP gem pickup | `gem` (gated 60ms) | after `player.gainXP(this.value);` |
| Chest open | `chest` | after `DOM.chestModal.classList.add('visible');` (`// Show modal with slot spinning`) |
| Legendary reveal | `legendary` | first line of `showLegendaryUpgrade()` (covers all 4 reveal paths) |
| Boss warning | `bossWarn` | first line of `showBossWarning(...)` |
| Game over | `gameover` | after `gameRunning = false;` in `gameOver()` |
| Leaderboard submit | `submit` | after if/else success (Firestore `.add` **or** local), before `hideScoreModal();` |
| Pause / resume | `pause(!gamePaused)` | after `gamePaused = !gamePaused;` (resume tone when unpausing) |
| UI clicks | `uiClick` | ONE delegated capture listener on `.menu-btn, .settings-close-btn, .settings-btn, .weapon-select-card, .weapon-select-btn, .pause-menu-btn, .score-btn, #startBtn, #weaponConfirmBtn` |

`powerup` cue is defined in the engine but intentionally left unwired (Step 3 specified no powerup anchor; available for future use).

---

## 3 SAFE polish applied

- **Mute button:** new `#muteBtn` inserted as a sibling of `#pauseBtn`, offset to `top:6px; left:48px` (clears the 36px pause button + the bottom-trackpad minimap). Toggles `🔊`/`🔇`, persists, `aria-pressed`, `stopPropagation` so it doesn't trip the UI-click cue. Inline styles match the pause button's look (intentional inline per project memory re: DuckDuckGo-Android workaround pattern; mute is a one-off control).
- **a11y:** `#pauseBtn` (`<div>`) got `role="button" aria-label="Pause" tabindex="0"`; both settings gears got `aria-label="Settings"`; both close buttons (`#tutorialClose`, `#leaderboardClose`) got `aria-label="Close"`.
- **prefers-reduced-motion:** added a `@media (prefers-reduced-motion: reduce)` block (before `</style>`) that sets `animation: none !important; transition-duration: 0.01ms !important` on the menu/pause/settings/weapon-select/upgrade/shrine/chest(`#chestModal`)/legendary/score(`.score-modal`)/leaderboard/tutorial/confirm overlays **and their descendants only**. Canvas gameplay is JS-driven and is NOT touched.

---

## 4 Slider reconcile

- **SFX slider (`#sfxVolumeSlider`):** now LIVE. Its `input` handler appends `if (window.SFX) SFX.setVolume((settings.sfxVolume || 100) / 100);`, and `updateUI()` (called at startup) applies the saved value so it takes effect on boot. Engine maps `vol` onto master gain (`0.32 × vol`).
- **Music slider (`#musicVolumeSlider`):** there is **no music layer in this build** → the control is a broken promise. Its `.settings-row` is now `style="display:none"` with an HTML comment `<!-- music slider hidden: no music layer in this build -->`. **Not deleted** — element/handler preserved. **FLAGGED FOR OWNER:** either wire a real music bed (xDeviruchi collection per repo CLAUDE.md) or remove the slider for good.

---

## 5 Deferred / MECH (flagged, NOT applied)

- **Music bed.** No audio track in this build. Adding music is a feature, not polish — owner call (see §4).
- **Dead `case 'chain'` / `fireChain` branch.** No weapon uses `type: 'chain'`; the method never runs. Pure dead code (~20 lines). Left untouched — removing it is a refactor, out of audio scope. The real Chain Lightning is `fireChainLightning`.
- **Per-enemy-type hit/kill timbres.** Bosses/leprechauns share the generic `hit`/`kill` cues (wired only in `Enemy.takeDamage`/`Enemy.die` per spec). Distinct boss-hit/boss-death cues would be a nice juice pass but touch more sites.
- **Powerup pickup cue.** Engine has `powerup`; no pickup anchor was specified. Wiring it later is trivial.
- Any balance/spawn/speed/stat change — explicitly out of scope (mechanics LOCKED).

---

## 6 Validation notes

- **Syntax:** all three `<script>` blocks extracted and pass `node --check` (engine + 41 wiring sites + settings IIFE — braces/parens balanced).
- **Counts (grep):** 21 distinct weapon-cue call sites (one each), `window.SFX = SFX;` present, canvas still `width="800" height="820"`.
- **Boot path (manual):** `#startBtn` → weapon-select grid → pick a `.weapon-select-card` → `#weaponConfirmBtn` → `startGame`. First gesture unlocks audio.
- **Console shortcut:** `selectWeapon('energyBolt')` (or any weapon id from `WEAPONS`) to jump straight in; fire to hear the per-weapon cue.
- **Expected:** distinct tone per weapon, gated cues (beam/flame/orbit) don't machine-gun, hit/kill/gem throttled, mute button flips `🔊`/`🔇` and silences master, SFX slider scales volume live, music row hidden.

---

## 7 Re-rate (craft × fit)

| Axis | Before | After |
|------|--------|-------|
| Craft | 8.5/10 | 9/10 |
| Fit | 6/10 (silent flagship, two dead sliders) | 9/10 |

**Is it ≥9/10?** Yes on both axes. The flagship now has the owner's headline feature — a distinct sound for every one of the 20 weapons (21 cues incl. mine blast) — plus a full event-feedback layer, a working SFX slider, a persisted mute, reduced-motion respect, and icon-button a11y.

**What blocks a 10:** (1) No music bed — the `#musicVolumeSlider` promise is hidden, not fulfilled. (2) Boss/leprechaun share generic hit/death timbres. (3) The dead `fireChain` branch is cosmetic cruft. All three are out of the locked-mechanics audio-polish scope and flagged for the owner.
