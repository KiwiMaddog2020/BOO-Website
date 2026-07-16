# BOO Pinball — Roguelike Pinball Architecture (P1_0)

Architect: Opus (advisory + specs, this doc). Implementers: Opus (high) / Sonnet (xhigh–high) per phase.
Goal: take the arcade's next game from nothing to a **fully polished roguelike pinball cabinet — 90/100**,
where 100 = best-in-class digital pinball *feel* (3D Pinball Space Cadet is Kevin's cited north star)
**fused with** roguelike-pinball depth (Balatro-style ante/draft progression). Same platform conventions
as the other 8 arcade games.

Kevin's directives (locked via the P1_0 planning cards):
- **Run structure = ante / target-score** (Balatro-like): each round has a score target you must beat
  within a fixed number of balls; clear it to advance; draft an upgrade between rounds.
- **First board = Neon Space** (feel-first homage to Space Cadet; reskinnable later).
- **First deliverable = feel + one draft layer**: one board, full pinball feel, 3-ball round loop,
  leaderboard, PLUS a between-ball pick-1-of-3 upgrade draft to prove the roguelike hook. Meta-shop stubbed.
- Push it "as far as we did with BOO Survivors" — multiple machines, meta-shop, achievements/unlocks come
  in the later automated build-out; this doc specifies the whole architecture but the SLICE is scoped tight.

File: **`Games/boo-pinball.html`** (new; greenfield, no single-writer contention with `neon-survivors.html`).
Line references in this doc are targets for the slice build and WILL DRIFT — re-grep named symbols.

---

## 0. Platform conventions (match the other 8 games — non-negotiable)

- Vanilla HTML/CSS/JS, single self-contained file, HTML5 Canvas. **No frameworks, no physics lib.**
- **Font:** Oxanium everywhere (CSS + canvas), loaded via Google Fonts, matching V1_245.
- **Palette:** neon on dark — cyan `#00ffff`/`#0ff`, magenta `#ff1493`, purple `#9b30ff`, orange `#ff6600`,
  gold for score/leaderboard accents. High saturation, psychedelic-but-readable.
- **Music:** shared `Games/boo-music.js` engine (`createBooMusic`), per-table `TRACKS` + `playlist`
  (title theme / in-game rotation / game-over sting), auto-yields to the site `#audio-player`. Pause ducks
  via low-pass; mute button silences music+SFX.
- **Leaderboard:** Firebase Firestore, new collection **`pinball_scores`**, fields **`{ name, score }`**
  (name string 2–12 chars, score int ≥ 0, no updates, no deletes — mirror the existing `firestore.rules`
  block for a score-only game). Reuse the compat-SDK `firebaseConfig` + `initFirebase`/`loadFirebaseSDK`
  boilerplate verbatim from an existing game; harden the render against malformed docs (V1_162+ lesson).
- **Arcade embed:** register an `.arcade-pill` + lazy `<iframe loading="lazy">` in `index.html`; assign a
  per-game **`data-aspect`** read by `enforceGameAspectRatio()`. Pinball is **portrait** (tall board) —
  pick an aspect near **`600/900` (2:3)**; coordinate the CSS + JS values (aspect consistency is the #1
  arcade priority). Add to `sitemap.xml` if the arcade lists games there; add a Playwright smoke path.
- **PWA / SEO:** no new manifest work needed; the game rides the site shell.
- **Mobile:** touch flippers (left half of screen = left flipper, right half = right flipper), tap-and-hold
  plunger, nudge via a dedicated button or a quick double-tap; strip heavy filters, GPU-friendly transforms.
- **Perf law (inherited from Survivors):** NO per-frame `ctx.shadowBlur` in hot paths — bake glows into
  offscreen sprites once (`_getGlowSprite(color)` cache), `drawImage` per frame. The ball, bumpers, and
  flippers are the hot paths.

---

## 1. The physics engine (the crux — where the polish budget goes)

Pinball lives or dies on ball feel. This is a small custom 2D engine, not a general one.

### 1.1 Integration loop
- **Fixed timestep** physics decoupled from render. Accumulator pattern: `PHYS_HZ = 240` (dt = 1/240 s).
  Each rendered frame runs `while (acc >= h) { step(h); acc -= h; }`. 240 Hz keeps a fast ball stable and
  makes restitution feel crisp without tunneling headroom tricks.
- **Sub-stepped swept collision (CCD).** Even at 240 Hz a launched ball moves many radii/step. Each step,
  move the ball along its velocity in **N micro-substeps** where `N = ceil(speed*h / (radius*0.5))` (clamped,
  e.g. ≤ 8), resolving collisions per substep. This is the anti-tunneling guarantee — **the** pinball gotcha.
  Belt-and-suspenders: a swept circle-vs-segment test (closest-approach along the motion segment) catches any
  residual thin-wall pass-through.
- Gravity points "down-screen" (+y). Tunable `GRAVITY` for the Space-Cadet arc (start ~ 1400 px/s² at the
  board's logical scale; tune by feel). A slight **table nose-down tilt** is faked purely by GRAVITY — no 3D.

### 1.2 Colliders (three primitives, everything is built from these)
1. **Segment** (line wall): closest point on segment to ball center; if `dist < r`, push out along normal,
   reflect velocity with `restitution` (walls ~0.35) minus tangential `friction`.
2. **Arc** (curved wall / rounded corner): center + radius + angle range; inside/outside aware.
3. **Circle** (post / bumper core): standard circle-circle resolve.
- All colliders carry `{ restitution, friction, kind, onHit(ball) }`. `kind` drives scoring/FX hooks.
- Static geometry is precomputed once into a flat array; a coarse uniform-grid broadphase buckets colliders
  so the ball only tests nearby ones (board is static, so the grid is built at load).

### 1.3 Flippers (the single most important feel element)
- Modeled as a **rotating capsule** (segment with radius) pivoting around a fixed point, swinging between
  `restAngle` and `activeAngle` over `FLIP_TIME` (~45 ms up, slightly slower down).
- On contact, impart velocity = wall reflection **plus** the flipper's surface velocity at the contact point
  (`ω × r`), so a ball struck by a rising flipper launches hard (the "live catch"/backhand feel). Tunables:
  `FLIP_OMEGA`, tip vs base impulse falloff, max exit speed clamp.
- Support **flipper hold** (ball rests on a raised flipper) and **cradle** (dead-bounce a rolling ball).
  Input: keyboard Left/Right (or Z/M), touch halves, gamepad later.

### 1.4 Active elements (kick back at the ball)
- **Pop bumpers:** on hit, kick the ball radially outward at a fixed `BUMPER_KICK` speed + score + FX + SFX +
  a brief flash/scale. Lively, Space-Cadet-loud.
- **Slingshots:** triangular walls flanking the flippers; on hit, kick along the face normal + score.
- **Kickers/saucers:** capture the ball briefly, then eject along a set vector (used for locks, skill shot,
  ramp returns).

### 1.5 Playfield features
- **Plunger lane:** hold to charge a power meter, release to launch; a one-way gate stops the ball
  re-entering the lane. **Skill shot** = a lit lane/target rewarded if hit on the launched ball before a
  flipper touch.
- **Ramps & orbits:** modeled as **guided lanes** — once the ball enters a lane region moving fast enough, it
  is soft-constrained to a spline path (velocity redirected along the lane) and released at the exit with an
  exit vector. Ramps feed an inlane/upper-flipper; orbits loop the ball around the top. Cheaper and more
  reliable than pure free-body physics for these, and it reads correctly.
- **Targets:** drop targets (fall when hit, reset as a bank), standup targets, spinners (spin + score per
  rotation), rollovers (lane lights).
- **Lock + multiball:** lock N balls in a saucer; releasing all = multiball with a lit jackpot. Multiball is
  the mandatory dopamine spike.
- **Inlanes/outlanes + drain:** the bottom gap. Ball crossing the drain line → ball lost (unless ball-save).

### 1.6 Safety systems (feel + fairness)
- **Ball-save:** for `BALL_SAVE_MS` after launch (and after multiball start), a drained ball is re-served.
  Visible timer/indicator.
- **Tilt / nudge:** a nudge input shoves the ball (small velocity impulse) + shifts the table; overuse builds
  a **tilt meter** — tilt → flippers dead + ball drains, current-ball scoring lost. Classic and teaches nudge.
- **Stuck-ball watchdog:** if ball speed ≈ 0 and position unchanged for `STUCK_MS`, nudge it free (Survivors'
  boss-unstick lesson, V1_445).
- **Ball too slow / trap detection** for lanes so a lane-constrained ball can't die there.

### 1.7 Test seams (automated verification must be first-class from day one)
Expose on `window`: `__PB` with `_serveBall(x,y,vx,vy)`, `_setState(s)`, `_flip('L'|'R', up)`, `_ballState()`
(pos/vel/onFlipper), `_forceDrain()`, `_addScore(n)`, `_targetScore()`, `_completeRound()`, `_draftPick(i)`,
`_meta` (save accessor), `_noTilt`, and a **frame-stepper** `_sim(ms)` that advances physics headlessly. These
let the harness assert **invariants**: ball never leaves the board polygon (no tunneling), a rising flipper
increases ball speed, a bumper hit adds the right score, drain decrements balls, target-score clears the round.

---

## 2. The Neon Space board — AUTHENTIC layout (P1_3 redesign)

Kevin's bar: **3D Pinball for Windows (Space Cadet) levels of quality.** Same neon *style*, but the board
must read at a glance as a REAL, designed pinball table — the authentic element *vocabulary* arranged the
way a real table (Space Cadet) arranges it. The v1 board read as abstract neon shapes; this is the fix.
Portrait 600×900 logical, rendered scaled. Deep-space blue playfield, neon-outlined elements.

### 2.1 The authentic element vocabulary (every one must be present and recognizable)
1. **Mushroom pop bumpers ×3** in a tight triangular **nest** (the signature). Round, with an outer skirt
   ring + a raised inner cap + a strong glow; they visibly flash+kick. Placed upper-center-left, the classic
   Space-Cadet bumper cluster. This is the single most recognizable feature — nail it.
2. **Slingshots ×2** — triangular rubber kickers sitting just **above and outside each flipper**, faces
   angled inward-down, with a visible rubber band on the kicking face. (Not floating triangles — they must
   frame the flipper zone.)
3. **Flipper V** at the bottom: two main flippers, tips angled toward a **fair center drain** gap.
4. **The bottom lane structure (the other signature)** — a real flipper zone: **outlanes** (outer, drain-y)
   and **inlanes** (inner, feed the flipper) on each side, separated by the slingshot body + a **lane-guide
   post with a rubber**. Return-rollover in each inlane. This 4-lane bottom is what makes a table read as a
   table; the v1 board lacked it.
5. **Launch chute (shooter lane)** — a vertical lane down the **far right** with the plunger at the bottom
   and a **one-way gate** at the top, feeding a **top arch / orbit** that carries the ball across the top and
   down into the upper playfield. Skill shot = a lit target reachable off the plunge.
6. **Top rollover lanes ×3** at the arch exit (separated by 2 posts), spelling `B-O-O` — the classic entry
   lanes; complete to light multiball.
7. **Central kickout saucer** (the multiball **lock**, themed "Wormhole"/"Black Hole") with a **ring of
   standup targets** around it — the central mission feature.
8. **Left ramp** (elevated surface, directional chevrons, lit entrance — unmistakable up-and-over) + a
   **right orbit** loop; a **spinner** in one orbit lane.
9. **Drop-target bank ×3–4** (angled row) that lights the ramp jackpot, plus a couple of scattered standups.
10. **Posts + neon rubber bands** throughout to delineate lanes and give the table authentic visual density.

### 2.2 Arrangement (Space-Cadet-modeled, top → bottom)
- **Top:** the shooter-lane feed curves into a smooth **top arch/orbit**; under it, the **3 rollover lanes**.
- **Upper-center-left:** the **3-bumper mushroom nest** ringed by posts; a **spinner** orbit to one side.
- **Center:** the **kickout saucer** + its **standup-target ring** (the mission hole).
- **Mid sides:** the **left ramp**, the **right orbit** return, the **drop-target bank**.
- **Lower:** **slingshots** framing the **flipper V**, with the **inlane/outlane** 4-lane structure and
  return rollovers; **center drain**.
- **Far right:** the **launch chute** the whole way down.

### 2.3 Recognizability test (the acceptance bar for this redesign)
An experienced pinball player, shown a still of the board, must immediately identify: the **bumper nest**,
the **slingshots**, the **flipper zone with inlanes/outlanes**, the **shooter lane**, and the **top orbit +
rollover lanes** — the same read they'd get from a Space Cadet screenshot. If any of those don't jump out,
it's not done. Physics engine + all systems (§1, §3) are preserved; only the table geometry (colliders) and
its render are rebuilt, and every scoring hook is remapped onto the authentic elements.

**Missions/targets (reflavored Space-Cadet "ranks"):** complete the rollover word → light multiball; hit the
drop bank → light the ramp jackpot; N ramps → "Hyperspace" frenzy. These are the score sources that make the
target-score round achievable and skill-expressive.

---

## 3. Scoring & the round loop (ante / target-score)

### 3.1 Scoring model
- Base values per event (bumper, target, ramp, orbit, spinner, skill shot, mode completion), all funneled
  through **one** `addScore(base, {combo, source})` chokepoint so multipliers/upgrades apply in one place.
- **Combo/blue-multiplier:** chained shots within a window ramp a temporary multiplier (decays on drain).
- **Playfield multiplier** (2x/3x…) lit by objectives.
- **Bonus** tallied per ball, paid on drain (× playfield multiplier).

### 3.2 The round (a "mission")
- A round = one target score to beat within **`BALLS_PER_ROUND` = 3** balls. Beat the target → **round
  cleared** → advance (in the full game: to the next machine / higher ante; in the slice: to a new target on
  the same board, escalating).
- Fail (out of balls below target) → **game over** → score modal → RESULTS screen → leaderboard submit
  (mirror Survivors' V1_432 game-over split: score modal → RESULTS → menu).
- **Ante ladder:** target scores escalate per round (`target(n) = base * growth^n`); the full game maps antes
  onto machines + a boss/**Wizard Mode** finale.

### 3.3 The draft (the roguelike hook — in the slice)
- **Between balls** (and between rounds), present a **pick-1-of-3** upgrade card overlay, styled in the
  level-up "Goldmine" slot language we already use in Survivors (V1_450 parity). Picking applies immediately.
- **Draft pool (slice starter set, ~12):** Ball-save +2s · Bumpers +50% value · Slingshots +50% value ·
  Ramp jackpot ×2 · Multiplier decays 40% slower · Skill-shot value ×2 · Extra ball (this round) · Wider
  flippers (+8%) · Stronger nudge / +1 tilt tolerance · Lit-word bonus ×2 · Combo window +30% · +5% base
  score (stacking). Each has a rarity tint; offers flow through one `draftOfferAllowed()` chokepoint (extend,
  never bypass — the Survivors lesson) so the later meta-shop/unlock gating drops in cleanly.
- All draft effects read from a single `RUN` modifiers object consumed at the scoring/physics chokepoints
  (like Survivors' `applyPassives`), so numbers are honest and one place governs balance.

### 3.4 Display-truth law (inherited from V1_452)
Every number a card shows = the real effect delivered. If an upgrade is capped or diminishing, show the real
transition. No raw-value lies.

---

## 4. BOO Survivors → Pinball reuse map

| Survivors system | Pinball reuse |
|---|---|
| Meta save `survivors_meta` (versioned, additive, never re-lock) | **`pinball_meta`** — identical discipline (`canUseStorage` probe, defensive parse, prune) |
| PLASM currency + UPGRADES shop (10 stats × 5 ranks, refundable) | Meta shop (later): +1 starting ball, +% base score, wider flippers, +ball-save, unlock tables/draft entries |
| Level-up pick-1-of-3 (Goldmine slot UI) | **Between-ball draft** (§3.3) — same UI language |
| Relics (run-local passives, rarity rolls) | Run "mods" (later phase) |
| 6 levels + The Maw | **Multiple machines** + **Wizard Mode** finale |
| 28 achievements gate unlocks (central offer chokepoints) | Same engine (later); `draftOfferAllowed()` is the seam |
| Per-level chiptune tracks (`boo-music.js`) | Per-table tracks |
| Game-over split → RESULTS → menu (V1_432) | Same flow |
| Master code `BOO-LEGENDS` / reset `BOO-REWIND` | Same secret-code pattern (later) |
| `META._warp/_sim`, `__P4/__MAW` seams | `__PB` seams (§1.7) |
| Viewport-cutoff law (V1_422), pinned-footer exits (V1_429) | All overlays obey them |

Only reuse the *patterns/discipline* — code is a fresh file. Where a system isn't in the slice, leave the
named chokepoint so the later automated build-out slots in without a refactor.

---

## 5. `pinball_meta` save schema (v1, slice-minimal, additive-only)

```js
{ v: 1,
  ach:      {},                                  // achievement progress (engine lands later)
  unlocked: { tables: ['neonSpace'], drafts: [/* all slice drafts */] },
  currency: 0,                                   // meta currency (arcade flavor: "TOKENS"); shop lands later
  shop:     {},                                  // { statId: rank }
  life:     { runs: 0, bestScore: 0, roundsCleared: 0, multiballs: 0, best: {/* per-table */} } }
```
Rules: additive migrations only; unlocks never re-lock; merge-with-defaults on load; prune unknown ids.

---

## 6. Polish-to-90 rubric (how we grade the slice)

Score vs 100 = best-in-class pinball feel + roguelike depth. Dimensions (weighted):
1. **Ball feel & physics** (30) — no tunneling ever; lively but controllable bounce; flipper impulse reads
   right; ramps/orbits feel intentional; nudge/tilt satisfying.
2. **Flipper control & skill ceiling** (15) — cradling, backhands, aimed shots are learnable and rewarding.
3. **Scoring clarity & juice** (15) — readable score events, combos, big multiball payoff, screen/audio juice.
4. **Board layout & flow** (10) — shots feel good, no cheap drains, geometry legible.
5. **Roguelike hook** (15) — the draft meaningfully changes a run; choices feel impactful and honest.
6. **Round-loop tension** (5) — target-score chase creates real pressure without feeling unfair.
7. **Presentation/theme** (5) — neon Space identity, cohesive with the arcade.
8. **Stability/perf/mobile** (5) — 60fps, touch flippers work, no soft-locks, zero pageerrors.
Target 90; Kevin directs the feel dials (gravity, restitution, flipper impulse, ball-save, target curve).

---

## 7. Build phases

**SLICE (now):** physics engine + `__PB` seams + Neon Space board + scoring + 3-ball target-score round +
between-ball draft (12-card pool) + `pinball_scores` leaderboard + one music track set + game-over/RESULTS +
touch controls. Verified: physics invariants, round clears, draft applies, leaderboard submits, zero
pageerrors, screenshots at desktop + 412×720. **Then Kevin fine-tunes to 90.**

**FULL BUILD-OUT (later automated run):** meta-shop + currency economy · multiple machines (per-table
layouts/themes/music/objectives) · Wizard-Mode finale · achievements + unlock gating · run "mods" · secret
codes · achievement drip-feed pacing · full mobile polish · Playwright suite expansion. Each machine is a
data-driven board definition consumed by the one engine.

## 8. Acceptance criteria for the slice
- Launch → play 3 balls → beat/miss target → RESULTS → leaderboard, on desktop + mobile viewports.
- Ball never escapes the board polygon across a 60-second automated shake test (anti-tunneling proof).
- A rising flipper measurably increases ball speed; bumpers/slingshots kick; drain decrements balls.
- Between-ball draft shows 3 cards, applying one visibly changes the run (measured, honest numbers).
- Multiball triggers and pays a jackpot. Ball-save re-serves. Tilt works.
- 60fps on desktop; touch flippers/plunger/nudge on mobile; zero pageerrors (Firebase/GA noise exempt).
