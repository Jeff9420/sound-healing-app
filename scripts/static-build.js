/**
 * Static build pipeline
 * - Runs Vite build (for PWA assets/service worker)
 * - Copies all static site content into dist so CI (Lighthouse) and Vercel have full pages
 *
 * Keeps the pipeline simple (KISS) and avoids over-engineering (YAGNI).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dist = path.join(root, 'dist');

const includeDirs = [
  'assets',
  'en',
  'zh',
  'sleep-sounds',
  'meditation-focus',
  'anxiety-sound-healing',
  'chakra-sound-healing',
  'blog',
  'location',
  'content-distribution',
  'pages',
  'api'
];

const allowedRootExtensions = new Set([
  '.html',
  '.xml',
  '.txt',
  '.json',
  '.webmanifest',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico',
  '.js',
  '.css',
  '.map'
]);

const skipNames = new Set([
  'node_modules',
  'dist',
  '.git',
  '.github',
  '.vercel',
  '.serena',
  '.playwright-mcp',
  '.dev',
  '.claude',
  '%USERPROFILE%.configclaude-code'
]);

function cleanDist() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
}

function runViteBuild() {
  execSync('npx vite build', { stdio: 'inherit' });
}

function copyDirIfExists(dirName, targetName = dirName) {
  const srcPath = path.join(root, dirName);
  if (!fs.existsSync(srcPath)) return;
  const destPath = path.join(dist, targetName);
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }
  copyRecursive(srcPath, destPath);
}

function copyRecursive(srcPath, destPath) {
  const stats = fs.statSync(srcPath);
  if (stats.isDirectory()) {
    fs.mkdirSync(destPath, { recursive: true });
    for (const entry of fs.readdirSync(srcPath)) {
      const srcChild = path.join(srcPath, entry);
      const destChild = path.join(destPath, entry);
      copyRecursive(srcChild, destChild);
    }
    return;
  }
  if (stats.isFile()) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

function copyRootFiles() {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    if (skipNames.has(entry.name)) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedRootExtensions.has(ext)) continue;
    const srcPath = path.join(root, entry.name);
    const destPath = path.join(dist, entry.name);
    if (fs.existsSync(destPath)) continue;
    fs.copyFileSync(srcPath, destPath);
  }
}

function main() {
  try {
    console.log('🧹 Cleaning dist...');
    cleanDist();

    console.log('🏗️  Running Vite build (PWA assets)...');
    runViteBuild();
    console.log('🔍 process.exitCode after Vite:', process.exitCode);

    console.log('📦 Copying static directories...');
    for (const dir of includeDirs) {
      console.log(`  - ${dir}`);
      copyDirIfExists(dir);
    }
    console.log('✅ Static directories copied');

    console.log('📄 Copying root static files...');
    copyRootFiles();

    console.log('✅ Static build complete. Output:', dist);
  } catch (error) {
    console.error('❌ Static build failed:', error);
    process.exit(1);
  }
}

main();
