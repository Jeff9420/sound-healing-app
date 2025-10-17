(function () {
    const pageLang = document.documentElement.lang || "zh-CN";
    const candidateUrls = [
        `../../content/docs.${pageLang}.json`,
        "../../content/docs.json"
    ];

    const createElement = (tag, className, text) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    };

    const createLink = (href, label, extraClass = "") => {
        const a = document.createElement("a");
        if (extraClass) a.className = extraClass;
        a.href = href;
        a.textContent = label;
        return a;
    };

    function fetchSequential(urls) {
        const [first, ...rest] = urls;
        if (!first) return Promise.reject(new Error("No data source available"));
        return fetch(first)
            .then((res) => {
                if (!res.ok) throw new Error(`加载失败: ${first}`);
                return res.json();
            })
            .catch((err) => {
                if (!rest.length) throw err;
                return fetchSequential(rest);
            });
    }

    fetchSequential(candidateUrls)
        .then((data) => {
            renderHero(data.hero);
            renderSections(data.sections || []);
            renderStats(data.totals || {});
        })
        .catch((error) => {
            console.error("[docs-page] Failed to load docs JSON", error);
            const container = document.getElementById("docsSections");
            if (container) {
                container.innerHTML = "";
                container.appendChild(createElement("p", "load-error", "文档列表加载失败，请稍后再试。"));
            }
        });

    function renderHero(hero) {
        const heroSection = document.getElementById("docsHero");
        if (!heroSection) return;
        const titleEl = heroSection.querySelector("h1");
        const descEl = heroSection.querySelector(".hero-desc");
        if (titleEl) titleEl.textContent = hero?.headline || "文档资源中心";
        if (descEl) descEl.textContent = hero?.description || "集中管理所有带 front matter 的 Markdown 文档。";
    }

    function renderStats(totals) {
        const statsEl = document.getElementById("docsStats");
        if (!statsEl) return;
        statsEl.innerHTML = "";
        const metrics = [
            { label: "文档数量", value: totals.documents || 0 },
            { label: "分类数量", value: totals.sections || 0 }
        ];
        metrics.forEach((metric) => {
            const card = createElement("div", "stat-card");
            card.appendChild(createElement("strong", null, String(metric.value)));
            card.appendChild(createElement("span", null, metric.label));
            statsEl.appendChild(card);
        });
    }

    function renderSections(sections) {
        const container = document.getElementById("docsSections");
        if (!container) return;
        container.innerHTML = "";

        sections.forEach((section) => {
            const secEl = createElement("section", "resources-section");
            secEl.id = section.id || "section";
            secEl.appendChild(createElement("h2", null, section.title || "文档分类"));
            if (section.description) {
                secEl.appendChild(createElement("p", null, section.description));
            }

            const grid = createElement("div", "resource-grid");
            (section.items || []).forEach((item) => {
                const card = createElement("article", "resource-card");
                card.appendChild(createElement("h3", null, item.title || "文档"));
                if (item.summary) {
                    card.appendChild(createElement("p", null, item.summary));
                }
                if (item.updated) {
                    const meta = createElement("p", "doc-meta", `更新日期：${item.updated}`);
                    card.appendChild(meta);
                }
                if (Array.isArray(item.tags) && item.tags.length) {
                    const tagsEl = createElement("div", "doc-tags");
                    item.tags.forEach((tag) => {
                        tagsEl.appendChild(createElement("span", null, tag));
                    });
                    card.appendChild(tagsEl);
                }
                if (item.href) {
                    const link = createLink(item.href, "查看详情 →");
                    card.appendChild(link);
                }
                grid.appendChild(card);
            });

            secEl.appendChild(grid);
            container.appendChild(secEl);
        });
    }
})();

