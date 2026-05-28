# Whole-Website Polish Audit - 2026-05-16

Subject: BOO website, current `main` at V1_160.

Goal: raise whole-site craft without changing the established appearance unless Kevin explicitly approves that train.

## Audit Evidence

- `npm audit --omit=dev --json`: 0 vulnerabilities.
- `npm audit --json`: 0 vulnerabilities.
- Local responsive crawl against `npm run serve` on port 4747:
  - desktop 1440x900
  - OnePlus-class Android 412x915
  - phone landscape 740x360
  - iPad mini landscape 1133x744
  - iPad Pro portrait 1024x1366
- Crawl results:
  - 0 page errors.
  - 0 console warnings.
  - 0 bad local responses.
  - 0 duplicate IDs.
  - 0 missing image alt attributes.
  - 0 empty buttons.
  - 0 `target="_blank"` links missing `noopener`.
  - 0 viewport visibility issues across the crawled sections.
  - 2 Google Analytics collection requests aborted per profile in local headless testing; these are external analytics pings, not missing site assets.
- Repository/media scan:
  - `index.html`: 12,289 lines, about 529 KB.
  - Largest game files: `neon-survivors.html` about 1.06 MB, `neon-dig.html` about 674 KB, `neon-tower-defense.html` about 522 KB.
  - Largest audio files: `GIRL WITH WEED.mp3` about 20 MB, `QUEEN.mp3` about 17 MB, `GOLDMINE.mp3` about 11 MB.
  - No zero-byte files found under `Images/` or `Music/`.

## Ratings

| Category | Craft | Fit | Notes |
| --- | ---: | ---: | --- |
| Visual and responsive layout | 8.5 | 9.0 | Current breakpoint matrix is much healthier after V1_160. Main risk is cascade fragility from many layered overrides. |
| Navigation behavior | 7.5 | 8.0 | Nav-only direction is right for the site. Card indicator legacy and tests should be reconciled so behavior and docs match. |
| Accessibility and touch ergonomics | 7.0 | 7.5 | Core labels/alt/IDs are clean. Music controls, volume slider, close button, and mobile logo hit area are below comfortable touch target size in several viewports. |
| Performance and media loading | 6.5 | 7.0 | Images are reasonable. Audio and large inline game files are the biggest remaining weight. Any audio loading change needs careful play-state testing. |
| Security and dependency posture | 8.5 | 8.5 | npm audit is clean and external links are hardened. Remaining work is targeted review of user-supplied leaderboard rendering and optional policy headers. |
| SEO, PWA, and discovery | 7.5 | 8.0 | Schema, robots, sitemap, manifest, and humans file exist. `sitemap.xml` lastmod is stale; PWA portrait orientation may conflict with the new iPad landscape goal. |
| Test and CI coverage | 8.0 | 8.0 | Critical Playwright coverage is strong. It should now include the new responsive matrix, mobile nav hit targets, and nav-only contract. |
| Maintainability | 5.5 | 6.5 | The one-file site has accumulated many historical patches. No broad refactor should happen without approval, but targeted tests/docs can reduce future regressions. |
| Content readiness | 7.0 | 7.5 | Events are current and external links work. Merch remains intentionally placeholder-like; README is stale against current behavior and tooling. |

## Priority Findings

1. Small interactive hit areas remain the clearest quality gap.
   - Music player mute, previous, next, close, and volume controls are visually fine but their effective touch rectangles are too small in mobile and iPad landscape testing.
   - The mobile logo/home anchor also tests small.
   - Best fix: increase invisible hit areas while preserving visible size.

2. The test suite needs to catch the layout issues we just fixed manually.
   - The current suite covers important critical paths, but not the exact iPad mini/iPad/iPad Pro matrix that drove the recent fixes.
   - Best fix: add a dedicated responsive-fit spec using the proven viewport set.

3. Documentation does not match the current product contract.
   - README still describes wheel/touch/keyboard section switching and "no dependencies" language that no longer matches the current nav-only, Playwright-backed site.
   - Best fix: update documentation only, no runtime behavior change.

4. SEO/PWA metadata has minor drift.
   - `sitemap.xml` lastmod predates the current live release.
   - `manifest.webmanifest` uses portrait orientation, which may be wrong now that iPad landscape quality is a product goal.
   - Best fix: update sitemap now; treat manifest orientation as a separate approval item.

5. Performance has one meaningful open question: audio preload.
   - The site includes large MP3s, and the current player can create unnecessary initial weight depending on browser behavior.
   - Best fix: test a metadata/lazy-load approach only if Kevin approves possible music-player behavior changes.

6. Security is clean at the package/link level, but leaderboard rendering deserves a focused pass.
   - The game files are large and include leaderboard rendering paths.
   - Best fix: verify every user-supplied name is escaped before insertion; patch only actual unsafe paths.

## Recommended Execution Trains

### Train 1 - Safe Metadata and Docs

No visual drift.

- Update `sitemap.xml` lastmod to `2026-05-16`.
- Update README to reflect the current nav-only site behavior and Playwright dev dependencies.
- Keep this audit doc as the working checklist.

### Train 2 - Regression Tests

No intended visual drift.

- Add responsive-fit Playwright coverage for desktop, OnePlus-class Android, phone landscape, iPad mini landscape, and iPad Pro portrait.
- Add mobile nav hit testing for the lower nav items, especially Merch and Events.
- Add a nav-only contract check so future scroll/swipe regressions are caught.

### Train 3 - Touch Target Hardening

Appearance should remain the same, but hit areas will change.

- Increase effective hit area for music player controls.
- Increase effective hit area for the mobile logo/home anchor.
- Improve the volume slider touch area without visually enlarging the slider.
- Re-run the responsive matrix and mobile music-player tests.

### Train 4 - Performance Pass

Requires explicit approval because music playback timing can be affected.

- Experiment with `preload="metadata"` and lazy source loading.
- Verify first-play latency and track switching on Android, iOS, and desktop.
- Land only if there is no noticeable user-facing regression.

### Train 5 - Nav-Only Cleanup

Requires explicit approval because this touches established section-navigation behavior and tests.

- Reconcile or retire legacy card indicators if they no longer belong in the product model.
- Update tests to assert navmenu-only navigation instead of card-dot behavior.

### Train 6 - Leaderboard Security Review

No intended visual drift.

- Review all seven arcade game leaderboard render paths.
- Patch only actual unsafe user-controlled insertion paths.
- Add minimal tests or reproducible checks where practical.

## Proposed First Move

Run Train 1 and Train 2 first. They create very low appearance risk, make the current state easier to maintain, and give us a stronger safety net before touching hit areas or media loading.
