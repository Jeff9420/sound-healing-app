const fs = require('fs');
const https = require('https');

const URLS = [
  'https://soundflows.app/',
  'https://soundflows.app/sitemap.xml',
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
  const results = [];
  for (const url of URLS) {
    results.push(await fetchStatus(url));
  }

  let report = '# Daily SEO Health Report\n\n';
  report += 'Generated: ' + new Date().toISOString() + '\n\n';
  report += results.map((result) => {
    if (result.error) {
      return '- [!] ' + result.url + ' -> ERROR: ' + result.error;
    }
    return '- [' + result.statusCode + '] ' + result.url;
  }).join('\n');

  const dir = 'docs/reports';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outputPath = dir + '/SEO-DAILY-REPORT-' + new Date().toISOString().slice(0, 10) + '.md';
  fs.writeFileSync(outputPath, report);
  console.log('Daily SEO report generated at', outputPath);
})();
