# Polish — Neon Space Shooter (`Games/neon-space-shooter.html`)

**Date:** 2026-05-29 · **Scope:** Sound effects + SAFE polish, ONE file. Mechanics LOCKED (no physics/spawn/speed/score/balance changes). No git, no server, canvas size untouched (480×720).

---

## 1 Audit (craft × fit + evidence)

**Craft (before):** The game was a polished arcade shmup — neon plasma bullets, weighted-random slot-machine upgrades, a two-phase boss (electric orbs + telegraphed AOE), Firebase leaderboard with profanity filter and local fallback, CORS error suppressor (V1_174), stacked-rAF guard (V1_162). Visually 8/10.

**Fit gap (the blocker):** The game was **completely silent**. Every other BOO arcade title (brickbreaker, clyde's-big-jump) ships a synth WebAudio SFX layer; this one had none — no `AudioContext`, no `<audio>`, zero sound calls (grep confirmed). For an "⚡ Arcade Space Shooter ⚡" that is a top-tier fit miss: shooting, hits, deaths, boss, and the slot-machine upgrade reveal are all begging for audio feedback. Mobile WebView also requires a user-gesture unlock and a mute control for App Review.

**Secondary craft nits found:**
- Dead code: `let mouseDown` was written in 3 handlers (canvas mousedown, canvas mouseup, document mouseup) but **never read** anywhere — confirmed via grep (only assignments, no reads). Pure cruft.
- a11y: score-submit modal and leaderboard overlay had no `role="dialog"`/`aria-modal`; the `✕` close button had no accessible label; live score/wave values weren't announced.
- No `prefers-reduced-motion` fallback for the four infinite CSS animations (titleGlow, titlePulse, autoFirePulse, slotShine + slotRoll).

---

## 2 Sound map wired (table)

A self-contained synth WebAudio engine (`SFX`) was inserted at the top of the main `<script>`, immediately after the V1_174 CORS suppressor. Primitives (`tone`, `noise`, `gate`) + 21 named cues; master gain 0.32, mute persisted to `localStorage['spaceshooter_muted']`; unlocked on first `pointerdown`/`touchstart`/`keydown`.

| Event | Cue | Anchor (unique snippet) |
|---|---|---|
| Player fire (1 shot) | `shoot` | `if (totalProjectiles > 1) SFX.shootMulti(); else SFX.shoot();` after projectile loop in `fireBullets` |
| Player fire (spread) | `shootMulti` | (same line — branch) |
| Hunter fires plasma | `enemyShoot` (gated 50ms) | after `color: '#ff4444' });` in `fireHunterPlasma` |
| Boss fires orb | `bossFire` | after `color: '#88ffff' });` in `fireElectricOrb` |
| Enemy hit (normal) | `hit` (gated 40ms) | after `e.health -= damage;` |
| Enemy hit (crit) | `crit` (gated 40ms) | `if (isCrit) SFX.crit(); else SFX.hit();` |
| Enemy death | `enemyDeath` | at `createExplosion(...); SFX.enemyDeath(); score += e.points;` |
| Player hit — enemy projectile | `playerHit` | after `player.health -= damage;` in `updateEnemyProjectiles` |
| Player hit — enemy collision | `playerHit` | after `player.health -= damage;` in Enemies-vs-Player |
| Player hit — boss orb | `playerHit` | after `player.health -= damage;` (damage = 20) |
| Player hit — boss AOE | `playerHitHeavy` | after `player.health -= damage;` (damage = 35) |
| Boss spawn | `bossSpawn` | after boss object `};` in `startBossWave` |
| Boss hit | `bossHit` (gated 40ms) | after `boss.health -= damage;` |
| Boss death | `bossDeath` | first line of `defeatBoss` |
| Wave-clear panel opens | `wavePanel` | after `upgradeOverlay.classList.add('active');` |
| Slot roll tick | `slotTick` (gated 120ms) | inside `rollInterval = setInterval(...)` |
| Slot reveal | `slotReveal` | after `slot.className = 'upgrade-slot revealed';` |
| Upgrade selected | `upgrade` | after `choice.apply();` |
| New wave starts | `waveStart` | after `wave++;` |
| Game over | `gameover` | top of `endGame` |
| Leaderboard submit OK | `submit` | after `await db.collection(COLLECTION_NAME).add({...});` (Firebase branch only) |
| UI clicks (Start / Play Again / Submit / Skip / Leaderboard / close) | `uiClick` | one delegated `document` click listener |
| Mute toggle | `unlock` + `toggle` | `#muteBtn` handler |

Throttling: per-event `gate()` debounce prevents machine-gun clipping on rapid hits / enemy fire / slot ticks. Mute button uses `stopPropagation()` so it never double-fires `uiClick`. Upgrade slots are explicitly **excluded** from the delegated `uiClick` selector so they emit only the richer `upgrade` arpeggio (no clashing blip).

---

## 3 SAFE polish applied

- **Mute button:** `#muteBtn` inserted as first child of `.game-container` (top-left, clear of the top-right SCORE HUD and bottom WAVE label). `.game-container` is `position: relative`, so the button's `position:absolute` anchors correctly. 36×36, cyan neon, `aria-label`/`aria-pressed`, 🔊/🔇 glyph swap, persists across sessions.
- **a11y:** `role="dialog" aria-modal="true"` + `aria-label` on the score-modal content and the leaderboard container; `aria-label="Close leaderboard"` on the `✕` button; `aria-live="polite"` on `#scoreDisplay` and `#waveDisplay`.
- **prefers-reduced-motion:** `@media (prefers-reduced-motion: reduce)` zeroes the four real animated selectors — `.title` (titleGlow), `.upgrade-title` (titlePulse), `.auto-fire-indicator` (autoFirePulse), `.upgrade-slot::before` (slotShine) + `.upgrade-slot.rolling .upgrade-content` (slotRoll).
- **Dead code removed:** `let mouseDown` declaration + the canvas `mousedown` handler + the canvas `mouseup` and document `mouseup` handlers (all 3 only ever wrote `mouseDown`, which is never read). The `mousemove`/`mouseenter` handlers that set `mouseX` for desktop aiming were **kept** (load-bearing). Grep confirms 0 remaining `mouseDown` refs.

---

## 4 Deferred / MECH-locked

- **DEFERRED (owner's call):** Font swap — the title/UI use the default system stack (Segoe/Arial) rather than Orbitron. Left as-is; branding/taste decision, not a polish bug.
- **MECH-locked (untouched):** all physics, spawn tables, speeds, damage numbers, score values, balance, canvas size (480×720). Audio calls are side-effect-only and never alter game state.
- **Not re-touched (already shipped):** V1_162 stacked-rAF fix, V1_163 leaderboard hardening, V1_174 CORS suppressor.

---

## 5 Validation (no browser/git)

- `node --check` on the extracted inline script (93.6 KB, the only non-`src` block): **SYNTAX OK** — braces/parens/strings balanced, emoji literals intact.
- Grep: `window.SFX = SFX;` present (1); 28 total `SFX.` occurrences; 0 `mouseDown` refs; `canvasWidth: 480` / `canvasHeight: 720` unchanged; `#muteBtn` present in markup + wired (`getElementById('muteBtn')`).
- Ordering check: `#muteBtn` markup (body) precedes the `<script>`, which precedes the engine and the mute-wiring IIFE — so the button resolves at run time.
- **Manual boot path (when served):** click `#startBtn` → `startGame()`; first gesture unlocks `AudioContext`; fire (auto), kill enemies, clear wave → slot machine → pick upgrade → next wave → boss; lose → `#restartBtn` (also bound to `startGame`). Mute button toggles + persists.

---

## 6 Re-rate

- **Audio:** 0/10 (silent) → **9/10** — full synth layer, every meaningful event covered, gated against clipping, mute + gesture-unlock for mobile/App Review.
- **a11y:** ~6/10 → **8.5/10** — dialogs labeled, live HUD, reduced-motion honored. (Remaining: focus-trap inside modals is the next step, not in this pass's scope.)
- **Overall fit/craft:** ~8/10 → **9/10**. The silent-game blocker is cleared and the file is cleaner (dead code gone) with no mechanics touched.

**Blockers to 10/10:** modal focus-trap + Esc-to-close; optional volume slider; Orbitron font (deferred — owner). None are in-scope for this SAFE pass.
