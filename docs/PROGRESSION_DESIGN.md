# BOO Survivors — Progression & Multi-Level Architecture (V1_396)

Architect: Fable (advisory + specs). Implementers: Opus (high) / Sonnet (xhigh–high) per phase.
Goal: take the game from one polished endless level to a fully fledged game — **85/100**
where 100 = Vampire Survivors base-game progression/depth. Kevin's directives: lock part of
the arsenal behind achievements, ≥4 new levels with new aesthetics and some new enemies
(ranged included, fun-not-annoying), always a final wave, **final wave standard = 30:00**.

Recon anchors below refer to `Games/neon-survivors.html` at V1_395 (31,350 lines) and WILL
DRIFT as phases land — re-grep the named symbols, don't trust raw numbers.

---

## 1. Meta-progression core

### 1.1 Save (new, versioned)
`localStorage` key **`survivors_meta`**, guarded like the Settings module (isolated pattern,
`canUseStorage()` probe, defensive parse, stale-id pruning — see 31130–31176):

```js
{ v: 1,
  ach:      { [id]: { p: 0, done: false, ts: 0 } },     // progress + completion
  unlocked: { weapons: [...], tomes: [...], levels: ['meadow'] },
  life:     { kills: 0, gold: 0, runs: 0, bosses: 0, directives: 0, chests: 0,
              deaths: 0, best: { [levelId]: seconds }, clears: { [levelId]: 0 } } }
```
Rules: additive migrations only; **unlocks never re-lock**; merge-with-defaults on load;
prune ids that no longer exist in `WEAPONS`/`TOMES`/`ACHIEVEMENTS`/`LEVELS`.

### 1.2 Achievements engine
No event bus exists — hybrid observation:
- **Frame-poll** (1 Hz is plenty) cheap globals: `gameTime`, `kills`, `player.level`,
  `playerGold`, `bossCount`.
- **Notify shims** `Achievements.notify(evt, data)` (one-liners) at: boss kills
  (`kills += 10` @16296, `kills += 25` @16750), directive completion (`directiveReward`
  @26600), chest open, shrine activate, weapon reaching level 20 (upgrade-apply @~24730),
  death (`gameOver` @30423), victory (new, §3.4).
- **Run summary + award pass** in `gameOver()` and in the new victory path — both funnel
  through one `Achievements.endOfRun(summary)`.
- Directive targets have `xpValue=0` but ARE real kills — they count toward kill counters.

### 1.3 Unlock gating — the three-concept rule
`unlockedWeapons`/`unlockedTomes` (meta) is a **third concept**, separate from persisted
user prefs `disabledWeapons`/`disabledTomes` and per-run `banishedWeapons`. Central
helpers `weaponUnlocked(id)` / `tomeUnlocked(id)`; new shared `weaponOfferAllowed(id)`
used by every weapon pool; fold `tomeUnlocked` into existing `tomeOfferAllowed()` (@9573)
so tome surfaces inherit. **Surfaces that MUST gate** (recon §9): weapon-select grid
(@29582), level-up builder (@24040), **starting-bonus pick-3 (@21287/21296/21312 —
currently skips even disabled/banished filters: highest leak risk)**, shrine/chest/pot/
shop blessing pool (`shrinePowerupPool` @9563), tome editor (@29794). A locked id must
never appear in ANY pool, hint, or reroll.

### 1.4 Starting roster (10 weapons / 8 tomes available on fresh save)
Starters cover every archetype:
**Weapons:** energyBolt, plasmaOrbit, shotgun, beam, starField, pulseMine, iceShard,
flameThrower, boomerang, toxicAura.
**Tomes:** powerTome, vitalityTome, speedTome, attackSpeedTome, armorTome, xpTome,
critTome, regenTome.

### 1.5 Achievement → unlock map (15 weapons, 8 tomes)
Pacing: first session should pop 2–3 unlocks; capstones tie to level clears.

| Achievement id | Condition (observable) | Unlocks |
|---|---|---|
| `firstBlood`     | 150 kills in one run | spiritOrbs |
| `survivor10`     | Survive 10:00 in one run | voidDaggers |
| `bigSpender`     | Earn 2,000 gold in one run | ricochetDisc |
| `bossDown`       | Kill 5 bosses lifetime | thunderStrike |
| `packHunter`     | 500 kills in one run | blackSquirrel |
| `exterminator`   | 2,500 kills lifetime | chainLightning |
| `taskmaster`     | Complete 3 directives in one run | spectralArrows |
| `survivor20`     | Survive 20:00 in one run | gravityWell |
| `keeper`         | Activate 3 shrines in one run | lighthouse |
| `highScaler`     | Reach player level 25 in one run | boomBox |
| `perfectionist`  | Max any weapon (level 20) | photonScythe |
| `marshCleared`   | Clear Gloom Marsh | meteorStrike |
| `necroCleared`   | Clear Neon Necropolis | stormSentry |
| `emberCleared`   | Clear Ember Wastes | encore |
| `riftCleared`    | Clear the Void Rift | voidRailgun |
| `lucky`          | Open 10 chests lifetime | luckTome |
| `bossSlayer`     | Kill 12 bosses lifetime | critDamageTome |
| `survivor15`     | Survive 15:00 in one run | lifestealTome |
| `highLevel15`    | Reach level 15 in one run | sizeTome |
| `survivor25`     | Survive 25:00 in one run | persistTome |
| `slaughter300`   | 300 kills in one run | velocityTome |
| `tycoon`         | Earn 5,000 gold lifetime | midasTome (Riches) |
| `phoenix`        | Perish 5 times | retributionTome (Thorns) |

Level clears also unlock the next level (§2). Existing players start fresh — that IS the
progression; flag in release notes.

---

## 2. Levels (5)

`LEVELS` registry; `activeLevel` chosen on the new Level Select screen, applied inside
`startGame()` (@30056 — the single setup seam) and `generateTerrain()` (@20760).
Theme scope per recon §4: **theme ground/decoration/atmosphere only** — `GROUND_PALETTE`,
`FLOWER_COLORS`, `MOTE_COLORS`, obstacle counts/variants, plus a new fullscreen ambience
tint/fog layer. `COLORS` (gameplay neon) stays global. Convert the four theme tables from
`const` to reads off `activeLevel` with Meadow as defaults.

Per-level record:
```js
{ id, name, tagline, ground, flowers, motes, obstacles: {lakes, trees, rocks, bushes,
  variants}, ambience: {tint, fog}, spawnTable: minute-keyed type weights,
  tuning: {hpMult, dmgMult, speedMult, spawnRateMult}, roster: [newEnemyKinds+entry times],
  finalWaveAt: 1800, clearHoldSeconds: 120, unlocks: nextLevelId }
```

| # | id / Name | Look (ground/decor/motes) | Feel & signature enemies |
|---|---|---|---|
| 1 | `meadow` / **Neon Meadow** | current, untouched | current roster; the baseline |
| 2 | `marsh` / **Gloom Marsh** | murky teal-greens, 12 bog pools, dead trees, firefly motes | tanky-slow (hp×1.15, spd×0.92); **spitter** @2:00 |
| 3 | `necropolis` / **Neon Necropolis** | violet slate, tombstones (rock variant), 4 pools, 60 bare trees, ember motes | swarm-heavy; **gravecaller** @3:00, **wraith** @6:00 |
| 4 | `ember` / **Ember Wastes** | charcoal/rust, LAVA pools (lake variant, glowing), obsidian rocks ×70, charred spires | fast-fragile (spd×1.12, hp×0.9); **cinderWisp** @2:00, **charger** @4:00 |
| 5 | `rift` / **Void Rift** | indigo/black starfield, crystal shards + spires, 6 void pools | everything + elites (hp×1.2, dmg×1.1); **splitter** @1:00, **voidSniper** @5:00, all prior signatures later |

Progression: fresh save has `meadow` only; **clearing level N unlocks N+1** (and fires the
matching weapon achievement for 2–5).

---

## 3. Enemies & the final wave

### 3.1 New-enemy architecture
Existing 4 types (basic/fast/tank/swarm) stay on their legacy switch untouched. New kinds
live in an **`ENEMY_KINDS` registry** `{ stats, ai(e,dt), face(ctx,e) }`; `Enemy`
constructor and the AI/draw dispatch fall through to the registry when the type isn't
legacy (recon §1 gotcha — this avoids touching ~10 `this.type ===` branches).

### 3.2 Enemy projectiles (new, first-class)
Own light array (NOT the `Enemy('swarm')` hack @16717). Doctrine — **fun, not annoying**:
- speed strictly below player base move speed (dodgeable by walking);
- visible wind-up telegraph before every shot (glow swell; snipers get an aim line,
  **locked at fire decision — never tracking**);
- no homing, hard despawn (range ~500 + offscreen), **global cap ~24 live projectiles**;
- baked-glow sprites (no per-frame shadowBlur), damage applies player armor path.

### 3.3 The kinds
| kind | behavior sketch |
|---|---|
| `spitter` | stops 260–340px out; 0.7s glow; lobbed arcing glob w/ landing ring, small AoE; cap 6 globs |
| `gravecaller` | keeps ~400px; every 6s raises 3 tinted swarm minions; **killing caller pops its brood** |
| `wraith` | fades intangible→drifts close→0.5s shimmer telegraph→2.2× lunge; only solid = vulnerable |
| `charger` | tank charge state machine, lighter hp; longer telegraph line drawn on ground |
| `cinderWisp` | strafes ~300px; 0.6s glow; burst of 3 straight bolts (0.18s spacing) |
| `splitter` | on death splits once into 2 minis (60% stats); minis don't split |
| `voidSniper` | holds ~420px; 1.4s thin aim-line telegraph; single heavy slow orb; 5s cd |

### 3.4 Final wave → victory (the missing terminal state)
Today `gameTime >= finalSwarmTime (1800)` escalates forever (recon §3); no win exists.
New: **every level's FINAL HORDE fires at 30:00**; surviving `clearHoldSeconds` (120s)
inside it triggers **VICTORY** — new overlay (retitle-branch of `menuOverlay` or third
overlay): "LEVEL CLEARED", run stats, unlock toasts, then two buttons:
**KEEP GOING** (endless — horde continues escalating exactly as today) and **FINISH RUN**
(score modal → menu). Clear is persisted (`life.clears`, `unlocked.levels`, achievement)
the moment victory fires, regardless of what the player picks. `MUSIC`: victory reuses
the title-swell pattern (`rise`), then back to `game` state if continuing.
Beware the "swarm" naming collision (pre-boss SWARM event vs swarm TYPE vs FINAL SWARM)
— new state vars must not touch `swarmActive`.

---

## 4. UI

- **Level Select** — new step: menu START → Level Select → Weapon Select. 5 cards
  (2-col grid on ≤550px), locked = dim + 🔒 + "Clear <prev level>"; shows best time +
  cleared badge. Visual language + zero-scroll/pinned-✕ lessons from V1_393 tome editor.
- **Locked weapon/tome cards** — dim + 🔒 + the achievement hint line ("Survive 20:00 in
  one run"); click shows hint, never selects; excluded from confirm + Edit mode counts.
- **Achievements panel** — button on main menu; grid of cards w/ progress bars
  (e.g. 1,830/2,500), done = lit. Same overlay skeleton as tome editor (incl. Escape,
  pinned ✕, zero-scroll tiers).
- **Unlock toast** — slide-in "🔓 UNLOCKED — Thunder Strike" queue, in-run and on menus;
  also stacked on the victory screen.

---

## 5. Phasing (serialized — single 31k-line file, one writer at a time)

| Phase | Scope | Model/effort |
|---|---|---|
| P1 | Meta save + achievements engine + notify shims + gating helpers + patch ALL offer surfaces (incl. starting-bonus leak) | Opus / high |
| P2 | Locked-card UI (weapon select + tome editor), achievements panel, toasts, menu button | Sonnet / high |
| P3 | LEVELS registry + startGame/generateTerrain injection + spawn-table refactor (@23522–23558 replaced wholesale) + Level Select + victory terminal state + per-level persistence | Opus / high |
| P4 | ENEMY_KINDS registry + 7 kinds + enemy-projectile system + level roster wiring | Opus / high |
| P5 | 4 level aesthetics (theme tables, terrain variants, ambience layers) | Sonnet / xhigh |
| P6 | Integration verify (fresh-save flow, time-warped 30-min final-wave test per level, unlock chain), balance pass | architect + agents |
| P7 | Polish loop → honest 85/100, shipping every iteration | loop |

Every phase: headless verification (server :8123, playwright-core, zero pageerrors),
commit `[V1_39x]`, push branch + main (CI E2E gates deploy).

## 6. The 85/100 rubric (VS base game = 100)
- Content variety (levels, enemy kinds, arsenal breadth) — /25
- Progression pull (unlock pacing, visibility, "one more run") — /25
- Moment-to-moment fun & balance (per level) — /20
- UX & juice (toasts, screens, clarity, zero jank) — /15
- Stability & mobile perf (60fps, 412px layouts, zero errors) — /15
Target: ≥85 total, no category below 70% of max. Scored honestly each polish iteration;
gaps become the next iteration's worklist.

## 7. Out of scope (parked)
Per-level Firebase leaderboards (needs firestore.rules change — flag to Kevin),
COLORS-level neon re-theming, grandfathering existing players' unlocks.
Next depth levers, in priority order (gap analysis vs VS/Megabonk, Kevin-reviewed):
**weapon evolutions** (max weapon + matching tome → evolved form), **meta gold shop**,
gameplay-stat characters layered on the sprite system, arcanas/run modifiers.

---

## 8. Post-85 addendum — how the design actually evolved (V1_403 → V1_412)

This doc was written for the 5-level 85-target arc; everything below extended it.
CLAUDE.md carries the always-current summary; registries in-file are the truth.

- **Per-level music subsets** (V1_403): shipped — `LEVELS[].music` filters the 12-song
  rotation; meadow = all 12. (Un-parks the §7 item.)
- **Per-run achievement high-water marks + themed boss identities** (V1_404):
  `BOSS_IDENTITY` per level; runStat progress is a persisted best, never zeroed.
- **10-step tutorial rewrite + z-fix** (V1_405): tutorial overlay must stay ABOVE the
  menu (10001 vs 2000) — it silently opened underneath for a long time.
- **Unlockable player sprites** (V1_406/V1_408): `PLAYER_SPRITES` registry, 9 skins,
  drawn inside the squash/lean transform; the V1_408 `overHat(ctx, oh)` pass draws
  through/around the cowboy hat inside its tilt transform (horns/halo/flames/moss).
- **Hellmouth** (V1_407): 6th level `inferno`, hardest tuning, PIT FIEND/THE ARCHFIEND,
  demon sprite via `infernoCleared` (24th achievement).
- **THE MAW** (V1_409/V1_410): true final boss behind a post-clear portal on Hellmouth
  ONLY (Kevin: portal unlocks after the 2:00 clear; reward = Legend sprite, 25th
  achievement `mawSealed`). 3 phases on 66%/33% gates, telegraph law instrumented
  (`__MAW.telemetry`, min 800ms). Music override: `MUSIC.setOverride('maw')` /
  `clearOverride` (V1_410 engine port; rotation suppressed while set; any setState
  clears). `MAW_HP` = reasoned estimate — live-device tuning input wanted.
- **Perf law enforcement** (V1_411): enemy body glow baked (−54% crowd draw pass),
  ghost glow baked + soft cap 12. Deferred with reasoning: `Projectile.draw` bake
  (up to 300/frame — #1 remaining perf item, needs a per-weapon look-parity cycle),
  XP-gem bake (measured REGRESSION in-harness — do not redo without GPU measurement).
- **Target raised to 90+** (Kevin): iterations = perf (A, V1_411) → art/UX flags
  (B, V1_412) → balance depth (C). Fun & balance is the gating category; past ~C the
  honest next point comes from live play on Kevin's device, not more headless proxies.

---

## 9. Depth addendum — V1_413 → V1_422 (Maw tuning, music, economy, drip-feed)

CLAUDE.md carries the always-current summary; in-file registries are the truth.

- **Maw HP measured** (V1_413): 130k estimate re-based against benched mid-build DPS
  (1,890 measured) → `MAW_HP` 220k (mid ≈ 180–260s real at 45–65% dodge uptime).
  Live dodge-uptime on Kevin's device remains the open tuning input.
- **Per-level music** (V1_414/V1_415): 15 new 32-bar tracks (5 per new level, themed);
  `shufflePlaylist` semantic change — `LEVELS[].music` is now the POOL ITSELF validated
  against `TRACKS` (fallback full-12 if <2 valid), un-trapping brand-new track keys the
  old filter-over-meadow-12 silently dropped. V1_415 extended the 12 meadow originals
  to the same 32-bar form (EXTENSIONS merge; shipped bars byte-identical).
- **Power ceiling** (V1_416): two-lane DR in `Player.applyPassives` — PERMANENT
  stacking passes knees (`PERM_AS_KNEE` 0.80/0.50, `PERM_CRIT_KNEE` 2.6/0.45);
  temporary spikes (deadeye etc.) stack after, unscaled. Strong/mid spread measured
  7.5× → 4.05×, monotonic; UI shows effective values.
- **Evolutions wave 1** (V1_417): `EVOLUTIONS` registry (base L20 + paired tome →
  chest becomes EVOLVE reveal; in-place slot transform; evolved is final — never
  levels, never offered). 8 of 25 shipped; `firstEvolution` badge. Remaining 17 are
  a content backlog, not new architecture.
- **Legendary rework** (V1_418): splitFire removed everywhere; +soulHarvest /
  spectralEcho / phantomStride / guardianWisp (pool 17). ONE-OF-EACH per run enforced
  at the `showLegendaryUpgrade()` chokepoint + chest preview; all-owned → V1_385
  blessing fallback. xpMagnet display renamed "Soul Siphon" (name collision).
- **Live-play UI batches** (V1_419): combined APPEARANCE picker (color+sprite, one
  popover), HUD glyph clamp, trackpad tooltips fixed (dead since V1_314 —
  #trackpadZone swallowed mousemove), overhead HP-bar fade with hysteresis, unified
  1.5× objective arrows w/ scale-aware corner margins, SURVIVE countdown → pause-safe
  shrink-to-chip.
- **Unlock pacing revamp** (V1_420): 28 achievements; session 1 = exactly 3 unlocks;
  raised thresholds spread meadow mastery over sessions 2–6; NEW level-conditional
  runStat plumbing (optional `level:` tag — progress only counts on the matching
  world): Marsh Endurance 15:00 → lifesteal, Grave Vigil 25:00 necro → persistence,
  Forged in Fire L30 ember → Boom Box, Hellwalker badge; meadowCleared parity event.
  Migration law held: legacy sims keep every unlock (union merge, prune-only).
- **PLASM economy** (V1_421): second currency, Megabonk split (gold = in-run only).
  Sources: mini-boss 2 / boss 5 (field shards, magnetized), level clear 25 (+25
  first), Maw seal 100, survival floor(min/2) on death AND victory. Menu PLASM SHOP:
  10 permanent stats × 5 ranks, costs 10/20/35/55/80 (2,000 full board ≈ 25
  clear-runs), FULL REFUND; bonuses apply at `startGame` through the V1_416 permanent
  lane (verified: +5% shop atk-speed compresses to +2.5% past the knee). META adds
  `plasm`/`plasmLifetime`/`shop` (additive; legacy-safe).
- **Viewport-cutoff law** (V1_422): Kevin-reported (Info popup unreachable GOT IT!).
  Every surface must bound height to the viewport with inner scroll + pinned
  header/exit. 36 surfaces × 5 viewports audited to 0 fails. Gotchas found:
  `backdrop-filter` makes an overlay the containing block for fixed children (pin
  broke on the shop ✕ — blur moved to a `::before` layer); absolute-positioned
  corner buttons inside scrollable overlays scroll away (gear → fixed); decorative
  oversized `::after` layers (legendary god-rays) turn `overflow-y:auto` into bogus
  scroll — that overlay is intentionally left unhardened, documented in place.
