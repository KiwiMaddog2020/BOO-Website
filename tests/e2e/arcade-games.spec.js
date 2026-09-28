// @ts-check
/**
 * V1_GLOW: arcade smoke tests. critical-paths.spec.js only checks that each
 * game file responds 200 — a game that throws on boot (the black-tile
 * failure mode) still passed. These load every game directly and fail on
 * any uncaught page error, plus make sure the game actually painted a canvas.
 */
const { test, expect } = require('@playwright/test');

const GAMES = [
  'neon-brickbreaker', 'neon-survivors', 'neon-tower-defense',
  'neon-dig', 'neon-snake', 'clydes-big-jump', 'neon-space-shooter',
];

test.describe('BOO arcade — every game boots clean', () => {
  for (const g of GAMES) {
    test(`${g} loads with no uncaught errors and a sized canvas`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(`/Games/${g}.html`);
      await page.waitForLoadState('domcontentloaded');
      // Same grace as critical-paths test 2: lets async init (Firebase,
      // fonts, first animation frames) throw if it's going to.
      await page.waitForTimeout(1500);
      expect(errors, errors.join('\n')).toEqual([]);

      const canvas = await page.evaluate(() => {
        const cs = Array.from(document.querySelectorAll('canvas'));
        return cs.map(c => ({ w: c.width, h: c.height }));
      });
      expect(canvas.length, `${g} should have a canvas`).toBeGreaterThan(0);
      expect(canvas.some(c => c.w > 0 && c.h > 0), `${g} canvas should be sized`).toBe(true);
    });
  }
});

test.describe('BOO website — phone layout', () => {
  test('phones: no horizontal overflow on load', async ({ page }, testInfo) => {
    // Companion to critical-paths test 20 (iPad-only). The OnePlus 13R-class
    // phone viewport is the primary target; the page must never side-scroll.
    if (!/mobile-/.test(testInfo.project.name)) test.skip();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const o = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(o.scrollW, `horizontal overflow: scrollWidth ${o.scrollW} > clientWidth ${o.clientW}`)
      .toBeLessThanOrEqual(o.clientW + 2);
  });
});
