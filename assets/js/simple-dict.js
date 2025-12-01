(() => {
  const cache = new Map();
  let currentLocale = null;
  let currentDict = {};

  async function loadDictionary(locale) {
    if (cache.has(locale)) return cache.get(locale);
    try {
      const res = await fetch(`/assets/i18n/dictionaries/${locale}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load dictionary for ${locale}`);
      const json = await res.json();
      cache.set(locale, json);
      return json;
    } catch (err) {
      console.warn('[simple-dict] load failed', err);
      return {};
    }
  }

  async function applyDictionary(locale) {
    console.log(`[simple-dict] Starting applyDictionary for locale: ${locale}`);
    const dict = await loadDictionary(locale);
    console.log(`[simple-dict] Dictionary loaded, keys:`, Object.keys(dict));
    currentLocale = locale;
    currentDict = dict || {};
    const elements = document.querySelectorAll('[data-dict]');
    console.log(`[simple-dict] Found ${elements.length} elements with [data-dict]`);

    let appliedCount = 0;
    let skippedCount = 0;

    elements.forEach((el, idx) => {
      const key = el.getAttribute('data-dict');
      if (!key) {
        skippedCount++;
        return;
      }
      const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), dict);

      if (idx < 5) {
        console.log(`[simple-dict] Element ${idx}: key="${key}", value="${value}", current="${el.textContent?.substring(0, 30)}"`);
      }

      if (typeof value === 'string') {
        el.textContent = value;
        appliedCount++;
      } else {
        skippedCount++;
        if (idx < 5) {
          console.warn(`[simple-dict] No translation for key: ${key}`);
        }
      }
    });

    console.log(`[simple-dict] Applied: ${appliedCount}, Skipped: ${skippedCount}`);
  }

  function get(key, fallback = '') {
    const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), currentDict);
    return typeof value === 'string' ? value : fallback;
  }

  window.simpleDict = { applyDictionary, get, getCurrentLocale: () => currentLocale };
})();
