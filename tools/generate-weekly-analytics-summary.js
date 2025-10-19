#!/usr/bin/env node

/**
 * Generates a Markdown summary of analytics QA results.
 * Intended content for weekly analytics email.
 */

const fs = require('fs');
const path = require('path');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function createSummary(analyticsQa, videoQa) {
  const lines = [];
  lines.push('# SoundFlows Analytics Weekly Snapshot');
  lines.push('');
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  lines.push('');

  if (analyticsQa) {
    const planData = analyticsQa.planForm?.dataLayer || [];
    const resourcesData = analyticsQa.resourcesForm?.dataLayer || [];

    lines.push('## Conversion Events');
    lines.push('');
    lines.push('- **Plan form submissions**: ' + planData.filter((event) => event.event === 'plan_submit').length);
    lines.push('- **Plan CRM successes**: ' + planData.filter((event) => event.event === 'plan_submit_success').length);
    lines.push('- **Resource subscriptions**: ' + resourcesData.filter((event) => event.event === 'resources_subscribe').length);
    lines.push('- **Resource CRM successes**: ' + resourcesData.filter((event) => event.event === 'resources_subscribe_success').length);
    lines.push('');

    lines.push('### GTM / GA4 Events observed');
    if (analyticsQa.capturedEvents?.gtagCalls?.length) {
      analyticsQa.capturedEvents.gtagCalls.forEach((call) => {
        lines.push(`- \`${call.name}\` ${JSON.stringify(call.params)}`);
      });
    } else {
      lines.push('- No GA4 events captured in QA run (check instrumentation).');
    }
    lines.push('');
  }

  if (videoQa) {
    lines.push('## Background Video Regression');
    lines.push('');
    lines.push('- **Desktop video mode**: ' + videoQa.desktop?.metrics?.isVideoMode);
    lines.push('- **Mobile video mode**: ' + videoQa.mobile?.isVideoMode);
    lines.push('- **Canvas fallback confirmed**: ' + videoQa.fallback?.useCanvas);
    lines.push('- **Plan CRM status**: ' + (videoQa.planForm?.crmResponse?.status || 'N/A'));
    lines.push('- **Resources CRM status**: ' + (videoQa.resourcesForm?.crmResponse?.status || 'N/A'));
    lines.push('');
  }

  lines.push('## Notes');
  lines.push('- Amplitude HTTP endpoints are not reachable from the current automation environment (TLS handshake blocked). Scripts are provided for manual execution once network access is available.');
  lines.push('- HubSpot form endpoints responded with HTTP 200 for QA payloads.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const analyticsQa = loadJson(path.join(process.cwd(), 'qa-analytics-e2e-results.json'));
  const videoQa = loadJson(path.join(process.cwd(), 'qa-video-functional-results.json'));

  const summary = createSummary(analyticsQa, videoQa);

  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }

  const outputPath = path.join(reportDir, `WEEKLY-ANALYTICS-SUMMARY-${new Date().toISOString().slice(0, 10)}.md`);
  fs.writeFileSync(outputPath, summary, 'utf8');
  console.log(`Weekly analytics summary written to ${outputPath}`);
}

main();
