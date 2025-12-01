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
    const dict = await loadDictionary(locale);
    currentLocale = locale;
    currentDict = dict || {};
    const elements = document.querySelectorAll('[data-dict]');
    elements.forEach(el => {
      const key = el.getAttribute('data-dict');
      if (!key) return;
      const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), dict);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
  }

  function get(key, fallback = '') {
    const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), currentDict);
    return typeof value === 'string' ? value : fallback;
  }

  window.simpleDict = { applyDictionary, get, getCurrentLocale: () => currentLocale };
})();
