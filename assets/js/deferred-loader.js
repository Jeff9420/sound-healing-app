/**
 * Deferred Loader
 * 顺序加载非关键脚本，避免阻塞首屏渲染
 */
(function() {
  if (typeof window === 'undefined') {
    return;
  }

  const scripts = (window.LAZY_SCRIPT_QUEUE || []).slice();
  if (!scripts.length) {
    return;
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      console.warn('[deferred-loader] failed:', src);
      resolve(); // 不中断后续加载
    };
    document.body.appendChild(script);
  });

  const schedule = window.requestIdleCallback || function(cb){ setTimeout(cb, 300); };

  function loadSequentially(index) {
    if (index >= scripts.length) return;
    loadScript(scripts[index]).then(() => loadSequentially(index + 1));
  }

  schedule(() => loadSequentially(0));
})();

