# Polish — Snake Racing (`Games/neon-snake.html`) — 2026-05-29

Audio + SAFE polish pass. **Mechanics locked**: no speed/grid/spawn/score/balance
changes. All edits surgical, anchored on unique snippets. No git, no server run.
Did not re-touch V1_163 leaderboard hardening or the V1_174 CORS handler.

---

## 1 Audit

Snake Racing was **completely silent** — the only arcade game with zero audio.
Mechanically rich (race up to 2 AI snakes for food; bait their head into your tail
for a kill), with a slot-machine power-up selector, kill animations, a death
sequence, and a Firebase leaderboard with a score-submit modal — all soundless.
Every one of those beats is a natural cue. The game also had two small non-audio
gaps: the leaderboard name cell rendered the literal string `undefined` for
malformed docs (everything else was already hardened in V1_163), and three
icon-only `✕`/control buttons lacked `aria-label`s. No `prefers-reduced-motion`
handling existed for the looping power-up CSS animations.

Pre-audio craft: solid. Pre-audio *fit* for an arcade title: weak — silence on a
neon racer reads as broken.

---

## 2 Sound map wired

Synth WebAudio engine (no asset files) inserted immediately after the canvas
context line. Master gain 0.32, mute persisted to `localStorage['snake_muted']`,
unlocked on first pointer/touch/key. Primitives kept EXACT as specified.

| Event | Cue | Anchor (unique snippet) |
|-------|-----|--------------------------|
| Eat food | `SFX.eat(snake.length)` — pitch rises with length | after `score += points; scoreEl.textContent = score;` in the food-collision block |
| Power-up orb collected | `SFX.powerup()` — two-note rise | just before `showPowerupSelector();` |
| Slot reveal (per slot) | `SFX.slotReveal(i)` — pitch per slot index | right after `slot.classList.remove('rolling');` (loop index `i`) |
| Power-up chosen | `SFX.choose()` — 3-note arpeggio | just before `choice.apply();` |
| Overtake / kill enemy (your win) | `SFX.kill()` — triumphant 3-note rise | in `enemy_dies` branch, before `startKillAnimation(...)` |
| Enemy self-destruct (no reward) | `SFX.enemyGone()` — soft down-sweep | inside `simpleKillEnemy()` body (covers all 3 no-reward call sites with one edit) |
| Death (self + enemy collision) | `SFX.gameover()` — descending buzz | first line of `function gameOver()` |
| Leaderboard submit success | `SFX.submit()` — success chime | before the success-path `hideScoreModal();` (after add/saveLocalScore) |
| Submit validation error | `SFX.submitError()` — low buzz | before each `usernameInput.classList.add('error')` (both validation branches) |
| UI clicks | `SFX.uiClick()` — short blip | one delegated `document` click listener (click only) |

**Mute button**: persistent 36×36 overlay button (`#muteBtn`) placed inside the
`position:relative` `.canvas-wrapper`, top-left, `z-index:60`. Deliberately NOT in
`#controlsButtons` (that row is `display:none` during gameplay, so mute would be
unreachable mid-game). Toggles 🔊/🔇, persists, `stopPropagation` so it never
fires the delegated UI blip or a duplicate touch.

Total: **14 `SFX.` call sites** (10 distinct game cues + unlock/toggle/muted).

---

## 3 SAFE polish

- **Bug — leaderboard "undefined" name**: `escapeHtml(entry.name)` →
  `escapeHtml(entry.name || '???')`. Malformed docs now show `???` instead of the
  literal string `undefined`. (Score was already guarded with `Number(...) || 0`
  in V1_163; this closes the matching gap on the name field.)
- **a11y — icon-only buttons**: added `type="button"` + `aria-label` to
  `#leaderboardClose` ("Close leaderboard") and `#tutorialClose` ("Close
  tutorial"). The new `#muteBtn` already carries `aria-label` + `aria-pressed`.
  PREV/NEXT tutorial buttons already have visible text — left alone.
- **prefers-reduced-motion**: added a `@media (prefers-reduced-motion: reduce)`
  block disabling the looping/decorative CSS keyframe animations —
  `powerupTitlePulse` (via `.powerup-title`), `powerupShine` (slot `::before`),
  `powerupRoll` + `powerupIconCycle` (rolling slots), and the `inputShake` error
  shake. Canvas `Math.sin` pulses are NOT touched (per instruction).

---

## 4 Deferred / MECH (flagged, not applied)

- **Per-MOVE tick sound** — intentionally OMITTED. At full speed the snake moves
  ~10×/sec; a tick per move is grating. Not added by design.
- **Orbitron font** — file currently uses a system stack, not the arcade's
  Orbitron. This is the owner's call (visual identity), deferred.
- **`neonSnakeHigh` localStorage key** — camelCase, inconsistent with the
  snake-case keys elsewhere. Migrating it risks orphaning existing local high
  scores for no user benefit. Left as-is.
- **Racing/lap MECH ideas (out of scope — mechanics locked)**: a lap/position HUD
  ("you vs. AI #1/#2" food-count race), a near-miss "close call" cue when an enemy
  head passes adjacent to your tail, a combo multiplier sound for back-to-back
  kills, or an engine-rev ambient loop that pitches with speed. All would be fun
  but each changes feel/feedback loops — owner's call, separate task.

---

## 5 Validation (no browser / no git available here)

Static checks only:
- Re-read engine + ~6 wiring sites; confirmed exact-match anchors.
- `grep` count of `SFX.` call sites = 14 (expected ≥12).
- Brace/paren/bracket balance: engine slice net 0; whole `<script>` block net 0.
- `window.SFX = SFX;` present.
- Grid-snap math (`GRID_COUNT`, `GRID_SIZE`, `canvas.width/height`) untouched.
- V1_174 CORS suppressor + V1_163 leaderboard hardening confirmed intact.

**Manual boot path (for a browser pass later):**
1. Open `Games/neon-snake.html`; menu overlay shows.
2. Click `#menuStartBtn` → `startGame()` (first click also unlocks audio).
3. ArrowKeys / WASD to move. Eat food → rising blip. Grab the ⚡ orb → power-up
   chime + slot-machine reveals + choose arpeggio. Bait an AI head into your tail
   → kill fanfare; let an AI hit a wall → soft down-sweep. Die → game-over buzz.
4. Submit a name → success chime; submit a 1-char/blocked name → error buzz.
5. Toggle 🔊/🔇 top-left mid-game; reload → mute state persists.

---

## 6 Re-rate

- **Audio**: 0/10 → **9/10**. Full, length-reactive cue set covering every game
  beat; synth engine, gated unlock, persistent mid-game mute. −1 only for the
  deliberately-omitted move tick and no ambient/music bed (out of scope).
- **a11y**: ~7 → **9/10**. All icon-only controls now labelled; reduced-motion
  honored for the busy power-up animations.
- **Leaderboard robustness**: now matches the rest of the suite (name + score
  both guarded).

No blockers. Recommend a quick in-browser confirmation of the unlock-on-first-gesture
and the mid-game mute toggle before shipping, since those can't be exercised here.
