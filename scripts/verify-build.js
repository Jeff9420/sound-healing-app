const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const locales = ['en', 'zh', 'ja', 'ko', 'es'];
const requiredHreflangs = ['en', 'zh-Hans', 'ja', 'ko', 'es', 'x-default'];

let hasError = false;

function error(msg) {
    console.error(`❌ ${msg}`);
    hasError = true;
}

function success(msg) {
    console.log(`✅ ${msg}`);
}

console.log('🔍 Starting Build Verification (Regex Mode)...');

// 1. Check Directories
locales.forEach(locale => {
    const dirPath = path.join(rootDir, locale);
    if (!fs.existsSync(dirPath)) {
        error(`Missing directory: /${locale}/`);
    } else {
        success(`Directory exists: /${locale}/`);
    }
});

// 2. Check Index Files & Metadata
const filesToCheck = [
    { path: 'index.html', lang: 'en' }, // Root redirects to en, but let's check if it has hreflangs
    ...locales.map(l => ({ path: `${l}/index.html`, lang: l === 'zh' ? 'zh-Hans' : l }))
];

filesToCheck.forEach(file => {
    const filePath = path.join(rootDir, file.path);
    if (!fs.existsSync(filePath)) {
        error(`Missing file: ${file.path}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check lang attribute
    if (file.path !== 'index.html') {
        const langMatch = content.match(/<html[^>]*lang=["']([^"']+)["']/i);
        if (!langMatch) {
            error(`${file.path}: Could not find lang attribute`);
        } else if (langMatch[1] !== file.lang) {
            error(`${file.path}: Incorrect lang attribute. Expected '${file.lang}', got '${langMatch[1]}'`);
        } else {
            success(`${file.path}: Lang attribute correct (${langMatch[1]})`);
        }
    }

    // Check hreflang tags
    const hreflangRegex = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi;
    const foundHreflangs = [];
    let match;
    while ((match = hreflangRegex.exec(content)) !== null) {
        foundHreflangs.push(match[1]);
    }

    const missingHreflangs = requiredHreflangs.filter(h => !foundHreflangs.includes(h));

    if (missingHreflangs.length > 0) {
        error(`${file.path}: Missing hreflang tags: ${missingHreflangs.join(', ')}`);
    } else {
        success(`${file.path}: All hreflang tags present`);
    }

    // Check canonical
    const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (!canonicalMatch) {
        error(`${file.path}: Missing canonical tag`);
    } else {
        success(`${file.path}: Canonical tag present (${canonicalMatch[1]})`);
    }
});

if (hasError) {
    console.error('\n💥 Verification Failed! Please fix the errors above.');
    process.exit(1);
} else {
    console.log('\n✨ Verification Passed! All systems go.');
    process.exit(0);
}
