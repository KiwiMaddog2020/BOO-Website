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

---

# Round 2 — Safety net + docs (commits V1_166–V1_169)

## What landed

| Commit | Change | Validation |
|--------|--------|-----------|
| V1_166 | `static.yml` deploy now gated on the "E2E tests" workflow succeeding (`workflow_run` + conclusion check) | YAML reviewed; deploy no longer fires on red tests |
| V1_167 | `firestore.rules` + `firebase.json` added (reconstructed, verify-before-deploy warning) | n/a (inert until `firebase deploy`) |
| V1_168 | Docs truth pass: README deps/nav, package.json 1.103→1.168, sitemap lastmod, canonical link, CLAUDE.md+AGENTS.md through V1_168, tracked AGENTS.md + docs/ | docs-only |
| V1_169 | Playwright iPad matrix (mini-landscape + Pro portrait) + tests 19 (games 200) / 20 (iPad no-overflow) / 21 (loop-fix guard) | **98 passed / 7 skipped / 0 failed** across 5 projects |

## Category deltas

| # | Category | Craft | Fit | Note |
|---|----------|:---:|:---:|------|
| 68 | CI deploy gating | 4 → **8** | 4 → **8** | Red tests no longer ship to prod. |
| 51 | Firestore rules version control | 2 → **7** | 3 → **7** | In git now; not 9 because it's reconstructed pending console reconciliation. |
| 69 | iPad responsive coverage | 1 → **7** | 1 → **7** | 2 iPad projects + no-overflow assertion; both iPads pass clean. |
| 70 | Game / leaderboard coverage | 2 → **5** | 3 → **6** | Games-200 + loop-guard regression tests added; still no gameplay/score-submission test. |
| 76 | Sitemap freshness | 3 → **8** | 4 → **8** | lastmod current. |
| 78 | Meta / OG / canonical | 6 → **8** | 7 → 8 | `<link rel="canonical">` added; og:url slash normalized. |
| 80 | README accuracy | 3 → **7** | 3 → **7** | "no dependencies" + nav corrected. |
| 81 | CLAUDE.md / AGENTS.md currency | 2 → **7** | 3 → **7** | Extended through V1_168. |
| 83 | Doc / version-control hygiene | 3 → **7** | 4 → **7** | AGENTS.md + docs/ tracked; version synced; first git tag (`v1_169`). |
| 73 | Browser coverage | 5 → **7** | 5 → **7** | **Audit correction:** webkit was NOT unused — `mobile-ios` + the new iPad projects all run on webkit (iPhone/iPad descriptors default to it). |

## Aggregate movement (cumulative, Rounds 1+2)

```
                                  CRAFT (base→now)   FIT (base→now)
─────────────────────────────────────────────────────────────────
A  Engineering / JS correctness     6.2 → 6.6        6.9 → 7.1
B  Arcade & leaderboards             5.6 → 6.7        5.6 → 6.7
E  Architecture & maintainability    5.0 → 5.3        5.8 → 6.0
F  Security & data integrity         6.0 → 6.6        6.6 → 6.9
I  Testing & CI                      3.9 → 6.0        4.1 → 6.3
J  SEO / PWA / discovery             6.0 → 6.6        6.4 → 6.9
K  Documentation                     3.8 → 6.0        4.2 → 6.4
  (C, D, G, H, L unchanged — Rounds 3–6 not executed)
─────────────────────────────────────────────────────────────────
WEIGHTED AVERAGE (88 categories)    5.4 → 6.0        5.9 → 6.4
```

## Still open after Round 2 (top 3)

1. **iOS App Store blockers** (#56/#57) — `ITSAppUsesNonExemptEncryption` missing; `armv7` arch. Round 3.
2. **CSS cascade fragility** (#28) — JS-injected `safari-style-fix` overrides inline CSS. Round 4 (visual-gated).
3. **Leaderboard write integrity** (#23) — console-spoofable; needs App Check decision. Round 5.

All 8 Round 1+2 commits (V1_162–V1_169) are local + unpushed; the full suite is green.

---

# Round 3 — iOS App Store readiness (commit V1_171)

## What landed (mobile/ only — live site untouched)

| # | Category | Craft | Fit | Note |
|---|----------|:---:|:---:|------|
| 56 | App Store export-compliance | 3 → **9** | 2 → **9** | `ITSAppUsesNonExemptEncryption=false` added; uploads no longer stall. `plutil -lint` OK. |
| 57 | Info.plist correctness | 4 → **8** | 4 → **8** | `UIRequiredDeviceCapabilities` armv7 → arm64. |
| 58 | Capacitor config | 7 → **8** | 7 → **8** | `limitsNavigationsToAppBoundDomains` true (WKWebView hardening restored). |
| 59 | build-www.sh robustness | 6 → **8** | 7 → **8** | Sanity check now covers all 7 games, not just Brickbreaker. |
| 84 | mobile/README | 4 → **7** | 4 → **7** | Updated Phase-1 copy to Phase-2 reality. |

**Theme G (Mobile / iOS / Capacitor): craft 5.6 → ~6.9, fit 5.4 → ~6.9.**

## Deferred from Round 3 (need tooling + a simulator)

- **Splash.imageset** (~25MB of 6 identical 5MB PNGs) — regenerate via `npx @capacitor/assets generate` from one source, not hand-resized.
- **LaunchScreen.storyboard** 375×667 hardcoded frame — Auto Layout constraints in Xcode.

## Cumulative aggregate (Rounds 1–3)

```
WEIGHTED AVERAGE (88 categories)    CRAFT 5.4 → ~6.1    FIT 5.9 → ~6.5
```

10 commits (V1_162–V1_171) local + unpushed; tag `v1_169`; suite green.

## Remaining rounds (character changes here)

- **Round 4 — CSS cascade + a11y:** visible-surface; best done as reviewed proposals, not auto-executed (Kevin "lives in the details").
- **Round 5 — leaderboard anti-cheat:** needs the App-Check-vs-accept infra decision (open question #1).
- **Round 6 — maintainability:** palette variables, strip dig debug keys, unify game scaffolding. Low urgency.

---

# Rounds 4–6 — turbo run (commits V1_173–V1_175)

The user enabled turbo + rapid-fire and asked to run all remaining rounds. Honest outcome: **R4 and R5 are mostly not safe/possible to auto-execute**, so only the safe subset of R6 landed. Nothing risky was forced.

## Round 4 (CSS / a11y) — DEFERRED intact (needs your eye + a real device)
Every item touches something I can't safely change here:
- **safari-style-fix migration** — edits the runtime-injected sheet that owns all Safari/iOS/Android rendering; can't verify on real Safari/iOS from here. Highest risk in the whole plan.
- **Reduced-motion Safari fix** — same injected sheet.
- **Dead CSS deletion** — `.wavy-flutter`/`.psych-fractals` are referenced in ~40 scattered rules + the injected JS (`querySelectorAll`), and `.wavy-flutter` may be a live hidden element. Too intertwined to rush.
- **Load Tilt Neon / Oxanium** — would change the live appearance (taste — open question #2).
- **Touch targets ≥44px** — your pixel-tuned music pill (visible).
- **Viewport zoom lock** — a11y vs the app-like feel (open question #3).

## Round 5 (leaderboard anti-cheat) — DEFERRED (infra decision)
The real fix is Firebase App Check + a Cloud Function with score bounds — needs console access, a deploy, and possibly billing, none of which I can provision here. Conservative turbo call: **accept the limitation** (it's a fun band arcade, not a ranked ladder). `firestore.rules` is already in version control (V1_167). Open question #1 stands.

## Round 6 (maintainability) — LANDED (safe subset)

| # | Category | Craft | Fit | Note |
|---|----------|:---:|:---:|------|
| 27 | Shipped debug affordances | 4 → **6** | 4 → **6** | Dig B/N/M teleport keys gated off (V1_173). Survivors' dead audio sliders still present (visible UI removal — deferred). |
| 26 | Game scaffolding consistency | 5 → **7** | 5 → **7** | CORS handler ported to snake/clyde's/shooter (V1_174); all 7 games now hardened. Shooter's name-sanitize still divergent (skipped — profanity-filter interaction risk). |
| 30 | Color palette discipline | 2 → **3** | 4 → **5** | Docs reconciled to real values (V1_175); the ~700 hardcoded literals + var migration remain (risky mass-replace, deferred). |

**Verified:** all 7 games load with zero uncaught JS errors (headless); full suite 98 passed / 7 skipped / 0 failed.

## Final cumulative aggregate (Rounds 1–6 as executed)

```
WEIGHTED AVERAGE (88 categories)    CRAFT 5.4 → ~6.2    FIT 5.9 → ~6.6
```

Remaining headroom to 9.0+ is concentrated in the **deferred** items above — all of which need either your taste call, a real device, or infra. They are not safe for autonomous execution.

14 commits total (V1_162–V1_175); suite green.
