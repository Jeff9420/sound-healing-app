#!/usr/bin/env node

/**
 * Sends synthetic events to Amplitude via HTTP API to ensure data flow.
 * Usage: node tools/seed-amplitude-events.js
 */

const https = require('https');

const API_KEY = 'b6c4ebe3ec4d16c8f5fd258d29653cfc';
const ENDPOINTS = [
  'https://api2.amplitude.com/2/httpapi',
  'https://api.amplitude.com/2/httpapi'
];

function sendAmplitudeEvents(events) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      api_key: API_KEY,
      events
    });

    let resolved = false;
    let attempts = 0;

    const tryNext = () => {
      if (attempts >= ENDPOINTS.length) {
        if (!resolved) {
          reject(new Error('All Amplitude endpoints failed.'));
        }
        return;
      }

      const endpoint = ENDPOINTS[attempts++];
      const request = https.request(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        },
        (response) => {
          let data = '';
          response.on('data', (chunk) => (data += chunk));
          response.on('end', () => {
            if (!resolved) {
              resolved = true;
              resolve({
                endpoint,
                statusCode: response.statusCode,
                body: data
              });
            }
          });
        }
      );

      request.on('error', (error) => {
        if (attempts < ENDPOINTS.length) {
          tryNext();
        } else {
          reject(error);
        }
      });

      request.write(payload);
      request.end();
    };

    tryNext();
  });
}

async function main() {
  const now = Date.now();
  const events = [
    {
      user_id: `qa-${now}`,
      device_id: `qa-device-${now}`,
      event_type: 'plan_submit',
      event_properties: {
        goal: 'sleep',
        time: '10-20',
        source: 'qa-seed-script'
      },
      time: now
    },
    {
      user_id: `qa-${now}`,
      device_id: `qa-device-${now}`,
      event_type: 'resources_subscribe',
      event_properties: {
        source: 'qa-seed-script',
        form_id: 'resources-subscribe-form'
      },
      time: now + 1
    }
  ];

  const result = await sendAmplitudeEvents(events);
  console.log('Amplitude seed response:', result);

  if (result.statusCode !== 200) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Failed to seed Amplitude events:', error);
  process.exit(1);
});
