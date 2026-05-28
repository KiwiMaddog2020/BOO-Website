# Polish — whole BOO-Website — Round 1 post-execute re-rate

*Generated 2026-05-28 by the Polish protocol (Phase 4). Baseline: [`POLISH_2026-05-28_whole-boo-website.md`](POLISH_2026-05-28_whole-boo-website.md).*

**Scope of this re-rate:** Round 1 only (the correctness bug-fix train, commits V1_162–V1_165). The other 5 rounds were not executed, so their categories are unchanged from the baseline. This is a focused delta, not a full 88-category re-audit.

## What landed

| Commit | Change | Validation |
|--------|--------|-----------|
| V1_162 | Fix stacked `requestAnimationFrame` loops in Space Shooter (`:1263`/`:2701`, single-kick guard) + Brickbreaker (`:5049`, re-entry guard) | Code-verified; loop pattern now matches snake/clyde's/TD |
| V1_163 | Harden leaderboard render in 6 games — `Number(x)\|\|0` coercion + null-safe `escapeHtml` (survivors) | Playwright 54-run suite green |
| V1_164 | Boot/JS guards: survivors + clyde's `localStorage` try/catch; lightbox arrow-key `.active` guard; `data-aspect` null-safety | Playwright green (lightbox open/close tests 6/7 pass; "no JS errors" test 2 passes) |
| V1_165 | Music init: removed the forced `localStorage` write that poisoned the desktop preference | Test 18 ("mobile music player starts collapsed and swaps with toggle") passes on android + iOS |

**Test suite:** `chromium` 16 passed / 2 skipped; `mobile-android` 18 passed; `mobile-ios` 18 passed. **0 failures.** (Local run used `python3 -m http.server` because `serve` crashes in this environment — exit 144; flagged for the Round 2 tooling pass.)

## Category deltas

| # | Category | Craft (pre→post) | Fit (pre→post) | Note |
|---|----------|:---:|:---:|------|
| 19 | Space Shooter — game loop | 3 → **8** | 3 → **8** | Stacked loops eliminated; single kick guarded. Not 10: loop still spins on the start screen (pre-existing, low cost). |
| 20 | Brickbreaker — game loop | 4 → **8** | 3 → **8** | Re-entry guard kills the touchend+click double-loop. |
| 17 | Survivors — boot robustness | 5 → **8** | 5 → **8** | Top-level `localStorage` parses guarded. |
| 22 | Clyde's — boot robustness | 5 → **8** | 4 → **8** | Read + write guarded. |
| 24 | Leaderboard render — numeric (all 7) | 5 → **8** | 5 → **8** | One malformed doc can no longer blank the board. |
| 16 | Survivors — leaderboard render safety | 6 → **8** | 5 → **7** | Null-safe escape, numeric coercion. |
| 7 | Lightbox gallery (index) | 6 → **8** | 6 → **7** | Arrow-key drift fixed. Not 10: still no focus trap (R4). |
| 8 | Arcade iframe sizing | 7 → **8** | 7 → 7 | `data-aspect` null-safe (defensive). |
| 5 | Mobile music-toggle state machine | 4 → **6** | 4 → **6** | Pref-clobber fixed. NOT fully resolved by design: the inline-style writes are the deliberate V1_146 DuckDuckGo-Android workaround and were intentionally retained (the baseline's "broken re-collapse" P0 was overstated — the V1_161 single-entry-point toggle is internally consistent). |

## Aggregate movement

```
                                  CRAFT (pre→post)   FIT (pre→post)
─────────────────────────────────────────────────────────────────
A  Engineering / JS correctness     6.2 → 6.6        6.9 → 7.1
B  Arcade & leaderboards             5.6 → 6.7        5.6 → 6.7
  (other 10 themes unchanged — Rounds 2–6 not executed)
─────────────────────────────────────────────────────────────────
WEIGHTED AVERAGE (88 categories)    5.4 → 5.8        5.9 → 6.2
```

The needle moved exactly where Round 1 aimed: the two broken game loops and the boot/render-safety categories. The remaining distance to 9.0+ is concentrated in **Testing/CI** (deploy gating — Round 2), **Documentation** (Round 2), **CSS cascade** (Round 4), and **iOS readiness** (Round 3) — none touched yet.

## Still open (top 3)

1. **CI deploy gating** (Theme I, #68) — at 4/4; red tests still ship to production. Round 2.
2. **Documentation** (Theme K) — at 3.8/4.2; README/version/CLAUDE-AGENTS still stale, sitemap 31 days old, AGENTS.md + docs/ untracked. Round 2.
3. **iOS App Store blockers** (Theme G, #56) — at 3/2; missing `ITSAppUsesNonExemptEncryption` stalls every upload. Round 3.

## Items deliberately NOT auto-fixed in Round 1 (need a human/device call)

- **Music-toggle inline-style architecture** — works today; a class-only rewrite risks reintroducing the DuckDuckGo-Android transition bug it was built to fix. Needs device testing if pursued.
- **DPR zoom-compensation desktop-gating** (#9/#66) — touches mobile arcade sizing ("aspect ratio is sacred"); deferred to the user-gated Round 4.
- **Leaderboard write integrity** (#23) — architectural; needs the App-Check-vs-accept decision (open question #1).
