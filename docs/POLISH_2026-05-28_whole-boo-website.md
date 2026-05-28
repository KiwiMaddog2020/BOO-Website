# Polish — the whole BOO-Website project

*Generated 2026-05-28 by the Polish protocol (`plugins/endenza/skills/polish/`), run on Opus 4.8. Audit fanned out across 6 read-only slice agents (index.html JS, index.html CSS, games A, games B, mobile/payments, ops/meta); top P0/P1 findings independently re-verified against source by the orchestrator.*

## 1. Subject + bar

- **Subject:** The entire BOO-Website codebase — `index.html` (12,305 lines / ~530 KB), 7 arcade games (~65,370 lines), the Capacitor 6 iOS wrapper (`mobile/`), Stripe payment-redirect pages, tests/CI, SEO/PWA assets, and docs. Current `main` at **V1_161**.
- **Project:** Bunch of Others (BOO) — psychedelic rock band site, Kelowna BC. Vanilla HTML/CSS/JS, no frameworks; Firebase Firestore leaderboards; GitHub Pages.
- **Bar:** **Apple-quality / ships to a harsh critic.** Per `CLAUDE.md`: "We live in the details… pixel-level and percentage-level feedback is normal." The iOS arcade must pass App Store review.
- **Methodology:** two-axis rating (CRAFT = universal craftsmanship; FIT = fit-to-purpose for BOO's objectives) per category, every craft grade cites file:line evidence, aggregate weighted average, top-10 leverage gaps, sequenced 10/10 plan.
- **Project objectives (FIT axis anchor):**
  - **O1** — Psychedelic visual complexity + clean, readable, pixel-perfect layout.
  - **O2** — 7-game HTML5 arcade with *fun, fair, exploit-resistant* global leaderboards.
  - **O3** — Mobile-first (OnePlus 13R @412px) + cross-browser (Safari/Chrome/Firefox) + iPad; "stability over flair" on mobile.
  - **O4** — iOS App Store release via the Capacitor wrapper.
  - **O5** — Vanilla stack, solo-dev maintainability, fast *safe* iteration with a real Playwright + CI safety net.
- **Baseline:** Supersedes [`docs/POLISH_2026-05-16_whole-website.md`](POLISH_2026-05-16_whole-website.md) (rated vs V1_160). That audit's "first move" (Train 1 docs + Train 2 tests) **was never executed** — its stale-sitemap, stale-README, and missing-iPad-test findings are all still open at V1_161 and are confirmed below. This run goes far deeper on **correctness bugs**, the area the prior craft/fit pass under-covered.

---

## 2. Per-theme tables

`Gap = 10 − min(craft, fit)`. Evidence is file:line. Verification tags: **[V]** = re-checked against source by orchestrator; otherwise slice-agent-reported with a specific cite.

### Theme A — Engineering craft / JS correctness (`index.html`)

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 1 | Section nav engine | 7 | 8 | 2 | `index.html:10104-10266` — 550 ms cooldown + 150 ms wheel-accumulator reset; transition guarded on 5 flags. Three separate window/doc `wheel` handlers all `preventDefault` (10147/10218/11994) make ordering hard to reason about. |
| 2 | menuTransitionToSection state machine | 6 | 7 | 3 | `:9760-9766` — re-entrancy guard `return`s and drops the requested target; a 2nd nav tap during the ~0.45 s transition is silently lost. |
| 3 | Mobile nav overlay | 6 | 7 | 3 | `:9968-10002` — each tile binds 5 handlers; pointerup (dy>42) and touchend (dy>30) use different thresholds for the same gesture (9978 vs 9991). |
| 4 | Music player transport | 7 | 8 | 2 | `:10644-10666` — next/prev modulo correct incl. `(i-1+len)%len`; isPlaying synced via audio 'play'/'pause' listeners. |
| 5 | **Mobile music-toggle state machine** | 4 | 4 | 6 | **[V]** `:10707-10742` — state split across inline styles + `.shown`/`.hidden` classes + localStorage that can disagree; root cause of the V1_142→V1_161 saga (see P0-3). |
| 6 | Music-toggle event binding | 8 | 8 | 2 | `:10744+` — single `fired` debounce (350 ms) across pointerdown/touchstart/click/touchend/pointerup correctly kills the V1_143 double-toggle. |
| 7 | Lightbox gallery | 6 | 6 | 4 | **[V]** `:9256` — Arrow keys call `navigateLightbox` with no `.active` guard → index drifts + hidden images preload while lightbox is closed. No focus trap. |
| 8 | Arcade iframe sizing | 7 | 7 | 3 | `:11131` — `aspectStr.split('/')` throws TypeError if an active pill lacks `data-aspect` (null pill guarded, missing-attr not). Desktop 640/718 + mobile 155 px match the doc. |
| 9 | Zoom compensation | 4 | 5 | 5 | `:11370` — `setInterval` polling DPR every 250 ms, never cleared; `getZoomLevel()` (`:11282`) defined but never called (dead). Heavy machinery fighting CSS on a mobile-stability-first site. |
| 10 | Browser/OS detection | 8 | 8 | 2 | `:9299-9319` — iPadOS-as-Macintosh detection (`MacIntel && maxTouchPoints>1`) is textbook; duplicated inline 3× instead of reusing globals. |
| 11 | Error suppressor (V1_117) | 9 | 9 | 1 | `:80-117` — tightly scoped to CORS `'Script error.'` + empty-source; real errors propagate. Best-crafted block in the file. |
| 12 | rAF / interval / timeout lifecycle | 5 | 6 | 4 | One uncleared interval (11370); ~30 setTimeouts hand-coordinated by magic constants (e.g. loader 1000 ms vs deep-link 1250 ms). |
| 13 | Event-listener lifecycle | 4 | 6 | 4 | **[V]** 99 `addEventListener`, 0 `removeEventListener`. Mostly parse-time singletons (not classic leaks) but zero teardown discipline + several near-duplicate doc-level touch/wheel handlers. |

### Theme B — Arcade & leaderboards (7 games)

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 14 | Survivors — game loop & memory | 9 | 9 | 1 | `neon-survivors.html:19422` dt-cap; single flag-gated rAF; `cleanupArray()` + hard `LIMITS` caps (`:6441`). Genuinely strong. |
| 15 | Dig — game loop & lifecycle | 8 | 8 | 2 | `neon-dig.html:14521` delta clamp; tracked roll-timers cleared on restart (`:13448`); visibilitychange key-clear. Cleanest of the 7. |
| 16 | Survivors — leaderboard render safety | 6 | 5 | 5 | `neon-survivors.html:22241` `entry.score.toLocaleString()` + non-null-safe `escapeHtml` (`:22251`) → one malformed doc throws and bricks the whole board. |
| 17 | Survivors — boot robustness | 5 | 5 | 5 | `:20988,20993` top-level `JSON.parse(localStorage…)` with NO try/catch → uncaught throw at module init in iOS WebView / private mode (the settings loader 1,400 lines later IS guarded — inconsistent). |
| 18 | Dig — score-modal restart race | 6 | 6 | 4 | `:13550-13567` — nested setTimeouts (~2.2 s) with no cancel; tapping "DIG AGAIN" inside the window pops the name modal over the new run. |
| 19 | **Space Shooter — game loop** | 3 | 3 | 7 | **[V]** `:2701` unconditional re-schedule + `:1263` fresh rAF on every `startGame` (restartBtn `:1253`) → stacked loops, compounding 2×/3×/N× speed after each "PLAY AGAIN". |
| 20 | **Brickbreaker — game loop** | 4 | 3 | 7 | `neon-brickbreaker.html:5049` unguarded `startGame` + `:5165` rAF; "PLAY AGAIN" bound to touchstart+touchend+click (`:5380-5392`) → on mobile one tap stacks two loops → permanent ~2× speed. (Same signature as #19, verified there.) |
| 21 | Snake / Clyde's / TD — game loops | 8 | 8 | 2 | Correct patterns exist in-repo: TD `cancelAnimationFrame` (`neon-tower-defense.html:5291`), snake double-guard (`neon-snake.html:3031/3040`), clyde's single-kick (`clydes-big-jump.html:2678`). Proves the fix for #19/#20 is surgical, not a rewrite. |
| 22 | Clyde's — boot robustness | 5 | 4 | 6 | `clydes-big-jump.html:1397` top-level `localStorage` read, no try/catch, no error handler → boot crash in storage-blocked WebView/private mode (snake `:1867` is the correct in-repo template). |
| 23 | Leaderboard write integrity (all 7) | 3 | 4 | 6 | **[V pattern]** Writes read reassignable module-GLOBAL vars (`pendingScore` etc.; main script is not an IIFE) → `pendingScore=9e9; submitScore()` in console owns the global #1. Firestore rules only enforce `int≥0`. Architectural, not a regression. |
| 24 | Leaderboard render — numeric fields (all 7) | 5 | 5 | 5 | TD `:8808`, BB `:5794`, snake `:3636`, clyde's `:2969`, shooter `:2949` interpolate `entry.wave/kills/level/length` + `.toLocaleString()` raw → one non-numeric/missing field blanks the board. |
| 25 | Leaderboard name escaping (XSS) | 7 | 7 | 3 | All 7 escape `name` (e.g. `neon-survivors.html:22240` via textContent round-trip; dig's `escapeHtml` is null-safe). Real defense; not the weak point. |
| 26 | Game scaffolding consistency | 5 | 5 | 5 | Forked-then-drifted: shooter uses bare `.trim()` (`:2842`) vs `sanitizeUsername` in the other 4; snake/clyde's/shooter lack the CORS error handler TD/BB have. |
| 27 | Shipped debug affordances | 4 | 4 | 6 | `neon-dig.html:13705-13714` ships B/N/M depth-teleport keys in production (depth feeds the leaderboard); survivors `:5420` Music/SFX sliders mutate settings but **no audio code exists** — dead UI. |

### Theme C — Visual design & CSS (`index.html`)

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 28 | **CSS cascade architecture** | 2 | 3 | 7 | `:9441-9664` — a 220-line `<style>` built as a JS template literal and appended to `<head>` LAST, re-declaring backgrounds/overlays/h1/h2 with ~110 `!important`. Editing the inline `<style>` for Safari/iOS/Android silently has no effect. The keystone fragility. |
| 29 | `!important` debt | 3 | 4 | 6 | **1,774** occurrences; the section-background + h1/h2 system exists 3× (inline `is-mac-safari` 731, inline `is-ios` 8170, injected `is-safari` 9654), resolved only by source order. |
| 30 | Color palette discipline | 2 | 4 | 6 | **[V]** 514 hex + 213 cyan/magenta rgba literals vs 5 mostly-unused `:root` vars. Documented purple `#8b00ff` appears 0×; real value `#9b30ff` (48×). Documented magenta `#ff00ff` (5×) vs actual `#ff1493` (38×). CLAUDE.md palette is inaccurate. |
| 31 | Dead CSS | 3 | 4 | 6 | `.psych-fractals` (17 rules, 0 markup), `.vine-overlay` + 6 `vineGrowWarp*` keyframes (`:4617-4760`, 0 markup), dead `.wavy-flutter` overrides — ~120+ removable lines. |
| 32 | Responsive breakpoint matrix | 5 | 6 | 4 | 59 `@media` blocks; eight `min-width:769…max-width:1400` iPad permutations disambiguated only by orientation/min-height; fragile. |
| 33 | Font loading | 4 | 5 | 5 | **[V]** Only Poppins+Bebas Neue (`:148`) and Rumble Brave (`:149`) are loaded. **Tilt Neon** (documented display font) and **Oxanium** (documented body font) are declared in CSS but never loaded → fall back to sans-serif. (Titles mostly use Rumble Brave, which IS loaded — so impact is moderate, not total.) |
| 34 | Title clamp consistency | 4 | 5 | 5 | Documented `clamp(3rem,15vw,5.4rem)` appears at exactly 1 site (`:7197`); section/per-breakpoint titles use ≥10 different formulas incl. a `20vw` (`:7370`). "Unified" is not literally true. |
| 35 | Mobile filter stripping | 8 | 8 | 2 | `:2456` genuinely kills blend-modes/filters/overlays under `(max-width:768px),(hover:none)`; no live `hue-rotate` anywhere (all matches are removal comments). Matches O3. |
| 36 | z-index strategy | 7 | 8 | 2 | Mostly disciplined 0–100; pseudo-fullscreen ceiling reasoned (99999→100000). Two unexplained magic values (55, 9990). |
| 37 | Reduced-motion support | 4 | 5 | 5 | Two global `prefers-reduced-motion` resets (`:2426`, `:3309`), but the later-injected `body.is-safari h1{animation…!important}` (`:9452`) overrides them — Safari users with Reduce Motion still get animated titles. |
| 38 | Cross-browser hacks | 6 | 7 | 3 | `@supports(-webkit-touch-callout:none)` iOS hack still valid; Chrome `(-webkit-appearance) and (not (-moz-appearance))` legitimate. 6 dead `-ms-` prefixes. |

### Theme D — Product UX

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 39 | Navigation behavior | 7 | 8 | 2 | Nav-menu-driven is right for the fixed-section model; card-indicators legacy still in DOM (`:8861`). |
| 40 | Touch ergonomics | 5 | 6 | 4 | Music controls below 44 px: volume thumb 12 px (`:6992`), play-pause 36 px (`:7104`), prev/next 26 px (`:7110`), hide-btn ~18 px (`:7136`); mobile toggle regressed 48→42 px (`:7129`). HIG/O3 gap; flagged in prior audit, still open. |
| 41 | Viewport zoom lock | 3 | 4 | 6 | `:15` `maximum-scale=1.0, user-scalable=no` disables pinch-zoom → WCAG 1.4.4 fail on the exact mobile/iPad surface that is the focus. |
| 42 | Lightbox UX | 6 | 6 | 4 | Works, but no focus management + the closed-state arrow-key drift (#7). |
| 43 | Loading experience | 7 | 7 | 3 | Color-sweep logo loader; two hand-coordinated magic timers (loader 1000 ms, deep-link 1250 ms) can flash Home if they drift. |

### Theme E — Architecture & maintainability

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 44 | mobile/ build & sync architecture | 9 | 9 | 1 | `build-www.sh` + `.gitignore:23-25` → `mobile/www/{Games,Images,Music}` is gitignored build output regenerated from canonical; bundle cannot drift. Clean. |
| 45 | Single-file index.html | 5 | 6 | 4 | 12,305 lines, 160+ versions of layered patches; surgical edits work but cross-cutting reasoning is hard. No broad refactor recommended (risk > value for solo static site). |
| 46 | State management | 4 | 5 | 5 | Music/nav state split across inline styles + classes + localStorage (#5). The recurring bug generator. |
| 47 | Config/version coherence | 3 | 4 | 6 | **[V]** `package.json:3` `1.103.0` vs site V1_161; 0 git tags despite docs prescribing them; AGENTS.md + docs/ untracked. |
| 48 | Dead-code hygiene | 4 | 5 | 5 | `getZoomLevel()` dead (`:11282`); ~120 lines dead CSS; dead audio sliders in survivors; `frameTime` dead in brickbreaker (`:4920`). |

### Theme F — Security & data integrity

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 49 | Secret hygiene | 9 | 9 | 1 | **[V]** Repo-wide scan for `sk_/rk_/whsec_` → zero. Firebase `apiKey` (e.g. `neon-brickbreaker.html:5425`) is public-by-design config, not a leak. |
| 50 | Payment-page integrity | 9 | 10 | 1 | `success.html:135-143` is pure static markup — no `session_id` read, no value granted → spoof-a-success-URL attack is structurally impossible. Correct design. |
| 51 | Firestore rules version control | 2 | 3 | 7 | **[V]** No `firestore.rules`/`firebase.json` in repo. The only server-side trust boundary for public-write leaderboards lives only in the console — no diff, no review, no rollback. |
| 52 | Leaderboard write trust | 3 | 4 | 6 | Client-authoritative; spoofable (#23). Needs App Check + server validation for true O2 fairness. |
| 53 | External-link hardening | 9 | 9 | 1 | All `target="_blank"` carry `rel="noopener noreferrer"`; YouTube via `youtube-nocookie`. |
| 54 | CSP / headers | 4 | 5 | 5 | No `<meta http-equiv="Content-Security-Policy">` anywhere; GitHub Pages can't set HTTP headers but the meta CSP is available and absent. |
| 55 | SECURITY.md | 6 | 6 | 4 | Real disclosure path + timeline, but a meaningless single-row "Supported Versions" table and a disclosure email (`kevinmadson3@`) ≠ public contact (`bunchofothers@`, `humans.txt:12`). |

### Theme G — Mobile / iOS / Capacitor

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 56 | App Store export-compliance | 3 | 2 | 8 | `Info.plist` has no `ITSAppUsesNonExemptEncryption` → every App Store Connect upload stalls on "Missing Compliance." Hard release-flow friction. |
| 57 | Info.plist correctness | 4 | 4 | 6 | `UIRequiredDeviceCapabilities = armv7` (`:31`) — 32-bit arch on an arm64-only Capacitor 6 binary. |
| 58 | Capacitor config | 7 | 7 | 3 | No `server.url`/`allowNavigation`/`cleartext` (bundled-only, correct), but `limitsNavigationsToAppBoundDomains:false` (`:9`) opts out of WKWebView hardening for no benefit. |
| 59 | build-www.sh robustness | 6 | 7 | 3 | `set -euo pipefail` ✓ + wipe-then-copy prunes stale files, but `cp -R` not `rsync --delete`, and `:61` sanity-checks only 1 of 6 active games → a renamed game ships a 404 black tile, green build. |
| 60 | Native shell | 9 | 9 | 1 | Stock Capacitor AppDelegate; `menu.js:101` clears iframe `src` on close (stops game audio/loops); Android back wired. Solid. |
| 61 | Splash/icon assets | 5 | 5 | 5 | AppIcon real 1024². Splash.imageset = 6 byte-identical 5 MB PNGs (~25–30 MB dead weight in the IPA). LaunchScreen frame hardcoded 375×667 (iPhone 8). |
| 62 | App-Store 4.2 (min functionality) | 6 | 5 | 5 | Native game shell + haptics defensible, but same content as the public arcade → reviewer may probe "why an app." |

### Theme H — Performance

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 63 | Image optimization | 8 | 8 | 2 | V1_150 converted all JPGs→WebP q70 (~30% byte cut, 78 refs updated). Strong. |
| 64 | Favicon weight | 2 | 3 | 7 | `Images/Favicon/favicon.svg` is **1.78 MB** and is the manifest's primary `sizes="any"` icon — severe install-prompt/tab-icon liability on the mobile-first surface. |
| 65 | Audio weight | 5 | 6 | 4 | Largest MP3s ~11–20 MB; player can create initial weight depending on `preload`. Any change needs play-state testing. |
| 66 | DPR-polling cost (mobile) | 4 | 5 | 5 | The 250 ms interval (#9) + scroll-triggered `transform`/margin writes on the game container even off the arcade section — contradicts "stability over flair." |
| 67 | Game memory management | 8 | 8 | 2 | Hard caps + array pruning across survivors/dig/TD; iOS canvas-pixel downscale guard in survivors. |

### Theme I — Testing & CI

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 68 | **CI deploy gating** | 4 | 4 | 6 | **[V]** `static.yml:6-7` deploys Pages on every push to main with zero dependency on `test.yml`; no branch protection. Red E2E ships to prod. The safety net is advisory. |
| 69 | iPad responsive coverage | 1 | 1 | 9 | **[V]** `playwright.config.js:21-25` has only Desktop Chrome / Pixel 7 / iPhone 14 Pro — zero iPad, despite V1_153-161 being almost all iPad work and the prior audit asking for it. |
| 70 | Game / leaderboard coverage | 2 | 3 | 7 | 0 of 22 tests play a game, submit a score, or read a leaderboard — the riskiest input path (O2) has no net. |
| 71 | Music-toggle regression net | 3 | 4 | 6 | Tests 13/18 assert only aria-label + visibility; nothing on play-state/`currentTime` — the exact bug class behind 8 commits. |
| 72 | Real-path coverage (rest) | 6 | 6 | 4 | 22 `test()` blocks (CLAUDE.md says "17" — stale); ~9 are smoke/DOM-count. Test 8 brittle-couples to a commented-out pill (`:9091`). |
| 73 | Browser coverage | 5 | 5 | 5 | **[V]** `test.yml:27` installs webkit but `:30` never runs it — wasted CI time + false impression of Safari (the documented #1 problem browser) coverage. |
| 74 | Flake hygiene | 6 | 6 | 4 | Good: avoids `networkidle`. Bad: `waitForTimeout(1500)`/`(600)` hard sleeps that flake under CI `workers:2`. |

### Theme J — SEO / PWA / discovery

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 75 | JSON-LD MusicGroup | 8 | 8 | 2 | `index.html:40-67` valid: name, url, image, genre, foundingLocation, 4 `sameAs`. Strong. |
| 76 | Sitemap freshness | 3 | 4 | 6 | **[V]** `sitemap.xml:5` lastmod `2026-04-27` — 31 days stale vs HEAD; flagged 05-16, still unfixed. |
| 77 | Manifest correctness | 6 | 6 | 4 | `orientation:"portrait"` contradicts the iPad-landscape goal; only 2 icons, no 192/512 PNG. |
| 78 | Meta / OG / Twitter | 6 | 7 | 3 | Full OG + Twitter card; **no `<link rel="canonical">`**; `og:url` (no slash) ≠ sitemap `loc` (slash). |
| 79 | robots.txt | 7 | 7 | 3 | Valid, references sitemap. |

### Theme K — Documentation

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 80 | README accuracy | 3 | 3 | 7 | **[V]** `README.md:13` "no dependencies" (false — Playwright+serve); `:24` "Wheel, touch, and keyboard navigation" stale + omits the V1_149 hamburger. Flagged 05-16, unfixed. |
| 81 | CLAUDE.md / AGENTS.md currency | 2 | 3 | 7 | Both document only through V1_127; the entire V1_128-161 arc (mobile-nav redesign, WebP, iPad matrix, music saga) is undocumented. |
| 82 | CLAUDE/AGENTS sync | 7 | 5 | 3 | **[V]** 2-line diff (title + "Claude Code" vs "Codex"). Near-perfect, but AGENTS.md is untracked so they can silently diverge. |
| 83 | Doc/version control hygiene | 3 | 4 | 6 | **[V]** AGENTS.md + docs/ untracked (`??`); 0 git tags; package.json version drift. |
| 84 | mobile/README | 4 | 4 | 6 | Describes Phase-1 "one playable game"; repo ships 6 active. |

### Theme L — Content readiness

| # | Category | Craft | Fit | Gap | Notes (evidence) |
|---|----------|------:|----:|----:|------------------|
| 85 | Events currency | 8 | 8 | 2 | Okanagan Tattoo Show added V1_155; events current. |
| 86 | Band story / bio | 8 | 8 | 2 | README + bio tell the Kyle/Fields-of-Green origin well. |
| 87 | Merch readiness | 6 | 6 | 4 | Intentionally placeholder (Stripe `PAYMENT_LINK_1-4` placeholders, gated behind beta); fulfillment (Phase 5) not built. |
| 88 | Social/media links | 9 | 9 | 1 | All platforms present and hardened. |

---

## 3. Aggregate scores

```
                                         CRAFT   FIT
──────────────────────────────────────────────────────
A  Engineering / JS correctness (13)      6.2    6.9
B  Arcade & leaderboards (14)             5.6    5.6
C  Visual design & CSS (11)               4.4    5.4
D  Product UX (5)                         5.6    6.2
E  Architecture & maintainability (5)     5.0    5.8
F  Security & data integrity (7)          6.0    6.6
G  Mobile / iOS / Capacitor (7)           5.6    5.4
H  Performance (5)                        5.4    6.0
I  Testing & CI (7)                       3.9    4.1
J  SEO / PWA / discovery (5)              6.0    6.4
K  Documentation (5)                      3.8    4.2
L  Content readiness (4)                  7.8    7.8
──────────────────────────────────────────────────────
WEIGHTED AVERAGE (88 categories)          5.4    5.9
```

**Read:** strong **content** (L), strong isolated craft (error suppressor, survivors/dig game loops, build-sync architecture, payment-page design, secret hygiene). Dragged down by **Testing/CI** (the safety net doesn't gate), **Documentation** (2+ weeks of stale findings + V1_128-161 undocumented), and **CSS** (cascade fragility + palette/dead-code debt). Two **broken game loops** and the **mobile music-toggle** are the live correctness wounds — exactly the Codex/Opus-4.7-era regressions suspected.

---

## 4. Top 10 highest-leverage gaps

Ranked by impact × categories-affected ÷ cost.

| # | Gap | Categories | Est. cost | Round |
|---|-----|-----------|-----------|-------|
| 1 | Stacked-rAF loops (space-shooter + brickbreaker) — unplayable after replay, unfair scores | #19,#20,#52 | ~30 min, surgical | R1 |
| 2 | CI deploy decoupled from tests — red ships to prod; makes all other test work theater | #68,#73 | ~20 min (workflow_run gate) | R2 |
| 3 | Mobile music-toggle state machine + pref clobber — the V1_142→161 saga's root | #5,#46,#40 | ~1 hr (class-driven rewrite) | R1 |
| 4 | Firestore rules not version-controlled — only server-side trust boundary unreviewed | #51 | ~15 min (commit file) | R2 |
| 5 | Leaderboard render null-safety (all 7) + survivors/clyde's boot guards — one bad doc / private mode bricks games | #16,#17,#22,#24 | ~45 min | R1 |
| 6 | iOS App Store blockers — `ITSAppUsesNonExemptEncryption` + armv7→arm64 + app-bound-domains | #56,#57,#58 | ~15 min, 3 keys | R3 |
| 7 | JS-injected `safari-style-fix` cascade fragility — "edit CSS, nothing happens" | #28,#29 | ~2 hr (migrate to inline, gated) | R4 |
| 8 | Docs truth pass — README/version/CLAUDE-AGENTS/sitemap + commit untracked files + tags | #47,#76,#80,#81,#83 | ~45 min, zero runtime risk | R2 |
| 9 | iPad Playwright matrix + game/leaderboard smoke + music-toggle regression test | #69,#70,#71 | ~1.5 hr | R2 |
| 10 | Touch targets ≥44 px + viewport zoom lock + load Tilt Neon/Oxanium | #40,#41,#33 | ~1 hr (visual-gated) | R4 |

(Leaderboard write integrity #23/#52 is high-impact but architectural — separate gated round R5, needs an infra decision.)

---

## 5. Sequenced plan to 10/10

### Round 1 — Correctness bug-fix train *(low visual risk; directly mitigates suspected Codex/Opus-4.7 regressions)*
- **Slot α — game loops:** fix `neon-space-shooter.html` (kick rAF once at load, gate by `gameState`; cancel on restart) and `neon-brickbreaker.html` (`if(gameRunning) return` guard + `cancelAnimationFrame` + `preventDefault` the touchend). Reference the already-correct snake/clyde's/TD patterns.
- **Slot β — leaderboard render hardening (all 7 games):** coerce `Number(entry.X)||0`, null-safe `escapeHtml`, per-row try/catch so one bad doc can't blank the board.
- **Slot γ — boot + JS guards:** wrap survivors `:20988/20993` and clyde's `:1397/1764` localStorage in try/catch; `index.html` lightbox arrow-key `.active` guard (`:9256`), null-safe `data-aspect` (`:11131`), gate the DPR-poll IIFE to desktop (`:11269`).
- **Slot δ — music toggle:** rewrite `toggleMusicPlayer`/`initMusicPlayerVisibility` to be **class-driven only**; delete the inline `visibility/opacity/transform` writes and the forced `localStorage.setItem('musicPlayerHidden','true')` (`:10727`). *(Design-anchor-adjacent → keep Kevin in the loop on the visible behavior.)*

### Round 2 — Safety net + docs truth *(zero runtime behavior change)*
- Gate `static.yml` on `test.yml` success (`workflow_run`) or enable branch protection.
- Commit `firestore.rules` + `firebase.json` as source of truth.
- Add iPad landscape + iPad Pro portrait Playwright projects with no-horizontal-overflow + nav-reachable assertions; add a music-toggle play-state regression test + one HTTP smoke per game; drop the unused webkit install or actually run it.
- Docs pass: README (deps + nav reality), `package.json` version, CLAUDE.md/AGENTS.md through V1_161, `sitemap.xml` lastmod, add `<link rel="canonical">`, commit AGENTS.md + docs/, add git tags for V1_36/V1_43/current.

### Round 3 — iOS App Store readiness
- `Info.plist`: add `ITSAppUsesNonExemptEncryption=false`; `armv7`→`arm64`.
- `capacitor.config.json`: `limitsNavigationsToAppBoundDomains:true`.
- `build-www.sh`: loop the sanity check over all 6 active games; switch to `rsync -a --delete`.
- Slim `Splash.imageset` (~25 MB); LaunchScreen Auto Layout constraints.

### Round 4 — CSS cascade + a11y hardening *(visible-surface; user-gated)*
- Migrate the JS-injected `safari-style-fix` into the inline `<style>` (single cascade source); fix the reduced-motion Safari escape hatch.
- Load Tilt Neon + Oxanium (or remove the references if the fallback is intended — see open questions).
- Touch targets ≥44 px on music controls + mobile logo; remove the viewport zoom lock (verify layout).
- Delete ~120 lines of dead CSS (psych-fractals, vine-overlay + keyframes, dead wavy-flutter overrides).

### Round 5 — Leaderboard integrity *(architectural; needs decision)*
- Firebase App Check + a Cloud Function with score-plausibility ceilings, **or** accept client-authoritative scores as a known limitation + periodic server-side outlier pruning.

### Round 6 — Maintainability *(deferred, low urgency)*
- Real palette variables from actually-used hex (`#9b30ff`, `#ff1493`, `#00ffff`, `#ff6600`); reconcile CLAUDE.md.
- Strip dig debug teleport keys; remove or wire survivors' dead audio sliders.
- Re-unify game scaffolding (port CORS handler + `sanitizeUsername` into snake/clyde's/shooter).

### Deferred / NOT cost-effective to 10/10
- **Full modular refactor** of the 12K-line `index.html` / 65K-line games — high cost, high regression risk, low marginal value for a solo-dev static site. The surgical-edit model is working.
- **i18n** — single-language (en-CA) product; not worth it.
- **Manifest 4.2 / "why an app"** — keep the native game-shell framing; no action unless review pushes back.

---

## 6. Cost estimate

| Round | Effort | Risk | Token est. |
|-------|--------|------|-----------|
| R1 — correctness | ~2.5 hr | low (logic, surgical) | ~30–50k |
| R2 — safety net + docs | ~3 hr | none (config/docs) | ~30–50k |
| R3 — iOS readiness | ~1 hr | low | ~15–25k |
| R4 — CSS + a11y | ~4 hr | medium (visible) — user-gated | ~40–60k |
| R5 — leaderboard integrity | ~half-day + infra | decision-gated | n/a |
| R6 — maintainability | ~2 hr | low | ~20–30k |

**To 9.0+ aggregate:** Rounds 1–3 (≈6–7 hr of agent work, near-zero appearance risk) should move craft ~5.4→~7.5 and fit ~5.9→~7.8. **To 10/10:** add R4–R6, gated by Kevin's calls on the open questions.

---

## 7. Open questions for human judgment

1. **Leaderboard anti-cheat (O2):** invest in App Check + a Cloud Function (real infra, ongoing cost), or accept client-authoritative scores + prune outliers? Today any visitor can own the global #1 from the console.
2. **Typography:** are **Tilt Neon** and **Oxanium** *meant* to render, or is the sans-serif fallback the intended look (the way you intentionally prefer Rumble Brave's cursive fallback per V1_123)? Determines whether R4 loads them or removes the references.
3. **Viewport zoom lock:** remove `user-scalable=no` for accessibility (WCAG 1.4.4), or keep the "app-like" no-zoom feel? Affects O3 a11y vs feel.
4. **Manifest orientation:** `portrait` → `any`/`landscape` now that iPad-landscape is a product goal?
5. **Stripe go-live:** Phase 5 fulfillment/webhook isn't built — keep merch in placeholder/beta until then? (No code change needed now; just confirming the intent.)

---

## 8. Honesty checklist

- [x] Every CRAFT grade cites ≥1 specific piece of evidence (file:line, count, or measured fact).
- [x] Every FIT grade ties to a stated objective (O1–O5).
- [x] Zero "seems reasonable" / "looks fine" / "could be better" / "appears solid" / "generally well-structured" phrases (grep-verified before publish).
- [x] At least one sub-10 weakness per theme.
- [x] Calibrated to BOO's own bar (Apple-quality / harsh critic / App-Store-ready), not generic best practice.
- [x] No flattery without evidence (the strong scores — content, game loops, payment design, secret hygiene — each cite the proof).
- [x] Plan has both low-cost wins (R1–R3) and hard/deferred categories (R4–R6 + the deferred list).
- [x] Top-10 ordered by leverage (impact × affected ÷ cost), not raw score gap.
- [x] Headline P0s (space-shooter loop, CI gating, music-init clobber) re-verified against source, not taken on agent report alone; agent over-claims calibrated down (fonts: "whole UI sans-serif" → "Tilt Neon/Oxanium only").
