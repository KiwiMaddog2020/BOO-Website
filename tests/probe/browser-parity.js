#!/usr/bin/env node
/**
 * Browser parity probe (Phase 1 — measurement only).
 *
 * Renders the BOO site's 8 sections under a chosen Playwright engine, in a
 * "natural" pass (real UA sniffing) plus "forced-<class>" passes that pin the
 * body to exactly one browser-detection class regardless of the real engine.
 * Comparing forced passes across engines isolates pure rendering-engine
 * divergence from CSS-authored divergence; comparing natural passes shows
 * what ships today.
 *
 * Usage:  PROBE_ENGINE=chromium|firefox|webkit node tests/probe/browser-parity.js
 *
 * Writes probe-results/<engine>/<pass>/{*.png,metrics.json} and
 * probe-results/<engine>/summary.json. Does not modify index.html.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const playwright = require('playwright');
const { PNG } = require('pngjs');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ENGINE = process.env.PROBE_ENGINE;
const ENGINE_LAUNCHERS = {
  chromium: playwright.chromium,
  firefox: playwright.firefox,
  webkit: playwright.webkit,
};

if (!ENGINE_LAUNCHERS[ENGINE]) {
  console.error(
    `[probe] PROBE_ENGINE must be one of chromium|firefox|webkit (got ${JSON.stringify(ENGINE)})`
  );
  process.exit(1);
}

const BASE_URL = process.env.PROBE_BASE_URL || 'http://localhost:4747';
const BASE_ORIGIN = new URL(BASE_URL).origin;

const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'probe-results', ENGINE);

const SECTIONS = ['home', 'about', 'videos', 'photos', 'game', 'merch', 'events', 'logo-outro'];

// Every class the site's own UA-sniffing JS might add to <body> (~line 9990
// of index.html). Forced passes strip all of these before adding exactly one.
const SNIFFED_CLASSES = [
  'is-chrome', 'is-firefox', 'is-safari', 'is-mac-safari',
  'is-ios', 'is-ipad', 'is-android', 'is-mobile', 'is-samsung',
];

const FORCE_CLASSES = ['is-firefox', 'is-chrome', 'is-safari'];

const MACSAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

// The background-layer stack inside each <section> (see CLAUDE.md).
const OVERLAY_SELECTORS = [
  '.darken-overlay',
  '.color-mist',
  '.liquid-overlay',
  '.oil-slick',
  '.color-splotches',
  '.wavy-flutter',
  '.lava-blobs',
  '.fade-overlay',
  '.psych-fractals',
  '.ambient-color-wash',
  '.chrome-color-sweep',
  '.chrome-shimmer',
  '.lava-blob',
  '.splotch',
  '.vine-overlay',
];

const VIEWPORT = { width: 1920, height: 1080 };

// 5x5 sample grid, patches are 40x40px centred at these fractions of the viewport.
const PATCH_X_FRAC = [0.08, 0.26, 0.50, 0.74, 0.92];
const PATCH_Y_FRAC = [0.12, 0.30, 0.50, 0.70, 0.88];
const PATCH_SIZE = 40;

// The V1_459/V1_460/V1_461 desktop layouts sit behind this query. Headless
// Firefox reports coarse/no-hover pointer capabilities by default, so probe v1
// silently compared Firefox's stacked phone layout against the other engines'
// desktop grid. Firefox is now launched with ui.*PointerCapabilities=6
// (2=fine|4=hover) and every engine asserts the fence matches before measuring.
const FENCE_QUERY =
  '(min-width: 1100px) and (orientation: landscape) and (hover: hover) and (pointer: fine)';

// Animations are frozen through the Web Animations API (exact, and supported in
// all three engines) rather than `animation-play-state`/`animation-delay`, which
// probe v1 used and which landed each engine on a DIFFERENT keyframe (.color-mist
// and .lava-blobs resolved to opacity 0 in Firefox but 1 in Chromium).
const FREEZE_TIME_MS = 3000;
const FREEZE_CSS = '*, *::before, *::after { transition: none !important; }';

// ---------------------------------------------------------------------------
// Small numeric helpers
// ---------------------------------------------------------------------------

function round(x, d = 3) {
  const f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Standard RGB(0-255) -> HSL. Returns {h, s, l} with s,l in [0,1]. */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function decodePng(buffer) {
  return PNG.sync.read(buffer);
}

/**
 * Whole-frame mean R/G/B (-> HSL saturation/lightness) plus the
 * Hasler–Süsstrunk colourfulness metric, computed over every pixel.
 */
function wholeFrameMetrics(png) {
  const { width, height, data } = png;
  const n = width * height;
  const rg = new Float64Array(n);
  const yb = new Float64Array(n);
  let sumR = 0, sumG = 0, sumB = 0;

  for (let i = 0, p = 0; p < n; i += 4, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    sumR += r; sumG += g; sumB += b;
    rg[p] = r - g;
    yb[p] = (r + g) / 2 - b;
  }

  const meanR = sumR / n, meanG = sumG / n, meanB = sumB / n;
  const { s, l } = rgbToHsl(meanR, meanG, meanB);

  let sumRg = 0, sumYb = 0;
  for (let p = 0; p < n; p++) { sumRg += rg[p]; sumYb += yb[p]; }
  const meanRg = sumRg / n, meanYb = sumYb / n;

  let sqRg = 0, sqYb = 0;
  for (let p = 0; p < n; p++) {
    sqRg += (rg[p] - meanRg) * (rg[p] - meanRg);
    sqYb += (yb[p] - meanYb) * (yb[p] - meanYb);
  }
  const stdRg = Math.sqrt(sqRg / n);
  const stdYb = Math.sqrt(sqYb / n);

  const colourfulness =
    Math.sqrt(stdRg * stdRg + stdYb * stdYb) + 0.3 * Math.sqrt(meanRg * meanRg + meanYb * meanYb);

  return {
    meanR: round(meanR, 2),
    meanG: round(meanG, 2),
    meanB: round(meanB, 2),
    saturation: round(s, 4),
    lightness: round(l, 4),
    colourfulness: round(colourfulness, 3),
  };
}

/**
 * 5x5 grid of 40x40 patches. Per patch: mean R/G/B, then that mean RGB is
 * converted once to HSL (not per-pixel HSL averaging) per the probe spec.
 */
function patchMetrics(png) {
  const { width, height, data } = png;
  const half = PATCH_SIZE / 2;
  const patches = [];

  for (const yf of PATCH_Y_FRAC) {
    for (const xf of PATCH_X_FRAC) {
      const cx = Math.round(xf * width);
      const cy = Math.round(yf * height);
      const x0 = Math.max(0, cx - half);
      const y0 = Math.max(0, cy - half);
      const x1 = Math.min(width, cx + half);
      const y1 = Math.min(height, cy + half);

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2];
          count++;
        }
      }
      const meanR = sumR / count, meanG = sumG / count, meanB = sumB / count;
      const { s, l } = rgbToHsl(meanR, meanG, meanB);
      patches.push({
        xFrac: xf, yFrac: yf,
        meanR: round(meanR, 2), meanG: round(meanG, 2), meanB: round(meanB, 2),
        saturation: round(s, 4), lightness: round(l, 4),
      });
    }
  }

  return {
    patches,
    patchAvgSaturation: round(mean(patches.map((p) => p.saturation)), 4),
    patchAvgLightness: round(mean(patches.map((p) => p.lightness)), 4),
  };
}

// ---------------------------------------------------------------------------
// Page-side helpers
// ---------------------------------------------------------------------------

async function captureComputedStyles(page, sectionId) {
  return page.evaluate(
    ({ sectionId, overlaySelectors, truncateLen }) => {
      function trunc(s) {
        if (s == null) return s;
        s = String(s);
        return s.length > truncateLen ? s.slice(0, truncateLen) + '…' : s;
      }
      function pick(cs) {
        return {
          display: cs.display,
          opacity: cs.opacity,
          filter: cs.filter,
          backgroundColor: cs.backgroundColor,
          backgroundImage: trunc(cs.backgroundImage),
          mixBlendMode: cs.mixBlendMode,
          maskImage: trunc(
            cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : (cs.webkitMaskImage || 'none')
          ),
        };
      }

      const section = document.getElementById(sectionId);
      if (!section) return { error: 'section not found: ' + sectionId };

      const result = {};
      result['section'] = pick(getComputedStyle(section));
      try {
        result['section::before'] = pick(getComputedStyle(section, '::before'));
      } catch (e) {
        result['section::before'] = { error: String(e) };
      }
      overlaySelectors.forEach((sel) => {
        const el = section.querySelector(sel);
        result[sel] = el ? pick(getComputedStyle(el)) : null;
      });
      return result;
    },
    { sectionId, overlaySelectors: OVERLAY_SELECTORS, truncateLen: 120 }
  );
}

// ---------------------------------------------------------------------------
// PART 3 — minimal repro for the bug the Safari workaround was written for
// ---------------------------------------------------------------------------
// Commit 2ed7d92 "Working on Safari Version" ("...the lack of background images
// showing up at all") introduced `body.is-safari section::before { display:none }`
// plus a duplicate section-level background, blaming "::before + mask-image +
// animation". This rebuilds exactly that recipe — an absolutely-positioned
// ::before at 130% inside a fixed, translateZ'd section, with the 10-stop
// mask-image gradient and the backgroundBreathingWarp scale animation — and
// samples the rendered pixels. If the centre shows the image colour, the bug
// does not reproduce in this engine.
const REPRO_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden;}
  .scroll-container{position:relative;height:100vh;}
  section{position:fixed;top:0;left:0;width:100vw;height:100vh;overflow:hidden;
    background:#000;transform:translateZ(0);-webkit-transform:translateZ(0);
    backface-visibility:hidden;-webkit-backface-visibility:hidden;
    isolation:isolate;contain:layout style paint;}
  section::before{content:'';position:absolute;top:-15%;left:-15%;right:-15%;bottom:-15%;
    width:130%;height:130%;background-size:cover;background-position:center;
    background-repeat:no-repeat;z-index:0;
    background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%23ff00ff'/%3E%3C/svg%3E");
    mask-image:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.2) 12%,rgba(0,0,0,0.5) 22%,rgba(0,0,0,0.8) 30%,black 38%,black 62%,rgba(0,0,0,0.8) 70%,rgba(0,0,0,0.5) 78%,rgba(0,0,0,0.2) 88%,transparent 100%);
    -webkit-mask-image:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.2) 12%,rgba(0,0,0,0.5) 22%,rgba(0,0,0,0.8) 30%,black 38%,black 62%,rgba(0,0,0,0.8) 70%,rgba(0,0,0,0.5) 78%,rgba(0,0,0,0.2) 88%,transparent 100%);
    animation:backgroundBreathingWarp 30s ease-in-out infinite;
    -webkit-animation:backgroundBreathingWarp 30s ease-in-out infinite;
    transform-origin:center center;-webkit-transform-origin:center center;
    will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden;
    filter:saturate(1.0);-webkit-filter:saturate(1.0);}
  @keyframes backgroundBreathingWarp{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
  @-webkit-keyframes backgroundBreathingWarp{0%,100%{-webkit-transform:scale(1)}50%{-webkit-transform:scale(1.06)}}
</style></head><body><div class="scroll-container"><section></section></div></body></html>`;

async function runSafariBeforeRepro(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await page.setContent(REPRO_HTML, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      (document.getAnimations ? document.getAnimations() : []).forEach((a) => {
        try { a.pause(); a.currentTime = 3000; } catch (e) { /* ignore */ }
      });
    });
    await page.waitForTimeout(200);

    const reproDir = path.join(OUT_DIR, 'repro');
    fs.mkdirSync(reproDir, { recursive: true });
    const buffer = await page.screenshot({ path: path.join(reproDir, 'section-before-mask.png') });
    const png = decodePng(buffer);

    const sample = (xf, yf) => {
      const x = Math.round(xf * png.width);
      const y = Math.round(yf * png.height);
      const i = (y * png.width + x) * 4;
      return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] };
    };

    const centre = sample(0.5, 0.5);
    const topEdge = sample(0.5, 0.01);
    const bottomEdge = sample(0.5, 0.99);
    const quarter = sample(0.5, 0.25);

    // The image is pure magenta; "painted" means the centre is unmistakably it.
    const imagePainted = centre.r > 200 && centre.b > 200 && centre.g < 60;
    // The mask must still fade the top/bottom to the section's black.
    const maskFades = topEdge.r < 40 && bottomEdge.r < 40;
    // ...and the 22-30% band must be a partial, mid-strength value.
    const maskGradates = quarter.r > 40 && quarter.r < 220;

    const beforeBox = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('section'), '::before');
      return {
        display: cs.display,
        opacity: cs.opacity,
        width: cs.width,
        height: cs.height,
        maskImage: (cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : cs.webkitMaskImage || 'none').slice(0, 60),
      };
    });

    const result = {
      engine: ENGINE,
      screenshot: 'repro/section-before-mask.png',
      samples: { centre, topEdge, quarter, bottomEdge },
      computed: beforeBox,
      imagePainted,
      maskFades,
      maskGradates,
      bugReproduces: !(imagePainted && maskFades && maskGradates),
    };
    console.log(`[probe:${ENGINE}] safari ::before repro -> ${JSON.stringify(result.samples)} ` +
      `painted=${imagePainted} maskFades=${maskFades} gradates=${maskGradates} ` +
      `bugReproduces=${result.bugReproduces}`);
    return result;
  } catch (err) {
    return { engine: ENGINE, error: String(err) };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browserType = ENGINE_LAUNCHERS[ENGINE];
  const launchOpts = {};
  if (ENGINE === 'firefox') {
    // 2 = fine, 4 = hover -> 6 = fine+hover. Without this headless Firefox
    // reports a coarse/no-hover pointer and misses the desktop fence entirely.
    launchOpts.firefoxUserPrefs = {
      'ui.primaryPointerCapabilities': 6,
      'ui.allPointerCapabilities': 6,
    };
  }
  const browser = await browserType.launch(launchOpts);

  const passes = [{ name: 'natural', forceClass: null, userAgent: null }];
  if (ENGINE === 'webkit') {
    // Playwright's stock webkit UA does not reliably say "Macintosh" the way
    // the site's isMacSafari sniff wants, so we also probe with a real
    // desktop-Safari UA string to make sure is-mac-safari actually lands.
    passes.push({ name: 'natural-macsafari', forceClass: null, userAgent: MACSAFARI_UA });
  }
  for (const cls of FORCE_CLASSES) {
    passes.push({ name: `forced-${cls}`, forceClass: cls, userAgent: null });
  }

  const assertionFailures = [];

  const summary = {
    engine: ENGINE,
    generatedAt: new Date().toISOString(),
    probeVersion: 2,
    passes: {},
  };

  for (const pass of passes) {
    console.log(`\n[probe:${ENGINE}] === pass: ${pass.name} ===`);

    const contextOpts = { viewport: VIEWPORT, deviceScaleFactor: 1 };
    if (pass.userAgent) contextOpts.userAgent = pass.userAgent;

    const context = await browser.newContext(contextOpts);

    // Block everything off-origin so external embeds/CDNs cannot stall `load`
    // or introduce network-dependent variance between runs.
    await context.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(BASE_ORIGIN)) route.continue();
      else route.abort();
    });

    const passDir = path.join(OUT_DIR, pass.name);
    fs.mkdirSync(passDir, { recursive: true });

    const passMetrics = {
      engine: ENGINE,
      pass: pass.name,
      forceClass: pass.forceClass,
      userAgent: pass.userAgent,
      sections: {},
    };

    for (const sectionId of SECTIONS) {
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      const url = sectionId === 'home' ? `${BASE_URL}/` : `${BASE_URL}/#${sectionId}`;

      try {
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      } catch (err) {
        console.error(`[probe:${ENGINE}] goto failed for ${pass.name}/${sectionId}: ${err.message}`);
        passMetrics.sections[sectionId] = { error: String(err) };
        await page.close();
        continue;
      }

      // Page loader clears ~1000-1400ms after `load`; the deep-link
      // section-activation timer fires ~1250ms after `load`. 2500ms clears both.
      await page.waitForTimeout(2500);

      if (pass.forceClass) {
        await page.evaluate(
          ({ sniffed, force }) => {
            sniffed.forEach((c) => document.body.classList.remove(c));
            document.body.classList.add(force);
            void document.body.offsetHeight; // force reflow
          },
          { sniffed: SNIFFED_CLASSES, force: pass.forceClass }
        );
        await page.waitForTimeout(400);
      }

      // Kill transitions only; animations are frozen exactly via the WAAPI below.
      await page.addStyleTag({ content: FREEZE_CSS });
      await page.waitForTimeout(300);

      // Freeze every running animation on the SAME timeline position in every
      // engine. `a.currentTime = t` is exact; the old CSS animation-delay trick
      // was not (see FREEZE_TIME_MS comment above).
      const freezeReport = await page.evaluate((t) => {
        const anims = document.getAnimations ? document.getAnimations() : [];
        let paused = 0;
        let failed = 0;
        anims.forEach((a) => {
          try {
            a.pause();
            a.currentTime = t;
            paused++;
          } catch (e) {
            failed++;
          }
        });
        return { total: anims.length, paused, failed };
      }, FREEZE_TIME_MS);
      await page.waitForTimeout(200);

      const freezeTimes = await page.evaluate(() =>
        (document.getAnimations ? document.getAnimations() : []).map((a) =>
          a.currentTime == null ? null : Math.round(Number(a.currentTime))
        )
      );
      const freezeOffBy = freezeTimes.filter((v) => v !== FREEZE_TIME_MS);
      const freezeSynced = freezeOffBy.length === 0;
      if (!freezeSynced) {
        console.error(
          `[probe:${ENGINE}] FREEZE DESYNC ${pass.name}/${sectionId}: ` +
            `${freezeOffBy.length}/${freezeTimes.length} animations not at ${FREEZE_TIME_MS}ms ` +
            `(sample: ${freezeOffBy.slice(0, 8).join(',')})`
        );
      }

      // Fence + layout assertion. Comparing engines is only meaningful if they
      // all resolved to the SAME layout branch.
      const fence = await page.evaluate(
        ({ q, sectionId }) => ({
          fenceMatches: window.matchMedia(q).matches,
          minWidth1100: window.matchMedia('(min-width: 1100px)').matches,
          landscape: window.matchMedia('(orientation: landscape)').matches,
          hoverHover: window.matchMedia('(hover: hover)').matches,
          pointerFine: window.matchMedia('(pointer: fine)').matches,
          homeDisplay: (() => {
            const h = document.getElementById('home');
            return h ? getComputedStyle(h).display : null;
          })(),
          sectionDisplay: (() => {
            const el = document.getElementById(sectionId);
            return el ? getComputedStyle(el).display : null;
          })(),
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }),
        { q: FENCE_QUERY, sectionId }
      );
      const fenceOk = fence.fenceMatches === true && fence.homeDisplay === 'grid';
      if (!fenceOk) {
        console.error(
          `[probe:${ENGINE}] FENCE ASSERTION FAILED ${pass.name}/${sectionId}: ` +
            `fenceMatches=${fence.fenceMatches} homeDisplay=${fence.homeDisplay} ` +
            `(minWidth1100=${fence.minWidth1100} landscape=${fence.landscape} ` +
            `hover=${fence.hoverHover} pointerFine=${fence.pointerFine})`
        );
        assertionFailures.push(`${pass.name}/${sectionId}: fence`);
      }
      if (!freezeSynced) assertionFailures.push(`${pass.name}/${sectionId}: freeze`);

      const bodyClasses = await page.evaluate(() => Array.from(document.body.classList).sort());

      const screenshotPath = path.join(passDir, `${sectionId}.png`);
      const buffer = await page.screenshot({ path: screenshotPath });

      let wholeFrame, patchData;
      try {
        const png = decodePng(buffer);
        wholeFrame = wholeFrameMetrics(png);
        patchData = patchMetrics(png);
      } catch (err) {
        console.error(`[probe:${ENGINE}] PNG decode failed for ${pass.name}/${sectionId}: ${err.message}`);
        wholeFrame = { error: String(err) };
        patchData = { patches: [], patchAvgSaturation: null, patchAvgLightness: null };
      }

      const computedStyles = await captureComputedStyles(page, sectionId);

      passMetrics.sections[sectionId] = {
        screenshot: `${sectionId}.png`,
        bodyClasses,
        assertions: {
          fenceOk,
          fence,
          freezeSynced,
          freeze: { ...freezeReport, offBy: freezeOffBy.slice(0, 12) },
        },
        wholeFrame,
        patchAvgSaturation: patchData.patchAvgSaturation,
        patchAvgLightness: patchData.patchAvgLightness,
        patches: patchData.patches,
        computedStyles,
      };

      console.log(
        `  [${sectionId}] classes=${bodyClasses.join(',') || '(none)'} ` +
          `sat=${wholeFrame.saturation} light=${wholeFrame.lightness} colourfulness=${wholeFrame.colourfulness}`
      );

      await page.close();
    }

    fs.writeFileSync(path.join(passDir, 'metrics.json'), JSON.stringify(passMetrics, null, 2));

    summary.passes[pass.name] = {
      forceClass: pass.forceClass,
      userAgent: pass.userAgent,
      sections: Object.fromEntries(
        Object.entries(passMetrics.sections).map(([id, s]) => [
          id,
          {
            bodyClasses: s.bodyClasses,
            wholeFrame: s.wholeFrame,
            patchAvgSaturation: s.patchAvgSaturation,
            patchAvgLightness: s.patchAvgLightness,
            fenceOk: s.assertions ? s.assertions.fenceOk : null,
            freezeSynced: s.assertions ? s.assertions.freezeSynced : null,
            // Resolved opacity per measured layer, so the next reader can
            // sanity-check that the engines really were frozen in step.
            layerOpacity: s.computedStyles
              ? Object.fromEntries(
                  Object.entries(s.computedStyles)
                    .filter(([, v]) => v && typeof v === 'object' && 'opacity' in v)
                    .map(([k, v]) => [k, v.opacity])
                )
              : null,
            layerBlend: s.computedStyles
              ? Object.fromEntries(
                  Object.entries(s.computedStyles)
                    .filter(([, v]) => v && typeof v === 'object' && 'mixBlendMode' in v)
                    .map(([k, v]) => [k, v.mixBlendMode])
                )
              : null,
          },
        ])
      ),
    };

    await context.close();
  }

  summary.safariBeforeRepro = await runSafariBeforeRepro(browser);
  summary.assertionFailures = assertionFailures;
  summary.assertionsPassed = assertionFailures.length === 0;

  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  await browser.close();
  console.log(`\n[probe:${ENGINE}] done -> ${OUT_DIR}`);

  if (assertionFailures.length) {
    console.error(
      `\n[probe:${ENGINE}] ${assertionFailures.length} ASSERTION FAILURE(S) — ` +
        `these measurements are NOT comparable across engines:\n  ` +
        assertionFailures.join('\n  ')
    );
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error('[probe] fatal error:', err);
  process.exit(1);
});
