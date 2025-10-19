const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const URLS = [
  'https://soundflows.app/pages/meditation/',
  'https://soundflows.app/pages/resources/index.html'
];

function fetchStatus(url) {
  return new Promise((resolve) => {
    const request = https.request(url, (response) => {
      resolve({ url: url, statusCode: response.statusCode });
      response.resume();
    });
    request.on('error', (error) => {
      resolve({ url: url, error: error.message });
    });
    request.end();
  });
}

(async () => {
  let report = '# Weekly SEO Operations Report\n\n';
  report += 'Generated: ' + new Date().toISOString() + '\n\n';

  report += '## Key URL Status\n';
  for (const url of URLS) {
    const result = await fetchStatus(url);
    if (result.error) {
      report += '- [!] ' + result.url + ' -> ERROR: ' + result.error + '\n';
    } else {
      report += '- [' + result.statusCode + '] ' + result.url + '\n';
    }
  }
  report += '\n';

  let lighthouseOutput = 'Unable to run Lighthouse in current environment.';
  try {
    execSync('npx --yes lighthouse https://soundflows.app/ --quiet --chrome-flags="--headless" --output=json --output-path=lighthouse-tmp.json');
    const lighthouseJson = JSON.parse(fs.readFileSync('lighthouse-tmp.json', 'utf8'));
    const categories = lighthouseJson.categories;
    lighthouseOutput = 'Performance: ' + (categories.performance.score * 100) + '\n' +
      'Accessibility: ' + (categories.accessibility.score * 100) + '\n' +
      'Best Practices: ' + (categories['best-practices'].score * 100) + '\n' +
      'SEO: ' + (categories.seo.score * 100);
    fs.unlinkSync('lighthouse-tmp.json');
  } catch (error) {
    // Keep default message
  }
  report += '## Lighthouse Snapshot\n' + lighthouseOutput + '\n\n';

  const dir = 'docs/reports';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const outputPath = dir + '/SEO-WEEKLY-REPORT-' + new Date().toISOString().slice(0, 10) + '.md';
  fs.writeFileSync(outputPath, report);
  console.log('Weekly SEO report generated at', outputPath);
})();
