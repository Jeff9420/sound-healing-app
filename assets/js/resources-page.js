(function(){
    const pageLang = document.documentElement.lang || "en-US";
    const candidateUrls = [
        `../../content/resources.${pageLang}.json`,
        "../../content/resources.json"
    ];

    const createElement = (tag, className, text) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    };

    const createCtaButton = (label, href, id, extraClass = "") => {
        if (!href) return null;
        const a = document.createElement("a");
        a.className = extraClass;
        a.href = href;
        a.textContent = label;
        if (id) {
            a.dataset.track = id;
            a.dataset.cta = id;
        }
        return a;
    };

    const computeSlug = (href = "") => {
        const withoutHash = href.split("#")[0];
        const withoutQuery = withoutHash.split("?")[0];
        return withoutQuery.replace(/\.html$/i, "");
    };

    const trackContentEvent = (eventName, payload) => {
        if (typeof window.trackContentEngagement === "function") {
            window.trackContentEngagement(eventName, payload);
        } else if (window.soundFlowsAnalytics && typeof window.soundFlowsAnalytics.trackContentEngagement === "function") {
            window.soundFlowsAnalytics.trackContentEngagement(eventName, payload);
        }
    };

    const attachCtaTracking = (element, payloadBuilder) => {
        if (!element) return;
        element.addEventListener("click", () => {
            const payload = typeof payloadBuilder === "function" ? payloadBuilder(element) : payloadBuilder;
            trackContentEvent("content_cta_click", payload);
        });
    };

    fetchSequential(candidateUrls)
        .then(data => {
            renderHero(data.hero);
            renderSections(data.sections || []);
            renderFooterCta(data.footer_cta);
        })
        .catch(err => {
            console.error(err);
            const container = document.getElementById("resourcesSections");
            if (container) {
                const error = createElement("p", "load-error", "Resources failed to load, please try again later.");
                container.appendChild(error);
            }
        });

    function fetchSequential(urls) {
        const [first, ...rest] = urls;
        if (!first) return Promise.reject(new Error("No data source available"));
        return fetch(first).then(res => {
            if (!res.ok) throw new Error(`Failed to load: ${first}`);
            return res.json();
        }).catch(err => {
            if (!rest.length) throw err;
            return fetchSequential(rest);
        });
    }

    function renderHero(hero){
        if (!hero) return;
        const heroSection = document.getElementById("resourcesHero");
        if (!heroSection) return;
        const titleEl = heroSection.querySelector("h1");
        const descEl = heroSection.querySelector(".hero-desc");
        const actionsEl = heroSection.querySelector(".hero-actions");
        if (titleEl) titleEl.textContent = hero.headline || "Sound Healing Resource Hub";
        if (descEl) descEl.textContent = hero.description || "Curated guides, videos and stories, updated weekly.";
        if (actionsEl){
            actionsEl.innerHTML = "";
            const primary = createCtaButton(hero.primary_cta?.label || "Fill Needs Form", hero.primary_cta?.href, hero.primary_cta?.id, "hero-btn-primary");
            const secondary = createCtaButton(hero.secondary_cta?.label || "View Case Studies", hero.secondary_cta?.href, hero.secondary_cta?.id, "hero-btn-secondary");
            if (primary) {
                actionsEl.appendChild(primary);
                attachCtaTracking(primary, () => ({
                    category: "hero",
                    stage: "consideration",
                    source: "resources-hero",
                    ctaId: primary.dataset.cta || "resources-hero-primary",
                    content_category: "hero",
                    content_title: hero.headline || ""
                }));
            }
            if (secondary) {
                actionsEl.appendChild(secondary);
                attachCtaTracking(secondary, () => ({
                    category: "hero",
                    stage: "discover",
                    source: "resources-hero",
                    ctaId: secondary.dataset.cta || "resources-hero-secondary",
                    content_category: "hero",
                    content_title: hero.headline || ""
                }));
            }
        }
    }

    function renderSections(sections){
        const container = document.getElementById("resourcesSections");
        if (!container) return;
        container.innerHTML = "";
        sections.forEach(section => {
            const secEl = createElement("section", "resources-section");
            secEl.id = section.id || "section";
            const h2 = createElement("h2", null, section.title || "Curated Resources");
            secEl.appendChild(h2);
            if (section.description){
                secEl.appendChild(createElement("p", null, section.description));
            }
            const grid = createElement("div", "resource-grid");
            (section.items || []).forEach((item, index) => {
                const card = createElement("article", "resource-card");
                if (item.tag) card.appendChild(createElement("span", null, item.tag));
                card.appendChild(createElement("h3", null, item.title || "Resource"));
                if (item.summary) card.appendChild(createElement("p", null, item.summary));
                if (item.href){
                    const link = createElement("a", null, item.cta || "View Details");
                    link.href = item.href;
                    link.dataset.cta = `resource-${section.id || 'section'}`;
                    link.dataset.track = `resource-${section.id || 'section'}`;
                    link.addEventListener("click", () => {
                        trackContentEvent("content_detail_click", {
                            category: section.id || "section",
                            content_category_name: section.title || "",
                            slug: computeSlug(item.href),
                            title: item.title || "",
                            tag: item.tag || "",
                            position: index,
                            stage: "discover",
                            source: "resources-index",
                            ctaId: link.dataset.cta,
                            content_type: section.id || "section"
                        });
                    });
                    card.appendChild(link);
                }
                grid.appendChild(card);
            });
            secEl.appendChild(grid);
            if (section.view_all){
                const footer = createElement("div", "section-footer");
                const more = createElement("a", null, "View More");
                more.href = section.view_all;
                more.dataset.cta = `resource-${section.id || 'section'}-viewall`;
                more.dataset.track = more.dataset.cta;
                attachCtaTracking(more, () => ({
                    category: section.id || "section",
                    stage: "discover",
                    source: "resources-index",
                    ctaId: more.dataset.cta,
                    content_category: section.id || "section",
                    content_title: section.title || "",
                    interaction_type: "view_all"
                }));
                footer.appendChild(more);
                secEl.appendChild(footer);
            }
            container.appendChild(secEl);
        });
    }

    function renderFooterCta(footer){
        const footerEl = document.getElementById("resourcesFooterCta");
        if (!footerEl) return;
        if (!footer){
            footerEl.style.display = "none";
            return;
        }
        const title = footerEl.querySelector("h2");
        const desc = footerEl.querySelector("p");
        const actions = footerEl.querySelector(".cta-actions");
        if (title) title.textContent = footer.title || "Next Steps";
        if (desc) desc.textContent = footer.description || "Learn how to quickly implement sound healing.";
        if (actions){
            actions.innerHTML = "";
            const primary = createCtaButton(footer.primary?.label || "Submit Practice Needs", footer.primary?.href, footer.primary?.id, "cta-primary");
            const secondary = createCtaButton(footer.secondary?.label || "Download Deployment Guide", footer.secondary?.href, footer.secondary?.id, "cta-secondary");
            if (primary) {
                actions.appendChild(primary);
                attachCtaTracking(primary, () => ({
                    category: "footer",
                    stage: "consideration",
                    source: "resources-footer",
                    ctaId: primary.dataset.cta || "resources-footer-primary",
                    content_category: "footer",
                    content_title: footer.title || ""
                }));
            }
            if (secondary) {
                actions.appendChild(secondary);
                attachCtaTracking(secondary, () => ({
                    category: "footer",
                    stage: "consideration",
                    source: "resources-footer",
                    ctaId: secondary.dataset.cta || "resources-footer-secondary",
                    content_category: "footer",
                    content_title: footer.title || ""
                }));
            }
        }
    }
})();
