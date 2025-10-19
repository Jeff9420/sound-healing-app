#!/usr/bin/env node

/**
 * End-to-end analytics verification script.
 *
 * What it does:
 * 1. Loads https://soundflows.app with analytics consent granted.
 * 2. Submits the homepage 7-day plan form and resources subscribe form.
 * 3. Captures outbound Amplitude / GA4 requests, GTM dataLayer pushes, and CRM responses.
 * 4. Produces qa-analytics-e2e-results.json summarising evidence for GA4/GTM/Amplitude/CRM flows.
 *
 * Requirements:
 * - Playwright browsers installed (`npx playwright install chromium`).
 * - Network access to api.amplitude.com, google-analytics.com, api.hsforms.com.
 *
 * Usage:
 *   node tools/analytics-e2e-test.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://soundflows.app/';
const RESOURCES_URL = new URL('pages/resources/index.html', BASE_URL).toString();

function waitForCondition(checkFn, timeout = 15000, interval = 100) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = async () => {
      try {
        if (await checkFn()) {
          resolve(true);
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }
      if (Date.now() - start >= timeout) {
        reject(new Error('Timed out waiting for condition.'));
        return;
      }
      setTimeout(poll, interval);
    };
    poll();
  });
}

function normaliseAmplitudeEvents(postData) {
  if (!postData) return [];
  try {
    const parsed = typeof postData === 'string' ? JSON.parse(postData) : postData;
    if (!parsed || !Array.isArray(parsed.events)) return [];
    return parsed.events.map((event) => ({
      event_type: event.event_type,
      device_id: event.device_id || null,
      user_id: event.user_id || null,
      event_properties: event.event_properties || {},
      insert_id: event.insert_id || null
    }));
  } catch (error) {
    return [];
  }
}

function extractGaEvent(reqUrl) {
  try {
    const url = new URL(reqUrl);
    const params = Object.fromEntries(url.searchParams.entries());
    const eventName =
      params.en ||
      params['ep.event_name'] ||
      params['pr.event'] ||
      params['pr.name'] ||
      null;
    return {
      event: eventName,
      params
    };
  } catch (error) {
    return null;
  }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const amplitudeEvents = [];
  const gaEvents = [];
  const crmResponses = [];
  const amplitudeEventLog = [];
  const gaEventLog = [];

  page.on('requestfinished', async (request) => {
    const url = request.url();
    if (url.includes('amplitude.com/2/httpapi')) {
      const postData = request.postData();
      const events = normaliseAmplitudeEvents(postData);
      amplitudeEvents.push({
        url,
        events
      });
    }
    if (
      url.includes('google-analytics.com/g/collect') ||
      url.includes('analytics.google.com/g/collect') ||
      url.includes('region1.google-analytics.com/g/collect')
    ) {
      const gaEvent = extractGaEvent(url);
      if (gaEvent) {
        gaEvents.push(gaEvent);
      }
    }
  });

  page.on('dialog', async (dialog) => {
    await dialog.dismiss().catch(() => {});
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.setItem('analyticsConsent', 'accepted');
    } catch (error) {
      // ignore
    }
  });

  await page.goto(`${BASE_URL}?analytics_debug=1`, { waitUntil: 'networkidle' });

  await page.waitForFunction(
    () => typeof window.soundFlowsAnalytics !== 'undefined',
    { timeout: 15000 }
  );

  await waitForCondition(
    () =>
      page.evaluate(() => {
        const analytics = window.soundFlowsAnalytics;
        if (!analytics) return false;
        return !!(analytics.amplitudePromise || analytics.amplitudeReady);
      }),
    15000
  ).catch(() => {});

  await waitForCondition(
    () =>
      page.evaluate(() => {
        const analytics = window.soundFlowsAnalytics;
        if (!analytics) return false;
        return analytics.amplitudeReady === true;
      }),
    20000
  ).catch(() => {});

  await page.evaluate(() => {
    window.__qaAmplitudeEvents = [];
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      if (!window.__qaAmplitudeWrapped) {
        const originalTrack = window.amplitude.track.bind(window.amplitude);
        window.amplitude.track = function (eventType, eventProperties) {
          try {
            window.__qaAmplitudeEvents.push({
              event_type: eventType,
              event_properties: eventProperties || {}
            });
          } catch (error) {
            // ignore logging errors
          }
          return originalTrack(eventType, eventProperties);
        };
        window.__qaAmplitudeWrapped = true;
      }
    }

    window.__qaGaEvents = [];
    if (typeof window.gtag === 'function') {
      if (!window.__qaGtagWrapped) {
        const originalGtag = window.gtag.bind(window);
        window.gtag = function () {
          try {
            window.__qaGaEvents.push(Array.from(arguments));
          } catch (error) {
            // ignore logging errors
          }
          return originalGtag.apply(this, arguments);
        };
        window.__qaGtagWrapped = true;
      }
    }
  });

  await page.waitForSelector('#planRequestForm', { timeout: 10000 });

  const testName = `QA Automation ${new Date().toISOString().slice(11, 19)}`;
  const timestamp = Date.now();
  const testEmailPlan = `qa.plan+${timestamp}@testing.soundflows.app`;

  await page.fill('#planName', testName);
  await page.fill('#planEmail', testEmailPlan);
  await page.selectOption('#planGoal', 'sleep');
  await page.selectOption('#planTime', '10-20');

  const planCrmPromise = page
    .waitForResponse(
      (response) =>
        response.url().includes('ec666460-ee7c-4057-97a6-d6f1fdd9c061'),
      { timeout: 20000 }
    )
    .then(async (response) => {
      try {
        const body = await response.text();
        const record = {
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
          bodySnippet: body ? body.slice(0, 200) : ''
        };
        crmResponses.push(record);
        return record;
      } catch (error) {
        const record = {
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
          bodySnippet: ''
        };
        crmResponses.push(record);
        return record;
      }
    })
    .catch(() => null);

  const planAmplitudePromise = page
    .waitForResponse(
      async (response) => {
        if (!response.url().includes('amplitude.com/2/httpapi')) return false;
        const req = response.request();
        try {
          const postData = await req.postData();
          return postData && postData.includes('plan_submit');
        } catch (error) {
          return false;
        }
      },
      { timeout: 20000 }
    )
    .catch(() => null);

  const planGaPromise = page
    .waitForRequest(
      (request) =>
        (request.url().includes('google-analytics.com/g/collect') ||
          request.url().includes('analytics.google.com/g/collect') ||
          request.url().includes('region1.google-analytics.com/g/collect')) &&
        (request.url().includes('plan_submit') || request.url().includes('content_conversion')),
      { timeout: 20000 }
    )
    .catch(() => null);

  await page.click('#planRequestForm button[type="submit"]');

  await page.waitForSelector('.conversion-offer__success.is-visible', { timeout: 20000 });

  await planCrmPromise.catch(() => null);
  await planAmplitudePromise.catch(() => null);
  await planGaPromise.catch(() => null);

  await waitForCondition(
    () =>
      amplitudeEvents.some((entry) =>
        entry.events.some(
          (ev) => ev.event_type === 'plan_submit_success' || ev.event_type === 'plan_submit'
        )
      ),
    20000
  ).catch(() => {});

  await waitForCondition(
    () =>
      gaEvents.some(
        (entry) =>
          entry.event === 'plan_submit_success' ||
          entry.event === 'plan_submit' ||
          (entry.params && entry.params['ep.event_name'] === 'plan_submit_success')
      ),
    20000
  ).catch(() => {});

  const planDataLayer = await page.evaluate(() =>
    (window.dataLayer || []).filter(
      (item) => item && typeof item === 'object' && item.event && item.event.startsWith('plan_')
    )
  );

  const planCaptured = await page.evaluate(() => ({
    amplitude: window.__qaAmplitudeEvents || [],
    ga: window.__qaGaEvents || []
  }));

  amplitudeEventLog.push(...planCaptured.amplitude.filter(Boolean));

  gaEventLog.push(
    ...planCaptured.ga
      .filter((entry) => Array.isArray(entry) && entry[0] === 'event')
      .map((entry) => ({
        command: entry[0],
        name: entry[1],
        params: entry[2] || {}
      }))
  );

  const testEmailResources = `qa.resources+${timestamp}@testing.soundflows.app`;

  await page.goto(`${RESOURCES_URL}?analytics_debug=1`, { waitUntil: 'networkidle' });

  await waitForCondition(
    () =>
      page.evaluate(() => {
        const analytics = window.soundFlowsAnalytics;
        if (!analytics) return false;
        return analytics.amplitudeReady === true;
      }),
    20000
  ).catch(() => {});

  await page.evaluate(() => {
    window.__qaAmplitudeEvents = [];
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      if (!window.__qaAmplitudeWrapped) {
        const originalTrack = window.amplitude.track.bind(window.amplitude);
        window.amplitude.track = function (eventType, eventProperties) {
          try {
            window.__qaAmplitudeEvents.push({
              event_type: eventType,
              event_properties: eventProperties || {}
            });
          } catch (error) {
            // ignore logging errors
          }
          return originalTrack(eventType, eventProperties);
        };
        window.__qaAmplitudeWrapped = true;
      }
    }

    window.__qaGaEvents = [];
    if (typeof window.gtag === 'function') {
      if (!window.__qaGtagWrapped) {
        const originalGtag = window.gtag.bind(window);
        window.gtag = function () {
          try {
            window.__qaGaEvents.push(Array.from(arguments));
          } catch (error) {
            // ignore logging errors
          }
          return originalGtag.apply(this, arguments);
        };
        window.__qaGtagWrapped = true;
      }
    }
  });

  await page.waitForSelector('#resourceSubscribeForm', { timeout: 10000 });

  await page.fill('#resourceSubscribeForm input[name="email"]', testEmailResources);

  const resourcesCrmPromise = page
    .waitForResponse(
      (response) =>
        response.url().includes('ce1bb1ff-0230-4f9b-bf4c-ea92ca4962f4'),
      { timeout: 20000 }
    )
    .then(async (response) => {
      try {
        const body = await response.text();
        const record = {
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
          bodySnippet: body ? body.slice(0, 200) : ''
        };
        crmResponses.push(record);
        return record;
      } catch (error) {
        const record = {
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
          bodySnippet: ''
        };
        crmResponses.push(record);
        return record;
      }
    })
    .catch(() => null);

  const resourcesAmplitudePromise = page
    .waitForResponse(
      async (response) => {
        if (!response.url().includes('amplitude.com/2/httpapi')) return false;
        const req = response.request();
        try {
          const postData = await req.postData();
          return postData && postData.includes('resources_subscribe');
        } catch (error) {
          return false;
        }
      },
      { timeout: 20000 }
    )
    .catch(() => null);

  const resourcesGaPromise = page
    .waitForRequest(
      (request) =>
        (request.url().includes('google-analytics.com/g/collect') ||
          request.url().includes('analytics.google.com/g/collect') ||
          request.url().includes('region1.google-analytics.com/g/collect')) &&
        (request.url().includes('resources_subscribe') ||
          request.url().includes('resources_subscribe_success')),
      { timeout: 20000 }
    )
    .catch(() => null);

  await page.click('#resourceSubscribeForm button[type="submit"]');

  await resourcesCrmPromise.catch(() => null);
  await resourcesAmplitudePromise.catch(() => null);
  await resourcesGaPromise.catch(() => null);

  await waitForCondition(
    () =>
      amplitudeEvents.some((entry) =>
        entry.events.some(
          (ev) =>
            ev.event_type === 'resources_subscribe_success' || ev.event_type === 'resources_subscribe'
        )
      ),
    20000
  ).catch(() => {});

  await waitForCondition(
    () =>
      gaEvents.some(
        (entry) =>
          entry.event === 'resources_subscribe_success' ||
          entry.event === 'resources_subscribe' ||
          (entry.params && entry.params['ep.event_name'] === 'resources_subscribe_success')
      ),
    20000
  ).catch(() => {});

  const resourcesDataLayer = await page.evaluate(() =>
    (window.dataLayer || []).filter(
      (item) =>
        item && typeof item === 'object' && item.event && item.event.startsWith('resources_')
    )
  );

  const resourcesCaptured = await page.evaluate(() => ({
    amplitude: window.__qaAmplitudeEvents || [],
    ga: window.__qaGaEvents || []
  }));

  amplitudeEventLog.push(...resourcesCaptured.amplitude.filter(Boolean));

  gaEventLog.push(
    ...resourcesCaptured.ga
      .filter((entry) => Array.isArray(entry) && entry[0] === 'event')
      .map((entry) => ({
        command: entry[0],
        name: entry[1],
        params: entry[2] || {}
      }))
  );

  const amplitudeEventNames = new Set(
    [
      ...amplitudeEvents.flatMap((entry) => entry.events.map((ev) => ev.event_type)),
      ...amplitudeEventLog.map((ev) => ev.event_type)
    ].filter(Boolean)
  );

  const gaEventNames = new Set(
    [
      ...gaEvents
        .map((entry) => entry.event || (entry.params && (entry.params['ep.event_name'] || entry.params.en)))
        .filter(Boolean),
      ...gaEventLog.map((entry) => entry.name).filter(Boolean)
    ]
  );

  const report = {
    runAt: new Date().toISOString(),
    planForm: {
      amplitudePlanSubmit:
        amplitudeEventNames.has('plan_submit_success') || amplitudeEventNames.has('plan_submit'),
      gaPlanSubmit:
        gaEventNames.has('plan_submit_success') ||
        gaEventNames.has('plan_submit') ||
        gaEventNames.has('conversion'),
      crmResponse: crmResponses.find((resp) =>
        resp.url.includes('ec666460-ee7c-4057-97a6-d6f1fdd9c061')
      ) || null,
      dataLayer: planDataLayer
    },
    resourcesForm: {
      amplitudeSubscribe:
        amplitudeEventNames.has('resources_subscribe_success') ||
        amplitudeEventNames.has('resources_subscribe'),
      gaSubscribe:
        gaEventNames.has('resources_subscribe_success') ||
        gaEventNames.has('resources_subscribe'),
      crmResponse: crmResponses.find((resp) =>
        resp.url.includes('ce1bb1ff-0230-4f9b-bf4c-ea92ca4962f4')
      ) || null,
      dataLayer: resourcesDataLayer
    },
    amplitudeEvents,
    gaEvents,
    crmResponses,
    capturedEvents: {
      amplitudeTrackCalls: amplitudeEventLog,
      gtagCalls: gaEventLog
    }
  };

  await browser.close();

  const outputPath = path.join(process.cwd(), 'qa-analytics-e2e-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Analytics QA report written to ${outputPath}`);
}

main().catch((error) => {
  console.error('Analytics E2E test failed:', error);
  process.exit(1);
});
