(function () {
  if (typeof window === 'undefined') return;

  const HRV_RANGE = { min: 64, max: 72 };
  const moodMap = {
    default: ['Calm', 'Centered', 'Flow'],
    zh: ['平静', '平衡', '流动'],
    ja: ['穏やか', '集中', 'フロー'],
    ko: ['차분함', '균형', '몰입'],
    es: ['Sereno', 'Equilibrado', 'Fluir']
  };

  function getLocaleKey() {
    const lang = (document.documentElement.lang || 'en').toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('es')) return 'es';
    return 'default';
  }

  function pickMood() {
    const key = getLocaleKey();
    const list = moodMap[key] || moodMap.default;
    return list[Math.floor(Math.random() * list.length)];
  }

  function sampleHRV() {
    const { min, max } = HRV_RANGE;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function updateIndicators(hrvValue, moodValue) {
    document.querySelectorAll('[data-ai-hrv]').forEach((el) => {
      el.textContent = String(hrvValue);
    });

    document.querySelectorAll('[data-ai-mood]').forEach((el) => {
      el.textContent = moodValue;
    });
  }

  window.startAISignaturePlan = function startAISignaturePlan(source) {
    const hrvValue = sampleHRV();
    const moodValue = pickMood();

    updateIndicators(hrvValue, moodValue);

    if (typeof window.openPlayerModal === 'function') {
      window.openPlayerModal(true);
    }

    document.body.dispatchEvent(
      new CustomEvent('soundflows.aiSignatureStart', {
        bubbles: true,
        detail: {
          source: source || 'ai-module',
          hrv: hrvValue,
          mood: moodValue,
          language: document.documentElement.lang || 'en',
          path: window.location.pathname
        }
      })
    );
  };
})();
