const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs", "resources");
const OUTPUT_JSON_DIR = path.join(ROOT, "content");
const OUTPUT_PAGES_DIR = path.join(ROOT, "pages", "resources");
const DEFAULT_LANG = "zh-CN";

const SECTION_CONFIG = {
  guides: {
    order: 1,
    tags: { "zh-CN": "指南", "en-US": "Guide" },
    titles: { "zh-CN": "实践指南", "en-US": "Practice Guides" },
    descriptions: {
      "zh-CN": "循序渐进的操作手册，把冥想、睡眠、解压按步骤落地。",
      "en-US": "Step-by-step guides to bring meditation, sleep, and stress relief into daily routine."
    }
  },
  videos: {
    order: 2,
    tags: { "zh-CN": "视频", "en-US": "Video" },
    titles: { "zh-CN": "短视频课堂", "en-US": "Video Lessons" },
    descriptions: {
      "zh-CN": "用 1-3 分钟的实操视频，随时打开练习。",
      "en-US": "1-3 minute practical lessons you can play anytime."
    }
  },
  stories: {
    order: 3,
    tags: { "zh-CN": "故事", "en-US": "Story" },
    titles: { "zh-CN": "真实用户故事", "en-US": "User Stories" },
    descriptions: {
      "zh-CN": "真实用户如何把声音疗愈融入生活与职场，提供可执行灵感。",
      "en-US": "Real users weaving sound healing into life and work, offering actionable inspiration."
    }
  },
  experts: {
    order: 4,
    tags: { "zh-CN": "访谈", "en-US": "Interview" },
    titles: { "zh-CN": "疗愈专家访谈", "en-US": "Expert Interviews" },
    descriptions: {
      "zh-CN": "和临床心理师、冥想导师对话，了解声音疗愈的专业视角。",
      "en-US": "Conversations with therapists and mentors for professional perspectives."
    }
  },
  endorsements: {
    order: 5,
    tags: { "zh-CN": "背书", "en-US": "Endorsement" },
    titles: { "zh-CN": "品牌背书", "en-US": "Brand Endorsements" },
    descriptions: {
      "zh-CN": "合作企业与机构的推荐，展示声音疗愈方案的可信背书。",
      "en-US": "Testimonials from partner brands that validate the sound healing program."
    }
  },
  blog: {
    order: 6,
    tags: { "zh-CN": "博客", "en-US": "Blog" },
    titles: { "zh-CN": "博客文章", "en-US": "Blog Articles" },
    descriptions: {
      "zh-CN": "从科学、生活方式到工作技巧，让声音疗愈体系化。",
      "en-US": "From science to lifestyle and work tips, systematise sound healing."
    }
  },
  downloads: {
    order: 7,
    tags: { "zh-CN": "下载", "en-US": "Download" },
    titles: { "zh-CN": "下载资料", "en-US": "Downloads" },
    descriptions: {
      "zh-CN": "可直接应用的方案和表格，帮你快速落地声音疗愈。",
      "en-US": "Practical plans and sheets to deploy sound healing quickly."
    }
  }
};

const HERO_CONFIG = {
  "zh-CN": {
    headline: "声音疗愈资源枢纽 · 精选练习随时取用",
    description: "每周更新操作手册、短视频与真实故事，全部免费，帮助你在团队或个人节奏里落地声音疗愈。",
    primary_cta: { label: "填写需求表单", href: "../../index.html#conversionOffer", id: "resources-plan" },
    secondary_cta: { label: "查看实践案例", href: "../../index.html#impactProof", id: "resources-impact" }
  },
  "en-US": {
    headline: "Sound Healing Library · Free practice kits anytime",
    description: "Guides, videos and real stories updated weekly so you can deploy sound healing without extra cost.",
    primary_cta: { label: "Submit practice request", href: "../../index.html#conversionOffer", id: "resources-plan" },
    secondary_cta: { label: "See case studies", href: "../../index.html#impactProof", id: "resources-impact" }
  }
};

const FOOTER_CTA = {
  "zh-CN": {
    title: "想把声音疗愈推广给团队或学员？",
    description: "先填写需求表，我们会在 1 个工作日内回访；也可直接下载部署指南，先行自助试用。",
    primary: { label: "提交练习需求", href: "../../index.html#conversionOffer", id: "resources-book-demo" },
    secondary: { label: "下载部署指南", href: "download-enterprise-guide.html", id: "resources-download-guide" }
  },
  "en-US": {
    title: "Ready to roll sound healing out to your team?",
    description: "Share your goals and we’ll respond within one business day, or grab the deployment guide to start on your own.",
    primary: { label: "Submit a practice request", href: "../../index.html#conversionOffer", id: "resources-book-demo" },
    secondary: { label: "Download deployment guide", href: "download-enterprise-guide.html", id: "resources-download-guide" }
  }
};

function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const normalized = raw.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\s*([\s\S]*?)---\s*([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing front matter in ${filePath}`);
  }
  const yaml = match[1];
  const body = match[2].trim();
  const meta = {};
  yaml.split(/\r?\n/).forEach(line => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  });
  if (!meta.slug) {
    const base = path.basename(filePath, path.extname(filePath));
    meta.slug = base;
  }
  meta.lang = meta.lang || DEFAULT_LANG;
  meta.category = meta.category || 'guides';
  meta.tag = meta.tag || SECTION_CONFIG[meta.category]?.tags?.[meta.lang] || meta.category;
  meta.summary = meta.summary || '';
  meta.keywords = meta.keywords || '';
  meta.updated = meta.updated || new Date().toISOString().slice(0, 10);
  return { meta, body };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = false;
  for (const line of lines) {
    if (!line.trim()) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push('');
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h3>${line.slice(4).trim()}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h2>${line.slice(3).trim()}</h2>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${line.slice(2).trim()}</li>`);
      continue;
    }
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    html.push(`<p>${line.trim()}</p>`);
  }
  if (inList) {
    html.push('</ul>');
  }
  return html.join('\n');
}

function renderResourcePage(meta, bodyHtml, lang) {
  const categoryName = SECTION_CONFIG[meta.category]?.titles?.[lang] || meta.category;
  const relIndex = lang === DEFAULT_LANG ? 'index.html' : `index.${lang}.html`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title} | 声音疗愈资源中心</title>
    <meta name="description" content="${meta.summary}">
    <meta name="keywords" content="${meta.keywords}">
    <link rel="stylesheet" href="../../assets/css/resources.css">
</head>
<body>
    <div class="resources-wrapper">
        <a class="back-link" href="${relIndex}">← 返回资源中心</a>
        <section class="resources-hero">
            <span class="resource-category">${categoryName}</span>
            <h1>${meta.title}</h1>
            <p class="hero-desc">${meta.summary}</p>
            <div class="hero-actions">
                <a class="hero-btn-primary" href="../../index.html#conversionOffer" data-cta="detail-plan">填写需求表单</a>
                <a class="hero-btn-secondary" href="../../index.html#impactProof" data-cta="detail-impact">查看实践案例</a>
            </div>
        </section>

        <section class="resource-content">
${bodyHtml}
        </section>

        <section class="resource-actions">
            <h3>下一步行动</h3>
            <div class="cta-actions">
                <a class="cta-primary" href="../../index.html#conversionOffer" data-cta="detail-collect">提交我的练习需求</a>
                <a class="cta-secondary" href="../../pages/resources/index.html#resourcesHero" data-cta="detail-subscribe">订阅每周精选</a>
            </div>
        </section>

        <section class="resource-related">
            <h3>延伸阅读</h3>
            <ul>
                <li><a href="sleep-routine.html">30 分钟睡前音疗步骤</a></li>
                <li><a href="video-rain-bowl.html">雨声 + 颂钵混音实操</a></li>
                <li><a href="../../index.html#journeyShowcase">探索更多疗愈场景 →</a></li>
            </ul>
        </section>
    </div>
    <script src="../../assets/js/crm-bridge.js"></script>
    <script src="../../assets/js/email-automation.js"></script>
    <script src="../../assets/js/gtm-events.js"></script>
</body>
</html>`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function build() {
  ensureDir(DOCS_DIR);
  ensureDir(OUTPUT_JSON_DIR);
  ensureDir(OUTPUT_PAGES_DIR);

  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
  const resourcesByLang = new Map();

  files.forEach(file => {
    const filePath = path.join(DOCS_DIR, file);
    const { meta, body } = parseMarkdownFile(filePath);
    const lang = meta.lang || DEFAULT_LANG;
    const section = SECTION_CONFIG[meta.category];
    if (!section) {
      console.warn(`Unknown category ${meta.category} in ${file}`);
      return;
    }
    if (!resourcesByLang.has(lang)) {
      resourcesByLang.set(lang, []);
    }
    resourcesByLang.get(lang).push({ meta, body });
  });

  resourcesByLang.forEach((entries, lang) => {
    const sectionsMap = new Map();
    entries.forEach(({ meta, body }) => {
      const sectionCfg = SECTION_CONFIG[meta.category];
      if (!sectionsMap.has(meta.category)) {
        sectionsMap.set(meta.category, []);
      }
      const href = lang === DEFAULT_LANG ? `${meta.slug}.html` : `${meta.slug}.${lang}.html`;
      sectionsMap.get(meta.category).push({
        tag: meta.tag || sectionCfg.tags?.[lang] || meta.category,
        title: meta.title,
        summary: meta.summary,
        href,
        order: sectionCfg.order
      });

      const bodyHtml = markdownToHtml(body);
      const pageHtml = renderResourcePage(meta, bodyHtml, lang);
      const pageFile = lang === DEFAULT_LANG ? `${meta.slug}.html` : `${meta.slug}.${lang}.html`;
      fs.writeFileSync(path.join(OUTPUT_PAGES_DIR, pageFile), pageHtml, 'utf-8');
    });

    const sectionsArray = Array.from(sectionsMap.entries())
      .sort((a, b) => SECTION_CONFIG[a[0]].order - SECTION_CONFIG[b[0]].order)
      .map(([category, items]) => {
        const cfg = SECTION_CONFIG[category];
        return {
          id: category,
          title: cfg.titles?.[lang] || category,
          description: cfg.descriptions?.[lang] || '',
          view_all: cfg.view_all ? cfg.view_all : undefined,
          items: items.map(item => ({
            tag: item.tag,
            title: item.title,
            summary: item.summary,
            href: item.href
          }))
        };
      });

    const json = {
      hero: HERO_CONFIG[lang] || HERO_CONFIG[DEFAULT_LANG],
      sections: sectionsArray,
      footer_cta: FOOTER_CTA[lang] || FOOTER_CTA[DEFAULT_LANG]
    };

    const jsonFile = path.join(OUTPUT_JSON_DIR, `resources.${lang}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2), 'utf-8');
    if (lang === DEFAULT_LANG) {
      fs.writeFileSync(path.join(OUTPUT_JSON_DIR, 'resources.json'), JSON.stringify(json, null, 2), 'utf-8');
      const indexHtml = fs.readFileSync(path.join(ROOT, 'pages', 'resources', 'index.html'), 'utf-8')
        .replace('<html lang="zh-CN">', `<html lang="${lang}">`);
      fs.writeFileSync(path.join(OUTPUT_PAGES_DIR, 'index.html'), indexHtml, 'utf-8');
    } else {
      const baseIndex = fs.readFileSync(path.join(OUTPUT_PAGES_DIR, 'index.html'), 'utf-8');
      const localized = baseIndex
        .replace('lang="zh-CN"', `lang="${lang}"`)
        .replace('../../content/resources.json', `../../content/resources.${lang}.json`);
      fs.writeFileSync(path.join(OUTPUT_PAGES_DIR, `index.${lang}.html`), localized, 'utf-8');
    }
  });

  console.log(`Generated resources for languages: ${Array.from(resourcesByLang.keys()).join(', ')}`);
}

build();
