# Polish — BOO Brickbreaker (`Games/neon-brickbreaker.html`)

*Generated 2026-05-28 by the Polish protocol (Opus 4.8). First of a per-game sweep across all 7 arcade games. Deep read-only audit (all 5,962 lines) via a dedicated agent; the three headline "dead giveaway" claims (silent audio, Orbitron absent, no pause) independently re-verified against source by grep.*

## 1. Subject + bar

- **Subject:** the BOO Brickbreaker game — `Games/neon-brickbreaker.html` (5,962 lines, self-contained HTML/CSS/JS). "Arcade Roguelite" brick-breaker: power-ups, boss fights ~every 5 levels, lives, global Firebase leaderboard. Iframe-embedded into the band site + bundled in the iOS app.
- **Bar:** Apple-quality / ships to a harsh critic / App-Store-grade.
- **HARD CONSTRAINT (Kevin):** do **NOT** change game **mechanics** (ball physics, scoring formula, power-up behavior, difficulty curve, level/boss design) without explicit approval. Every finding is tagged **[SAFE]** (craft/UX/code/perf/a11y/juice — preserves mechanics) or **[MECH]** (alters feel/balance — needs a yes).
- **Objectives (FIT axis):** O1 fun & satisfying (the hook that keeps band-site visitors) · O2 on-brand BOO neon/psychedelic · O3 fair + exploit-resistant global leaderboard · O4 flawless mobile/iOS/cross-browser · O5 maintainable vanilla code.

## 2. Per-theme ratings (craft × fit, file:line evidence)

| Category | Craft | Fit | Gap | Notes (evidence) |
|----------|------:|----:|----:|------------------|
| Ball physics / speed model | 7 | 7 | 3 | `moveBall:3646` frame-rate-independent (`dx*deltaMultiplier`); bounce conserves speed (`:3699`). Constant within a level; ramps only at `nextLevel:4569`. |
| Paddle "english" / angle | 6 | 6 | 4 | **[MECH]** Angle from contact point only (`:3700`); paddle velocity (`dx`) never transferred → sweeping imparts nothing. Caps skill ceiling. |
| Collision response | 7 | 7 | 3 | Min-overlap AABB-vs-circle (`:3761`), per-row early-exit (`:3744`). Correct. |
| Difficulty curve | 7 | 7 | 3 | **[MECH]** Coherent: speed +0.4/+0.6, paddle shrink, rows grow, boss scaling (`:4569-4587`, `:2540`). |
| Ball launch / serve | 6 | 6 | 4 | **[MECH]** Auto-launch fixed 45° (`resetBall:4607`); no player aim/serve. |
| Lives / death feel | 7 | 7 | 3 | Clear life-loss flow (`:3837-3897`); thoughtful post-clear freeze (`:3626`). No death juice (shake/flash/sound). |
| Input — mouse | 8 | 8 | 2 | `:5220` activate-on-mousedown, correct rect-scale. |
| Input — touch | 7 | 7 | 3 | `handleTouch:5244` gated, `{passive:false}`. Painted "trackpad" implies a smaller hit area than reality (whole canvas works). |
| Input — keyboard | 7 | 6 | 4 | Paddle moves (`:5190`), but **no keyboard to Start/Upgrade/Submit** (`:5384/4138/5710`). |
| Multi-input conflict | 6 | 7 | 4 | **[SAFE]** 2× `click` + 2× `touchend` on canvas (`:5287/5306/5321/5322`); guarded but brittle. |
| **Pause** | 2 | 3 | 7 | **[SAFE] [V]** **No pause, no blur/visibility handling** (grep=0). Laser-dodge bosses + app-switch = lost lives. |
| Power-ups — variety | 6 | 6 | 4 | **[MECH]** Only 3 pickups + 1 debuff (`:2295`). Thin for a "roguelite." |
| Power-ups — clarity/HUD | 7 | 7 | 3 | `drawPowerUpTimers:4466` sorts, flashes <3s, color-coded; ball tints to active power-up (`:3403`). |
| Roguelite upgrades | 7 | 7 | 3 | Weighted anti-repeat RNG (`:4039`), 6 normal + 4 legendary, slot-reveal (`:4103`). Genuinely good. |
| Boss fights | 7 | 7 | 3 | `createBosses:2537` scaling, drop-march, staggered lasers, death particles. **The most polished system in the file.** |
| **Juice / particles** | 4 | 4 | 6 | **[SAFE] [V]** **Brick breaks emit ZERO particles** (`:3776` just `alive=false`); only bosses get FX (`:2854`). No screen shake anywhere. Boss lasers over-juiced (`:3044`) while the core loop is dry — mismatched budget. |
| Combo / scoring feedback | 3 | 4 | 7 | Flat **+1/brick** (`:3777`), no combo/multiplier, no floating "+N". [SAFE] for popups; [MECH] for combo formula. |
| Transitions / game-over | 7 | 7 | 3 | Level-clear/boss-incoming/+life overlays; rank-aware score modal (`:5575`). Coherent. |
| **Audio (SFX/music/mute)** | 1 | 1 | 9 | **[SAFE] [V]** **100% SILENT** — 0 audio APIs (grep=0). No bounce/brick/boss/win sound, no music, no mute. For a *rock band's* arcade, the single biggest fit failure. |
| Visual / neon aesthetic | 8 | 9 | 1 | Cyan/magenta/gold consistent, tiered `shadowBlur` glows, pulsing bricks, ball trail, boss plasma. Strong BOO look. |
| HUD legibility | 7 | 7 | 3 | Canvas HUD measured + centered (`:4687`); readable. |
| Start menu / first-run | 6 | 6 | 4 | Menu + How-to-Play (`:1507/1576`) + first-boss tutorial; but tutorial omits magnet/dual-ball/immunity mechanics. |
| Performance / rAF | 8 | 8 | 2 | Single guarded `update` loop (V1_162), delta clamp, `alpha:false`, CPU-tiered shadows. Careful. |
| Entity / particle caps | 7 | 7 | 3 | Boss particles + trail capped; **[MECH]** multi-ball uncapped (`:3727`, bounce-budget-gated so practically fine). |
| Memory / listeners | 6 | 6 | 4 | Listeners bound once; `rollSlots` interval/timeout (`:4120`) untracked but re-entry-guarded. |
| Leaderboard I/O | 8 | 8 | 2 | `orderBy('score','desc').limit(100)`, `Number()`-coerced render (V1_163), XSS-safe escape, offline fallback. |
| Leaderboard fairness | 5 | 4 | 6 | **[SAFE]** Console-spoofable (`firestore.rules` only checks name/int; `score` is a reassignable global). Architectural (App Check, deferred). |
| Score submission UX | 7 | 7 | 3 | Rank-aware modal, multilingual profanity filter, sanitize, Enter-to-submit. Minor: `getScoreRank:5610` compares without `Number()`. |
| Mobile / iOS / Capacitor | 8 | 8 | 2 | DPR-correct scaling, 16.7M-px iOS cap, pseudo-fullscreen, visualViewport, swipe-exit block, postMessage. Battle-tested. |
| **Accessibility** | 2 | 2 | 8 | **[SAFE]** 0 aria/role/alt/tabindex (grep); canvas-only HUD invisible to SR; no keyboard menu; `prefers-reduced-motion` (`:348`) ignores canvas. Far below the parent site's V1_107-151 bar. |
| Robustness / errors | 7 | 7 | 3 | localStorage try/catch, Firebase guarded, CORS suppressor. Gap: no blur-pause (see Pause). |
| Code quality | 6 | 6 | 4 | **[SAFE]** One 4,300-line script, ~80 globals, magic numbers; paddle-width formula duplicated 4× (`:3863/4180/4579`). Good comments. |
| Dead code | 6 | 7 | 3 | **[SAFE]** `lastPowerUpBarContent:4464` written 3×, read 0× (tracked a removed DOM bar). `pointsPerKill:0` no-op (`:2222`). (NB: `frameTime` is live — earlier "dead" note was wrong.) |

## 3. Aggregate

```
                              CRAFT     FIT
─────────────────────────────────────────────
Weighted average (~32 cats)   ~6.2      ~6.0
─────────────────────────────────────────────
```
*(core-experience themes — feel/juice/audio/fit — weighted ~2× over plumbing.)*

- **Biggest strength:** the boss subsystem + DPR/iOS scaling + rAF discipline — senior-grade, ship-quality engineering.
- **Biggest weakness:** **total silence** — a psychedelic-rock band's flagship game with zero audio. Second: the core verb (breaking bricks) has no feedback while bosses are over-juiced.

## 4. Top 10 highest-leverage improvements

| # | Improvement | Tag | Objectives | Cost |
|---|-------------|-----|-----------|------|
| 1 | WebAudio **SFX + mute** layer (bounce/brick/power-up/boss/death/win) | SAFE | O1,O2 | med |
| 2 | **Brick-break particles + screen-shake** (reuse boss-particle code, pooled/capped) | SAFE | O1 | low-med |
| 3 | **Accessibility pass** — keyboard Start/Upgrade/Submit, canvas aria, reduced-motion canvas branch | SAFE | O4,O5 | med |
| 4 | **Pause + auto-pause** on blur/`document.hidden` | SAFE | O1,O4 | low |
| 5 | **Score popups** (floating "+N", visual only — NOT the formula) | SAFE | O1 | low |
| 6 | **App Check + Cloud-Function score bounds** (only real anti-cheat) | SAFE (infra) | O3 | high |
| 7 | `getScoreRank` **`Number()`-coerce** (`:5610`) | SAFE | O3 | trivial |
| 8 | **Load + apply Orbitron** (`:4695` uses Arial) — brand parity | SAFE | O2 | low |
| 9 | Decouple immunity timer; delete dead `lastPowerUpBarContent`; dedupe paddle-width; consolidate tap handlers | SAFE | O5 | low |
| 10 | Expand power-up variety + paddle "english" + combo scoring | **MECH** | O1 | med — **needs approval** |

## 5. Sequenced plan

### Round 1 — Juice & sound *(SAFE; transforms game feel, zero mechanic change)* — the headline win
- **Audio:** small WebAudio SFX engine (synth or tiny samples): paddle bounce, brick break, power-up, boss hit, boss death, life lost, level/win. iOS first-gesture unlock; canvas-drawn **mute toggle** (persisted, `prefers-reduced-motion`/muted respected).
- **Brick-break juice:** 4–8 shard particles in brick color + brief screen-shake on power-up/skull/boss hits, pooled + capped (reuse boss-particle pattern).
- **Score popups:** floating "+1"/"+30" — *display only*, the +1 formula is untouched.
- **Reduced-motion branch** that dampens trails/shake (a11y + perf).

### Round 2 — Pause & accessibility *(SAFE)*
- `P`-key + tap **pause** overlay; **auto-pause** on `document.hidden`/`window.blur`.
- Canvas `role="application"` + `aria-label`; keyboard Start (Enter/Space), upgrade pick (1/2/3 or arrows+Enter), `aria-live` score mirror.

### Round 3 — Brand & code hygiene *(SAFE)*
- Load + apply **Orbitron** to HUD/titles/`ctx.font`.
- `getScoreRank` `Number()` fix; decouple immunity timer (`:3158`); delete dead `lastPowerUpBarContent` + `pointsPerKill:0`; extract `computePaddleWidth()`; consolidate the stacked canvas tap handlers.

### Round 4 — Deferred / decision-gated
- **[SAFE infra]** App Check + Cloud Function score-plausibility bounds (global-board integrity) — needs Firebase console + deploy (your call; same as whole-project R5).
- **[MECH — needs your YES]** paddle "english" (velocity transfer), more power-ups, combo **scoring** multiplier, multi-ball cap, boss kill-bonus. I'll write specific proposals only if you want them.

## 6. Cost estimate

| Round | Effort | Risk | Notes |
|-------|--------|------|-------|
| R1 juice & sound | ~2–3 h | low (additive; no mechanics) | audio is the bulk; I'll keep SFX synth-based to avoid asset weight |
| R2 pause & a11y | ~2 h | low | pause must correctly freeze the loop without the V1_162 re-entry trap |
| R3 brand & hygiene | ~1 h | low | |
| R4 infra + MECH | gated | — | decision/approval required |

To **~8.5 craft / ~8.5 fit:** R1–R3 (all SAFE). To **9.5+:** add R4 (your calls).

## 7. Open questions for you

1. **Game music?** SFX is clearly in scope and safe. A looping **music bed** is a content/taste call — do you want one (a BOO track? a neutral loop?), or keep it **SFX-only** to avoid clashing with the site's floating music player (and iOS autoplay limits)? *(Recommended: SFX-only for now.)*
2. **Mechanics:** keep them **fully locked** (SAFE polish only), or do you want me to write up the specific **[MECH]** proposals (paddle english, more power-ups, combo scoring) for a yes/no later?
3. **App Check** anti-cheat — invest in the Firebase infra, or accept the spoofable board for a band-site arcade? (same decision as whole-project Round 5.)

## 8. Honesty checklist

- [x] Every craft grade cites file:line or a measured fact.
- [x] Every fit grade ties to an objective (O1–O5).
- [x] Zero "seems reasonable / looks fine / could be better / appears solid / generally well-structured" (grep-clean).
- [x] At least one sub-10 weakness per theme.
- [x] Calibrated to the harsh-critic / App-Store bar.
- [x] Headline claims (silent audio, no pause, Orbitron absent) re-verified by grep, not taken on agent report alone.
- [x] Every finding tagged [SAFE] vs [MECH]; mechanics-lock honored.
- [x] Plan separates low-cost SAFE wins (R1–R3) from decision-gated MECH/infra (R4).

---

## 9. Execution status (2026-05-28)

**Round 1 — audio: COMPLETE & live** (all `[SAFE]`, mechanics untouched):
- `[V1_184]` WebAudio SFX engine + canvas mute toggle + iOS gesture-unlock; 8 core cues (paddle, brick, boss-hit, boss-death, life-lost, level-clear, game-over, + power-up).
- `[V1_185]` boss-weapon-fire cue; debuff/skull cue (fixed a bug — skull bricks had played the *positive* power-up sound); distinct per-brick cues.
- `[V1_186]` restored the original power-up brick sound (Kevin preferred it); slot-machine "ka-chunk" lock + "gift" fanfare on the legendary-upgrade picker.
- `[V1_187]` fixed the boss-death "screen jump" (1-frame delta catch-up suppressed after the heavy death frame); immunity-star pickup sparkle.

**Round 1 — visual juice: PENDING** (`[SAFE]`, next up): brick-break particles + screen-shake, then floating score popups (visual only — not the +1 formula).

**Rounds 2–3: PENDING** (`[SAFE]`): pause + auto-pause on blur/hidden; accessibility (keyboard Start/Upgrade/Submit, canvas aria, reduced-motion canvas branch); load Orbitron; getScoreRank `Number()` fix; decouple immunity timer; delete dead `lastPowerUpBarContent`; dedupe paddle-width.

**Round 4: GATED** — App Check anti-cheat (infra); `[MECH]` ideas (paddle english, more power-ups, combo scoring) need explicit approval.

**Audio is open to tuning** — the cue table is a compact, easy-to-tweak block at the top of the game script (`SFX` engine).
