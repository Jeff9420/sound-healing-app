#!/usr/bin/env node

/**
 * Sends test submissions to HubSpot form endpoints used by SITE_CONFIG.
 */

const https = require('https');

const SUBSCRIBE_ENDPOINT =
  'https://api.hsforms.com/submissions/v3/integration/submit/244150644/ce1bb1ff-0230-4f9b-bf4c-ea92ca4962f4';
const PLAN_ENDPOINT =
  'https://api.hsforms.com/submissions/v3/integration/submit/244150644/ec666460-ee7c-4057-97a6-d6f1fdd9c061';

function submitToHubSpot(endpoint, fields) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      fields,
      context: {
        pageUri: 'https://soundflows.app/',
        pageName: 'SoundFlows QA Automation'
      }
    });

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
          resolve({
            statusCode: response.statusCode,
            body: data
          });
        });
      }
    );

    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

async function main() {
  const timestamp = Date.now();
  const subscribeResult = await submitToHubSpot(SUBSCRIBE_ENDPOINT, [
    { name: 'email', value: `qa.resources+${timestamp}@testing.soundflows.app` }
  ]);
  console.log('Subscribe endpoint response:', subscribeResult);

  const planResult = await submitToHubSpot(PLAN_ENDPOINT, [
    { name: 'email', value: `qa.plan+${timestamp}@testing.soundflows.app` },
    { name: 'firstname', value: 'QA' },
    { name: 'lastname', value: 'Automation' },
    { name: 'meditation_goal', value: 'sleep' },
    { name: 'preferred_time', value: '10-20' }
  ]);
  console.log('Plan endpoint response:', planResult);

  if (subscribeResult.statusCode !== 200 || planResult.statusCode !== 200) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('HubSpot submission test failed:', error);
  process.exit(1);
});
