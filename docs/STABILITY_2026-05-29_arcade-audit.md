# Arcade Stability Audit — 2026-05-29 (Opus 4.8)

Dedicated **performance / memory-leak / visual-glitch / correctness** audit of all 7 arcade games (read-only, parallel agents), followed by SAFE fixes. Complements the same-day SFX sweep (V1_191–195) and the Brickbreaker/Clyde's audio work (V1_184–190).

## Headline: the dangerous categories are clean

Across **all 7 games**, verified with file:line evidence:
- **No memory leaks** — no uncleared intervals/timeouts, no per-restart listener accumulation (all `addEventListener` bound once at top-level), no detached DOM growth.
- **No stacked `requestAnimationFrame` loops** — the V1_162 fix (Space Shooter, Brickbreaker) holds; every game runs exactly one loop, gated by a flag, re-entered (not re-spawned) on restart.
- **Complete state reset on play-again** — score/entities/timers/flags/spawn cursors all reset.
- **SFX engines are leak-free** — every oscillator/buffer-source is `.stop()`-scheduled; unlock + delegated-click + mute listeners bound once; hot cues throttled via `gate()`.
- **Entity pools bounded**, **iOS canvas pixel-cap enforced** (`MAX_CANVAS_PIXELS`), **canvas save/restore balanced**, **leaderboard/localStorage hardened** (V1_163).

## Per-game stability grade

| Game | Grade | Notes |
|------|-------|-------|
| Neon Dig | A− | excellent; per-frame warning gradients + uncapped chain particles flagged |
| Tower Defense | A− | clean; O(towers×enemies) targeting scan is the only perf headroom |
| Brickbreaker | A− → **A** | the one HIGH glitch (boss-death paddle/ball jump) fixed in V1_196 |
| BOO Survivors | B+ | no leaks; per-frame dead DOM HUD fixed in V1_196; minimap fog loop flagged |
| Neon Snake | B+ | the HIGH submit double-fire fixed in V1_196 |
| Clyde's Big Jump | B+ | death-shake cross-round bleed fixed in V1_196 |
| Space Shooter | B+ | tab-switch AOE clamped in V1_196; 120 Hz frame-rate dependence flagged |

## Fixes applied — V1_196 (all SAFE, mechanics untouched, validated headless)

1. **Brickbreaker [HIGH glitch]** — `drawBossDeathParticles` reset the canvas transform to bare scale, wiping the `translate(0, gameTop)`, so the paddle + ball drew 28px too high during every boss-death explosion (then snapped back). Restored the translate in the per-particle transform reset.
2. **Snake [HIGH correctness]** — `submitScore` could fire twice on touch (touchend + synthetic click), writing a duplicate Firestore row. Added an entry guard (`if (submitScoreBtn.disabled) return;`). Also hardened `highScore` against a `NaN` from corrupt localStorage.
3. **Clyde's [HIGH glitch]** — `deathShake` was never zeroed on restart, so a residual shake offset bled into the next round's opening frames. Reset it in `resetGame()`.
4. **Space Shooter [MED correctness]** — unclamped `deltaTime` meant returning from a backgrounded tab during a boss wave instantly fired the AOE on an idle player. Clamped to 50ms.
5. **Tower Defense [MED correctness]** — the global R/E/Escape keydown fired while typing a leaderboard name (rotating a tower / spawning particles behind the modal). Added an input-focus guard.
6. **Survivors [perf]** — a full legacy DOM HUD was rebuilt every frame (innerHTML + ~18 `getElementById`) into a `display:none` subtree (the canvas HUD is the live one). Added a self-correcting `offsetParent === null` early-return — pure waste eliminated, resumes automatically if ever shown.

## Flagged for Kevin — NOT applied (mechanics / presentation / device-verify)

- **[MECH] Space Shooter frame-rate dependence** — movement uses fixed per-frame increments, so the whole game runs ~2× on 120 Hz ProMotion iPhones (while the boss AOE telegraph stays wall-clock, so its relative difficulty shifts). Fix = delta-scale all motion (or wall-clock the AOE); needs a re-tune/playtest. **Biggest item.** Pre-existing, not from this sweep.
- **[MECH] Tower Defense targeting cost** — O(towers×enemies) double-scan with `Math.sqrt` every frame; dedupe the scan + use squared distance (+ optional retarget throttle). Touches targeting behavior → your call.
- **[MECH] Dig uncapped particle pushes** — ~17 direct `particles.push` sites bypass `MAX_PARTICLES=150`; a big chain/boss burst can spike to ~400. Route through a capped helper (could clip a deliberate burst → your call).
- **[MECH] Dig game-over screen** — the canvas "GAME OVER" text is overwritten by the next `draw()` (no `!gameRunning` guard); player sees a frozen live frame until the DOM modal at ~2.2s. Presentation decision.
- **[verify] Dig fullscreen mute button** — `#muteBtn` isn't hidden when the canvas HUD takes over in fullscreen, so it can float over the canvas / clash with the canvas-drawn pause button. Wants an in-fullscreen look before deciding (hide it + rely on the M key, or reposition).

## Recommended SAFE perf optimizations — deferred (low-risk, not bugs)

- **Survivors minimap** — a 6,084-cell fog loop runs every frame; cache fog to an offscreen layer, redraw only on new-cell reveal (moderate refactor).
- **Dig low-hull/low-fuel gradients** — two `createRadialGradient` calls per frame while <30% (the near-death state); cache once + modulate `globalAlpha` (needs module-scope gradient vars).
- **Space Shooter / Clyde's** — cache per-frame allocations (per-bullet radial gradients; `getMushroomColors` per pipe per frame).
- **Survivors / Snake resize** — `visualViewport scroll` → `resizeCanvas` is undebounced, reallocating the canvas backing store on every iOS scroll/zoom tick; debounce to rAF. Touches the (sacred) sizing path → verify aspect on a real device.
- **Consistency** — expose `window.SFX` on Brickbreaker + Clyde's (the other 5 do) for parity + testability. Trivial.

_Validation: static cue-coverage + headless Chromium (load, start, run loop, probe cues, mute) — all 6 edited games clean, no page errors. Mechanics unchanged throughout._
