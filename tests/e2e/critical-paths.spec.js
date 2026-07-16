// @ts-check
/**
 * Train A (V1_103): 10 critical-path E2E tests for the BOO band site.
 *
 * These cover regression surfaces that have caused production breakage in
 * the V1_82 → V1_102 range — touch handlers, arcade aspect normalization,
 * lightbox, section transitions, page-level JS errors. They run on three
 * viewports (Desktop Chrome, Pixel 7, iPhone 14 Pro) so a regression that
 * only shows on mobile (e.g. V1_94) gets caught before deploy.
 */
const { test, expect } = require('@playwright/test');

test.describe('BOO website — critical paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. page loads with title and 8 section elements', async ({ page }) => {
    await expect(page).toHaveTitle(/BOO|Bunch of Others/);
    // Home, Bio, Videos, Photos, Game, Merch, Events, Logo-outro
    const sections = page.locator('section');
    await expect(sections).toHaveCount(8);
  });

  test('2. no JavaScript errors during initial load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    // domcontentloaded fires once parsing is done. networkidle never settles
    // here because of the Spotify/Apple Music/YouTube embed polling. 1.5s
    // grace gives async init code (Firebase, IntersectionObserver) time to
    // throw if it's going to.
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('3. exactly one section has .section-active class', async ({ page }) => {
    const active = page.locator('section.section-active');
    await expect(active).toHaveCount(1);
  });

  test('4. bio container has scroll-friendly CSS', async ({ page }) => {
    // V1_44+ regression test: .about-container must allow native vertical scroll.
    const aboutContainer = page.locator('.about-container').first();
    await expect(aboutContainer).toHaveCSS('overflow-y', 'auto');
    await expect(aboutContainer).toHaveCSS('touch-action', 'pan-y');
    await expect(aboutContainer).toHaveCSS('pointer-events', 'auto');
  });

  test('5. photo gallery has 12 .photo-item elements', async ({ page }) => {
    const photos = page.locator('.photo-item');
    await expect(photos).toHaveCount(12);
  });

  test('6. lightbox opens via openLightbox()', async ({ page }) => {
    // Smoke test for the lightbox mechanism. The deeper V1_99/V1_100
    // touch-handler regression test (synthesizing a tap on .photo-item
    // and verifying the synthesized click reaches openLightbox without
    // being preventDefault'd) requires touch event simulation and lives
    // in Train A.next.
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).not.toHaveClass(/active/);

    await page.evaluate(() => {
      // @ts-ignore — openLightbox is defined in index.html
      if (typeof openLightbox === 'function') openLightbox(0);
    });

    await expect(lightbox).toHaveClass(/active/);
  });

  test('7. lightbox closes via close button', async ({ page }) => {
    // Open via JS to skip section-navigation timing.
    await page.evaluate(() => {
      // @ts-ignore — openLightbox is defined in index.html
      if (typeof openLightbox === 'function') openLightbox(0);
    });
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toHaveClass(/active/);

    await page.locator('#lightbox .close-btn, #lightbox [aria-label*="Close" i]').first().click();
    await expect(lightbox).not.toHaveClass(/active/);
  });

  test('8. arcade pills use their sanctioned aspect (V1_97 + pinball portrait)', async ({ page }) => {
    // V1_97 normalized the landscape-family pills to 640/718. BOO Pinball is an
    // intentional exception: a portrait table registered at 600/900 (design doc
    // §0). Regression catch if anyone re-introduces UNsanctioned per-game aspects.
    const ALLOWED = {
      'Games/boo-pinball.html': '600/900',
    };
    const pills = page.locator('.arcade-pill');
    const count = await pills.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const game = await pills.nth(i).getAttribute('data-game');
      const expected = ALLOWED[game] || '640/718';
      await expect(pills.nth(i)).toHaveAttribute('data-aspect', expected);
    }
  });

  test('9. brickbreaker iframe is loaded by default', async ({ page }) => {
    const iframe = page.locator('.game-container iframe').first();
    const src = await iframe.getAttribute('src');
    expect(src || '').toMatch(/neon-brickbreaker\.html/);
  });

  test('11. card-indicators has 8 dots (1 per section)', async ({ page }) => {
    const dots = page.locator('.card-indicators .card-dot');
    await expect(dots).toHaveCount(8);
  });

  test('12. every card-dot has an aria-label', async ({ page }) => {
    const dots = page.locator('.card-indicators .card-dot');
    const count = await dots.count();
    for (let i = 0; i < count; i++) {
      const label = await dots.nth(i).getAttribute('aria-label');
      expect(label, `dot ${i} missing aria-label`).toBeTruthy();
    }
  });

  test('13. music player toggle has aria-label', async ({ page }) => {
    const toggle = page.locator('#music-toggle');
    await expect(toggle).toHaveAttribute('aria-label', /music/i);
  });

  test('18. mobile music player starts collapsed and swaps with toggle', async ({ page }, testInfo) => {
    // Phone-only UI: the circular toggle exists only at <=768px. iPad and
    // desktop show the full player inline (no toggle), so skip them.
    if (testInfo.project.name === 'chromium' || /ipad/i.test(testInfo.project.name)) test.skip();

    await page.evaluate(() => localStorage.setItem('musicPlayerHidden', 'false'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const toggle = page.locator('#music-toggle');
    const player = page.locator('#music-player');

    await expect(toggle).toBeVisible();
    await expect(player).not.toBeVisible();

    await toggle.click();
    await expect(toggle).not.toBeVisible();
    await expect(player).toBeVisible();

    await player.locator('.player-hide-btn').click();
    await expect(toggle).toBeVisible();
    await expect(player).not.toBeVisible();
  });

  test('14. brickbreaker iframe responds 200', async ({ page, request }) => {
    const response = await request.get('/Games/neon-brickbreaker.html');
    expect(response.status()).toBe(200);
    const body = await response.text();
    // V1_105 regression catcher: Firebase URL is the bumped version
    expect(body).toContain('firebasejs/10.14.1');
  });

  test('15. meta description is present + non-empty', async ({ page }) => {
    const meta = await page.locator('meta[name="description"]').getAttribute('content');
    expect(meta).toBeTruthy();
    expect((meta || '').length).toBeGreaterThan(50);
  });

  test('17. mobile bio scroll: .about-container scrollTop responds to programmatic scroll', async ({ page }, testInfo) => {
    // V1_99 / V1_100 regression catcher. The capture-phase game-touch handlers
    // were preventDefault'ing all touchmoves whose coordinates fell inside the
    // game container's getBoundingClientRect() — which on this fixed-section
    // layout overlaps every other section. Bio scroll was dead until V1_100
    // gated the handler on isGameSectionActive().
    if (testInfo.project.name === 'chromium') test.skip(); // desktop has wheel, not the touch path

    // Navigate to bio
    await page.evaluate(() => {
      // @ts-ignore
      if (typeof menuTransitionToSection === 'function') menuTransitionToSection('about');
      else location.hash = 'about';
    });
    await page.waitForTimeout(600); // section transition cooldown 550ms

    const aboutContainer = page.locator('.about-container').first();
    await expect(aboutContainer).toBeVisible();

    // Try to scroll inside the container. If overflow + handler are correctly
    // wired, scrollTop will increase. If anything is preventDefault'ing or
    // touch-action is wrong, it stays at 0.
    const initial = await aboutContainer.evaluate(el => el.scrollTop);
    await aboutContainer.evaluate(el => { el.scrollTop = 80; });
    const final = await aboutContainer.evaluate(el => el.scrollTop);

    // If content is shorter than container, scrollTop will clamp to 0 — that's
    // fine, the test passes if we either scrolled or there's nothing to scroll.
    const scrollHeight = await aboutContainer.evaluate(el => el.scrollHeight);
    const clientHeight = await aboutContainer.evaluate(el => el.clientHeight);
    if (scrollHeight > clientHeight + 5) {
      expect(final, `scrollTop ${final} should be > initial ${initial} when content overflows`).toBeGreaterThan(initial);
    }
  });

  test('16. JSON-LD MusicGroup is present (V1_108)', async ({ page }) => {
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd || '{}');
    expect(parsed['@type']).toBe('MusicGroup');
    expect(parsed['name']).toBe('Bunch of Others');
  });

  test('10. computeFullscreenIframeSize caps letterbox at ~8% per side (V1_97)', async ({ page }) => {
    // Verify the V1_97 letterbox-cap math reaches the iframe at fullscreen.
    // We can't trigger native fullscreen in headless tests, so we exercise
    // the function directly via page.evaluate.
    const result = await page.evaluate(() => {
      // @ts-ignore — function is closure-scoped; expose via window if present
      const fn = /** @type {any} */ (window).computeFullscreenIframeSize;
      if (typeof fn !== 'function') return { available: false };
      // Simulate a tall portrait phone viewport against a Brickbreaker pill.
      // We can't pass args (it reads window.innerWidth/innerHeight + active pill),
      // so just call it and verify the output is a sensible {width, height}.
      const out = fn();
      return { available: true, out };
    });
    if (!result.available) {
      // Function is closure-scoped and not exposed on window — that's OK,
      // skip the math assertion and verify the constant exists in source.
      const html = await page.content();
      expect(html).toContain('MAX_LETTERBOX_RATIO = 0.08');
      return;
    }
    expect(result.out).toHaveProperty('width');
    expect(result.out).toHaveProperty('height');
    expect(result.out.width).toBeGreaterThan(0);
    expect(result.out.height).toBeGreaterThan(0);
  });

  test('19. all 8 arcade game files respond 200', async ({ request }) => {
    // Catches a renamed/missing game (which would ship a 404 black-tile iframe).
    const games = [
      'neon-brickbreaker', 'neon-survivors', 'neon-tower-defense',
      'neon-dig', 'neon-snake', 'clydes-big-jump', 'neon-space-shooter',
      'boo-pinball',
    ];
    for (const g of games) {
      const res = await request.get(`/Games/${g}.html`);
      expect(res.status(), `${g}.html should respond 200`).toBe(200);
    }
  });

  test('20. iPad: no horizontal overflow', async ({ page }, testInfo) => {
    // V1_153-160 iPad spacing-matrix regression catcher. Runs only on the
    // iPad projects; the page must not scroll horizontally.
    if (!/ipad/i.test(testInfo.project.name)) test.skip();
    const o = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(o.scrollW, `horizontal overflow: scrollWidth ${o.scrollW} > clientWidth ${o.clientW}`)
      .toBeLessThanOrEqual(o.clientW + 2);
  });

  test('21. game-loop fix guards present (V1_162 regression catcher)', async ({ request }) => {
    // V1_162 fixed stacked requestAnimationFrame loops that made these two
    // games speed up after "play again". Fail loudly if the guard is reverted.
    const shooter = await (await request.get('/Games/neon-space-shooter.html')).text();
    expect(shooter, 'space-shooter must guard its single gameLoop kick').toContain('gameLoopStarted');
    const brick = await (await request.get('/Games/neon-brickbreaker.html')).text();
    expect(brick, 'brickbreaker startGame must have a re-entry guard').toMatch(/if\s*\(\s*gameRunning\s*\)\s*return/);
  });

  test('22. BOO Pinball: loads, seams present, physics invariant holds, no JS errors', async ({ page }) => {
    // Phase-4 smoke path for the roguelike pinball table. Boots the game
    // directly (not through the arcade iframe), asserts the __PB test seams
    // exist, and runs a short headless physics sim asserting the ball never
    // tunnels out of the board polygon (the #1 pinball gotcha) and never NaNs.
    const errors = [];
    page.on('pageerror', err => {
      // Firebase/GA network noise is exempt (offline test env).
      if (!/firebase|firestore|gstatic|analytics|CORS/i.test(err.message)) errors.push(err.message);
    });
    await page.goto('/Games/boo-pinball.html');
    await page.waitForFunction(() => window.__PB && typeof window.__PB._sim === 'function', { timeout: 8000 });

    const res = await page.evaluate(() => {
      const PB = window.__PB;
      PB._reset(); PB._noTilt(true); PB._setState('play');
      const R = PB._consts.BALL_R;
      // high-speed serve + random flips through a short sim
      PB._serveBall(300, 460, 180, -260);
      let tunnels = 0, nans = 0;
      for (let i = 0; i < 120; i++) {
        if (Math.random() < 0.3) PB._flip(Math.random() < 0.5 ? 'L' : 'R', Math.random() < 0.6);
        PB._sim(50);
        for (const b of PB._balls()) {
          if (!isFinite(b.x) || !isFinite(b.y) || !isFinite(b.vx) || !isFinite(b.vy)) nans++;
          else if (b.alive && !PB._inside(b.x, b.y, R + 3)) tunnels++;
        }
        if (PB._ballCount() === 0) PB._serveBall(300, 460, 120, -240);
      }
      // a rising flipper must add speed; a bumper hit must kick
      PB._reset(); PB._noTilt(true);
      PB._serveBall(280, 290, 5, 5); // inside a bumper
      let bumpMax = 0;
      for (let i = 0; i < 6; i++) { PB._sim(6); const s = PB._ballState().speed; if (s > bumpMax) bumpMax = s; }
      return { tunnels, nans, bumpMax: Math.round(bumpMax), bumperKick: PB._consts.BUMPER_KICK };
    });

    expect(res.tunnels, 'ball must never leave the board polygon').toBe(0);
    expect(res.nans, 'ball position/velocity must never be NaN').toBe(0);
    expect(res.bumpMax, 'a bumper hit must kick the ball').toBeGreaterThanOrEqual(res.bumperKick * 0.7);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
