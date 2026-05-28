// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Train A (V1_103): Playwright config for BOO band site E2E tests.
 * Spins up `serve` on :4747 against the repo root, runs critical-path tests
 * across desktop Chrome + mobile Pixel + mobile iPhone viewports.
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  use: {
    baseURL: 'http://localhost:4747',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-android', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-ios', use: { ...devices['iPhone 14 Pro'] } },
    // V1_169: iPad coverage. V1_153-160 was almost entirely iPad
    // spacing/breakpoint work but had zero automated coverage. These two
    // emulate Safari (webkit) on the viewports that drove that work.
    { name: 'ipad-mini-landscape', use: { ...devices['iPad Mini landscape'] } },
    { name: 'ipad-pro-portrait', use: { ...devices['iPad Pro 11'] } },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:4747',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
});
