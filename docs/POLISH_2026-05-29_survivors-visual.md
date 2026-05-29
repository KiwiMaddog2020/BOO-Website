# BOO Survivors — Visual Upgrade (2026-05-29, Opus 4.8)

A render-only visual glow-up of the deepest game in the arcade. **Mechanics locked** throughout — zero changes to any collision radius, value/XP, damage, spawn, speed, attack timing, or balance. All visual scaling done via `ctx` transforms, never stored radii. Shipped in 4 trains, **V1_198–V1_201**, each validated headless (`node --check` + Playwright live run + gameplay screenshots) and committed/pushed separately.

## Survey insight

Two parallel art-direction surveys converged: the procedural art was already strong and characterful — what was missing was **reactivity, atmosphere, and loot legibility**. Two systems were even **dead-coded**: `camera.shake(...)` was *called* on big hits but the method was never added (silent no-op), and `settings.reducedParticles` was wired to the UI but never read. Both are now live.

## Train 1 — Combat feel (V1_198)
- **Screen-shake**: implemented the dead `camera.shake` as a **render-only translate** around the world pass — hard cap ≤4px, HUD/minimap exempt (restored before tints + HUD), `camera.x/y` never touched (aim stays exact). Wired to big events only: player-hurt, boss phase transitions, boss death, meteor impact.
- **Hit-flash**: enemy + all 3 boss classes flash white on damage (re-fill of the existing body path at decaying alpha) — the biggest missing "meaty hit" cue.
- **Damage-number punch**: spawn at scale ~1.3 easing to 1.0, with a dark outline for readability; crits get gold.
- **Spawn-in**: enemies fade + scale in (eased) instead of teleport-popping — visual scale only.
- **fxRings**: shared capped pool (≤16) — expanding ring on enemy death + projectile impact.

## Train 2 — Neon bloom + atmosphere (V1_199)
- **Additive (`'lighter'`) compositing** on energy FX (bolt/beam/orbit/aura) + the particle batch — cyan/magenta stack to white-hot. Flame deliberately left non-additive (keeps its red→orange→yellow fire identity).
- **Removed the per-particle `shadowBlur`** (additive provides the glow) — **net perf WIN**: up to ~100 blur passes/frame eliminated.
- **Reconnected `reducedParticles`** (via the `window.GameSettings` bridge) — the dead toggle now cuts spawn counts.
- **Always-on cached arena vignette** (deep purple-black edges → focus) + **cached additive player light-pool** (low alpha, follows player) — "a neon soul lighting a vast dark field."
- **Cached the 3 power-up vignettes** (were 3 `createRadialGradient`/frame while active).
- ctx save/restore audited balanced (14/14).

## Train 3 — Loot + character + telegraphs (V1_200)
- **XP-gem rarity color tiers** by value: cyan → green → blue → purple → gold (+ sparkle glint on higher tiers, on-screen-gated). `value`/radius/pickup untouched (color-only).
- **Player character**: the orb now has a run squash-stretch cycle (only while moving), a directional lean, and **two eyes that look toward movement** (idle-center, hidden on invuln blink) — cohesion with the faced enemies. Hitbox untouched.
- **Boss attack telegraph**: MajorBoss draws a contracting/brightening windup ring keyed to `attackCooldown` (read-only) + an `isCharging` lock-on ring → attacks are now readable/dodgeable. MiniBoss enrage aura tell <33% HP. Timers/values never written.

## Train 4 — UI polish (V1_201)
- **Upgrade-card rarity sheen** sweep (CSS `::after`, intensity by rarity) + animated **legendary gold aura**. Paused-screen, GPU, ~free.
- **In-world chest-open burst** (particles + ring at the chest) + **level-up world pop** (cyan ground-ring + puff at the player) — both reuse the existing capped pools, fired only on committed actions.
- **XP-bar polish**: cached magenta→cyan gradient + leading-edge highlight stripe + a white flash on level-up (via the existing read-only level-up detection).

## Deferred / flagged (NOT applied)
- **Shotgun per-shot screen-shake**: revived from the dead `camera.shake` call (3px/volley) — intentional weapon kick, but flagged for an ear-check; trivial to dial down.
- **HUD font cohesion**: no custom display font is actually loaded in this file (the `Orbitron` CSS refs fall back to monospace), so switching the HUD font would risk layout for no gain. Deferred — revisit if Orbitron is ever bundled.
- **Hit-stop / freeze-frame** and **chroma-shift**: too feel-/taste-sensitive; deferred unless requested.
- **Perf riders not done** (non-bugs, optional): bake the per-frame grass-blade strokes to offscreen tiles (heaviest floor cost; visual-equivalence risk); offscreen-cache or de-glow the OFFENSE/DEFENSE stat panels.
- **`showDamageNumbers`**: spotted as *another* dead toggle (wired, never read) — out of scope; flagged for a future micro-fix.

## Net effect
Same neon-psychedelic world, now **reactive** (every hit flashes, kills/impacts ring, big moments shake), **atmospheric** (player light-pool + edge vignette + additive bloom), and **legible** (gem rarity colors, a faced player, telegraphed boss attacks) — and slightly **faster** than before, thanks to dropping the per-particle shadow blur. Validated render-only; mechanics identical.
