# POLISH ROUND — BOO Pinball (P1_6 audit)

Date: 2026-07-17 · Baseline: `e254024` (P1_5) · Protocol: 3 specialist auditors (feel+gameplay,
presentation+juice, UX/mobile/perf) played the game hard THROUGH the arcade embed + a code-read
synthesis; architect merged, re-verified, scored conservatively. Rubric: `PINBALL_DESIGN.md` §6.

## Current rating: **76 / 100**

| Dimension | Score | Why |
|---|---|---|
| Ball feel & physics | 25.5/30 | Fundamentals verified strong (0 tunnels in 22,266 samples @2600px/s; clean 1500px/s² arc; live-catch 874→1647; fair drains). Docked: bumpers SET velocity to 560 — they *brake* fast balls instead of popping. |
| Flipper control & skill | 9/15 | **Aimed shots connect ~50% even when perfectly timed** — lane capture tests once per 240Hz step and strobes make/miss (measured). Cradle works but the ball settles at the flipper *base*, unshootable — no cradle-to-aim loop. Skill ceiling is broken by these two. |
| Scoring clarity & juice | 11.5/15 | Pops/combo/strobe/shake solid; but multiball (the "mandatory dopamine spike") rarely happens — `serveBall()` wipes B-O-O + multiplier progress every ball. Callouts understated for the big moments. SAVE badge overlaps the progress %. |
| Board layout & flow | 8/10 | Authentic vocabulary all present + fair drains. Capture inconsistency + single-flavor multiball dent flow; some label-dependence remains. |
| Roguelike hook | 10/15 | Goldmine UI + honest numbers are house-quality. But 11/12 cards are flat stat mults (only Wide Flippers changes *play*), offers are uncurated (repeat/dominated cards), and RESULTS never shows the build. |
| Round-loop tension | 3.5/5 | **Inverted snowball**: draft-every-ball × multiplicative cards outpace the 1.6× ante growth — later rounds get *easier* (anti-Balatro). Menu shows stale "TARGET 20,000" vs the real 30,000. |
| Presentation / theme | 4.5/5 | Cohesive Neon Space identity; game-over→RESULTS ceremony + 5-track audio are the strongest parts. Attract screen too dark to sell the table. |
| Stability / perf / mobile | 4/5 | Zero pageerrors everywhere, perf law clean, touch works. But **no pause at all** (and no visibilitychange — a live ball drains while the tab is backgrounded); a11y gaps (focus ring, reduced-motion). |

## Top 5 weaknesses
1. **Shot-making is a coin flip** — lane-capture strobing (HIGH; feel + skill ceiling).
2. **No cradle-to-aim loop** — trap settles unshootable at the flipper base (HIGH).
3. **Ante snowball inversion** — runs get easier as they go; tension inverts (HIGH; balance).
4. **Multiball starves** — per-ball objective wipe makes the game's biggest moment its rarest (HIGH; balance).
5. **No pause / thin onboarding** — Survivors-parity gaps (pause, tutorial, touch copy) (MED).

## Candidate trains

### Train A — "Make the shots real" (feel & skill) — expected ≈ +6-7 pts
| Item | Sev | Effort |
|---|---|---|
| Lane capture runs inside CCD substeps (fix ~50% strobing; aimed shots become learnable) | HIGH | M |
| Cradle-to-aim: trapped ball settles toward the flipper tip; re-flip carries real impulse | HIGH | M |
| Bumpers ADD energy (impulse, not velocity-set; dial toward ~700-800) | MED | S |
| Feel-dial pass with Kevin live after the above | — | S |

### Train B — "Tension & the Spike" (balance & multiball) — expected ≈ +5-6 pts
| Item | Sev | Effort |
|---|---|---|
| Persist objective progress (B-O-O, jackpot lit, drop bank) across balls within a round | HIGH | S |
| Fix ante snowball (draft cadence round-only OR additive big cards OR steeper growth — pick via bench) | HIGH | M |
| Real progressive saucer lock: lock 1/2 → lamps → 3rd lights multiball (+ build-up read) | MED | M |
| Draft curation (no dominated/repeat offers) + 3-4 play-changing/tradeoff cards | MED | M |
| Menu stale 20k target fix | LOW | S |

### Train C — "Ceremony & juice" — expected ≈ +3 pts
| Item | Sev | Effort |
|---|---|---|
| Big-callout banner component (MULTIBALL! / JACKPOT! / ROUND CLEARED / SKILL SHOT) | MED | M |
| Attract mode: brighten board behind menu, demo ball, START pulse | MED | M |
| Draft-card roll-in + rarity gradients + distinct icons (full Goldmine parity) | LOW | M |
| RESULTS shows the run's draft picks (mod strip) | LOW | S |
| SAVE badge / progress % overlap fix | LOW | S |

### Train D — "Onboarding & care" (UX/a11y) — expected ≈ +2 pts + retention
| Item | Sev | Effort |
|---|---|---|
| Pause (P/Esc + HUD button) + visibilitychange auto-pause | MED | M |
| HOW-TO-PLAY overlay (Survivors-style; covers nudge/tilt, skill shot, lock→multiball, ante) | MED | M |
| Touch menu copy (no keyboard keys on phones) + desktop nudge discoverability | LOW | S |
| a11y: focus-visible ring in-game, prefers-reduced-motion gating | LOW | S |

**Quick wins** (<30 min each, any train): stale menu target · SAVE overlap · touch menu copy.

## Notes
- Balance-affecting items (Train B rows 1-2, bumper dial) follow the balance protocol: benched
  before/after, changelogged, Kevin approves the direction (he selects the train itself).
- Positives to protect: anti-tunneling CCD, display-truth draft numbers, V1_432 ceremony parity,
  5-track audio identity, zero-pageerror record, the authentic §2 layout.
