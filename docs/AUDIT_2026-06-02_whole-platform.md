<!-- Hyper-speed full-platform audit (Opus 4.8, 2026-06-02): 9 parallel dimension auditors + adversarial duet verification + synthesis = 19 agents, 47 confirmed findings. Read-only — findings only, no edits applied in the audit run. -->

# BOO-Website — Full-Platform Audit Report

## Health Summary

The platform is **fundamentally sound but ships one genuine code-execution vulnerability and a cluster of polish/correctness gaps.** The headline risk is a **stored XSS** in all three of the survivors/snake/space-shooter leaderboards: any visitor can write a malicious Firestore doc that executes JavaScript on the `bunchofothers.com` origin for every player who opens that game — amplified by a same-origin, un-sandboxed iframe and the total absence of a CSP. Beyond that, the issues are mostly **high-value, low-effort wins**: a 17 MB MP3 eagerly downloaded on every visit, a WebP-disguised-as-PNG social card that breaks Facebook/LinkedIn previews for the band's main link, and a broken skip-to-content link plus several keyboard/screen-reader gaps in the photo gallery and lightbox. A few "performance optimizations" (off-screen animation pausing) are architecturally dead and deliver nothing on Firefox/mobile. None of these are crashes; the site works for the typical mouse-using visitor today. **Fix the XSS escaping and the three trivial perf/SEO wins this week, and the platform moves from "exposed" to "solid."**

---

## Top Fixes (ranked — severity × low-effort first)

1. **[SAFE] Escape leaderboard `time`/`length`/`wave` before innerHTML** — kills the stored XSS at the render layer; one-line `escapeHtml()`/`Number()` per game, no deploy needed. *(sec-1)*
2. **[SAFE] `preload="auto"` → `preload="metadata"` on the 17 MB MP3** — one attribute, saves ~17 MB on every visit. *(perf-1)*
3. **[SAFE] Re-encode `CuriosityAlbumCover.png` to true PNG bytes** — one `sips` command; unbreaks social share cards on the band's primary link. *(seo-1)*
4. **[SAFE] Exclude skip link from the section-nav handler** — one selector change; restores the site's primary keyboard-a11y affordance (currently blanks the page). *(corr-1)*
5. **[SAFE] Make photo tiles + lightbox keyboard/SR operable** — `<button>` tiles + `role="dialog"` and focus management; unlocks the entire Photos section for keyboard/SR users. *(a11y-1, a11y-2)*
6. **[SAFE] Generate real favicon/manifest icons** — replace the 1.78 MB bitmap-in-SVG; ~1.8 MB off every tab/install. *(seo-2)*
7. **[SAFE] Add `noindex` to the 7 game pages** — one meta tag each; stops thin canvas pages diluting SERPs. *(seo-3)*
8. **[SAFE] Batch the small a11y/SEO labels** — progressbar `aria-value*`, arcade `<h2>`, input/slider/close-button `aria-label`s, per-photo alt, OG completeness fields, JSON-LD album node. All low-risk markup. *(a11y-3/4/6/7/8/9, seo-4, seo-5)*
9. **[DECISION] Add a meta CSP (report-only first)** — defense-in-depth backstop for XSS; needs a rollout plan against inline scripts. *(sec-3)*
10. **[MECH] Tighten Firestore create rules + fix the dead animation-pause** — both need a careful reconcile/confirm step before they're safe to ship. *(sec-5, perf-2)*

---

## Findings by Severity

### Critical
*None.* No finding rises to data-loss, full-site-outage, or unauthenticated takeover of infrastructure.

---

### High

**Stored XSS via unvalidated leaderboard fields (`time`/`length`/`wave`) rendered raw into innerHTML** — `Games/neon-survivors.html:23462/23467`, `neon-snake.html:3765/3770`, `neon-space-shooter.html:3123` (+ `firestore.rules` create blocks)
- *Impact:* Any visitor can write a malicious leaderboard doc via the public-create collection; when **any** player opens that game's leaderboard the payload runs JS on the apex origin — read/forge all leaderboards, hijack analytics, rewrite the DOM, redirect users. Persistent, affects every viewer, amplified by sec-4 (no iframe sandbox).
- *Fix:* (1) **Escape/coerce before interpolation** — `escapeHtml(String(entry.time))` for survivors (it's a `"m:ss"` string), `Number()`-coerce snake `length` and space-shooter `wave`. This is the must-fix (no deploy dependency). (2) Type-check the fields in the rules (see sec-5).
- **[SAFE]** (render layer)

**Music `<audio>` uses `preload="auto"` on a 17 MB MP3 — full file downloaded on every page load** — `index.html:8986-8988`
- *Impact:* Every visitor (incl. mobile/metered) downloads ~17.3 MB up front despite no autoplay; the largest single transfer on the site, competing with the critical render path. Also bloats the Capacitor iOS build.
- *Fix:* Change to `preload="metadata"` (or `none`); the browser fetches audio on first `play()`. One attribute, zero behavior change for listeners.
- **[SAFE]**

**Photo gallery thumbnails are keyboard- and SR-inoperable (`div`+`onclick`)** — `index.html:9116-9151`
- *Impact:* Keyboard/switch users can't open any photo; SR doesn't announce the tiles as interactive. Entire Photos section unreachable without mouse/touch. WCAG 2.1.1 (A), 4.1.2 (A).
- *Fix:* Convert tiles to `<button type="button" aria-label="Open photo: <alt>">` (fires on Enter/Space for free), or add `role="button" tabindex="0"` + a shared keydown handler. Existing `:focus-visible` rings then work.
- **[SAFE]**

**Lightbox modal has no dialog semantics and no focus management** — `index.html:8894-8906` + `9307-9327`
- *Impact:* Focus stays behind the modal; keyboard/SR users can Tab to hidden background content and lose focus on close; no "dialog opened" announcement. WCAG 2.4.3 (A), 4.1.2 (A), 1.3.1 (A).
- *Fix:* Add `role="dialog" aria-modal="true" aria-label="Photo viewer"`; store `activeElement`, focus the close button on open, trap Tab, restore focus on close. (Escape-to-close already exists at `:9346`.)
- **[SAFE]**

**Skip-to-content link triggers a broken section transition** — `index.html:8882` + `9968-9978` + `9853-9957`
- *Impact:* Tab→Enter on the skip link `preventDefault()`s the focus jump (so it fails its only job), fades to black, removes `.section-active` from the real section and adds it to `<main>` (unstyled), and rewrites the URL to `#main-content`. Net: **the page blanks instead of moving focus.** Same defect in the touchend branch (~9987).
- *Fix:* Exclude the skip link: change selector to `a[href^="#"]:not(.skip-link)`, or guard with `if (!orderedSections.includes(targetId)) return;`. Add `tabindex="-1"` to `<main>` if focus must stick.
- **[SAFE]**

**`og:image`/`twitter:image` is a WebP file with a `.png` extension — social cards can fail** — `index.html:29,38,48-49` (`Images/CuriosityAlbumCover.png`)
- *Impact:* GitHub Pages serves it as `image/png` while the bytes are WebP (verified RIFF/WEBP header). Facebook/LinkedIn crawlers format-validate and frequently reject mismatched images → blank/broken preview on the band's main shared link, the highest-value sharing surface. (File is only 40 KB — format mismatch, not size, is the issue.)
- *Fix:* `sips -s format png Images/CuriosityAlbumCover.png --out Images/CuriosityAlbumCover.png`, then re-verify with `file`. Keep the `.png` name.
- **[SAFE]**

---

### Medium

**No Content-Security-Policy on the site or games** — `index.html` head; `Games/*.html`; `firebase.json` (no headers, and Pages can't set them anyway)
- *Impact:* No defense-in-depth backstop — any single injection (sec-1) is fully exploitable. No `frame-ancestors` either (clickjacking).
- *Fix:* Add a `<meta http-equiv="Content-Security-Policy">` with `script-src 'self' gstatic googletagmanager`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`. Inline scripts will need `'unsafe-inline'`/hashes — **start in report-only mode** to tune, then enforce.
- **[DECISION]** (rollout plan needed against large inline scripts)

**No Subresource Integrity (SRI) on any third-party CDN script/stylesheet** — all 7 games (`neon-brickbreaker.html:5592-5595`, Firebase SDK from gstatic); `index.html:149-150` (Google Fonts + `fonts.cdnfonts.com`)
- *Impact:* A compromised/MITM'd CDN executes arbitrary JS on the apex origin. `cdnfonts.com` is a smaller third-party host and a higher supply-chain risk.
- *Fix:* Add `integrity="sha384-…" crossorigin="anonymous"` to the dynamically-created Firebase script elements (gstatic serves CORS, so SRI works). Self-host the WOFF2s (and `rumble-brave`) to drop the `cdnfonts.com` dependency (Google Fonts CSS uses content negotiation, so stylesheet SRI is impractical). CSP is the broader mitigation.
- **[SAFE]**

**Off-screen animation-pause optimization is architecturally dead** — `index.html:2430-2452` (CSS), `10546-10584` (IntersectionObserver)
- *Impact:* All 7 sections' ~80+ decorative animations run continuously regardless of visibility. The `.offscreen` class is never applied by section-switch code, and the IO root is a non-scrolling fixed container so every section permanently "intersects" → `.offscreen` is stripped and never re-added. Chrome desktop masks it (animations force-disabled), but Firefox/LibreWolf (a supported browser) and mobile run the full stack — the labeled "major performance boost" delivers nothing: constant style-recalc/paint and battery drain while idle.
- *Fix:* Drive pause off the real visibility class — replace selectors with `section:not(.section-active) …`, or add/remove `.offscreen` in the section-switch path (`menuTransitionToSection` 9925/9931, load path 10640/10642), and drop the dead IO toggling.
- **[MECH]** (touches the psychedelic-effects system; confirm Kevin is OK freezing hidden-section animations)

**All ~3.4 MB of per-section wallpapers fetched on first load; no preload on the LCP home wallpaper** — `index.html:5069-5072/5094/5176-5178`, visibility `3592-3593`, persistent layer `3934-3983`, head `142-150`
- *Impact:* First load pulls ~3.4 MB when only ~0.85 MB (home `LiquidLight4.webp`) renders the first screen (inactive sections are `visibility:hidden`, not `display:none`, so their `::before` backgrounds still fetch). 7 persistent `will-change`+mask layers also hold GPU memory continuously. Slower LCP + higher steady-state memory.
- *Fix:* (1) `<link rel="preload" as="image" href="Images/LiquidLight4.webp" fetchpriority="high">` in head. (2) Move off-screen `::before` backgrounds into a JS-applied per-section class set on first activation. (3) Scope `will-change:transform` to `section.section-active::before` only.
- **[MECH]**

**Grouped vendor-prefixed `:fullscreen` selectors silently dropped (the MEMORY.md gotcha, only half-fixed in V1_180)** — `index.html:6520-6542`, `6601-6607`, plus 2-way groups at `6215-6220/6610-6613/6616-6626/6628-6631`
- *Impact:* The 4-way grouped rules carry `border:none; border-radius:0` + sizing; because an unknown vendor pseudo-class invalidates the whole selector list, these drop in **all** browsers → the base `.game-container` 2px cyan rounded border rings the screen edge in native fullscreen everywhere. The 2-way `:-webkit-full-screen` groups also drop in Firefox (no `:-moz-full-screen` rule), so Firefox loses fullscreen button/touch-blocker styling. JS rescues iframe centering, so this is cosmetic + a latent maintenance trap.
- *Fix:* Apply the V1_180 pattern fully — one standalone rule per prefix. At minimum, add `border:none; border-radius:0` to the existing standalone `:fullscreen` rule at `:6549` to kill the residual frame everywhere.
- **[SAFE]**

**Music seek bar: `role="progressbar"` with no `aria-value*`, seek is mouse/touch-only** — `index.html:8974` + `seekTrack` `10939`
- *Impact:* SR announces a valueless progressbar; keyboard users can't scrub. WCAG 1.3.1 (A), 4.1.2 (A), 2.1.1 (A). (Play/pause/next/prev/volume are real controls and fine.)
- *Fix:* Simplest — reuse an `<input type="range">` for seek like the volume control already does. Or keep it as a focusable `role="slider"` with `aria-valuenow` + arrow-key handler, populating `aria-value*` on `timeupdate`.
- **[SAFE]**

**Arcade section has no heading** — `index.html:9155-9196` (`<section id="game">`, no `<h2>`)
- *Impact:* SR users navigating by heading skip the arcade entirely (and `#merch h2` is `display:none` for normal visitors, so the arcade sits between two heading-less sections). WCAG 1.3.1 (A); weakens 2.4.6 (AA).
- *Fix:* Add `<h2>Arcade</h2>` as the first child (visually-hidden if the design can't show it).
- **[SAFE]**

**Mobile nav overlay: focusable buttons stay in tab order while `aria-hidden="true"`; no focus trap** — `index.html:8684-8704` (CSS), `8937-8947`, `10015-10026`
- *Impact:* Closed overlay is `opacity:0; pointer-events:none; display:flex` — buttons stay tabbable, so a mobile keyboard/switch user Tabs onto invisible items inside an `aria-hidden` subtree (conflicting state); on open, focus isn't moved/trapped. WCAG 4.1.2 (A), 2.4.3 (A). (Desktop safe — `display:none` ≥769px.)
- *Fix:* When closed, also apply `visibility:hidden` (or toggle `inert`) so tiles leave the tab order; on open, focus the first tile, trap Tab, restore focus to the hamburger on close.
- **[SAFE]**

**iPhone pseudo-fullscreen uses `100vh` while the iframe is sized to `window.innerHeight` — game off-center/clipped behind Safari toolbar** — `index.html:6240` vs `11754-11762`/`11581-11606`
- *Impact:* On iPhone (the only device using pseudo-fullscreen), the fullscreen game shifts down and clips its bottom edge — exactly where touch controls live. Inconsistent with the Capacitor wrapper (which measures `getBoundingClientRect`).
- *Fix:* Make the container `height: 100vh; height: 100dvh !important;` (with `@supports not (height:100dvh){ height:-webkit-fill-available }`), or set the height inline from `window.innerHeight`. Verify on a real iPhone with the toolbar showing.
- **[SAFE]**

**Android tablets sized as phones in `enforceGameAspectRatio` (CSS/JS sizing diverge)** — `index.html:11216-11217` + `9385-9392`
- *Impact:* `isPhone` has no size guard and `is-mobile` is added to every Android UA, so Android tablets run phone sizing and miss the tuned iPad/tablet matrix (the #1-priority sizing path) — oversized game vs iPads at the same viewport. Tablet CSS (`pointer:coarse`) still applies, so expected spacing and applied sizing diverge. No Android-tablet test coverage.
- *Fix:* Use a min-screen-dimension heuristic — treat as tablet when `Math.min(screen.width, screen.height) >= 600` (the test already used for `isTabletFS` at `:11625`) so phones (incl. iPhone landscape >768px wide) stay on the phone path.
- **[DECISION]**

**Primary `favicon.svg` is a 1.78 MB base64 raster doubling as a PWA manifest icon** — `index.html:71` + `manifest.webmanifest` icons[0] (1,824,844 bytes)
- *Impact:* Every tab/bookmark and every PWA install pulls ~1.8 MB to render a tiny icon; defeats the point of an SVG favicon and bloats the install footprint. Competes with the LCP hero on cold first paint.
- *Fix:* Make a true vector (or hand-optimized) `favicon.svg` (a few KB) + real PNG icons (32/192/512); point manifest icons[0] at a 512×512 PNG. The 15 KB `.ico` and 180px apple-touch-icon are already fine.
- **[SAFE]**

**27 MB of unreferenced audio in `_unused/` not gitignored** — `BOO-Website/.gitignore`, `BOO-Website/_unused/`
- *Impact:* 27 MB of dead audio is committed, republished by Pages on every deploy, and pulled by every clone/CI checkout. Pure bloat.
- *Fix:* Add `_unused/` to `.gitignore`, then `git rm -r --cached _unused` (files stay on disk; **Kevin runs the git step**).
- **[SAFE]** (file edit) / git step is owner's call

**`neon-dig` is the only game with no profanity filter on leaderboard submit** — `Games/neon-dig.html:14197-14207`
- *Impact:* A player can post a profane/slur name to the public `neondig_scores` board on the band's site, while the identical action is blocked in the other 6 games; the rules only check length. `sanitizeUsername` strips to `[A-Z0-9_-]` but single-token profanity passes.
- *Fix:* Port the shared `containsProfanity()` guard into neon-dig before `saveScore`, matching the other 6 games.
- **[DECISION]** (moderation policy call)

**Pages deploy checks out default-branch HEAD, not the tested commit (deploy-gate TOCTOU)** — `.github/workflows/static.yml:41-49` + `11-14`
- *Impact:* If commit B is pushed before A's tests finish, A's green run fires `static.yml` which checks out main HEAD = B → untested code ships. Low-probability for a serial-push solo dev, but the V1_166 gate's whole purpose ("red tests no longer ship") is silently defeated on any overlap. (`workflow_dispatch` has no gate — an accepted manual hatch.)
- *Fix:* Pin the checkout: `with: ref: ${{ github.event.workflow_run.head_sha }}` (fall back to default only for `workflow_dispatch`). Optionally gate on `head_branch == 'main'`.
- **[SAFE]** (one line)

**iOS App-Bound Domains enabled with no `WKAppBoundDomains` plist entry** — `mobile/capacitor.config.json:9` vs `mobile/ios/App/App/Info.plist` (key absent)
- *Impact:* With `limitsNavigationsToAppBoundDomains: true` and no allowlist, the WKWebView lockdown is incomplete — Firestore reads/writes (`googleapis.com`) and YouTube/Spotify/Apple embeds can fail **silently in the shipped iOS app** while working on web. Zero automated iOS coverage to catch it. (App Store build, not yet shipped.)
- *Fix:* Either remove the flag, or add a `WKAppBoundDomains` array (firestore.googleapis.com, firebaseio.com, www.googleapis.com, youtube.com, spotify, apple-music…), `npx cap sync ios`, and smoke-test a leaderboard submit on a real device before review.
- **[DECISION]**

---

### Low

**Same-origin game iframe has no `sandbox` attribute** — `index.html:9193` (+ `switchArcadeGame` `:11533`)
- *Impact:* Removes the isolation boundary, amplifying sec-1 from in-game to full apex-origin compromise. The iframe `src` comes from trusted hardcoded `data-game` attrs (not an injection vector); latent absent an injection bug.
- *Fix:* Tradeoff — strict `sandbox="allow-scripts"` (no `allow-same-origin`) would break Firebase/localStorage/fullscreen. Real mitigations: fix sec-1 + add CSP, or move `Games/` to a separate origin and use the existing postMessage bridge.
- **[DECISION]**

**Firestore create rules accept arbitrary extra fields and unbounded values** — `firestore.rules:36-93` (every `allow create`)
- *Impact:* The rules-side root cause enabling sec-1, and permits junk/oversized docs (quota abuse). No `keys().hasOnly([...])` allow-list, no numeric upper bound; every string field except `name` is unconstrained. (Distinct from the already-deferred "valid int spoofed high" issue, which needs App Check / a Cloud Function.)
- *Fix:* Add a per-collection `keys().hasOnly([...])` allow-list, type-check every permitted field, and bound numerics. **Reconcile against the live console rules and each game's real write payload before `firebase deploy`** or legitimate writes will start failing.
- **[MECH]**

**WebKit-detection hack `@media (-webkit-min-device-pixel-ratio:0)` labeled "All Safari" but also matches Chromium** — `index.html:580`, `605-615`, `647-676`
- *Impact:* Paints a fixed black bottom bar (~70px) on desktop/Android Chrome too — currently harmless (it also forces `background:#000`, has `pointer-events:none`, and the music player z-index sits above it), but unintended scope + mislabeled comment. (The `section::before animation:none` part is independently/intentionally disabled for Chrome at `:1543`, not a side effect.)
- *Fix:* Gate Safari-only effects on the existing `body.is-safari`/`body.is-ios` classes, or update the comments if Chrome behavior is intentional.
- **[DECISION]**

**`manifest.webmanifest` locks installed PWA to portrait, disabling all 12 landscape media queries** — `manifest.webmanifest:9`
- *Impact:* Installed-PWA + Android + landscape users get forced back to portrait; the landscape CSS work (incl. the V1_160 phone-landscape pass) is dead in installed mode. In-browser landscape is unaffected. Coherent state the manifest explicitly requests, not breakage.
- *Fix:* If landscape should be usable, set `"orientation": "any"` (or remove the key); if portrait-lock is deliberate, justify/trim the 12 landscape queries.
- **[DECISION]**

**`postMessage 'gameTouch end'` unlock branch is effectively dead** — `index.html:11979-11996`
- *Impact:* The finger-lift scroll-unlock never fires during play (`if (!isGameVisible)` is false the whole time the arcade is on screen); the lock self-heals only incidentally when the user taps parent chrome. Not a hard stuck-scroll; logically-inverted load-bearing-looking code that does nothing.
- *Fix:* Drop the `if (!isGameVisible)` guard so 'end' always clears interaction + `unlockScroll()` (which no-ops safely).
- **[SAFE]**

**`menuTransitionToSection` resets the transition lock at 100 ms — shorter than the ~480 ms transition** — `index.html:9855-9861` vs `9886-9956`
- *Impact:* A dropped reentrant click force-clears `isTransitioning` at 100 ms while DOM toggles (250/400/480 ms) are pending; a third rapid click in the 100–480 ms window can land on the wrong section. Needs triple rapid clicks.
- *Fix:* Don't reset on reentry — just `return` (drop the 100 ms setTimeout) and let the in-flight `resetTransitionState`/2000 ms safety clear it.
- **[SAFE]**

**Escape key unconditionally clears `document.body.style.overflow`** — `index.html:9345-9346` + `9323-9327`
- *Impact:* Pressing Escape while the lightbox is closed still wipes `body.style.overflow`. Benign today (wheel handlers still block scroll via `isScrollLocked`; desktop hover-lock is CSS-based, not body-overflow, so the finding's stated "clears mid-play" impact is inaccurate). Residual is a latent foot-gun for any future overflow-locking modal.
- *Fix:* Guard with `lb.classList.contains('active')` so it only fires when the lightbox is open.
- **[SAFE]**

**Standalone game pages are crawlable thin pages with no description/robots** — `Games/*.html:8` (all 7)
- *Impact:* All 7 have no `robots`/`description`/`canonical`, and `robots.txt` allows everything. But the sitemap lists only the homepage, there are no inbound links, and the homepage has a strong canonical — so real-world SERP-dilution risk for a small band site is modest.
- *Fix:* Add `<meta name="robots" content="noindex">` to each game head (doesn't block iframe embedding).
- **[SAFE]**

**OG image lacks width/height/alt and `og:locale`; JSON-LD omits the Curiosity LP** — `index.html:27-39` and `42-69`
- *Impact:* Missing `og:image:width/height` can defer/blank some cold-scrape share cards; missing `*:image:alt` and `og:locale` are minor completeness/i18n gaps. JSON-LD models only the band (no `MusicAlbum`/`MusicRelease`), forgoing album/track rich results for the flagship release. Pure upside, no defect.
- *Fix:* Add `og:image:width/height/alt` (1400×1400), `og:locale` (en_CA), `twitter:image:alt`; add an `album` node to the MusicGroup with name/byArtist/image/datePublished and the existing Spotify/Apple URLs.
- **[SAFE]**

**Leaderboard name inputs (and Survivors SFX/Zoom sliders) have no accessible label — placeholder-only** — all 7 games (`usernameInput`); `neon-survivors.html` sliders
- *Impact:* SR users hear an unlabeled field/slider. WCAG 1.3.1 (A), 4.1.2 (A). (The `musicVolumeSlider` is in a `display:none` row, so not user-facing.)
- *Fix:* Add `aria-label="Your name (2-12 characters)"` to each `usernameInput`, and `aria-label`s to the live Survivors sliders. Keep the placeholder.
- **[SAFE]**

**Lightbox `alt` is static "Gallery Image" — never updated per photo** — `index.html:8898` (+ `openLightbox` 9313, `navigateLightbox` 9337)
- *Impact:* Every enlarged photo is announced identically, discarding the descriptive thumbnail alt. WCAG 1.1.1 (A) for the primary view.
- *Fix:* Set `img.alt` alongside `img.src` in both functions (read the clicked thumbnail's alt or a parallel array).
- **[SAFE]**

**Desktop nav links double-announce text (hidden duplicate span)** — `index.html:8915-8920` + CSS `5401`
- *Impact:* Each nav item announced twice on desktop ("Bio Bio"); the `.menu-text-color` span is `opacity:0` (in the a11y tree) but a purely visual hover effect. Mobile is fine (`display:none`). Minor 4.1.2 (A) verbosity.
- *Fix:* Add `aria-hidden="true"` to the `.menu-text-color` spans.
- **[SAFE]**

**Icon-only close buttons lack an accessible name (bare ✕)** — `neon-brickbreaker.html:1572/1657`; `clydes-big-jump.html:1153`
- *Impact:* SR announces the glyph ("multiply"/nothing) instead of "Close." WCAG 4.1.2 (A), 1.1.1 (A). (Narrower than "some games" — really brickbreaker ×2 + clydes ×1; the other 4 games + Survivors already label theirs.)
- *Fix:* Add `aria-label="Close"` to the bare ✕ buttons in brickbreaker and clydes.
- **[SAFE]**

**`neon-space-shooter` skips the `sanitizeUsername` normalization the other 6 apply** — `neon-space-shooter.html:3013-3038`
- *Impact:* Writes mixed-case/unicode/emoji names raw to the shared board; cosmetic inconsistency. **Not XSS** — `renderLeaderboard` escapes via `escapeHtml(entry.name)` at `:3121`.
- *Fix:* Add the shared `sanitizeUsername()` and run input through it before the length/profanity checks and the write.
- **[DECISION]** (consistency policy)

**Two scroll-lock systems with duplicate `lockScroll`/`unlockScroll` names** — `index.html:11089-11200` (IIFE, `scrollLocked`) and `11922-12200` (outer, `isScrollLocked`)
- *Impact:* Not a shadowing bug (scoping is valid), but two same-named functions + near-identical state vars + overlapping touch handlers make the area easy to break — a maintainer can edit the wrong `lockScroll`.
- *Fix:* Consolidate into one module, or rename one pair (e.g. `lockTouchScroll`) and cross-reference; verify the two touch handlers aren't double-acting on one gesture.
- **[SAFE]** (rename/comment)

**Shared helpers duplicated across 6-7 game files** — `Games/*.html` (`containsProfanity`, Firebase config, `escapeHtml`, `sanitizeUsername`, render)
- *Impact:* No build step → each helper lives in 6-7 copies; one banned word or SDK bump requires editing every game. The `containsProfanity` whitespace drift shows copies are already diverging (and is the root of hyg-2/3/6).
- *Fix:* Extract into `Games/_shared/leaderboard.js` + `<script src>` for a single source of truth, OR accept the no-bundler cost and add a CLAUDE.md checklist to edit all 7 together.
- **[DECISION]** (architecture call)

**`escapeHtml` null-safety / name-fallback inconsistent across games** — `neon-space-shooter.html:3121`, `clydes-big-jump.html:3093`, `neon-brickbreaker.html:5923`, `neon-tower-defense.html:8977`
- *Impact:* A name-less doc renders literal "undefined" in clyde/brickbreaker/space-shooter/tower-defense, vs empty in dig/survivors and "???" in snake. Low likelihood (write-path blocks empty names); V1_163 hardening left half-applied.
- *Fix:* Standardize on the null-safe `escapeHtml` body (dig/survivors) or `escapeHtml(entry.name || '???')` (snake) across all 7.
- **[SAFE]**

**Commented-out Space Shooter arcade pill left in nav** — `index.html:9181-9185`
- *Impact:* Dead commented markup in the shipped page + a complete-but-hidden game. "Hidden for now" suggests a deferred decision.
- *Fix:* Either delete the commented block (git preserves it) or uncomment to ship — don't leave it dangling.
- **[DECISION]**

**Info-level Firebase `console.log` ships to production in all 7 games** — e.g. `neon-snake.html:3420/3428`
- *Impact:* Console noise in end-user DevTools on every game load; `index.html` ships zero `console.*`, so the games are inconsistent. No functional effect.
- *Fix:* Drop the two success/offline info `console.log` lines per game (keep `warn`/`error`).
- **[SAFE]**

**Forever-running 250 ms `setInterval` polling `devicePixelRatio` for zoom** — `index.html:11468-11476`
- *Impact:* A 4 Hz main-thread wakeup that blocks full tab idle; per-tick body is just a DPR read (negligible cost). No `clearInterval`.
- *Fix:* Remove the poll (existing resize/visualViewport/keydown handlers already cover zoom) or lengthen to 1000 ms. Lowest priority.
- **[SAFE]**

**Dead `@keyframes` (titleOutlineGlow/subtitleOutlineGlow + webkit twins, ~120 lines)** — `index.html:5604-5655`, `5722-5790`
- *Impact:* ~120 lines of dead CSS shipped to every visitor; zero runtime cost but a maintenance trap (could re-enable an un-compositable animated text-shadow on the H1).
- *Fix:* Delete the four unused keyframe blocks.
- **[SAFE]**

**Six more dead `@keyframes` (~1.85 KB)** — `index.html:4199-4202, 4291-4304, 4306-4319, 4321-4337, 4339-4346, 5180-5183`
- *Impact:* ~1.85 KB dead CSS in the single 537 KB file; "kept for any other usage" that never came. No functional effect.
- *Fix:* Delete the six blocks + the orphaned comment at `:4290`. Keep the active `waveRippleCombined1/2` and `backgroundBreatheFlippedH`.
- **[SAFE]**

**`--vh` custom property computed and kept in sync but never consumed** — `index.html:9761-9776`
- *Impact:* A resize + orientationchange handler runs on every iOS resize for no effect; the "Fix iOS Safari 100vh" comment mislabels where the real fix lives (`100dvh`). KB/maintainability.
- *Fix:* Remove `setVH` and its two listeners (the `100dvh` rules already handle iOS).
- **[SAFE]**

**CI Node pinned to '20' — GitHub-forced Node 24 migration ~mid-2026** — `.github/workflows/test.yml:24-27`
- *Impact:* Pins the test runner to an EOL toolchain; won't hard-break when the default flips (explicit pin) but surfaces deprecation warnings. Pure hygiene.
- *Fix:* Bump to `'22'` (Active LTS) or `'24'`. No Node-20-specific deps, so low-risk; let E2E validate.
- **[SAFE]**

**`firestore.rules` + CLAUDE.md omit the `mode` field Tower Defense writes (schema-doc drift)** — `firestore.rules:55-62` + CLAUDE.md table; write at `neon-tower-defense.html:8834-8840`
- *Impact:* No runtime bug (rules allow extra fields), but the version-controlled rules mirror under-documents the real write shape — an exhaustive `hasOnly()` hardening using the documented list would silently reject every TD submit.
- *Fix:* Add `mode` (string) to the rules comment and CLAUDE.md table; account for `mode`+`timestamp` if exhaustive validation is added. Comment-only, no deploy.
- **[SAFE]**

---

## Quick SAFE Wins (safe to auto-apply)

These are escaping/markup/attribute/dead-code changes with no behavioral risk to legitimate users. Recommend batching into a few conventional commits:

- **Security:** escape/coerce `time`/`length`/`wave` (sec-1, the critical one); add Firebase SRI (sec-2).
- **Performance:** `preload="metadata"` on the MP3 (perf-1); LCP wallpaper preload (the link tag portion of perf-3); remove the DPR poll (perf-5); delete the 10 dead keyframes (perf-6, css-2); add `border:none;border-radius:0` to the standalone `:fullscreen` rule (css-1); remove the dead `--vh` (mobile-3).
- **Accessibility:** photo tiles → buttons (a11y-1); lightbox dialog + focus mgmt (a11y-2); progressbar/seek (a11y-3); arcade `<h2>` (a11y-4); nav-overlay visibility/inert + focus (a11y-5); input/slider labels (a11y-6); per-photo alt (a11y-7); nav `aria-hidden` dedupe (a11y-8); close-button labels (a11y-9).
- **Correctness:** skip-link guard (corr-1, page-blanking); `gameTouch end` guard (corr-2); transition-lock reentry (corr-3); Escape overflow guard (corr-4).
- **SEO/PWA:** re-encode the social image (seo-1); real favicon/manifest icons (seo-2); game `noindex` (seo-3); OG completeness + JSON-LD album (seo-4, seo-5).
- **Mobile:** iPhone pseudo-fullscreen `dvh` (mobile-1).
- **Hygiene/Infra:** `escapeHtml` consistency (hyg-7); drop game `console.log`s (hyg-9); rename one scroll-lock pair (hyg-5); pin the deploy checkout SHA (infra-1); bump CI Node (infra-3); TD `mode` doc fix (infra-5). Add `_unused/` to `.gitignore` (hyg-1) — but **Kevin runs the `git rm --cached`** step per git policy.

## Needs Your Call (MECH / DECISION)

These either need a confirmation/reconcile step before they're safe, or are a product/architecture judgment:

- **MECH (needs a reconcile/confirm step):**
  - **Firestore create-rule allow-lists** (sec-5) — reconcile against the live console + each game's real payload before `firebase deploy`.
  - **Fix the dead animation-pause system** (perf-2) — confirm you're OK freezing hidden-section animations; touches the psychedelic-effects system.
  - **Defer off-screen wallpapers + scope `will-change`** (perf-3, parts 2-3) — JS section-switch wiring.
- **DECISION (your judgment):**
  - **Add a meta CSP** (sec-3) — report-only rollout plan against inline scripts.
  - **Game iframe isolation** (sec-4) — accept same-origin + CSP, or split `Games/` to a separate origin.
  - **Android-tablet sizing heuristic** (mobile-2) — the proposed `min-dimension >= 600` fix needs a sign-off given the #1-priority sizing path.
  - **iOS App-Bound Domains** (infra-2) — remove the flag, or add `WKAppBoundDomains` + device smoke-test before App Review.
  - **PWA portrait lock** (mobile-4) — intended lock vs. wasted landscape CSS.
  - **WebKit-hack scope** (mobile-5) — gate on `is-safari`, or document the Chrome behavior as intentional.
  - **neon-dig profanity filter** (hyg-2) — moderation policy.
  - **Space-shooter name normalization** (hyg-3) — consistency policy.
  - **Shared-helper extraction** (hyg-4) — `_shared/leaderboard.js` vs. accept the no-bundler cost.
  - **Commented Space Shooter pill** (hyg-8) — ship it or delete it.

---

**Relevant files:** `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/index.html`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/Games/*.html`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/firestore.rules`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/manifest.webmanifest`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/.github/workflows/static.yml` + `test.yml`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/mobile/capacitor.config.json` + `mobile/ios/App/App/Info.plist`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/Images/CuriosityAlbumCover.png` + `Images/Favicon/favicon.svg`, `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website/.gitignore` + `_unused/`.