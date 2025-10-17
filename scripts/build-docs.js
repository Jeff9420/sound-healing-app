const fs = require("fs");
const path = require("path");

let marked;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  marked = require("marked");
} catch (error) {
  console.warn("[build-docs] marked not found, falling back to basic markdown parser.");
  marked = null;
}

const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");
const OUTPUT_JSON_ROOT = path.join(ROOT, "content");
const OUTPUT_JSON_DIR = path.join(OUTPUT_JSON_ROOT, "docs");
const OUTPUT_PAGES_DIR = path.join(ROOT, "pages", "docs");
const DEFAULT_LANG = "zh-CN";
const SKIP_SECTIONS = new Set(["resources"]); // handled by build-resources.js

const HERO_COPY = {
  "zh-CN": {
    headline: "文档资源中心",
    description: "集中管理带有 Front Matter 的知识文档，统一生成 HTML 页面与 JSON 数据源，方便多语言站点调用。",
  },
  "en-US": {
    headline: "Documentation Library",
    description: "Unified HTML and JSON outputs generated from front-matter Markdown for multilingual consumption.",
  },
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function titleCase(str) {
  if (!str) return "General";
  return str
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function parseFrontMatter(raw) {
  const normalized = raw.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\s*([\s\S]*?)---\s*([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const block = match[1].trim();
  const body = match[2].trim();

  const meta = {};
  let currentArrayKey = null;

  block.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const arrayMatch = line.match(/^\s*-\s+(.*)$/);
    if (arrayMatch && currentArrayKey) {
      const value = arrayMatch[1].trim();
      meta[currentArrayKey].push(coerceType(value));
      return;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      return;
    }

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (!value) {
      meta[key] = [];
      currentArrayKey = key;
    } else {
      meta[key] = coerceType(value);
      currentArrayKey = null;
    }
  });

  return { meta, body };
}

function coerceType(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (!Number.isNaN(Number(value)) && value.trim() !== "") {
    return Number(value);
  }
  return value;
}

function basicMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLanguage = "";

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLanguage = line.replace("```", "").trim();
        html.push(`<pre><code${codeLanguage ? ` class="language-${codeLanguage}"` : ""}>`);
      } else {
        inCode = false;
        html.push("</code></pre>");
      }
      return;
    }

    if (inCode) {
      html.push(line.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
      return;
    }

    if (!line.trim()) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push("");
      return;
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#{1,6}/)[0].length;
      const content = line.slice(level).trim();
      html.push(`<h${level}>${escapeHtml(content)}</h${level}>`);
      return;
    }

    const listMatch = line.match(/^[-*+]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${escapeHtml(listMatch[1])}</li>`);
      return;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      html.push(`<blockquote>${escapeHtml(quoteMatch[1])}</blockquote>`);
      return;
    }

    html.push(`<p>${escapeHtml(line)}</p>`);
  });

  if (inList) {
    html.push("</ul>");
  }
  if (inCode) {
    html.push("</code></pre>");
  }

  return html.join("\n");
}

function markdownToHtml(markdown) {
  if (marked) {
    return marked.parse(markdown);
  }
  return basicMarkdown(markdown);
}

function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(input, fallback) {
  if (input) {
    return input
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;
  }
  return fallback;
}

function collectMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name.startsWith(".")) return;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  });
  return results;
}

function renderDocPage(meta, bodyHtml, lang, sectionTitle) {
  const backHref = lang === DEFAULT_LANG ? "../index.html" : `../index.${lang}.html`;
  const updated = meta.updated ? `<p class="doc-updated">最后更新：${escapeHtml(meta.updated)}</p>` : "";
  const tagHtml = Array.isArray(meta.tags) && meta.tags.length
    ? `<div class="doc-tags">${meta.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(meta.title)} | 文档资源中心</title>
    <meta name="description" content="${escapeHtml(meta.summary || "")}">
    <link rel="stylesheet" href="../../assets/css/resources.css">
</head>
<body>
    <div class="resources-wrapper">
        <a class="back-link" href="${backHref}">← 返回文档中心</a>
        <section class="resources-hero">
            <span class="resource-category">${escapeHtml(sectionTitle)}</span>
            <h1>${escapeHtml(meta.title)}</h1>
            <p class="hero-desc">${escapeHtml(meta.summary || "")}</p>
            ${updated}
            ${tagHtml}
        </section>
        <section class="resource-content">
${bodyHtml}
        </section>
    </div>
</body>
</html>`;
}

function build() {
  ensureDir(OUTPUT_JSON_ROOT);
  ensureDir(OUTPUT_JSON_DIR);
  ensureDir(OUTPUT_PAGES_DIR);

  const docsByLang = new Map();
  const files = collectMarkdownFiles(DOCS_DIR);
  let processedCount = 0;
  let skippedCount = 0;

  files.forEach((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = parseFrontMatter(raw);
    if (!parsed) {
      skippedCount += 1;
      return;
    }

    const { meta, body } = parsed;
    if (!meta.title) {
      console.warn(`[build-docs] Missing title in front matter: ${filePath}`);
      skippedCount += 1;
      return;
    }

    const relativePath = path.relative(DOCS_DIR, filePath);
    const pathSegments = relativePath.split(path.sep);
    const inferredSection = pathSegments.length > 1 ? pathSegments[0] : "general";
    const sectionId = (meta.section || meta.collection || meta.category || inferredSection || "general").trim();
    if (SKIP_SECTIONS.has(sectionId)) {
      skippedCount += 1;
      return;
    }

    const lang = (meta.lang || DEFAULT_LANG).trim();
    const slug = slugify(meta.slug, slugify(path.basename(filePath, ".md"), "doc"));
    const sectionTitle = meta.section_title || titleCase(sectionId);
    const sectionDescription = meta.section_description || "";

    const langDir = path.join(OUTPUT_PAGES_DIR, sectionId);
    ensureDir(langDir);

    const bodyHtml = markdownToHtml(body);
    const fileName = lang === DEFAULT_LANG ? `${slug}.html` : `${slug}.${lang}.html`;
    const outputPath = path.join(langDir, fileName);
    fs.writeFileSync(outputPath, renderDocPage(meta, bodyHtml, lang, sectionTitle), "utf-8");

    if (!docsByLang.has(lang)) {
      docsByLang.set(lang, new Map());
    }
    const sectionsMap = docsByLang.get(lang);
    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        id: sectionId,
        title: sectionTitle,
        description: sectionDescription,
        order: typeof meta.section_order === "number" ? meta.section_order : Number(meta.section_order) || 999,
        items: [],
      });
    }

    const sectionEntry = sectionsMap.get(sectionId);
    sectionEntry.description = sectionEntry.description || sectionDescription;
    if (meta.section_title) {
      sectionEntry.title = meta.section_title;
    }
    if (meta.section_order !== undefined) {
      sectionEntry.order = Number(meta.section_order) || sectionEntry.order;
    }

    sectionEntry.items.push({
      title: meta.title,
      summary: meta.summary || "",
      href: `${sectionId}/${fileName}`,
      slug,
      lang,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      updated: meta.updated || null,
      order: typeof meta.order === "number" ? meta.order : Number(meta.order) || Number(meta.weight) || null,
      source_path: relativePath.replace(/\\/g, "/"),
    });

    processedCount += 1;
  });

  const languages = docsByLang.size ? Array.from(docsByLang.keys()) : [DEFAULT_LANG];
  languages.forEach((lang) => {
    const sectionsMap = docsByLang.get(lang) || new Map();
    const sectionsArray = Array.from(sectionsMap.values())
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, lang))
      .map((section) => {
        const items = section.items
          .slice()
          .sort((a, b) => {
            const orderA = a.order ?? 999;
            const orderB = b.order ?? 999;
            if (orderA !== orderB) return orderA - orderB;
            return a.title.localeCompare(b.title, lang);
          })
          .map(({ order, ...rest }) => rest);
        return {
          id: section.id,
          title: section.title,
          description: section.description || "",
          items,
        };
      });

    const json = {
      language: lang,
      generated_at: new Date().toISOString(),
      hero: HERO_COPY[lang] || HERO_COPY[DEFAULT_LANG],
      sections: sectionsArray,
      totals: {
        sections: sectionsArray.length,
        documents: sectionsArray.reduce((total, section) => total + section.items.length, 0),
      },
    };

    const langFileName = lang === DEFAULT_LANG ? "docs.json" : `docs.${lang}.json`;
    ensureDir(OUTPUT_JSON_DIR);
    fs.writeFileSync(path.join(OUTPUT_JSON_DIR, langFileName), JSON.stringify(json, null, 2), "utf-8");

    if (lang === DEFAULT_LANG) {
      fs.writeFileSync(path.join(OUTPUT_JSON_ROOT, "docs.json"), JSON.stringify(json, null, 2), "utf-8");
    }
  });

  console.log(`[build-docs] Processed ${processedCount} markdown file(s), skipped ${skippedCount}.`);
}

build();

