#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = process.cwd();
const videoManagerPath = path.join(rootDir, 'assets', 'js', 'video-background-manager.js');
const audioConfigPath = path.join(rootDir, 'assets', 'js', 'audio-config.js');

function extractVideoConfig(content) {
  const match = content.match(/this\.videoConfig\s*=\s*\{([\s\S]*?)\n\s*\};/);
  if (!match) {
    throw new Error('Could not locate videoConfig in video-background-manager.js');
  }
  const full = '({' + match[1] + '})';
  return Function('return ' + full)();
}

function extractAudioConfig(content) {
  const match = content.match(/const\s+AUDIO_CONFIG\s*=\s*({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not locate AUDIO_CONFIG in audio-config.js');
  }
  return Function('return ' + match[1])();
}

function headRequest(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ statusCode: res.statusCode, headers: res.headers });
    });
    req.on('error', (error) => {
      resolve({ error: error.message });
    });
    req.setTimeout(15000, () => {
      req.destroy(new Error('timeout'));
    });
    req.end();
  });
}

(async () => {
  const videoContent = fs.readFileSync(videoManagerPath, 'utf8');
  const audioContent = fs.readFileSync(audioConfigPath, 'utf8');

  const videoConfig = extractVideoConfig(videoContent);
  const audioConfig = extractAudioConfig(audioContent);

  const videoCategories = Object.keys(videoConfig.categories || {});
  const audioCategories = Object.keys(audioConfig.categories || {});

  const missingInVideo = audioCategories.filter((cat) => !videoCategories.includes(cat));
  const missingInAudio = videoCategories.filter((cat) => !audioCategories.includes(cat));

  const baseUrl = videoConfig.baseUrl;
  const results = [];
  for (const [category, meta] of Object.entries(videoConfig.categories)) {
    const file = meta.filename;
    const url = `${baseUrl}${file}`;
    const start = Date.now();
    const response = await headRequest(url);
    const durationMs = Date.now() - start;
    results.push({ category, file, url, durationMs, response });
  }

  const report = {
    runAt: new Date().toISOString(),
    baseUrl,
    summary: {
      videoCategories,
      audioCategories,
      missingInVideo,
      missingInAudio
    },
    results
  };

  fs.writeFileSync('qa-video-results.json', JSON.stringify(report, null, 2));
  console.log('QA report written to qa-video-results.json');
  process.exit(0);
})();
