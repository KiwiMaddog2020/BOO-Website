# Glow-up Audit — 2026-09-28 (V1_470 → V1_490)

Full self-directed audit + polish of the main site and all 7 arcade games, done overnight on branch
`claude/website-glowup-opus-9y3o2y` (NOT pushed to `main` — review, then merge).

**Scope (set by Kevin in the pre-run interview):**
- Visual: *polish + small elevations* — fix visual bugs and make existing designs more consistent; no new
  effects, palettes, fonts or layout redesigns; V1_36 / V1_43 anchors and the sacred timings untouched.
- Games: bugs + visual cleanup, and *clear* balance bugs (upgrades that do nothing, mis-scaled numbers,
  exploits, frame-rate-dependent speed). No retuning by feel — those are listed below for Kevin.
- Extras: performance (identical output), accessibility + SEO, tests + CI, this docs pass.

**Method:** one audit agent per area (main site, Survivors, Dig, Tower Defense, Brickbreaker, Snake + Clyde,
Space Shooter + `boo-music.js`), each reproducing bugs in headless Chromium against the original file before
fixing and re-verifying after; then two independent adversarial review agents over the whole branch diff
(V1_480); then the full Playwright suite locally (chromium + mobile-android) and in GitHub Actions (all 5
projects incl. WebKit iPhone/iPad).

## Commits

| Version | Area | Headline |
|---|---|---|
| V1_470 | tests | Arcade boot smoke tests (every game, zero uncaught errors + sized canvas) + phone no-overflow |
| V1_471 | Brickbreaker | A/D typable in name box, Slower Ball freeze cap, stuck paddle size, boss floor multi-life, tunnelling |
| V1_472 | Snake | Boot crash on small windows, invisible How to Play, hidden-run starts, 120Hz tick |
| V1_473 | Clyde's Big Jump | Death beat actually shows, hidden restarts, duplicate saves, clipped thoughts |
| V1_474 | boo-music.js | Saved mute honoured in all 6 games, no note pile-up, iOS 'interrupted' resume |
| V1_475 | Space Shooter | Full frame-rate independence (the long-flagged #1 item), double boss, boss-kill crash |
| V1_476 | Tower Defense | 4 dead upgrades + Lucky, game-speed-dependent tower strength, short-screen clipping, perf |
| V1_477 | Neon Dig | Touch shop dead on phones, pause soft-lock, boss portal LEAVE, dead shop upgrades |
| V1_478 | BOO Survivors | Pause leaks behind reward screens, lost level-up picks, chest relic reroll exploit |
| V1_479 | Main site | Stacked sections on rapid nav, arcade hidden under the bottom bar in landscape, a11y/SEO |
| V1_480 | review fixes | Regressions caught by the adversarial review pass (see bottom) |
| V1_481 | docs | This report + CLAUDE.md truth pass |
| V1_482 | Snake | Review follow-up: a focused menu button handles its own Enter/Space |
| V1_483 | Survivors | Decisions: full-speed joystick, Refund All trims bans, menu title reset, 120Hz pellets |
| V1_484 | Tower Defense | Decisions: fire-rate carry-over, doomed-target retarget, Discount cap 75%, Armor Pierce, leprechaun speed, tutorial, Towers Built |
| V1_485 | Snake | Decisions: enemies on their own clock (same base speed), true 2x Slow Motion, tail-tip move |
| V1_486 | Brickbreaker | Decisions: pause (P/Esc/button/tab-hide), boss count levels 10-18, How to Play copy |
| V1_487 | Neon Dig | Decisions: baked particle glows + capped bursts, standalone 16:9 HUD |
| V1_488 | Space Shooter | Decisions: phone health bar above the touch controls |
| V1_489 | Main site | Decisions: iPad arcade un-dimmed, monitor-drag zoom fix, thumbnails, PNG icons, keyboard seek, Stripe copy |
| V1_490 | docs | Decisions record + CLAUDE.md |

## Decisions for Kevin (ranked) — RESOLVED in V1_483–V1_489, see "Decisions implemented" at the bottom

1. **Survivors touch movement is ~71% speed** at nearly every joystick angle (keyboard diagonal ×0.707 is
   applied to the analog stick). Also lets Cinder Wisp bolts outrun a phone player, breaking the
   "projectiles slower than walk speed" doctrine. One-line fix; phone runs would feel ~41% faster.
2. **Survivors level-up queue (V1_478) — playtest.** Multi-level gem vacuums used to deal 1 pick for N
   levels (a second offer superseded the first), and the major boss dealt 1 of its 2 promised rewards.
   Every earned pick is now dealt. Runs get more upgrades than the XP −25% tuning (V1_319) assumed.
   Revert path: make `requestUpgradeSelection()` drop instead of queue.
3. **Tower Defense game-clock (V1_476):** high speed is now a true time-scale — freeze/poison weaker at
   2–6x than before, Beam/Inferno stronger. Leaderboard meta may shift. Single variable (`gameClock`).
4. **Tower Defense fire-rate quantization:** timers reset to the frame, so Minigun (120ms) fires every
   133ms at 60Hz and fast towers lose DPS at 6x. Fix changes 1x DPS → needs feel test. Also: Discount cap
   (60–75%?), Armor Pierce needs a mechanic or removal, doomed-target cooldown waste, tutorial copy.
5. **Snake enemies move at ~half their set speed** (only on player ticks); Speed Boost also speeds enemies;
   Slow Motion is ~1.5x not the 2x the card says; moving into your departing tail tip is a death.
6. **Cannon tracer (TD)** now shows for its written 400ms instead of one frame — most visible game change.
   One line in `updateRailgunLines` restores the flash.
7. **Site: iPad landscape** — bottom ~30px of the game still dimmed by the iOS fade layer; fixing needs
   tablet arcade sizing (aspect territory). **Zoom compensation** mis-reads a 1x→2x monitor drag as
   200% zoom and shrinks the game to 50%.
8. **Assets:** gallery loads full-size photos into 140px tiles (needs thumbnails); `favicon.svg` is a
   1.8MB embedded bitmap and doubles as the manifest icon (needs 192/512 PNGs).
9. **Brickbreaker:** level 10 spawns 9 bosses not 10; Slower Ball cap set at −80% (10 stacks) — adjust if
   wanted; How to Play copy inaccurate on boss/legendary frequency; no pause button.
10. **Space Shooter:** difficulty depends on viewport size (speeds/sizes don't scale); phone health bar mostly
    under the touch bar.
11. **Dig:** opening directly at 16:9 on desktop shows no fuel/hull HUD; per-particle glow cost.
12. **Survivors misc:** Refund All keeps ban slots active; menu keeps "GAME OVER" after quitting a later run;
    shotgun pellets still per-frame on 120Hz; standalone landscape windows unhandled (iframe unaffected).
13. **Legacy:** `success.html` / `cancel.html` still mention Stripe (merch is Fourthwall now).

Device-only checks worth doing on the OnePlus 13R / an iPhone: audio resume after a call, auto-pause on
app switch (Survivors), knockback feel at 120Hz, Space Shooter + Snake speed on a high-refresh screen,
arcade in phone landscape (bottom bar removed there).

---

# Per-area reports

## Site glow-up: index.html + ancillary files

Scope: `index.html`, `manifest.webmanifest`, `sitemap.xml`, `humans.txt`, `success.html`, `cancel.html`. Nothing in Games/, tests/, docs/ or CLAUDE.md was touched, and git state was left alone. Every added comment is tagged `V1_479`.

**The headline:** desktop is pixel-identical on all 4 desktop viewports, and phone portrait (412 / 390) is pixel-identical too. The visual fixes only change three things:
- phone landscape
- iPad landscape / iPad Pro portrait (only the nav row)
- iPad mini portrait (only the Photos section)

### Fixed

| # | Sev | Cat | What + why | Viewports | How verified |
|---|-----|-----|-----------|-----------|--------------|
| 1 | HIGH | bug | **Rapid nav clicks could leave two sections active at once.** When a click arrived during a transition, `menuTransitionToSection` force-cleared `isTransitioning` after 100ms. A third click then started a second transition while the first swap was still pending. Reproduced: about→videos→events clicked within 200ms left `about,events` both active, and the stale section stayed stacked afterwards. **Fix:** a click during a transition is now ignored; the existing 2000ms safety timeout still recovers a stuck state. The swap step also clears any other active section, and the deep-link load switch does the same. | all | Scripted race: now `about` only, then `photos` only. Deep link `#events` still works. |
| 2 | HIGH | visual/bug | **Phone landscape: a black bar hid the bottom quarter of the arcade game.** The fixed 70px bottom bar (`body::before`, z 9990) covered the bottom of the game, including Brickbreaker's paddle row. The loss was ~70px on phone landscape and ~38px on iPad mini landscape. On Android, the section's `.fade-overlay` (z 15) also dimmed what was left above the container (z 10). **Fix:** in coarse-pointer landscape, ≤834px tall, while the arcade is active: hide the bar (the music player it sits behind is already hidden there) and lift the container to z 16. iPhone pseudo-fullscreen is excluded. | phone landscape, iPad landscape | Before/after screenshots: the full game box is now visible. iPhone pseudo-fullscreen re-checked (z 99999, fills 844x390). |
| 3 | MED | visual | **Touch devices with the inline nav showed the current and tapped nav link smaller** than the others (15.2px → 11.5px, letter-spacing lost). The cause was a `(max-width:768px),(hover:none)` rule meant for the old phone nav. Removed that rule's `font-size` / `letter-spacing` only. Phones ≤768px use the hamburger menu, so nothing changes there. | iPad landscape, iPad Pro portrait, phone landscape | Computed sizes now identical (15.2 / 13.6px). |
| 4 | MED | visual | **Phone landscape headings slid under content.** The portrait nudges (V1_136 Bio/Photos h2 `top:25px`, V1_135 home h1 `top:15px`) pushed the BIO heading under the bio box, the PHOTOS heading into the grid, and the title under the album cover. Set `top:0` in the V1_160 landscape guard, the same fix `#events h2` already had. | phone landscape | Measured: bio h2 95-121 vs box 131; photos h2 68-94 vs tiles 119; h1 119-162 vs cover 166. Screenshots confirm. |
| 5 | MED | visual | **iPad mini portrait (768x1024): the 3x4 photo grid overflowed.** It was sized at 95vw (~850px of tiles), so the PHOTOS heading sat under the nav and the bottom row went into the player bar. The grid width is now capped at `(100dvh-330px)*0.75`, only for `body.is-ipad`, 700-768px wide, portrait, ≤1080px tall. The taller iPad mini 6 (744x1133) already fit and is excluded. | iPad mini portrait | Heading now 101-177 (nav ends 68); grid ends 893. Before/after: `cmp_t768_photos.png`. |
| 6 | LOW | a11y | Mobile nav overlay: the six tiles stayed Tab-focusable while the overlay was closed (inside `aria-hidden`). It is now `inert` while closed. Escape moves focus back to the hamburger. | phones | Focusable closed tiles 6 → 0. Open, tap tile, navigate still works. |
| 7 | LOW | bug | Escape ran `closeLightbox()` even when the lightbox was closed, wiping `body.style.overflow` (which iPhone pseudo-fullscreen relies on). Now guarded. | all | Overflow is preserved; open→Esc→close still works and focus returns to the tile. |
| 8 | LOW | bug | Music play/pause stuck on ⏸ after a rejected `play()` (autoplay blocked or load failure), so the next tap was wasted. The state now rolls back. | all | Code review + syntax check. |
| 9 | LOW | bug | `gameTouch end` postMessage handler was dead code (its `if (!isGameVisible)` guard is always false while playing), so the touch lock outlived the finger-lift. The guard was dropped. | touch | Code review. |
| 10 | LOW | a11y | Arcade had no heading. Added a visually-hidden `<h2 class="boo-sr-only">Arcade</h2>` (all properties !important). | all | Zero pixel diff. |
| 11 | LOW | a11y | Seek bar `role="progressbar"` now has `aria-label` and `aria-valuemin/max/now`, kept in sync on timeupdate and track change. | all | Code review. |
| 12 | LOW | a11y | Desktop nav read every item twice ("Bio Bio"). Added `aria-hidden` to the duplicate `.menu-text-color` spans. | desktop | Zero pixel diff. |
| 13 | LOW | a11y | Arcade pills now expose `aria-pressed`, synced in `switchArcadeGame`. The two YouTube iframes had the same title ("YouTube video player") and now have distinct ones. | all | Pill switch still loads snake; test-8 `data-aspect` untouched. |
| 14 | LOW | perf | Removed the dead `setVH()` `--vh` helper and its resize / orientationchange listeners on Safari and iOS (nothing reads `var(--vh)`). | Safari/iOS | grep + syntax check. |
| 15 | LOW | seo | Added `og:locale` en_CA, and a JSON-LD `album` node for the Curiosity LP (MusicAlbum, 2025-12-04). The MusicGroup `@type` and `name` are unchanged, so test 16 still holds. | — | JSON parses. |
| 16 | LOW | seo | Manifest gets `"id": "/"`. Sitemap `lastmod` is now 2026-09-28. humans.txt: member roles match the site's headshot captions, the game count is corrected, and the last-update line is bumped. success.html and cancel.html now use `lang="en-CA"`, matching the main site. | — | JSON and XML validated. |

### Flagged for Kevin (not changed)

1. **iPad landscape (iOS): the bottom ~30px of the game is still dimmed.** The fixed Safari/iOS fade layer (`.scroll-container::before`, z 50) sits above every section. The real fix is to size the tablet arcade clear of the bottom fade zone. That is aspect-ratio / sizing territory, so it's your call.
2. **Zoom-compensation bug.** The zoom compensation code (index.html ~11990) compares the current `devicePixelRatio` to the one captured at page load. Dragging the window from a 1x monitor to a 2x monitor reads as "200% zoom" and counter-scales the game to 50%. The 250ms DPR poll is also still running forever.
3. **Photos load in full size.** The gallery loads the original images (e.g. EP cover 738KB) for 140px tiles. The custom lazy-loader is effectively eager, because every fixed section overlaps the observer's scroll root. Real thumbnails would need new image files, which are outside my scope.
4. **Icons.** `favicon.svg` is a 1.8MB embedded bitmap and doubles as the manifest icon. There are no 192/512 PNG icons, and the 180px icon uses `"any maskable"`, which can crop it on Android. New assets are needed. The manifest's portrait lock is still an open decision.
5. **Phone portrait title can overflow.** The phone-portrait h1 is `nowrap`, so it only fits because the platform's `cursive` fallback is narrow. In an environment without that font it clips at 412px. This is the same class of issue noted in V1_464.
6. **Seek bar isn't keyboard-operable.** It now has ARIA values, but only mouse or touch can scrub.
7. **success.html / cancel.html are probably legacy.** Their copy still mentions Stripe, while merch now goes through Fourthwall.
8. **Audit correction.** The 2026-06-02 audit's "Safari Reduce Motion escape" is inaccurate. mac Safari already gets inline `animation:none` on h1/h2, so no change is needed.
9. **Still-open decisions, unchanged:** meta CSP and iframe sandbox.

### Verification

- **Screenshots.** Every section at 9 viewports: 1920x1080, 1366x768, 2560x1440, 1100x800, 412x915, 390x844, 915x412, 768x1024, 1024x768. Plus probes at 834x1194, 744x1133, 844x390 and 844x390 iPhone pseudo-fullscreen.
- **Deterministic pixel diff.** `site/before2` vs `site/after`: fonts blocked, the original page served via route interception, animations frozen via the Web Animations API.
  - All desktop viewports and phone portrait: ~0 diff. The only exceptions were two diffs caused by images loading at different times, which I confirmed visually.
  - Diffs appear only in the intended regions (phone landscape, iPad landscape nav row, iPad mini portrait Photos).
- **Console and assets.** Zero non-network console errors at every viewport; zero local 404s.
- **Navigation and state.** All 8 sections navigate; exactly one `.section-active` each time; no horizontal overflow anywhere.
- **Interactions.** All work:
  - The arcade loads Brickbreaker and the pill switch loads Snake.
  - Lightbox: opens by tap and by keyboard (Enter), arrows navigate, Esc and the close button close it, and focus is restored.
  - Mobile menu opens and closes, and a tile tap navigates.
  - The phone music toggle works.
- **Syntax.** All 4 inline scripts pass `node --check`. The E2E suite was not run, per instructions.
- **Screenshots worth opening** (in `scratchpad/site/`):
  - `cmp_t768_photos.png`
  - `cmp_p915l_game.png`
  - `after/p915l_sheet.png` vs `before2/p915l_sheet.png`
  - `after/t1024_sheet.png` vs `before2/t1024_sheet.png`
  - `after/i844l-pseudofs.png`
  - `inter-after/`

---

## BOO Survivors — overnight glow-up audit (Games/neon-survivors.html)

Scope: only `Games/neon-survivors.html` changed (+272 / −27 lines). Every new comment is tagged `V1_478`, 49 in total. I did not touch git state. I left the sacred items alone: collision semantics, tuning numbers, music track data, save-key names, and the aspect/sizing math.

### Fixed

#### Bugs (confirmed in the browser before and after each fix)

1. **HIGH · bug: P / Escape / ⏸ un-paused the game behind modals.** When the legendary picker, cursed statue, tombstone, merchant, pot-of-gold (including the 300ms gap between its cards) or the death animation owned the pause, pressing P/Escape or tapping ⏸ set `gamePaused=false`. The fight then ran live behind the modal, so the player could die behind a card screen. After a death, the frame restarted with a dead player. The fullscreen bridge had the same problem because it clicks ⏸.
   - Fix: `togglePause` now only un-pauses from the pause menu. A new helper, `_pauseOwnedElsewhere()`, detects the other owners.
   - Safety valve: if the game is paused with nothing on screen, the pause menu opens instead of resuming.
   - Verified: before the fix, Escape on the legendary screen gave `paused:false`; after, `paused:true` with the legendary screen still up. Death animation + Escape now stays paused.
2. **HIGH · balance-bug: level-ups were silently lost.** Each earned offer called `showUpgradeSelection()` directly, and a second call while one was already up replaced it. This hit multi-level gem vacuums and big boss gems. It also broke the major boss's "2 level-up rewards": the second timer fired mid-spin, so only one ever landed.
   - Fix: new `pendingLevelUps` queue with `requestUpgradeSelection()`. The game loop deals one queued offer per unpaused frame. The queue resets in `startGame` and `exitToMenu`.
   - Verified: gaining 8 levels at once gave 1 offer before, 8 after. A realistic 60-gem vacuum gave 5 levels / 3 offers before, 4 levels / 4 offers after. Major boss kill gave 1 offer before, 2 after.
3. **MED · balance-bug (exploit): chest re-roll scumming.** Chest contents were re-rolled on every open. LEAVE, step 60px away, come back, and you get a new roll, free chests included, until a legendary appears. Each peek also bumped the common-pity streak.
   - Fix: a chest now rolls once and keeps its contents. It only re-rolls if the kept relic has since hit max stacks.
   - Verified: 5 reopenings showed the same relic every time.
4. **MED · bug: double-tapping a shrine granted two blessings.** The shrine cards stayed clickable during the 400ms close animation.
   - Fix: selection is ignored while the overlay is closing.
   - Verified: double click gave +16% attack speed before, +8% after.
5. **MED · bug: "Damage Numbers" setting did nothing.** It was saved and toggled but never read (flagged dead since V1_201). `spawnDamageNumber` now respects it.
6. **MED · bug: pause → Leaderboard → close left the run paused with no pause menu.** Closing the leaderboard now brings the pause menu back.
7. **MED · bug: timed power-ups burned their duration while paused.** Time Stop, Speed Boost and the Temporal Shield window run on `Date.now()`, so level-up cards, chests or the pause menu ate them. They are now frozen while paused (and while the tab is hidden, see 16).
   - Verified: after a 3s pause, Time Stop still had 6.96s of its 7s left.
8. **MED · bug: keys stuck after losing focus.** Holding a key while the iframe lost focus (alt-tab, clicking the parent site) kept the player running in that direction. A window `blur` handler now releases all held keys.
9. **MED · bug (device-only, can't verify headless): mobile audio could go silent for the rest of the session.** The sound-unlock listener fired only once, so after backgrounding or a phone call on iOS/Android the audio stayed off. The audio now resumes on later taps/key presses and when the page becomes visible. It also handles iOS's `interrupted` state.
10. **MED · balance-bug: knockback depended on frame rate.** It decayed ×0.88 per frame, so 120Hz screens (Kevin's OnePlus 13R) got half the knockback of 60Hz ones. This affected all 5 knockback sites (player, enemy, leprechaun, mini boss, major boss).
    - Fix: decay is now scaled by `dt` (`Math.pow(0.88, dt/16.667)`). This is identical at 60Hz. During Time Stop (`dt=0`) the old per-frame decay is kept, so knockback can't build up on frozen enemies.
11. **LOW · bug: score submit could write duplicate leaderboard rows.** Enter key-repeat or Enter+click could submit twice. `submitScore` now ignores calls while a submit is in flight.
    - Related: `hideScoreModal` is now safe to call twice. Pressing Skip during a slow submit used to run the results screen twice, which turned a VICTORY!/SEALED! title back into GAME OVER.
12. **LOW · bug: a Space press on a paused screen fired a surprise dash on resume.** A dash is now only queued during live play. Space also types normally in the name and master-code inputs.
13. **LOW · bug (defensive):**
    - `gameOver` can no longer run twice (a second run would bank the run into the save twice).
    - `exitToMenu` now clears `deathAnimationActive`; otherwise a stray death animation would pop the score modal on the menu.
    - `spawnTimer` now resets every run, so the previous run's partial spawn timer no longer triggers an early first wave.

#### Visual

14. **MED · visual: weapon select clipped on phones.** At 412px (Kevin's phone) and 360px, the one-line edit row forced the column to 449px. Both "(0/1 disabled)" labels and the weapon detail card ran off the screen edges.
    - Fix: the column is capped to the viewport width. Under 480px the two labels drop to their own line, each centred under its button. Under 380px the title shrinks slightly so its trailing ⚔️ stays on the same line.
    - Verified: an element-overflow scan shows 0 off-screen elements at 412/360/640/915.
15. **LOW · visual (viewport-cutoff law): cursed statue title clipped in the phone iframe.** In the in-site phone iframe (~380x426) the statue modal's title was cut off at the top. It now centres at 50% height on short viewports and is height-bounded with scrolling.
    - Verified: the reachability audit is clean at 380x426, 560x628, 640x718 and 800x820 (in iframes), and at 412x915 and 360x640 standalone.
16. **LOW · visual: Bootleg Recording's 4th level-up card popped in with no animation or sheen.** It now joins the entrance cascade.

#### Accessibility and UX

17. **LOW · a11y: keys 1–4 pick level-up, shrine and legendary cards.** Those cards were click/tap-only divs, so keyboard players couldn't choose.
18. **LOW · a11y: Escape now closes Settings, Leaderboard and How-to-Play.** It works from the menu and from pause. Over the pause menu, Escape used to fall through and resume the run.
19. **LOW · a11y: settings controls are now accessible.** The three toggles have `role="switch"`, are focusable, work with Enter/Space and keep `aria-checked` in sync. The sliders now have accessible names. There is also a neon-cyan keyboard-only focus ring matching the main site's V1_151 ring.
20. **LOW · UX: auto-pause when hidden.** Hiding the tab/app mid-run (app switch, phone call) now opens the pause menu, instead of resuming instantly under the player's thumb when they come back.

#### Performance

21. **LOW · perf: canvas no longer reallocated on every iOS scroll tick.** `calculateScale` only reassigns the canvas size when it actually changes. The `visualViewport` scroll listener used to reallocate and blank the canvas on every scroll/zoom tick. Output is identical.

### Flagged for Kevin (not changed)

- **Biggest: touch players move at ~71% speed at almost every angle.** `Player.update` applies the keyboard diagonal normalisation (`×0.707` when both dx and dy are non-zero) to the analog joystick too. A joystick nearly always has both axes non-zero, so mobile movement is ~29% slower than desktop even though SPEED shows 100%.
  - It also breaks the "enemy projectiles are slower than player walk speed" rule: Cinder Wisp bolts move at 1.9 vs an effective mobile walk speed of about 1.58.
  - One-line fix: apply `dx *= 0.707; dy *= 0.707` only when the input came from the keyboard.
  - Not applied because it would make your phone runs about 41% faster on foot; that needs your call.
- **Level-up queue (fix 2) means players now get every upgrade they earn.** Mid/late runs will have somewhat more upgrades than you tuned around. The old behaviour dropped them silently, and your XP −25% tuning (V1_319) was done with that bug in place. Worth a playtest.
- **Knockback fix (fix 10) doubles knockback on your 120Hz phone** compared with before, matching what 60Hz displays always got. Worth a feel check.
- **Shotgun pellets and a few cosmetic effects still move per frame.** On 120Hz pellets fly twice as fast; reach and damage are unchanged. I left this alone because `dt` scaling would let pellets tunnel through enemies on low-FPS devices.
- **Ban-slot refund exploit.** "Refund All" gives back the plasm for the Weapon/Tome Ban rows, but the bans stay active (shows "(5/1 disabled)"). Trimming bans to the cap would also cut bans on older saves from before V1_431 (the old 5/3 limit), so I left it for you to decide.
- **Menu title after a death.** After any death, the menu keeps "GAME OVER" / "TRY AGAIN" even after you later quit a run from pause. Do you want it reset to "BOO SURVIVORS"?
- **Standalone landscape windows are not handled.** At 915x412 or 1920x1080 opened directly (not in the site iframe), fullscreen scales by width only, so the pause/mute buttons and trackpad sit off-screen. The site's iframe always keeps a portrait-ish shape, so real players shouldn't see this. It would matter if the game is ever opened full-page in landscape. Sizing is sacred, so I didn't touch it.
- **Dead code:** `showStartingBonus` is never called, and `fireChain` is still unreachable.
- **Minor:** the harmless `willReadFrequently` console warning comes from the HUD-icon measurement bake. Adding the flag could slow the per-frame HUD draw, so I left it.
- **Needs a real device:** audio resuming after a phone call or backgrounding (fix 9), auto-pause on app switch (fix 20), and the knockback feel at 120Hz.

### Verification

- **Syntax:** all 4 inline `<script>` blocks pass `node --check` after every edit batch.
- **Browser:** Playwright + Chromium 1194 on port 4801, with Oxanium served locally and Firebase blocked. Across load, real-UI start, level-up, pause, resume, restart, victory, Maw fight to SEALED, results and TRY AGAIN, there were zero page errors and zero console errors. The only console noise is the pre-existing `willReadFrequently` warning.
- **Before/after runs against the original file** (served via route interception): legendary + Escape, multi-level offers, major-boss rewards, shrine double-tap, leaderboard from pause, death + Escape.
- **Soak run:** a bot resolved every modal while game time was jumped through 2:28, 9:50, 24:50, 29:55 and 31:58, on Meadow and Marsh with different weapons. Bosses spawned and the final horde ran. Afterwards: death → score → results → menu → second run started cleanly (queue 0, one run banked). No errors.
- **Visual sweep:** screenshots of about 27 surfaces at 412x915, 360x780, 640x718, 1920x1080 and 915x412, plus in-iframe runs at 380x426, 560x628, 640x718 and 800x820. An automated check confirmed every button and title is either on-screen or inside a scrollable container. The only failures were the landscape standalone cases flagged above.
- Scripts and screenshots are in `scratchpad/survivors/`.

---

## Neon Dig / Goldmine (`Games/neon-dig.html`): glow-up pass

I edited one file, `Games/neon-dig.html` (about +190 / -58 lines). Every added comment is tagged `V1_477`. I did not change music track data, collision code, canvas size or the sizing math.

### Fixed

| # | Sev | Category | What + why | Verified |
|---|-----|----------|------------|----------|
| 1 | HIGH | bug | **Shop items couldn't be bought on touch devices.** The `.game-container` touchstart handler called `preventDefault()` on every tap inside the container. That also blocked the tap's click on shop items, the surface UPGRADES button and the leaderboard close button, which only listen for `click`. There's now a pass-through list (`OVERLAY_TOUCH_PASSTHROUGH`) for those layers. | Playwright tap at 412x915 and in a 380x426 iframe: the original file buys nothing, the fixed file buys level 1. |
| 2 | HIGH | bug | **Pause → Leaderboard → close left the player stuck.** The game stayed paused with no overlay. In canvas-UI/iframe mode the pause button is hidden while paused, so touch players had no way back. Closing the leaderboard mid-run now brings the pause menu back. The close button also works by tap now (see #1). | Scripted in both click and tap modes. |
| 3 | HIGH | bug | **Boss-portal "← LEAVE" never worked.** `update()` stayed in the `teleporting` phase and reopened the intro on the next frame, so the player had to fight. LEAVE now ends the phase and sets the existing portal cooldown (walk 3 tiles away to re-arm it). The intro also opens once instead of rewriting its DOM every frame. | Intro inactive after LEAVE, phase `none`, cooldown set. |
| 4 | MED | balance-bug | **Shop "Hull Plating" did nothing,** because `hullCap` was never read. **Shop "Fuel Tank" only worked after a later boss Fuel Tank pick.** Buying either now recomputes `maxHull`/`maxFuel` with the same formula the boss upgrades use. | Two buys give maxHull 105 and maxFuel 105. |
| 5 | MED | balance-bug | **Legendary "Cryo Drill" could never appear.** All 4 legendaries were offered into 3 slots, so the 4th was always cut. It now draws 3 of the 4 using the existing anti-repeat weighting. | All 4 IDs seen across rolls; screenshot of the 3-card legendary screen. |
| 6 | MED | bug | **Saved mute didn't mute the music after a reload.** The button showed muted but the music played. Fixed by passing `startMuted: SFX.muted`, the same fix Brickbreaker and Snake got. | `MUSIC._dbg().muted === true` after reload. |
| 7 | MED | bug/perf | **Particles piled up with no limit.** `drawPlayer()` spawns low-fuel smoke, death smoke and low-hull sparks from `draw()`, which keeps running while paused, on the upgrade screen, behind the menu or modal, and during boss fights (which use their own particle pool). The pile then dumped out as a stale burst. Spawns now happen only while the game is actually running (`simRunning()`), and are scaled by frame time. | Original: 0 → 26 particles in 3s paused. Fixed: 1 → 1. Flat on the score modal. |
| 8 | MED | balance-bug | **Boss-arena timers counted frames, not time.** Player and boss invulnerability and the enter/exit fades used `--`, so on a 120 Hz screen the player's post-hit protection was half as long. They now use `-= deltaMultiplier`. | Invulnerability 45 → 26 after 300ms at 60 fps, as expected. Full boss fight → victory → legendary flow ran with no errors. |
| 9 | MED | bug | **Typing a leaderboard name toggled mute** (any name with an M). The P/M key handler now ignores keys typed into inputs. | Typed "MPM": mute unchanged, input value correct. |
| 10 | MED | bug | **Boss screens and timers leaked across exit/restart.** An open boss intro or victory card survived Exit Game and appeared over the next run, where BATTLE started an old-depth boss. The 1.5s victory and 1.2s upgrade timeouts could also fire into the menu or a new run. Fixes: a `runToken` guard, overlays cleared on start/exit, double-tap guards on BATTLE and TELEPORT BACK, and pause blocked while a boss card is up (the cards sit above the pause menu, so a pause there was invisible). | Scripted: overlays inactive after exit; a double TELEPORT tap gives a single upgrade selector. |
| 11 | LOW | visual | **Game-over card vanished after one frame.** "GAME OVER" / "HULL DESTROYED" was painted once and then overwritten by `draw()`, and the tilted wreck snapped upright. The canvas now holds the card until the modal and menu appear (the old deferred item). The drawing moved unchanged into `paintGameOverLayer()`, and a resize repaints it. | Screenshots: GAME OVER card, stats card, then modal. The menu backdrop is the live scene as before. |
| 12 | LOW | visual | **Mute button misplaced in canvas-UI (iframe/fullscreen) mode.** It stayed a fixed 36px box in the container corner. At 1920x1080 it floated about 400px off the playfield; on phones it was bigger than the canvas pause button. It now sits beside the canvas pause button at the same scale (never below 28px, so it stays tappable). Windowed mode goes back to the original spot. | Measured and screenshotted at 412x915, 540x600, a 560 iframe and 1920x1080. |
| 13 | LOW | visual | **Touch overlays drew on top of the pause menu.** The joystick ring (z 1000) flashed over the pause, confirm and boss cards when their buttons were tapped, and the "touch anywhere" tutorial (z 2000) sat over the pause menu. Both are now skipped or hidden. | Tap Resume: joystick stays inactive; pause screenshot is clean. |
| 14 | LOW | bug | **Gem Magnet pulled the player sideways.** A magnet pickup ran the normal dig-completion path, which snapped the player into the gem's column, sometimes through rock, and slid them into its hole. It also cancelled any dig in progress. Magnet pickups now skip the snap and slide, and the current dig is kept. | Original: x 258 → 303 plus a slide. Fixed: x unchanged and the gem is collected. |
| 15 | LOW | balance-bug | **Armor above 100% healed the player.** Stacked Titanium Hull plus the Hazard Resist shop upgrade could pass 100% damage reduction, so hazards healed hull above max. Total reduction is now capped at 90% (the limit the code already applied to the permanent part). Values under 90% are unchanged. | Checked the capped value. |
| 16 | LOW | a11y | **Pause and confirm controls weren't keyboard-reachable.** Resume / Leaderboard / Exit and Yes / No were `<div>`s. They're now `<button type="button">` with a neon `:focus-visible` ring. Existing CSS covers them, and they look the same in screenshots. | Pause-screen screenshots match; tap and click handlers still work. |

### Flagged for Kevin (not changed)

- **Standalone 16:9 desktop has no HUD.** Opening `neon-dig.html` directly at 1920x1080 leaves no height for the canvas HUD, so there are no fuel/hull bars (only the warning vignettes). The site iframe (640/718) and the site's fullscreen are fine. Fixing it means touching the sizing path, so I left it.
- **Phone standalone / Capacitor:** in fullscreen mode the canvas sits at the top of the viewport with empty space below (`.game-container` uses `justify-content: flex-start`). Worth a look if the iOS app shows the game directly.
- **Particle glows:** `drawParticles` still sets `shadowBlur` per particle for gem and explosion particles. Magnet pulls or bombs in gem-rich rock can push a few hundred uncapped particles. Baking the glow would change the look slightly, and a cap could clip a deliberate burst, so that's your call.
- **Frame-rate-dependent visuals:** the arrow bounce (`arrowBounceTime += 0.05`) and boss hit-flash still tick per drawn frame. They're cosmetic.
- **Death animation:** move and dig input is still processed during the 1s death animation. It's harmless; digs can't complete.
- **visualViewport `scroll` → `handleResize`** reallocates the canvas on every iOS scroll tick. Same finding as in the other games; it's in the sacred sizing path.
- **Canvas HUD functions leak `textBaseline`** into the next frame's world text, so in iframe mode "FUEL & REPAIR HERE" and similar text render with the leaked baseline. Your positions were tuned under that, so I left it.
- **Tutorial copy:** the Upgrades step lists "Hull capacity", but no boss upgrade raises hull (only the shop's Hull Plating does, now that it works). The step also says upgrades come from bosses, while an alien tip says "Upgrades appear every 50m depth!". Copy decision.
- **`boo-music.js`:** no bugs found from this game's side.

### Verification

- `node --check` passes on all 3 inline scripts, and there are no U+FFFD characters in the file.
- I ran headless Chromium 1194 with an eval hook injected at serve time (the file on disk has no test hook). Viewports: 412x915 (touch), 915x412, 640x718, 1920x1080, a 380x426 iframe (touch), a 560x628 iframe and 540x600.
- Flows exercised: menu, tutorial (all 8 steps), leaderboard with long names and 25 rows, start, dig, pause/resume (key, click and tap), pause → leaderboard → close, exit confirm, shop buy (click and tap), upgrade chest / boss upgrade / legendary selector, portal teleport → intro → LEAVE / BATTLE, boss fight → victory → teleport → legendary pick, death → game-over cards → score modal → skip → DIG AGAIN → restart and play.
- Zero page errors and zero console errors in every run (offline Firebase noise was filtered).
- For the pre-existing bugs, I first reproduced each one against a pristine copy of the original file and then re-ran the same test on the fixed file.

---

## Glow-up report: BOO Tower Defense (`Games/neon-tower-defense.html`)

Only this file was edited. Every change is tagged `V1_476` (72 tags). Nothing in git was touched. Music track data and `boo-music.js` were not touched.
Diff: +235 / -111 lines. About 70 of the removed lines are the targeting block, which was moved, not rewritten.
Prior audits were read first (POLISH_2026-05-29, STABILITY_2026-05-29). Nothing they covered was redone.

### Fixed

#### Balance bugs (the game was not doing what its numbers say)

1. **HIGH, balance-bug: 4 of the 15 roguelite upgrades did nothing.** Nothing ever read `poisonBonus`, `chainBonus`, `multishot` or `armorShred`.
   - **Toxic** (+X% poison damage) now multiplies the poison damage it applies.
   - **Chain Power** (+N bounce) now adds bounces, on Chain-type shots only.
   - **Multi-Shot** (+X% double shot) now gives an X% chance per projectile-tower shot to fire a second, identical bolt at the same target. The second bolt is offset 5px sideways so both show. It is counted in `incomingDamage` like any other shot.
   - **Armor Pierce**: enemies have no armor stat, so there was nothing to wire it to. It is still defined, but I flagged it `disabled` and took it out of the offer pool (`OFFERABLE_UPGRADES`). I also removed its "Armor Shred 0%" row from STATS. To re-enable it, delete the flag.
   - Verified in the browser: 2 projectiles with Multi-Shot at 100% and 1 without. A chain shot with +2 gives 5 bounces; a Blaster stays at 0. Poison 2 becomes 3 with +50%. Armor was offered 0 times in 300 rolls.
2. **HIGH, balance-bug: Lucky did about 1% of its effect.** `permUpgrades.luck` is stored as a decimal, and `generateUpgrade` divided it by 100 a second time. Fixed by converting it back to percent points.
   - Verified over 4,000 rolls at 20% luck: common 78% → 42%, epic 1.4% → 5.8%.
3. **HIGH, balance-bug and exploit: the speed button changed tower strength.** Slow, poison, inferno pools and the beam ramp all ran on `performance.now()`. At 6x speed:
   - Freeze slowed for 12 game-seconds.
   - Poison did 6x its total damage.
   - Inferno pools ticked 6x slower and the 4-pool cap throttled them.
   - The Beam's 800ms acquire time became 4.8 game-seconds.

   Fix: a new `gameClock` counts game time. It only advances while unpaused and scales with speed. Those four effects now use it.
   - At 1x nothing changes, except that effects no longer run out while the upgrade picker is open or the tab is hidden.
   - Verified: freeze lasts 2,000 game-ms at both 1x and 6x.
4. **MED, balance-bug and exploit:** enough Discount picks pushed tower cost negative, so placing a tower paid you gold. Cost is now clamped at 0 or above.
5. **MED, bug: a leprechaun reward could be lost.** If the leprechaun was the last kill of a wave, its upgrade pick and the wave-clear pick collided. The second one re-rolled the cards already on screen, so you got 1 upgrade instead of 2.
   - Fix: `showUpgradeSelector()` now queues a pick if one is already open, and shows it after you choose.
   - The leprechaun's 300ms timer also checks a per-run token. Before, it could pop over the game-over or menu screen and be picked in the next run. The stage-transition timer got the same guard.
   - Verified: 2 requests give 2 picks in a row, then the game unpauses.

#### Bugs

6. **MED:** if two enemies leaked in the same frame, `gameOver()` ran twice: a double sting and two score modals. Added a guard. Verified: 1 call.
7. **MED:** the score submit had no re-entry guard. Enter, or touchend plus click, while "Saving..." could write duplicate rows to Firestore. This is the same class as the Snake V1_196 fix. Verified: 1 row saved.
8. **MED:** in campaign mode the DOM wave display flipped from "1-3" to "3" on the first kill, because `updateHUD` overwrote it. The canvas HUD (fullscreen and iframe) showed the raw wave, which is 0 before wave 1. Both now use a shared `getWaveLabel()`.
9. **MED:** HOW TO PLAY page 6 of 10 was blank. The hidden Champions card was still counted as a step. Hidden steps are now skipped (9 pages, 9 dots).
10. **LOW:** STATS showed a percent stat at 100% or more wrong (for example +104% displayed as "+1%"). Now always scaled.
11. **LOW:** a corrupt or non-array `towerdefense_scores` in localStorage threw inside the leaderboard's catch block and left it stuck on "Loading scores...". `getLocalScores` now validates, and the save path reuses it. Leaderboard filter and sort are now safe against null docs and non-numeric fields.
12. **LOW:** after the +32 gold wave-1 bonus, the windowed-mode HUD showed the old gold until the next refresh. Lives no longer show a negative number (such as "-2") on a multi-life leak, in either HUD.
13. **LOW:** restarting did not clear `inspectedChampion`, a leftover upgrade overlay, or roll intervals. It now resets them, plus the new clock, queue and token.
14. **LOW:** the canvas speed button (fullscreen and iframe) did not set the DOM button's pink `.active` state, and both canvas buttons were silent. A tap on a canvas button while a tower was selected also started a ghost placement preview. All three fixed.

#### Visual

15. **MED: short landscape (915x412).** The UPGRADES shop overflowed, so the header and STATS/EXIT were cut off. HOW TO PLAY clipped its header, close button and Next. Both containers now have a height limit and scroll.
    - When the content fits, nothing changes (pixel-diffed).
    - Touch-drag scrolling verified: shop scrolled 235px, tutorial 62px.
16. **MED:** every splash, impact and leprechaun ring, and the Cannon's piercing streak, lasted exactly one frame, which read as a flicker. The cause: `dt` counts 60fps frames, but the code treated it as seconds (`dt*150`, `dt*1000`). They now play at the authored speed: rings grow at 150px/s, and the streak fades over its intended 400ms.
17. **LOW:** on phones the leaderboard close button was squashed into an oval with a tiny ✕, because of a padding rule. It is now a 32px circle. Also fixed a `padding-ight` typo in the leaderboard list.
18. **LOW:** shop icons didn't match the tower bar. Minigun showed ⚡ (Tesla's icon), Tesla showed 🗼, and Nova showed 💥 (the same as Bomber). They now use 🔥, ⚡ and 💫. ⚡ also got U+FE0F, because it rendered as a dark monochrome glyph on some platforms (upgrade card, stats, tower bar).
19. **LOW:** the placement preview ring used the level-0 range. It now includes the shop range level (and the buff radius level), so it matches the ring you see after placing.

#### Performance (same targets, verified)

20. The Blaster/Cannon nearest-enemy scan is merged into the targeting loop, so it is one pass instead of two. The main target, tracking, buff and Tesla scans use squared distance instead of `Math.sqrt`.
    - Checked against a reimplementation of the old algorithm: 0 mismatches in 2,000 random tower/enemy scenes, for both targets and turret angles.
21. Kills used to trigger a full HUD refresh plus a DOM pass over all 14 tower buttons each time. At 6x that was dozens of passes a second. Now it is at most one refresh per frame (`uiDirty`).
22. The Inferno tower no longer makes 2 new arrays per tower per frame.

#### Accessibility

23. Added a themed `button:focus-visible` cyan ring that matches the main site. It only shows for keyboard navigation.

### Flagged for Kevin (not changed)

- **Frame-rate quantization of fire rate.** After firing, a tower's timer resets to the current frame instead of carrying over the leftover time. At 60Hz:
  - The Minigun (120ms) actually fires every 133ms.
  - At 6x, an interval shorter than one frame is capped at one shot per frame, so fast towers lose a lot of DPS at high speed and on 60Hz displays compared with 120Hz.
  - Fixing this (carry the remainder over, or allow several shots per frame) changes baseline DPS at 1x, so it needs a feel test.
- **Doomed-target cooldown.** If a tower's best target is already "doomed" by shots in flight, `fireProjectile` returns but the cooldown is spent anyway. The tower idles instead of picking another target. A projectile that misses keeps its target "doomed" until it leaves the screen. Changing this changes targeting.
- **Discount has no cap.** It is clamped so towers can't pay you, but more than 100% stacking still makes towers free. Consider a cap (for example 60-75%).
- **Leprechaun slowdown** restores the pre-slowdown speed on death or escape. This overrides any speed change the player made in the meantime.
- **Armor Pierce:** implement a mechanic (for example "+X% damage to tank/boss/megaboss") or remove it. It is currently parked, out of the pool.
- **Tutorial copy:** it says "Tap placed towers to upgrade" (upgrades are in the UPGRADES shop; tapping a tower inspects or moves it). It also leaves out Rail Gun and Nova.
- **Game-over "Towers Built"** in campaign only counts the current stage, because towers are cleared at every stage.
- **START/END markers** overhang the canvas edge by about 7px (the outer ring is clipped). Left alone because it is a long-standing look.
- **Mute button** (fixed at 8,8) can overlap the START marker on maps whose entry is near the top-left (for example Map 19) in the iframe.
- **Cannon streak (item 16)** is the most visible change: a violet tracer across the map that fades over 400ms. That is what the code intended. To go back to the flash, revert the one `updateRailgunLines` line.
- **Game-clock change (item 3):** high-speed play is now a true time-scale. Freeze and poison are weaker at 2-6x than they were, and Beam and Inferno are stronger. The leaderboard meta may shift. Everything is keyed off one variable (`gameClock`) if you want it reverted.
- Pre-existing, unchanged: `visualViewport` scroll triggers a full canvas reallocation with no debounce. This is the same item flagged for Survivors and Snake.

### Verification

- `node --check` on both inline scripts passes.
- Served on :4803 and driven with headless Chromium 1194 using throwaway Playwright scripts in `scratchpad/td/`.
- **Screenshots, before and after:** menu, mode select, game, tower select, wave, upgrade picker, shop, stats, leaderboard, score modal, game over and tutorial. Viewports: 412x915, 640x718, 1920x1080 and 915x412, each both standalone and inside an iframe (the site's 640/718 embed).
  - 0 console or page errors (offline Firebase requests excluded).
  - Static screens are pixel-identical before and after (menu, game over). Game-screen differences are only the animated arrows, the Tesla icon and the canvas wave label.
- **Real UI flows:**
  - START → mode → place towers → START WAVE → CONFIRM → the wave runs (splash rings visible mid-wave) → 6x → wave clear → upgrade picker → pick → EXIT → confirm → menu → campaign restart. State was clean after restart (gold 65, lives 20, wave 0, clock reset).
  - Natural game over: no towers, auto-picked upgrades. One sting, one score modal, lives shown as 0, wave label "1-1". Double Enter on submit saved 1 score. PLAY AGAIN resets everything.
- **Mechanics probes** (results in items 1-11, 20): upgrades, luck distribution, slow duration at 1x vs 6x, upgrade queue, targeting equivalence, corrupt localStorage.

---

## BOO Brickbreaker: glow-up audit report

File: `Games/neon-brickbreaker.html` (the only file edited). Every change carries a `V1_471` comment (34 tags). I did not touch git state. The V1_162 guard that test 21 checks for (`if (gameRunning) return` in `startGame`) is still in place.

### Fixed

| # | Severity | Category | What and why | How verified |
|---|----------|----------|--------------|--------------|
| 1 | HIGH | Input / leaderboard | **You could not type the letters A or D in the leaderboard name box.** The document-level `keydown` handler (paddle A/D and arrow keys) called `preventDefault()` even while the name input had focus. Typing "Dada ad" came out as " ". The handler now returns early when the target is an INPUT or TEXTAREA. This also stops Escape from running `hideScoreModal()` twice. | Playwright typing test. Original: `" "`. Fixed: `"Dada ad"` at 1920x1080, 640x718 and 412x915. |
| 2 | HIGH | Balance (broken state) | **Stacking Slower Ball could break the game.** Each pick is -8% with no cap. At 13 or more stacks the speed multiplier drops to 0 or below: the ball either freezes or launches straight down, and every serve costs a life. Total reduction is now capped at 80% (10 stacks) with `SPEED_REDUCTION_CAP`, and Slower Ball stops being offered once you reach the cap. Nothing changes below the cap. | With `speedReduction = 104`, the original gives speed -0.23 and a downward launch. Fixed gives exactly 20% of the template speed. 40% still gives 60%. |
| 3 | MED | Balance / power-ups | **The paddle could stay huge or tiny for the rest of a level.** When a power-up expired, the paddle went back to the width saved at pickup. If Huge Paddle overlapped the skull debuff, or two Huge Paddles overlapped, it restored an out-of-date width. New `paddleRestWidth()` works out the width on expiry: level base plus permanent bonus, times whichever size effect is still running. With a single power-up the result is exactly the old saved width. | Original: big then skull ends at 218px, double big ends at 445px. Fixed: both end at the 107px base. |
| 4 | MED | Correctness | **Game over could fire more than once.** Boss rows land at the same moment, and `moveBosses` used `forEach`, so it took one life *per boss* (lives went to -2) and ran `gameOver()` again each time. That meant 3 game-over sounds and 3 score-modal timers. Fixes: `for…break` in `moveBosses`, plus a re-entry guard in `gameOver()`. | Original: n=3, lives=-2. Fixed: n=1, lives=0, and the modal still appears. |
| 5 | MED | Physics (frame hitches) | **The ball could pass straight through the paddle.** On a long frame step (a hitch, 30 fps, or fast late levels, with delta allowed up to 3x) the ball could jump right over the 11px paddle. I added a swept test: a downward ball whose bottom crossed `paddle.y` during this step also counts as a hit. It only adds hits the old overlap test missed. | A 36px step over the paddle: original lets the ball through (dy stays +18). Fixed bounces it. Deterministic 60 Hz run over about 10 minutes of game time (3,529 samples, several levels and boss phases, seeded RNG): trace identical to the original. |
| 6 | MED | Audio | **A saved mute did not mute the music after a reload.** The HUD showed 🔇 but the music played. The fix passes `startMuted: SFX.muted` to `createBooMusic`. Another agent also added an `SFX.muted` fallback inside `boo-music.js`; the two work together. | Mute saved, then reload: original music muted=false, fixed muted=true. |
| 7 | MED | Leaderboard integrity | **One name could be saved twice.** Submitting twice (Enter plus tap, or Enter twice) could write duplicate rows. `submitScore` now ignores calls while a save is in progress or after the modal has closed. | Two synchronous `submitScore()` calls: original saved 2 rows, fixed saves 1. |
| 8 | LOW-MED | Robustness | **Bad saved scores froze the leaderboard.** If localStorage held valid JSON of the wrong shape (`{}`, or `[null, …]`), the leaderboard threw an error and stayed on "Loading scores...". `getLocalScores()` now returns only an array of objects, and `saveLocalScore` goes through it. `getScoreRank` converts scores to numbers with `Number()`, so a bad document can't skew the "YOU'RE #1 / TOP 10" title (this was flagged in the earlier polish audit). | Original: TypeError (`scores.forEach is not a function`, and a null `.name`). Fixed: shows the empty board, or only the valid rows. |
| 9 | LOW-MED | Timing | **Switching tabs cleared active power-ups.** Power-up timers used the raw time gap, so after a hidden tab every timer expired at once, even though the ball had frozen. Immunity also drained during the life-lost pause. Timers now use game time capped like `deltaMultiplier` (3 frames = 50 ms) through `powerUpDeltaMs()`. Identical at 60 Hz. | A 30 s gap: original crusher ends at -22 s. Fixed loses only 0.05 s. The 60 Hz parity trace is identical. |
| 10 | LOW-MED | Boss visuals / collision | **From level 13 on, bosses overlapped after a life was lost.** `resetBossPositions` re-spaced every live boss evenly in a single row at y=50 (653px / 14+ bosses is less than the 50px boss width), which also merged their hitboxes. Bosses in the level 10+ formation now remember their spawn slot (`homeX/homeY`) and go back to it. Levels 1–9 are unchanged. | Level 14 reset: original 12 overlapping pairs, fixed 0. At level 3, y is still 50 and no home slot is set. |
| 11 | LOW | Timers | **Stray balls from Multi-Launch.** Its staggered `setTimeout` launches could fire after a newer serve, or into a frozen life-lost or stage-clear screen, where they showed up as stuck balls. A serve counter plus a pause check now drops those launches. | Code review, and the normal flow still works (probe). |
| 12 | LOW | Input | Releasing one arrow key while holding the other stopped the paddle. It now falls back to the key still held (the last key pressed still wins). Window `blur` clears held keys, so the paddle no longer slides when a keyup is missed. | Right+Left down, release Left: original dx=0, fixed dx=+8. Blur: dx=0. |
| 13 | LOW | 120 Hz (visual) | Boss-death particle drag was a flat 0.98 per frame, which is twice the drag at 120 Hz. It is now `0.98^deltaMultiplier`. Identical at 60 Hz. | 60 Hz parity identical. |
| 14 | LOW | Accessibility | You can now pick an upgrade with keys **1 / 2 / 3**. Escape closes How to Play. Neon `:focus-visible` rings are on menu, score, tutorial and close buttons (matching the site's V1_151). `aria-label`s are on both ✕ buttons, the canvas has a `role="img"` label, and the name `<label>` is linked to its input. | Key 2 selects slot 2. Keyboard Tab → Enter → Escape opens and closes the tutorial. Focus ring checked in a screenshot. |
| 15 | LOW | Layout | The score modal now uses `justify-content: safe center` plus `overflow-y: auto`, so on very short windows the title can't be pushed above the top edge. At normal sizes it looks the same. | 700x300 window: title and buttons both inside the viewport. |

### Flagged for Kevin (not changed)

- **The 80% Slower Ball cap (fix 2) is a number I picked.** It only prevents the broken state. If you want a lower cap (Slower Ball is very strong long before 10 stacks), that's a tuning call.
- **Level 10 spawns 9 bosses, not 10.** The top row can only fit 9 bosses inside the 10px margins, so the 10th only appears from level 11, in the second row. Changing this would change difficulty, so I left it.
- **Stacked Huge Paddle:** a second Huge Paddle while one is active multiplies again (107 → 218 → 445px). The expiry bug is fixed; the stacking itself matches the tutorial's "Power-ups stack!", so it's your call.
- **Tutorial text is inaccurate.** "Every few levels, bosses appear" — they actually appear every level (level N has N bosses). "Defeat them to earn… a legendary upgrade" — legendary upgrades only come every 5th level. The "Huge Paddle+" card says "duration+" and doesn't mention that it is +8s.
- **No pause button or auto-pause.** When the tab is hidden, rAF freezes the game (and power-up timers are now frozen too). But if the player scrolls to another section of the site, the same-origin iframe keeps running. Adding a pause overlay would be a feature (the earlier audit's Round 2).
- **Bricks can still be skipped at extreme speeds.** The brick hit zone is 30px, so a ball can skip a brick only at level 25+ combined with a frame hitch. Only the paddle got the swept test.
- **120 Hz visuals:** the ball trail is half as long, and the ball and paddle colour fades run twice as fast. Game speed and balance are already delta-scaled and correct.
- **The score modal waits for the Firestore rank query before it appears.** On a slow network it can show up late. A score of 0 on an empty board shows "YOU'RE #1".
- **Mobile upgrade cards:** at the 100x145 size used on phones, the Magnet Paddle card (2-line name plus 4-line description) fits with almost no room. A longer description would clip.
- **Standalone (not iframed) phone view:** the canvas sits at the top with black space below. The site's iframe path is fine. I left it because aspect and sizing are "sacred".
- **Touch scrolling of the score modal** is blocked by the document `touchmove` guard. This only matters if the modal ever overflows on a tiny touch screen.
- Leftover CSS for the removed DOM HUD (`.hud`, `.trackpad-zone`, `.power-up-timers`…) is dead code, but I left it alone because the rules say not to clean up code outside the requested scope. Leaderboard spoofing (App Check) is still an open infrastructure decision.
- **Other games:** none of them passed `startMuted` to the shared engine. Another agent's fallback in `boo-music.js` now covers all of them.

### Verification

- Server: `python3 -m http.server 4804`, headless Chromium 1194. Scripts are in `scratchpad/bb/` (`probe.js`, `fixes.js`, `fixes_orig.js`, `parity.js`, `visual.js`).
- `probe.js` at 1920x1080, 640x718 and 412x915 (touch, DPR 2.6): menu → tutorial → start → instruction dismissed → play → upgrade overlay → legendary overlay → game over → score modal → typing → leaderboard → restart. **Zero console or page errors** (offline Firebase and Google Fonts errors filtered out). Restart state resets cleanly (lives 3, level 1, score 0, 1 ball).
- `fixes.js`: all 16 checks PASS on the fixed file. The same checks on the original (`fixes_orig.js`) FAIL on 15 of 16, which confirms each bug was real; the one that passes is "score modal shown", a control check.
- `parity.js`: seeded RNG, synthetic 16.667 ms frames, an auto-paddle bot, about 10 minutes of game time across several levels and boss phases. The original and fixed traces are **identical** (firstDiff = -1), so the 60 Hz feel is unchanged.
- Screenshots were reviewed for menu, tutorial, play, upgrade, legendary, modal, leaderboard, focus ring and the short-window modal. The only visual differences: keyboard focus rings (keyboard users only), and the score modal on windows too short to fit it.

---

## Glow-up audit: Snake Racing + Clyde's Big Jump

Files edited (only these two): `Games/neon-snake.html` (+138/-22 approx.), `Games/clydes-big-jump.html` (+71). All added comments are tagged `V1_472/V1_473`. Music track data and gameplay constants are untouched. Nothing was committed.

Verification harness: Playwright + Chromium, served from `python3 -m http.server 4805`. Scripts are in `scratchpad/snake-clyde/`: `s1-s4.js` and `fr.js` for Snake, `c1-c4.js` for Clyde. Pre-fix copies are saved as `orig-*.html` there, and the `c4.js`/`s4.js`/`fr.js` runs compared original against fixed. I tested four layouts: a 560x628 iframe (the site's 1080p arcade size), 412x915 as a mobile device, 375x667 as a mobile device, and 1920x1080 direct.

---

### Snake Racing (`Games/neon-snake.html`)

#### Fixed

| # | Severity | Category | What + why | Verified |
|---|---|---|---|---|
| 1 | **HIGH** | Crash | **The game crashed at boot on small standalone windows.** Here "small" means both sides are 736px or less and the page is not in an iframe, for example an iPhone SE at 375x667. In `calculateScale()`'s non-fullscreen branch, a later `const isMobile` shadowed the outer `isMobile` for the whole block. The earlier `if (isMobile)` then threw a TDZ ReferenceError during the first `calculateScale()`. The script stopped there, so no listeners were bound and START did nothing. Fix: renamed the inner variable to `isMobileUI`. | Original gives the pageerror "Cannot access 'isMobile' before initialization" and the game never runs. Fixed version boots and plays at 375x667 and 640x718 standalone. |
| 2 | **HIGH** | Z-index | **HOW TO PLAY opened invisibly.** `.tutorial-overlay` had z-index 700, below the menu overlay's 2000, so it drew behind the menu. Raised it to 2100, which is still below the power-up picker (9000) and the modals (10000+). | Screenshot before the fix shows the tutorial behind the menu. After the fix, `elementFromPoint` hits the tutorial. |
| 3 | **HIGH** | Input | **Space and Enter started a run from anywhere.** Pressing Enter in the name field to submit also started a new game. That game ran hidden under the menu, and the pending 2s timer then dropped the menu over it. Space on the menu started the game without hiding the menu. Now keyboard start only works from the visible menu: never while typing, and never with the modal, leaderboard or tutorial open. It also hides the menu and calls `preventDefault` so a focused button doesn't fire too. | `s4.js`: original leaves `menuHidden=false` after Space, and `running=true` after pressing Enter in the name field. Fixed version: menu hides, and Enter-submit does not start a run. |
| 4 | MED | State | **The menu-return timer was never cancelled.** Skipping the modal and pressing PLAY AGAIN within 2s meant the menu dropped over the new run. The timer is now tracked, cleared in `startGame()`, and guarded with `if (gameRunning) return`. | Restart at 0.2s: after 2.2s the menu is still hidden. |
| 5 | MED | State | **Eating the orb and dying in the same tick left the power-up picker open over the menu.** A pick made after death could even add score. `gameOver()` now closes the picker and clears its roll intervals and the pause flag. | `showPowerupSelector(); gameOver()` leaves the overlay closed and `powerupPaused=false`. |
| 6 | MED | Balance bug | **Power-up timers kept running during the frozen pick screen.** An active power-up lost 2-3s of its duration to the slot roll. The power-up just chosen lost the 600ms close animation. Enemy respawn and spawn timers also elapsed, so enemies appeared the moment play resumed. The new `shiftTimersForPause()` pushes timers set before the pause forward by the pause length. Timers started during the pause (the chosen power-up) start counting at resume. Durations are unchanged. | Ghost mode activated, then a 2.5s pick: before the fix about 2.2s remained, now about 4.8s of 5s remains. |
| 7 | MED | Frame rate | **The game ran about 5% faster on 120/144Hz displays, and 4% faster at 75Hz.** The `elapsed >= speed` check was quantised to the display's frame length. The tick is now the 60Hz-quantised interval on every display, which is exactly what 60Hz always played (for example, speed 158 gives 166.7ms). An accumulator keeps odd refresh rates correct on average, and the loop resyncs after a stall. | `fr.js` with rAF polyfills, mean tick in ms. Original: 60Hz 166.7 / 120Hz 158.4 / 144Hz 159.6 / 75Hz 160.0. Fixed: 166.7 / 166.8 / 166.8 / 166.6. |
| 8 | MED | Visual | **The power-up timer pill covered both the SCORE and HIGH values** on narrow layouts (the site iframe and phones). It now sits just above the controls row when the layout is fullscreen/iframe and at most 700px wide. On small standalone layouts it drops over the "Swipe to move" hint line. Wide layouts are unchanged. | Screenshots at 560, 412 and 375 wide, before and after. |
| 9 | MED | Audio | **A saved mute did not mute the music after a reload** (the icon showed muted but music played). The fix passes `startMuted: SFX.muted` to `createBooMusic`. | `MUSIC._dbg().muted === true` after reloading with `snake_muted=1`. |
| 10 | LOW | Robustness | Score modal: the rank lookup is capped at 3s. Before, a stalled Firestore connection held the modal back indefinitely. The modal is skipped if a new run has already started. It also resets the Submit label (a hung earlier save could leave "Saving..."). A submit token stops a late earlier save from closing a newer modal. | Code review. The offline path was exercised. |
| 11 | LOW | Robustness | Corrupt `snake_scores` in localStorage (valid JSON but not an array) crashed the leaderboard render and rank check with an unhandled rejection. `getLocalScores()` now checks for an array and filters out non-object entries. Rank values are converted with `Number()`. | `{"a":1}` now shows the "No scores yet" state. Malformed rows render with no `undefined` or `NaN`. |
| 12 | LOW | Visual | A resize mid-run (for example the mobile URL bar showing or hiding) cleared the canvas until the next tick, a flicker of up to ~170ms. `calculateScale()` now always redraws. | Code review; draw is a pure render. |
| 13 | LOW | Visual | Regular food could spawn on the power-up orb and hide it. `spawnFood()` now avoids the orb's cell. | Code review. |
| 14 | LOW | a11y | Escape now closes the tutorial and the leaderboard. | Tested. |

#### Flagged for Kevin (not changed)
- **Enemy speed is set by the player's tick rate, not `ENEMY_SPEED`.** Enemies only move on player ticks, so the 171ms setting actually means one move every 2 player ticks, about 333ms at the start. Side effects:
  - **Speed Boost makes enemies faster too** (333ms becomes about 200ms).
  - **Slow Motion is about 1.5x slower, not the 2x the card says.**

  Fixing this changes the game's feel (enemies would be about 2x faster), so it's your call.
- **Self-collision counts the tail cell that is moving away.** Chasing your own tail tip kills you. Standard snake allows this move. It's a rules choice, so I left it.
- On wide desktop layouts (such as 1920x1080 direct), the absolute controls bar overlaps part of the bottom grid row. It's semi-transparent, and it predates this pass.
- At 560px, "PLAY AGAIN" wraps inside the 100px `#startBtn`. It's only visible for about 2s behind the modal, then the menu covers it.
- The score modal appears even for a score of 0. Clyde does the same.
- Snake doesn't implement the site's `boo-arcade` postMessage bridge (pane pause/mute in fullscreen). Only Dig and Survivors do.
- Canvas animations (orb colour cycle, spawn and kill flashes) only redraw on game ticks, so they animate at about 6-10fps. Smoothing them would change the look and cost, so I left it.

---

### Clyde's Big Jump (`Games/clydes-big-jump.html`)

#### Fixed

| # | Severity | Category | What + why | Verified |
|---|---|---|---|---|
| 1 | **HIGH** | Visual | **The V1_190 death beat never rendered.** On the death frame, the loop switched straight to `drawMenuBackground()`, so Clyde and the mushrooms vanished into an empty grid for 450ms. The screen-shake was never seen. A `deathBeat` flag now keeps drawing the frozen scene with the shake until the modal appears. Clyde no longer snaps to his idle bob position during the beat. With reduced motion there's no shake, just the frozen frame. | Screenshot 100ms after death: before, an empty grid; after, Clyde crashed into the mushroom, with the shake offset. |
| 2 | **HIGH** | Input | **Space in the name field, with the modal or leaderboard open, or during the death beat restarted the run hidden behind the overlay.** In the death-beat case, the modal then popped up mid-countdown. Space now only restarts from the visible game-over screen. | `c4.js`: original state after Space in the name field was `loading` with the modal open. Fixed: stays `gameover`. |
| 3 | **HIGH** | Input | **Faded-out menus kept their buttons focusable.** After clicking START with the mouse, pressing Enter mid-run "clicked" the invisible START button and restarted the game. `.overlay.hidden` now also sets `visibility:hidden`, applied only after the 0.3s opacity fade, so the fade itself is identical. | `c4.js`: original went from `playing` to `loading` on Enter. Fixed: stays `playing`, and focus is released. |
| 4 | MED | Correctness | `submitScore` had no re-entry guard, unlike Snake's V1_196 fix. A repeated Enter or tap could write duplicate Firestore rows. I added the same `disabled` guard. A hung earlier save could also leave Submit permanently disabled and reading "Saving...". `showScoreModal` now resets it, and a submit token stops a late save from closing a newer modal. | Double Enter saves exactly one local row. |
| 5 | MED | State | Clicking START and pressing Space together started two loading chains. `showLoadingScreen()` is now idempotent. | Click + Space gives a single `loading`. |
| 6 | MED | Visual | The longest thought bubbles ("I must be getting closer to the lake!") are wider than the 400px field and were clipped off the left edge. Only those thoughts are shrunk to fit; short ones stay 24px. | Screenshot before and after. |
| 7 | MED | Audio | A saved mute did not mute the music after a reload. Same fix as Snake: `startMuted: SFX.muted`. | `MUSIC._dbg().muted === true`. |
| 8 | LOW | Robustness | The rank lookup is capped at 3s. A stalled connection used to leave the player on a blank screen with no modal. Rank values are converted with `Number()`. `getLocalScores()` checks for an array. Leaderboard names fall back to `'???'` instead of the literal "undefined". | Malformed local rows render with no `undefined` or `NaN`. |
| 9 | LOW | Frame rate (cosmetic) | The death-shake and ear-flap decays were applied per frame, so they finished twice as fast at 120Hz. They are now dt-scaled, which is identical at 60Hz. Physics was already dt-normalised and is untouched. | Code review. |
| 10 | LOW | a11y | Escape closes the leaderboard. The icon-only close button gets `type="button"` and `aria-label`. | Tested. |

#### Flagged for Kevin (not changed)
- Physics is dt-integrated, so the jump apex is about 2% higher at 120Hz than at 60Hz. A fixed 60Hz step would make it exact, but it would render at 60fps or need interpolation. Not worth the risk, in my view.
- Flap is bound to `click`, which fires on mouse release. `mousedown` would feel about 100ms snappier on desktop, but that's a feel change.
- These items from the 2026-05-28 audit are still pending:
  - no pause or `visibilitychange` auto-pause
  - particles are off on mobile
  - `.menu-btn` touch target is under 44px
  - the 1.5s loading screen doesn't actually load anything
  - dead `GameDebug`
- There's no `boo-arcade` postMessage bridge, the same as Snake.

---

### Verification (final pass, both games)
- **Snake**: `s3.js` passed 16/16 checks: tutorial, Escape, Space-start, pause timer shift, death closing the picker, Enter handling, fast restart, menu return, a single local save, corrupt storage, malformed rows, saved mute, and SE boot. `fr.js` shows the tick is refresh-rate independent. There were zero page errors in all layouts; the only console errors are the expected blocked-network ones for gstatic and fonts.
- **Clyde**: `c3.js` passed 13/13 checks: intro to start, a single loading chain, Enter mid-run, the death beat, Space during the beat, modal and leaderboard, a single save, Space on game-over restarting, malformed rows, and saved mute. Screenshots cover intro, start, countdown, play, death and modal. Zero page errors.
- Start, play, game-over and restart all work in both games at 560x628 in an iframe, 412x915, 375x667 (Snake) and 1920x1080 / 800x900.
- **Not verified**: real 120Hz hardware (simulated with rAF polyfills), real iOS Safari, and live Firestore (offline only).
- No bugs found in `Games/boo-music.js`. Note that no game passes `startMuted`, so the same saved-mute bug probably exists in the other four games that use the shared engine.

---

## Glow-up report: `Games/neon-space-shooter.html` + `Games/boo-music.js`

Only these two files were edited. Every added comment is tagged `V1_474/V1_475`. I did not touch git.
Test 21 still passes: the `gameLoopStarted` V1_162 guard is intact, 3 occurrences.

---

### 1. `Games/neon-space-shooter.html`

#### Fixed

| # | Severity | Category | What was wrong and why it matters | How it was verified |
|---|---|---|---|---|
| 1 | **HIGH** | Balance: frame-rate dependence | This was the open item from STABILITY_2026-05-29. Every position, velocity, animation phase and decay moved a fixed amount per frame, so the game ran about 2x speed at 120Hz and 2.4x at 144Hz. Wall-clock timers (spawn, fire rate, AOE telegraph) did not speed up, which changed the difficulty balance. I scaled all per-frame motion by `dt = deltaTime / (1000/60)`. `dt` is 1 at 60Hz, and the existing 50ms clamp caps it at 3. Scaled: player keyboard movement, the mouse-follow lerp (`1-(1-k)^dt`), engine/thruster phase, bullets (y, vx, phase), hunter descent, hunter tracking lerp and wobble, regular enemy fall/wobble/sway, enemy plasma, boss entry, boss strafe, boss phase, boss orbs, damage numbers (y, gravity, fade), particles (velocity, drag `0.96^dt`, decay, shrink `0.97^dt`), and the starfield on both the game and start screens. The bullet trail is sampled about 60 times a second, so its 8-point length stays the same on screen at 120Hz. Wall-clock timers were already frame-rate independent and are unchanged. | Playwright with a virtual clock and manual rAF, seeded `Math.random`, same inputs. **Original vs patched at 60Hz: bit-identical state** for the whole world (player, stars, enemies, bullets, particles, projectiles, score) in the basic and mouse scenarios. In the boss scenario the boss entry finishes one frame later at 60Hz. That comes from float accumulation of `dt≈0.9999999` in synthetic timestamps; real vsync timestamps jitter more than that. **Patched, 60 vs 120 vs 144Hz after 6s:** player x 235 / 235 / 234.6 (original: 235 / 25 / 5). Enemy y within 0.75px. Boss x within 0.5px. **Median time for a drone to cross the screen over 25s:** original 13.75s / 6.9s / 5.7s at 60/120/144Hz; patched 13.75s / 13.74s / 13.74s. Spawn counts match. |
| 2 | **HIGH** | Correctness: boss wave | The wave timer that starts a boss had already expired, and `defeatBoss()` did not stop it. So on the frame after a boss died on wave 3/6/9, `checkWaveTimer()` started **a second boss** (355 HP). 500ms later the upgrade screen opened over the live boss. After the upgrade, wave 4 began with that boss still active. Fix: a `bossRewardPending` flag holds the wave timer until the delayed upgrade screen opens. The timeout also does nothing if the player died or restarted in the meantime. | Reproduced on the original: a new boss object right after the kill, then `gameState: upgrading` with the boss alive. Patched: no boss, upgrade screen opens, wave advances. A real-time run through waves 1 to 5, including a boss kill, was clean. |
| 3 | **MED** | Correctness: uncaught exception | `defeatBoss()` sets `boss = null` inside the `bullets.filter` in `updateBoss`. Every later bullet then called `rectCollision(b, null)` and threw `TypeError`. Some bullet is almost always in flight, so in practice this happened on nearly every boss kill. It aborted that frame's update and draw and put an error in the console (App Review). Fix: `if (boss && rectCollision(...))`. | Original throws `Cannot read properties of null (reading 'x')` with 2 bullets in flight at the kill. Patched: no page errors. |
| 4 | **MED** | Exploit: wave timer | The wave timer runs on the wall clock, but rAF stops in a hidden tab. Tabbing away for 30s mid-wave came back to an instant wave clear and a free upgrade without surviving. Now any frame gap longer than 50ms (hidden tab, app switch, long stall) is taken off the wave timer. Only the part of the gap after the wave started counts, so a wave that starts during a hidden gap is not over-extended. | Original: `upgrading` after a 35s gap. Patched: still `playing` on wave 1. Edge case (wave started halfway through a hidden gap): elapsed time is 0, not negative. |
| 5 | MED | Correctness: resize/fullscreen | The ship's y was fixed at spawn. Leaving fullscreen or rotating mid-run (1920x1080 to 630x900: canvas height 1068 to 888) left the ship at y=958, **below the canvas**: invisible, and enemies could no longer reach it. `resizeCanvas()` now re-anchors the ship (size, y = H-110, x rescaled and clamped) and rescales the stars. A `resizeCanvas.stateReady` guard avoids the TDZ error on the first resize, which runs before the game-state `let`s are declared. | Original: y 958 with H 888. Patched: y 778, screenshot shows the ship in place. |
| 6 | MED | Correctness: game over | Two hits in one frame (for example an orb and the AOE, or a projectile and a ram) called `endGame()` twice: two gameover SFX and the modal reopened. Also, if the player died on the frame the wave expired, `checkWaveTimer` could switch `gameState` to `upgrading` over the game-over screen. Added re-entry guards to `endGame()` and `checkWaveTimer()`. | Original: gameover SFX ×2. Patched: ×1. |
| 7 | MED | Leaderboard: duplicate rows | `submitScore` had no re-entry guard. Pressing Enter and then clicking Submit (or pressing Enter twice) during the Firestore await wrote duplicate rows. This is the same bug fixed in Snake in V1_196. Added `if (submitScoreBtn.disabled) return;`. | Enter followed by a click saves exactly 1 row. |
| 8 | LOW | Robustness | Wrapped `localStorage` `playerName` get/set in try/catch, because an iOS WebView or blocked storage used to break the score modal and submit. `getLocalScores()` now rejects non-array JSON, and `saveLocalScore` reuses it. `renderLeaderboard` skips null or non-object docs and never prints `undefined` for a missing name. | 30-row local board with a `null` name renders cleanly (phone and desktop screenshots). |
| 9 | LOW | Input | A `keyup` lost to a focus change (clicking into the parent page, alt-tab while holding an arrow) left the ship drifting. `blur` now clears `keys` and the touch flags. | Code review; no errors. |
| 10 | LOW | Timing hygiene | `lastTime` is now updated while the game is not playing, so the first frame after the upgrade screen is a normal frame instead of a clamped 50ms (dt=3) jump. `deltaTime` has a floor of 0, because the first rAF timestamp can be earlier than `startGame()`'s `performance.now()`. | Harness shows no negative or jump frames. |
| 11 | LOW | Visual: overlap | On touch layouts the WAVE / SCORE HUD (bottom 18px) sat on top of the right d-pad button. When the touch bar is shown (`hover: none`) the HUD now sits just above it: 116px, or 96px under the compact ≤550px-tall bar. | 412x915 touch screenshot: HUD sits cleanly above the bar. Desktop and the 630x900 iframe are unchanged (the bar is hidden there). |
| 12 | LOW | Visual: overlap | On short windows (landscape phones, ≤550px tall) the absolutely positioned controls hint wrapped up into the LEADER BOARD button. It now flows under the menu in that media block only. | 915x412 before/after screenshots. |
| 13 | LOW | UX / audio | The mute button (z-index 60) sat under the start and game-over overlays (z-index 100), so the title theme could not be muted from the menu. Raised it to z-index 150, which is still below the upgrade overlay (500) and the modals (2000). Also passed `startMuted: SFX.muted` to `createBooMusic`, so a saved mute now silences the music after a reload (see boo-music fix 1). | Screenshots: the button is visible and on top of the start overlay. `MUSIC._dbg().muted === true` after reloading with `spaceshooter_muted=1`. |

#### Flagged for Kevin (not changed)

- **Difficulty depends on viewport size.** In the arcade iframe (630x900) and in fullscreen the game uses "pseudo-fullscreen" and grows the play field (592x888 in the iframe, 712x1068 at 1920x1080). Player and bullet sizes scale with it, but speeds do not, and enemy and boss sizes do not either. A bigger screen means slower relative enemies and smaller targets. Fixing it means scaling speeds and enemy sizes by `CONFIG.scale`, which changes how the game feels today, so that's your call.
- **Health bar hidden under the touch bar.** The canvas health bar (H-28) and wave-timer bar (H-10) are drawn under the touch-control bar's 0.95-black gradient on phones, so they are barely visible. The ship also sits inside that 110px band. Moving these is a layout choice (raise the bars, or lighten the gradient).
- **Timers keep running during the upgrade screen.** Wall-clock cooldowns (hunter fire, boss orb/AOE cooldown, invincibility) run on `performance.now()` and are not paused by the upgrade screen, so an invincibility window can expire while you are choosing. This is intentional or harmless today. A single game-clock refactor would make it pause-consistent.
- The game is still hidden in `index.html` (its pill is commented out), so none of this is visible on the live site until you re-enable it.

---

### 2. `Games/boo-music.js` (shared engine; API and track data untouched)

#### Fixed

| # | Severity | Category | What was wrong and why it matters | How it was verified |
|---|---|---|---|---|
| 1 | **HIGH** | Mute logic | `createBooMusic` read only `cfg.startMuted`, and no game passed it. So in all 6 games a saved mute showed 🔇 while the music kept playing after a reload. The Survivors engine this was ported from seeds `muted = SFX.muted`. Now, when `startMuted` is omitted, the engine falls back to `window.SFX.muted` (every host sets `window.SFX` before creating the engine). An explicit `startMuted` still wins. The Snake, Brickbreaker and Clyde's agents independently added `startMuted: SFX.muted`; this fallback also covers Dig and Tower Defense. | Playwright with the saved mute set in all 6 games. Original: Dig and TD had `muted:false` and gain 0.14–0.16 (audible). Patched: all 6 have `muted:true` and gain about 0. |
| 2 | MED | Scheduling | While muted, in a throttled background tab (1 tick per second or less) or after a long stall, `nextTime` fell behind the audio clock. The lookahead loop then scheduled **every missed step in the past at once**, so dozens of notes fired together (a burst) on unmute or on return. Stale steps (more than 100ms late) are now walked silently. Bar, rotation and `once` logic still run, so the song position stays on the grid. In normal play `nextTime` is always ahead of the clock (240ms lookahead, 90ms tick), so the sound is unchanged. | Unmuting after 4s muted, oscillators created on the first tick. **Original:** 33 / 72 / 21 / 25 / 21 / 27 (snake / brickbreaker / dig / TD / clyde / shooter). **Patched:** 4 / 7 / 2 / 4 / 2 / 5, the same as the steady rate. The steady-state oscillators per second are identical to the original in every game. The step position after resuming is identical (step 58 vs 58), so the timeline is preserved. |
| 3 | LOW | Suspended context | `unlock()` resumed only `'suspended'`. iOS Safari reports `'interrupted'` after a call or Siri. It now resumes both. | Code review. |

#### Audited and found clean (no change)

- **Node lifetime:** every oscillator and buffer source is `start`ed and `stop`ped with a short tail. The echo delay/feedback, duck low-pass, channel gains, PeriodicWaves and noise buffer are created once and reused. There is no per-note leak and no echo node to disconnect.
- **Track data:** validated in-browser for all 6 games. Every bar is exactly 16 steps, every token parses (`[A-G]#?\d`), bar counts match `bars`, there are no NaN/Infinity MIDI values or lengths, drum grids are 16 characters from `ksho.`, and bpm, velocities and duties are present.
- **Override / yield logic:** `setOverride` / `clearOverride` / `setState` are consistent. Suppression while the site player is playing re-syncs `nextTime` when it lifts. The duck `setTargetAtTime` converges in about 1.2s, so the number of automation events stays bounded.

#### Flagged for Kevin (not changed)

- Hosts call `MUSIC.unlock()` only on the **first** gesture (`{ once: true }`). If iOS suspends the shared context later (backgrounding), only a host path that calls `SFX.unlock()` again, such as the mute button, resumes it. The games other agents own could re-arm unlock on `visibilitychange` if this shows up on the phone.
- A track key missing from `TRACKS` (for example a playlist typo) would throw in `switchTrack`. None exist today; guarding it is optional.

---

### Verification

- **Harness** (scratchpad `shooter/`): `harness.js` (virtual clock, manual rAF, seeded RNG, orig/new × 30/60/120/144Hz), `counts.js` (25s traversal/spawn parity), `bugs.js` (boss double-spawn, tab-away, double death; orig vs new), `dbg.js` (boss-kill null crash), `resize.js`, `flow.js` (real-time: 4 waves including a boss kill, death, Enter + click submit, restart), `shots.js`, `music.js` (all 6 boo-music games, orig vs new engine: mute seeding, burst count, track-data validation, page errors).
- **Screenshots** read at 412x915 (touch, DPR 2), 630x900 (arcade iframe), 1920x1080, and 915x412 landscape touch: start, play, upgrade roll, game over + modal, leaderboard. No clipping; overlaps fixed as described.
- **Page errors:** none in any run apart from the expected offline Firebase/gstatic blocks. `node --check` passes on the inline game script and on `boo-music.js`.
- **No git operations performed.** The originals are backed up at `scratchpad/shooter/orig-shooter.html` and `orig-boo-music.js`.

---

# Adversarial review pass (V1_480 / V1_482)

Two independent review agents re-read every hunk of V1_471–V1_479 against its surrounding code and
re-ran the risky flows in headless Chromium (side by side with the pre-fix builds where relevant).

**Confirmed regressions: none.** Verified, among others: Survivors offer queue across pause / victory /
death / restart; TD `gameClock` frozen while paused and reset per run, no stray `performance.now()`
comparisons; Dig TDZ ordering, boss LEAVE, touch pass-through not double-firing; site rapid nav always ends
with exactly one active section, deep links land correctly on iOS / mac Safari / desktop UAs, hamburger
tiles navigate after `inert` is cleared, iPhone pseudo-fullscreen unaffected by the landscape bottom-bar
change; Snake tick exactly 166.7ms at 60Hz with speed boost still applied; Space Shooter single upgrade
screen per boss and `bossRewardPending` cleared on death; Brickbreaker `paddleRestWidth` matches the
level-start formula; Clyde overlays fully visible again after Skip / Play Again.

**Follow-ups applied:**
- V1_480 — TD `exitToMenu` now bumps `runToken` and drops `#mapTransitionOverlay`, so exiting during the
  2.5s campaign stage transition no longer opens the upgrade selector over the menu (pre-existing).
- V1_482 — Snake: Enter/Space on a focused menu button (HOW TO PLAY, LEADERBOARD) activates that button
  instead of starting a run (V1_472 had made it start a run only).

**Low-impact notes, unchanged:** Survivors pause surfaces not listed in `_pauseOwnedElsewhere` (Stats
sub-overlay, possibly the evolution reveal) still get the pause menu on top (same leak as before, not
worse); Dig: pausing in the 1.5s between a boss kill and the victory card lets the card sit above the pause
menu (TELEPORT then Resume still works); site: a nav click during the ~1.25s loader fade is now overridden
by the deep-link section instead of stacking with it.

CI: the GitHub Actions E2E suite (all 5 projects incl. WebKit iPhone + iPad) passed on V1_479 via manual
dispatch on the branch.

# Decisions implemented (V1_483 → V1_489)

Kevin: "I'll take your recommendation on each and let's implement." Outcome per item above:

1. Survivors joystick — **fixed** (V1_483): analog magnitude kept, keyboard diagonal only.
2. Survivors level-up queue — **kept**.
3. TD game clock — **kept**.
4. TD — **all fixed** (V1_484): fire cooldowns carry the remainder on `gameClock` (max 4 shots/frame, no
   idle banking; Minigun 120ms now 120ms at every speed, ~+11% DPS at 1x — feel test), doomed targets fall
   through to the next-best, Discount cap 75%, Armor Pierce = +X% vs tank/boss/megaboss, leprechaun restores
   the player's chosen speed, tutorial copy, whole-run Towers Built.
5. Snake — **fixed** (V1_485): enemies on their own 333.3ms clock (today's effective base speed, so the
   feel is unchanged; Speed Boost is player-only), Slow Motion true 2x, tail-tip move allowed when not growing.
6. Cannon tracer — **kept** at 400ms.
7. Site — **fixed** (V1_489): iPad landscape arcade keeps only the top fade band; monitor-drag DPR change
   re-baselines instead of reading as zoom; 250ms poll replaced by a matchMedia listener.
8. Assets — **fixed** (V1_489): 5 gallery tiles use 540px WebP thumbnails (−1.01MB); LiquidLight1–6 +
   Curiosity cover stay on originals (already downloaded by the wallpapers/hero). PNG icon set + manifest
   any/maskable entries; the 1.8MB `favicon.svg` is no longer linked (kept in the repo).
9. Brickbreaker — **fixed** (V1_486): pause added, `maxBossesPerRow` 9 (levels 10–18 were a boss short),
   How to Play copy; Slower Ball cap stays −80%.
10. Space Shooter — health bar **lifted** (V1_488); viewport-dependent difficulty **left** (hidden legacy game).
11. Dig — **fixed** (V1_487): baked particle glows (−40% particle draw), capped bursts, standalone 16:9 HUD.
12. Survivors misc — **fixed** (V1_483): Refund All trims bans, quit resets the menu title, pellets
    min(dt/16.667,1)-scaled; standalone landscape windows **left** (site iframe unaffected, sizing sacred).
13. `success.html` — Stripe copy made generic (V1_489). Bonus: keyboard-operable music seek slider.

Feel tests worth doing: TD DPS at 1x (+11%), Survivors on the phone (joystick now full speed), Snake
enemies with Speed Boost.
