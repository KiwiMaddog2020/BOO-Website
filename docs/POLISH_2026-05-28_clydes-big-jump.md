# Polish — Clyde's Big Jump (`Games/clydes-big-jump.html`)

*Generated 2026-05-28 by the Polish protocol (Opus 4.8). Game #2 of the per-game arcade sweep (after Brickbreaker). Deep read-only audit (~3,046 lines) via a dedicated agent; headline claims (silent audio, dead `scorePop`/`.hud.pop`, mobile-zeroed particles) re-verified against source by grep.*

## 1. Subject + bar

- **Subject:** Clyde's Big Jump — a Flappy-Bird-style game starring Clyde the golden retriever (flap/tap to clear neon-mushroom gaps; global Firebase leaderboard `clydes_jump_scores`). Iframe-embedded + in the iOS app.
- **Bar:** Apple-quality / harsh critic / App-Store-grade.
- **HARD CONSTRAINT (Kevin):** NO mechanic changes (jump/gravity physics, obstacle spacing/speed, scoring, difficulty) without explicit approval. Every finding tagged **[SAFE]** (craft/UX/code/perf/a11y/juice/audio) or **[MECH]**.
- **Objectives:** O1 fun/juice/audio · O2 on-brand neon + Clyde charm · O3 fair leaderboard · O4 mobile/iOS/cross-browser · O5 maintainable vanilla.

## 2. Per-theme ratings (craft × fit, file:line evidence)

| Category | Craft | Fit | Gap | Notes (evidence) |
|----------|------:|----:|----:|------------------|
| **Audio / SFX** | 1 | 1 | 9 | **[V]** 0 audio refs in 3,046 lines. `flap()` (`:1801`), `endGame()` (`:1784`), score++ (`:2029`) all silent. The #1 gap (O1). |
| Game feel — flap/gravity | 7 | 7 | 3 | gravity 0.27 / jump -7 / vmax 8 (`:1438`), fps-normalized (`:1996`), eased rotation (`:2001`). Solid Flappy curve; flap lacks punch/sound. |
| Hitbox fairness | 8 | 8 | 2 | 8px forgiving padding (`:2045`); collision vs 52px stalk only. Generous. |
| Death feel | 3 | 3 | 7 | **[SAFE]** `endGame()` (`:1784`) instantly flips to the modal — no animation, freeze, shake, or sound. The signature Flappy moment is a non-event. |
| Juice — particles/shake/popups | 3 | 3 | 7 | **[SAFE] [V]** Dust is desktop-only (`if(!isLowPerf)` `:1804`) and `maxParticles:0` on small iOS (`:1192`) → mobile gets ZERO juice. No shake, no death burst, no hit-flash. |
| Dead juice (wired, never fires) | 2 | 3 | 7 | **[SAFE] [V]** `scorePop` only ever set to 0 / decayed (`:1662/1725/1965`); `.hud.pop` CSS (`:365`) never added by JS. Abandoned intent visible in source. |
| Clyde sprite / character | 8 | 9 | 1 | Hand-built vector retriever cached off-screen (`:1564-1659`), animated wag tail (`:2447`) + tongue (`:2511`). The most on-brand asset in the arcade. |
| Obstacle art (mushrooms) | 9 | 8 | 1 | 8 caps × 11 stalks × 5 patterns, each ≠ last (`:2105`); cached per spawn. Rich. |
| Background / parallax | 4 | 5 | 5 | Single static cached grid (`:2391`); no parallax/scroll/depth — static world behind moving obstacles. |
| HUD polish | 6 | 6 | 4 | DOM div w/ magenta glow (`:344`), but the `.pop` punch (`:365`) never triggers; score increments with no emphasis. |
| Input — tap/click/space | 8 | 8 | 2 | click + touchstart{passive:false} + Space (`:2682`), 50ms throttle (`:2677`). Clean. |
| Input — pause | 0 | 2 | 8 | **[SAFE]** No pause; no `visibilitychange` (grep 0). Tab-away keeps the run live. |
| Difficulty / progression | 4 | 4 | 6 | **[MECH] [V]** gap 180 / speed 3 / spawn 100 are `const`, never mutated (`:1448`). Score 5 plays like score 50. |
| Performance — loop/pooling | 9 | 9 | 1 | Single persistent rAF (`:2622`), particle + cap-canvas pools (`:1454-1511`), swap-pop removal, 16M-px guard. Senior-grade. |
| Performance — mobile tiering | 7 | 7 | 3 | Tiers correctly, but the result is mobile = no juice (see above). |
| Leaderboard — I/O & UX | 8 | 8 | 2 | Async Firestore + localStorage fallback (`:2884`), rank-aware modal, Number()-coerce + escapeHtml (`:2993`). Solid. |
| Leaderboard — fairness | 3 | 4 | 6 | **[SAFE]** Console-spoofable (`pendingScore` from client `score`, `:2887`); rules validate type/length only. Architectural (App Check). |
| Mobile / iOS / Capacitor | 8 | 8 | 2 | visualViewport sizing (`:1254`), DPR caps (`:1278`), fullscreen handoff (`:1295`). Touch: leaderboard close 44px (`:924`) good; `.menu-btn` ~33px (`:198`) under target. |
| Accessibility | 2 | 3 | 8 | **[SAFE]** 0 aria/role/tabindex; 0 `prefers-reduced-motion` despite constant pulse/bob; no canvas text alt; score not `aria-live`. |
| Robustness / errors | 8 | 8 | 2 | localStorage try/catch (`:1422/1789/2906`), Firebase guarded (`:2731`), CORS suppressor (`:1164`). Strong. |
| Start menu / first-run | 8 | 8 | 2 | Charming 3-screen story→start→countdown flow (`:1066`). But `MIN_LOADING_TIME=1500` (`:1426`) is a fake delay (nothing loads). |
| Code quality | 7 | 7 | 3 | **[SAFE]** Well-sectioned, pooled, cached. Dead: `GameDebug` (`enabled:false`, no toggle `:1199`), `scorePop`, `.hud.pop`. |

## 3. Aggregate

```
                              CRAFT     FIT
─────────────────────────────────────────────
Weighted average (~21 cats)   ~6.2      ~5.8
```
- **Biggest strength:** performance architecture (pools/caches/single rAF, `:1454-1511`) + **Clyde-as-character** (the hand-drawn animated retriever, `:1564-1659`) — the most on-brand asset in the arcade.
- **Biggest weakness:** total silence, compounded by **mobile getting zero juice** (particles desktop-gated `:1804`, zeroed on iOS `:1192`) and a **mute, instant death**. On the primary OnePlus target, flap/score/death are all inert.

## 4. Top 10 highest-leverage improvements

| # | Improvement | Tag | Obj | Cost |
|---|-------------|-----|-----|------|
| 1 | **WebAudio SFX engine + mute + iOS unlock** (flap/score/death/high-score/countdown/menu) — port Brickbreaker V1_184 | SAFE | O1,O2 | med |
| 2 | **Death feel** — hit-flash + screen-shake + Clyde tumble + sound *before* the modal (`:1784`) | SAFE | O1 | low-med |
| 3 | **Re-enable a capped flap-dust burst + score-pop on mobile** (`:1804/1192`) | SAFE | O1,O4 | low |
| 4 | **Wire the dead `scorePop` / `.hud.pop`** on score++ (`:2029/365`) | SAFE | O1 | trivial |
| 5 | **Difficulty ramp** — gap/speed scaling with clamps (`:1448`) | **MECH** | O1 | med — **needs approval** |
| 6 | **Pause + auto-pause** on `visibilitychange` | SAFE | O1,O4 | low |
| 7 | **`prefers-reduced-motion` guard** on decorative animations | SAFE | O4 | low |
| 8 | **`.menu-btn` → 44px** touch target (`:198`) | SAFE | O4 | trivial |
| 9 | **Trim/skip the fake 1.5s loading** (`:1426`) | SAFE | O1 | trivial |
| 10 | **Remove dead `GameDebug`** or gate behind `?debug=1` (`:1197`) | SAFE | O5 | low |

## 5. Sound map (ready to implement)

| Event | Trigger | Character |
|-------|---------|-----------|
| Flap / jump | `flap()` `:1801` | soft rising whoosh ~120→260Hz, ~60ms, ±5% pitch vary (no machine-gun) |
| Score / pass gap | score++ `:2029` | bright coin "ding" ~880Hz, 80ms |
| Collision death (mushroom) | `endGame()` collision `:2048` | descending thud+buzz saw 200→60Hz + noise |
| Ground death | `endGame()` `:2010` | heavier low "splat" variant |
| High score / Top Dog | rank===1 `:2817` | triumphant 3-note arpeggio |
| Countdown tick | `:1948` | 2 soft ticks + 1 higher "go" |
| Menu / button | `:2652-2671` | subtle sine click ~40ms |
| Submit success | `:2893` | confirmation blip-up |
| Mute toggle | new control | tick; persist `clydesBigJumpMuted`; unlock AudioContext on first touch/key |

## 6. Sequenced plan

### Round 1 — Sound & juice *(SAFE; the headline, mechanics untouched)*
- Synth WebAudio SFX engine (port Brickbreaker V1_184) + canvas/HTML mute toggle (persisted) + iOS first-gesture unlock; wire the full sound map above.
- **Death feel:** hit-flash + brief screen-shake + Clyde tumble (cosmetic, ~300–400ms) before the modal.
- Wire the dead `scorePop` / `.hud.pop` on score.
- Re-enable a small capped flap-dust burst + score-pop on mobile (raise the iOS-zero cap to ~6).

### Round 2 — Pause & accessibility *(SAFE)*
- Pause + auto-pause on `visibilitychange`/blur.
- `prefers-reduced-motion` guard on decorative animations; `aria-live` score; focus styling; canvas `aria-label`.
- `.menu-btn` → ≥44px touch target.

### Round 3 — Hygiene & polish *(SAFE)*
- Remove dead `GameDebug` (or `?debug=1` gate); trim/skip the fake 1.5s loading; consider narrowing the mushroom-cap art toward the collision box (cosmetic) so overhang doesn't read as a missed hit.

### Round 4 — Deferred / gated
- **[MECH — needs approval]** difficulty ramp (gap/speed scaling). **[SAFE infra]** App Check anti-cheat (shared decision across all games).

## 7. Open questions for you

1. **Difficulty ramp** — the flat curve is the biggest *engagement* lever, but it's `[MECH]`. Want me to propose a specific gentle ramp (e.g., gap 180→140 and speed 3→4 over the first ~40 points, clamped) for a yes/no? Or leave mechanics fully locked?
2. **Music?** SFX-only recommended (consistent with Brickbreaker — no clash with the site player, iOS-safe). A looping bed is a separate call.

## 8. Honesty checklist

- [x] Every craft grade cites file:line or a measured fact.
- [x] Every fit grade ties to an objective (O1–O5).
- [x] Zero "seems reasonable / looks fine / could be better / appears solid / generally well-structured" (grep-clean).
- [x] At least one sub-10 weakness per theme.
- [x] Calibrated to the harsh-critic / App-Store bar.
- [x] Headline claims (silent, dead scorePop/.hud.pop, mobile-zeroed particles) re-verified by grep.
- [x] Every finding tagged [SAFE]/[MECH]; mechanics-lock honored.
- [x] Plan separates SAFE wins (R1–R3) from gated MECH/infra (R4).

---

## 9. Execution status (2026-05-28)

**Round 1 — sound + death feel: COMPLETE & live (V1_189)** — all `[SAFE]`:
- Synth WebAudio SFX engine + HTML mute toggle (top-left, persisted `clydesBigJumpMuted`) + iOS gesture unlock (ported from Brickbreaker V1_184).
- Cues: flap (pitch-varied), score (+ wired the dead `.hud.pop` pulse), countdown "go", menu click, submit, cause-specific death (mushroom/ground), high-score sting on new best.
- Death feel: screen-shake + death sound, modal deferred ~450ms so death is a moment. Honors `prefers-reduced-motion`.

**Difficulty ramp (`[MECH]`): DECLINED by Kevin — keep flat.** Do not add a ramp.

**PENDING (`[SAFE]`, optional):** re-enable a capped flap-dust burst on mobile (the `if (!isLowPerf)` particle gates at the flap/update/draw sites need flipping to `PERF.maxParticles > 0`, with iOS-small cap raised from 0); R2 (pause + auto-pause on `visibilitychange`, a11y: aria-live score, focus, 44px `.menu-btn`); R3 (remove dead `GameDebug`, trim the fake 1.5s loading, narrow mushroom-cap art vs the 52px collision column). Score-pop is already wired via `.hud.pop`.
