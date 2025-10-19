#!/usr/bin/env node

/**
 * Video regression script
 * - Runs on production site (https://soundflows.app)
 * - Verifies desktop/mobile playback logic, loop settings, performance metrics
 * - Exercises canvas fallback path by simulating lack of video support
 * - Confirms Vercel deployment responds with HTTP 200
 *
 * Output: qa-video-functional-results.json
 */

const fs = require('fs');
const https = require('https');
const { chromium, devices } = require('playwright');

const PRODUCTION_URL = 'https://soundflows.app/';

/**
 * Simple GET request with timeout
 */
async function httpGet(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      // Drain response to allow connection to close
      res.on('data', () => {});
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

/**
 * Adds media stubs so that autoplay works in headless environment without codecs.
 */
function getMediaStubScript() {
  return `
    (function(){
      const proto = HTMLMediaElement.prototype;
      if (!proto) return;

      Object.defineProperty(proto, 'readyState', {
        configurable: true,
        get() { return 4; }
      });

      Object.defineProperty(proto, 'paused', {
        configurable: true,
        get() { return this._qaPaused !== false; },
        set(v) { this._qaPaused = v; }
      });

      proto.play = function() {
        this._qaPaused = false;
        this._qaPlayed = true;
        this.currentTime = (this.currentTime || 0) + 1;
        this.dispatchEvent(new Event('playing'));
        return Promise.resolve();
      };

      proto.pause = function() {
        this._qaPaused = true;
        this.dispatchEvent(new Event('pause'));
      };

      proto.load = function() {
        setTimeout(() => {
          this.dispatchEvent(new Event('loadeddata'));
          this.dispatchEvent(new Event('canplay'));
        }, 10);
      };

      const videoProto = HTMLVideoElement.prototype;
      videoProto.canPlayType = function(type) {
        if (type && type.includes('video/mp4')) {
          return 'probably';
        }
        return 'maybe';
      };
    })();
  `;
}

async function runDesktopSuite(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(getMediaStubScript());

  const results = {
    categories: [],
    metrics: null
  };

  await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.videoBackgroundManager?.currentVideo);

  const categories = await page.evaluate(() => Object.keys(window.videoBackgroundManager.videoConfig.categories));

    for (const category of categories) {
      const categoryResult = await page.evaluate(async (cat) => {
        const mgr = window.videoBackgroundManager;
        mgr.performanceMetrics.switchTime = 0;
        await mgr.switchVideoBackground(cat);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const video = mgr.currentVideo;
        const sourceElement = video?.querySelector('source[type="video/mp4"]');
        return {
          category: cat,
          currentCategory: mgr.currentCategory,
          src: video?.currentSrc || video?.src || sourceElement?.src || '',
          loop: !!video?.loop,
          paused: !!video?.paused,
          useCanvas: mgr.useCanvas,
          performanceMetrics: {
            loadTime: mgr.performanceMetrics.loadTime,
            switchTime: mgr.performanceMetrics.switchTime,
            errorCount: mgr.performanceMetrics.errorCount
          }
        };
      }, category);
      results.categories.push(categoryResult);
    }

  results.metrics = await page.evaluate(() => {
    const mgr = window.videoBackgroundManager;
    return mgr.getPerformanceMetrics();
  });

  await context.close();
  return results;
}

async function runMobileSuite(browser) {
  const iPhone = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone
  });
  const page = await context.newPage();
  await page.addInitScript(getMediaStubScript());

  await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.videoBackgroundManager?.currentVideo);

  await page.evaluate(async () => {
    const mgr = window.videoBackgroundManager;
    await mgr.switchVideoBackground('meditation');
  });
  await page.waitForTimeout(30);

  const status = await page.evaluate(() => {
    const mgr = window.videoBackgroundManager;
    const video = mgr.currentVideo;
    const sourceElement = video?.querySelector('source[type="video/mp4"]');
    return {
      isVideoMode: !mgr.useCanvas,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      currentCategory: mgr.currentCategory,
      src: video?.currentSrc || video?.src || sourceElement?.src || ''
    };
  });

  await context.close();
  return status;
}

async function runCanvasFallbackSuite(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(HTMLVideoElement.prototype, 'canPlayType', {
      configurable: true,
      value: () => ''
    });
  });

  await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.videoBackgroundManager !== 'undefined');

  const status = await page.evaluate(() => {
    const mgr = window.videoBackgroundManager;
    return {
      useCanvas: mgr.useCanvas,
      videoSupported: mgr.isVideoSupported,
      canvasDisplayed: mgr.canvasElement?.style.display !== 'none'
    };
  });

  await context.close();
  return status;
}

async function main() {
  const browser = await chromium.launch();

  const vercelResponse = await httpGet(PRODUCTION_URL);
  const vercelWwwResponse = await httpGet('https://www.soundflows.app/');

  const desktop = await runDesktopSuite(browser);
  const mobile = await runMobileSuite(browser);
  const fallback = await runCanvasFallbackSuite(browser);

  await browser.close();

  const report = {
    runAt: new Date().toISOString(),
    target: PRODUCTION_URL,
    vercel: vercelResponse,
    vercelWww: vercelWwwResponse,
    desktop,
    mobile,
    fallback
  };

  fs.writeFileSync('qa-video-functional-results.json', JSON.stringify(report, null, 2));
  console.log('Functional QA report written to qa-video-functional-results.json');
}

main().catch((error) => {
  console.error('Video regression test failed:', error);
  process.exit(1);
});
