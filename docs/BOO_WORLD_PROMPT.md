# BOO WORLD — One-Shot Build Prompt (v0.9, "90% polish")

> The prompt below is engineered to produce a complete, tuned, SMW-caliber game in a
> single generation. The remaining 10% is deliberately reserved: personal taste passes
> (feel nudges, palette dials, level-design edits) that only playtesting can drive.

---

## PROMPT

You are a senior platformer engineer + level designer shipping a **complete, tuned,
single-file HTML5 canvas game**: **BOO WORLD** — a love letter to Super Mario World
(SNES) in *feel and structure*, re-skinned into the Bunch of Others neon universe
(cyan `#00ffff` / magenta `#ff1493` / purple `#9b30ff` / orange `#ff6600` / gold, on
near-black). It must play like SMW: momentum, readable enemies, secrets, an overworld.
It must NOT look like Mario: all-original neon vector art drawn in canvas, no ripped
assets, no Nintendo names.

### Scope — "first two areas of SMW" equivalent, complete
- **Overworld map** (its own scene): node graph, player token walks paths between
  nodes, cleared levels light up, secret paths appear when found, Area 2 gate opens
  after the Area 1 fortress. Names shown per node. Map music.
- **Area 1 — Glow Meadows** (grass-world analog): `1-1 Neon Steps` (teaching level),
  `1-2 Humming Hollow` (underground, has a **secret exit**: hidden pipe → key +
  keyhole room), `1-3 Shell Hills` (slopes + shell play), `Gold Switch Shrine`
  (unlocked by the secret exit — pressing the big switch fills all outline blocks
  **globally and permanently**, SMW switch-palace style), `Prism Fortress` (hazard
  gauntlet + **Boss 1**).
- **Area 2 — Volt Caverns** (cave-world analog): `2-1 Crystal Run`, `2-2 Bat Bends`,
  `2-3 Static Shaft` (vertical climb), `2-4 Glowfall Grotto`, `Wyrm's Keep`
  (castle gauntlet + **Boss 2**), then a THE END (FOR NOW) celebration screen.
- 8 standard levels × **5 BOO Coins each** (dragon-coin analog, tracked + saved).
- Sub-rooms: at least 3 enterable pipes with bonus rooms; secret-exit room; boss rooms.

### Feel — non-negotiable physics (60 fps fixed step, 32px tiles)
Walk max 2.2 px/f, run max 3.6, P-speed max 4.4 (P-meter fills after ~1s at run max,
arms-out sparkle state); ground accel 0.14, air accel 0.10, friction 0.12, skid 0.35
with dust + sound. Jump −8.4 scaling to ~−10.0 with speed; gravity 0.38 rising while
jump held, else 0.82; terminal 8.5. **Coyote 6 frames, jump buffer 7 frames,
variable jump height, stomp bounce −5.5 (−8.8 if holding jump).** Spin jump (−7.6):
safe-bounces on spiked enemies, breaks glass blocks when big. Duck; duck-slide on
slopes. 45° slopes up/down with proper walker physics. Camera: SMW-style — horizontal
window + facing lookahead; vertical follows only when grounded (platform snap).

### Player — 3 forms + item box
`Boo` (small, cyan neon ghost with feet) → `Mega Boo` (tall, magenta trim) via
**Neon Core** → `Plasma Boo` (orange/white) via **Plasma Bloom** (shoots bouncing
plasma bolts, 2 max on screen). Damage steps down one form with knockback + 2s
invulnerability flicker. SMW **item box** top-center: stores one reserve powerup,
auto-drops on damage, or drop with Enter/Select.

### Enemies (all original, neon-styled) + carry mechanic
Glimmer (goomba analog), Shelby (koopa analog: stomp → shell; **carry with run
button, throw on release, kick**; shell slides at 5.2 px/f, kills enemies, breaks
glass, bounces off walls, wakes after ~8s), Wing Shelby (bouncing flyer → grounded
Shelby when stomped), Neon Maw (pipe piranha analog, timed emerge, unstompable),
Zapfly (cave bat: ceiling sleeper, swoops), Spikord (spiny analog: no stomp, spin-
bounce safe), Bolt Bro (arcing projectile thrower, rare). **Boss 1 Prism Brute**:
charges wall-to-wall, 3 stomps, speeds up + summons adds between hits. **Boss 2
Volt Wyrm**: hover-slams with floor shockwaves to jump, stunned window → stomp,
3 hits, phase-2 falling sparks. Both in locked arenas with intro banners.

### Blocks / items / furniture
? blocks (coin / powerup-by-state / rare 1-Up), glass bricks (breakable), 10-coin
brick, outline blocks `o` → solid `!` after the Gold Switch (persisted), one-way
ledges, springs, horizontal + vertical moving platforms, crumble platforms, spikes,
castle lava, midway gate (checkpoint, SMW-style tape), **goal gate with a moving
bar** — bar height converts to bonus score, breaking it high plays a fanfare. Coins
(100 → 1-Up), 1-Up sparks, key + keyhole, the Gold Switch.

### Systems
Lives (start 5), score, coins, per-level timer (300; hurry-up music-speed at 100),
death → respawn at midway if passed; game over → continue screen (progress kept).
**Save to localStorage** (guarded try/catch): unlocked/cleared/secret flags, switch
state, BOO coins per level, lives/coins/score, reserve item. Pause (P/Enter) with
neon overlay. Mute toggle (M).

### Presentation
All-canvas vector art baked to offscreen sprite sheets at load (glow via shadowBlur
at bake time only — runtime stays fast). Parallax: far glow-gradient skyline, mid
neon hills/crystals, near silhouettes + particle motes; area-specific palettes
(meadow cyan/green vs cavern purple/magenta). Iris-wipe scene transitions (SMW
circle wipe, neon ring). Oxanium font (Google Fonts) for all UI. HUD: lives, coins,
score, timer, item box, BOO-coin pips. Title screen with attract shimmer.
**WebAudio only**: compact chiptune sequencer (pulse/pulse/triangle/noise) with
original loops — title, overworld, meadows, caverns, fortress/boss, goal fanfare,
death, game-over — plus full SFX set (jump, spin, stomp, coin, BOO coin, grow,
shrink/hurt, fire, kick, spring, bump, break, 1-Up, pipe, switch, key, goal, boss
hits). Autoplay-safe: audio unlocks on first input.

### Controls
Keyboard: ←/→ move, ↓ duck, Z **or** Shift = run/carry/fire, X **or** Space = jump,
C = spin jump, P/Enter = pause, M = mute. Gamepad-style **touch controls** on mobile
(D-pad left, RUN + JUMP + SPIN right, opacity fade when idle) — target Kevin's
OnePlus 13R (412px viewport). Canvas letterboxes to fit any window; logical
resolution 768×432.

### Engineering constraints
One file: `Games/boo-world.html`. Vanilla JS, no libraries, no external assets
except the Oxanium font link. Fixed-timestep 60Hz update with accumulator (max 4
catch-up steps), render decoupled. Object pools for particles/projectiles. No
console errors, ever. Levels authored as readable ASCII tile maps with a documented
legend + per-level meta (pipes, platforms, links). Expose `window.__bw` debug API
(warp, grant form, invuln, level list) for automated testing. localStorage guarded
for iOS WebView boot.

### Acceptance checklist (all must pass)
1. Boots clean (no errors) → title → overworld → every node enterable in sequence.
2. All 10 nodes completable start-to-finish; both bosses beatable; goal bars work.
3. 1-2 secret exit → Shrine unlock; Gold Switch fills outline blocks in other
   levels; both persist through reload.
4. Physics: full-run jump clears ~4 tiles height / ~8 tile gap; coyote + buffer
   verifiably work; stomp chains score 100→200→400→800…
5. Item box drops reserve on damage; forms step correctly both ways.
6. Save/continue restores map state exactly; game over keeps progress.
7. 60fps on a mid phone (no per-frame shadowBlur; baked sprites; pooled particles).
8. Touch controls fully playable: run-jump chains, spin, carrying, pipe entry.

Deliver the complete file. Then verify the checklist headlessly (Playwright) and
report honestly which items pass and which need a follow-up pass.

---

*Reserved 10%: music composition taste, boss difficulty dials, per-level pacing
tweaks, palette nudges — Kevin's playtest feedback drives those.*
