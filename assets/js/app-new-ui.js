
// ========== 鍏ㄥ眬閿欒澶勭悊鍜岀敤鎴峰弽棣堢郴缁?==========
class ErrorHandler {
  constructor() {
    this.setupGlobalHandlers();
    this.setupUserNotification();
  }

  setupGlobalHandlers() {
    // 鎹曡幏JavaScript閿欒
    window.addEventListener('error', (event) => {
      console.error('JavaScript Error:', {
        message: event.error?.message || '鏈煡閿欒',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });

      // 鏍规嵁閿欒绫诲瀷鎻愪緵鏇村叿浣撶殑寤鸿
      let userMessage = '搴旂敤绋嬪簭閬囧埌闂';
      let suggestion = '璇峰埛鏂伴〉闈㈤噸璇?;

      if (event.error?.message?.includes('network')) {
        userMessage = '缃戠粶杩炴帴閿欒';
        suggestion = '璇锋鏌ユ偍鐨勭綉缁滆繛鎺ュ悗閲嶈瘯';
      } else if (event.error?.message?.includes('memory')) {
        userMessage = '鍐呭瓨涓嶈冻';
        suggestion = '璇峰叧闂叾浠栨爣绛鹃〉鍚庨噸璇?;
      } else if (event.error?.message?.includes('audio')) {
        userMessage = '闊抽鎾斁閿欒';
        suggestion = '璇峰皾璇曢€夋嫨鍏朵粬闊抽鏂囦欢';
      }

      this.showUserFriendlyError(userMessage, suggestion);
    });

    // 鎹曡幏Promise鏈鐞嗙殑鎷掔粷
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        timestamp: new Date().toISOString()
      });

      let userMessage = '鎿嶄綔澶辫触';
      let suggestion = '璇烽噸璇?;

      if (event.reason?.message?.includes('fetch')) {
        userMessage = '鏁版嵁鍔犺浇澶辫触';
        suggestion = '璇锋鏌ョ綉缁滆繛鎺ュ悗鍒锋柊椤甸潰';
      } else if (event.reason?.message?.includes('timeout')) {
        userMessage = '璇锋眰瓒呮椂';
        suggestion = '缃戠粶杈冩參锛岃绋嶅悗閲嶈瘯';
      }

      this.showUserFriendlyError(userMessage, suggestion);
      event.preventDefault();
    });
  }

  setupUserNotification() {
    // 鍒涘缓閫氱煡瀹瑰櫒
    if (!document.getElementById('errorNotificationContainer')) {
      const notificationContainer = document.createElement('div');
      notificationContainer.id = 'errorNotificationContainer';
      notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      `;
      document.body.appendChild(notificationContainer);
    }
  }

  showUserFriendlyError(title, message, duration = 5000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: rgba(220, 53, 69, 0.95);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${title}</div>
      <div style="font-size: 13px; opacity: 0.9;">${message}</div>
      <button onclick="this.parentNode.remove()" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      ">脳</button>
    `;

    const container = document.getElementById('errorNotificationContainer');
    if (container) {
      container.appendChild(notification);

      // 鑷姩绉婚櫎
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
  }

  showAudioError(audioFile, errorType) {
    const errorMessages = {
      'format': `闊抽鏍煎紡涓嶆敮鎸侊細${audioFile}`,
      'network': `鍔犺浇澶辫触锛?{audioFile}`,
      'decode': `闊抽鏂囦欢鎹熷潖锛?{audioFile}`,
      'permission': '闊抽鎾斁琚祻瑙堝櫒闃绘锛岃鐐瑰嚮鎾斁鎸夐挳'
    };

    const message = errorMessages[errorType] || `闊抽鎾斁鍑洪敊锛?{audioFile}`;
    this.showUserFriendlyError('闊抽鎾斁闂', message);
  }
}

// ========== 鎬ц兘鐩戞帶鍜屽唴瀛樼鐞嗙郴缁?==========
class PerformanceManager {
  constructor() {
    this.activeAnimations = new Set();
    this.activeIntervals = new Set();
    this.activeTimeouts = new Set();
    this.audioInstances = new Map();
    this.isTabVisible = true;
    this.setupVisibilityHandling();
    this.setupPerformanceMonitoring();
  }

  setupVisibilityHandling() {
    // 椤甸潰鍙鎬у彉鍖栨椂鏆傚仠/鎭㈠鍔ㄧ敾
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;

      if (this.isTabVisible) {
        this.resumeAnimations();
      } else {
        this.pauseAnimations();
      }
    });
  }

  setupPerformanceMonitoring() {
    // 姣?0绉掓鏌ユ€ц兘
    this.addInterval(() => {
      this.checkMemoryUsage();
      this.optimizeAnimations();
    }, 30000);
  }

  checkMemoryUsage() {
    if (performance.memory) {
      const memInfo = performance.memory;
      const usedPercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;

      console.log(`鍐呭瓨浣跨敤: ${Math.round(usedPercent)}%`);

      if (usedPercent > 80) {
        this.emergencyCleanup();
        window.soundHealingErrorHandler?.showUserFriendlyError(
          '鍐呭瓨浣跨敤杩囬珮',
          '宸茶嚜鍔ㄤ紭鍖栵紝寤鸿鍏抽棴鍏朵粬鏍囩椤?
        );
      }
    }
  }

  emergencyCleanup() {
    // 寮哄埗鍨冨溇鍥炴敹鍜屾竻鐞?
    this.pauseAnimations();
    this.clearOldAudioInstances();

    // 2绉掑悗鎭㈠鍏抽敭鍔ㄧ敾
    setTimeout(() => {
      this.resumeAnimations();
    }, 2000);
  }

  // 甯х巼闄愬埗鐨勫姩鐢荤鐞?
  createThrottledAnimation(callback, fps = 60) {
    let lastTime = 0;
    const interval = 1000 / fps;

    const animate = (currentTime) => {
      if (currentTime - lastTime >= interval) {
        callback(currentTime);
        lastTime = currentTime;
      }

      if (this.isTabVisible) {
        const animationId = requestAnimationFrame(animate);
        this.activeAnimations.add(animationId);
      }
    };

    const animationId = requestAnimationFrame(animate);
    this.activeAnimations.add(animationId);
    return animationId;
  }

  pauseAnimations() {
    this.activeAnimations.forEach(id => {
      cancelAnimationFrame(id);
    });
  }

  resumeAnimations() {
    // 閲嶆柊鍚姩鍏抽敭鍔ㄧ敾
    if (window.restartAnimations) {
      window.restartAnimations();
    }
  }

  optimizeAnimations() {
    // 鏍规嵁璁惧鎬ц兘璋冩暣鍔ㄧ敾澶嶆潅搴?
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isLowEnd = devicePixelRatio < 2 && navigator.hardwareConcurrency < 4;

    if (isLowEnd) {
      this.reduceAnimationComplexity();
    }
  }

  reduceAnimationComplexity() {
    // 闄嶄綆绮掑瓙鏁伴噺鍜屽抚鐜?
    const particles = document.querySelectorAll('.floating-particles');
    particles.forEach(container => {
      const children = container.children;
      for (let i = children.length - 1; i >= children.length / 2; i--) {
        if (children[i]) children[i].remove();
      }
    });
  }

  // 闊抽瀹炰緥绠＄悊
  registerAudioInstance(id, audio) {
    this.audioInstances.set(id, {
      audio,
      lastUsed: Date.now()
    });
  }

  clearOldAudioInstances() {
    const now = Date.now();
    const maxAge = 300000; // 5鍒嗛挓

    this.audioInstances.forEach((instance, id) => {
      if (now - instance.lastUsed > maxAge && instance.audio.paused) {
        instance.audio.src = '';
        instance.audio.load();
        this.audioInstances.delete(id);
      }
    });
  }

  // 瀹夊叏鐨勫畾鏃跺櫒绠＄悊
  addInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.activeIntervals.add(id);
    return id;
  }

  addTimeout(callback, delay) {
    const id = setTimeout(() => {
      callback();
      this.activeTimeouts.delete(id);
    }, delay);
    this.activeTimeouts.add(id);
    return id;
  }

  cleanup() {
    // 娓呯悊鎵€鏈夋椿鍔ㄧ殑瀹氭椂鍣ㄥ拰鍔ㄧ敾
    this.activeAnimations.forEach(id => cancelAnimationFrame(id));
    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeTimeouts.forEach(id => clearTimeout(id));

    this.activeAnimations.clear();
    this.activeIntervals.clear();
    this.activeTimeouts.clear();

    // 娓呯悊闊抽瀹炰緥
    this.audioInstances.forEach(instance => {
      instance.audio.pause();
      instance.audio.src = '';
      instance.audio.load();
    });
    this.audioInstances.clear();
  }
}

// ========== 鏃犻殰纰嶅姛鑳藉寮虹郴缁?==========
class AccessibilityManager {
  constructor() {
    this.setupKeyboardNavigation();
    this.setupAriaLabels();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
  }

  setupKeyboardNavigation() {
    // 鍏ㄥ眬閿洏蹇嵎閿?
    document.addEventListener('keydown', (event) => {
      // 闃叉鍦ㄨ緭鍏ユ涓Е鍙戝揩鎹烽敭
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        return;
      }

      switch(event.key.toLowerCase()) {
        case ' ':
        case 'spacebar':
          event.preventDefault();
          this.togglePlayPause();
          break;
        case 'arrowleft':
          if (event.ctrlKey) {
            event.preventDefault();
            this.previousTrack();
          }
          break;
        case 'arrowright':
          if (event.ctrlKey) {
            event.preventDefault();
            this.nextTrack();
          }
          break;
        case 'arrowup':
          if (event.ctrlKey) {
            event.preventDefault();
            this.adjustVolume(10);
          }
          break;
        case 'arrowdown':
          if (event.ctrlKey) {
            event.preventDefault();
            this.adjustVolume(-10);
          }
          break;
        case 'm':
          if (event.ctrlKey) {
            event.preventDefault();
            this.toggleMute();
          }
          break;
        case 's':
          if (event.ctrlKey) {
            event.preventDefault();
            this.toggleShuffle();
          }
          break;
        case 'r':
          if (event.ctrlKey) {
            event.preventDefault();
            this.toggleRepeat();
          }
          break;
        case 'escape':
          event.preventDefault();
          this.closeFocusedModal();
          break;
      }
    });
  }

  setupAriaLabels() {
    // 绛夊緟DOM鍔犺浇瀹屾垚鍚庤缃瓵RIA鏍囩
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.addAriaLabels());
    } else {
      this.addAriaLabels();
    }
  }

  addAriaLabels() {
    // 涓昏鎺у埗鎸夐挳
    this.setAriaLabel('playPauseBtn', '鎾斁/鏆傚仠', '鎸夌┖鏍奸敭鎾斁鎴栨殏鍋滈煶棰?);
    this.setAriaLabel('prevBtn', '涓婁竴棣?, '鎸塁trl+宸︾澶村垏鎹㈠埌涓婁竴棣?);
    this.setAriaLabel('nextBtn', '涓嬩竴棣?, '鎸塁trl+鍙崇澶村垏鎹㈠埌涓嬩竴棣?);
    this.setAriaLabel('shuffleBtnVisible', '闅忔満鎾斁', '鎸塁trl+S鍒囨崲闅忔満鎾斁妯″紡');
    this.setAriaLabel('repeatBtnVisible', '寰幆鎾斁', '鎸塁trl+R鍒囨崲寰幆鎾斁妯″紡');

    // 婊戝潡鎺у埗
    this.setAriaLabel('volumeRange', '闊抽噺鎺у埗', '鎸塁trl+涓婁笅绠ご璋冭妭闊抽噺');
    this.setAriaLabel('progressRange', '鎾斁杩涘害', '鎷栧姩璋冭妭鎾斁杩涘害');

    // 涓婚瀵艰埅
    this.setAriaLabel('carouselPrev', '涓婁竴涓富棰?, '鍒囨崲鍒颁笂涓€涓煶棰戜富棰?);
    this.setAriaLabel('carouselNext', '涓嬩竴涓富棰?, '鍒囨崲鍒颁笅涓€涓煶棰戜富棰?);

    // 璇█鍒囨崲
    this.setAriaLabel('languageToggle', '璇█鍒囨崲', '鐐瑰嚮鍒囨崲鐣岄潰璇█');

    // 瀹氭椂鍣ㄩ€夋嫨
    this.setAriaLabel('timerSelect', '瀹氭椂鍣ㄨ缃?, '閫夋嫨闊抽鎾斁鏃堕暱');

    // 鎾斁鍒楄〃
    this.setAriaLabel('trackList', '闊宠建鍒楄〃', '褰撳墠涓婚鐨勯煶杞ㄥ垪琛?);
    this.setAriaLabel('playFirstBtn', '鎾斁鍏ㄩ儴', '浠庣涓€棣栧紑濮嬫挱鏀惧綋鍓嶄富棰樼殑鎵€鏈夐煶杞?);
    this.setAriaLabel('togglePlaylistBtn', '鍒囨崲鏄剧ず', '鍒囨崲鎾斁鍒楄〃鐨勬樉绀烘柟寮?);

    // 涓鸿繘搴﹀鍣ㄦ坊鍔犲彲璁块棶鎬?
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
      progressContainer.setAttribute('role', 'slider');
      progressContainer.setAttribute('aria-label', '鎾斁杩涘害鎺у埗');
      progressContainer.setAttribute('tabindex', '0');
    }
  }

  setAriaLabel(elementId, label, description) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-label', label);
      element.setAttribute('title', description);

      // 纭繚鎸夐挳鍙€氳繃閿洏璁块棶
      if (element.tagName === 'BUTTON' && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    }
  }

  setupScreenReaderSupport() {
    // 鍒涘缓灞忓箷闃呰鍣ㄤ笓鐢ㄧ殑鐘舵€侀€氬憡鍖哄煙
    const liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);

    // 鍒涘缓绱ф€ラ€氬憡鍖哄煙
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'sr-assertive-region';
    assertiveRegion.className = 'sr-only';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(assertiveRegion);
  }

  announceToScreenReader(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'sr-assertive-region' : 'sr-live-region';
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;
      // 娓呴櫎娑堟伅浠ヤ究涓嬫鐩稿悓娑堟伅鑳借璇诲嚭
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  setupFocusManagement() {
    // 鏀瑰杽鐒︾偣鍙鎬?
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  // 閿洏蹇嵎閿搴旂殑鍔熻兘
  togglePlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.click();
      const isPlaying = playPauseBtn.querySelector('.control-icon').textContent.includes('鈴?);
      this.announceToScreenReader(isPlaying ? '闊抽宸叉挱鏀? : '闊抽宸叉殏鍋?);
    }
  }

  previousTrack() {
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.click();
      this.announceToScreenReader('鍒囨崲鍒颁笂涓€棣?);
    }
  }

  nextTrack() {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.click();
      this.announceToScreenReader('鍒囨崲鍒颁笅涓€棣?);
    }
  }

  adjustVolume(delta) {
    const volumeRange = document.getElementById('volumeRange');
    if (volumeRange) {
      const currentValue = parseInt(volumeRange.value);
      const newValue = Math.max(0, Math.min(100, currentValue + delta));
      volumeRange.value = newValue;

      // 瑙﹀彂input浜嬩欢浠ユ洿鏂伴煶閲?
      const event = new Event('input', { bubbles: true });
      volumeRange.dispatchEvent(event);

      this.announceToScreenReader(`闊抽噺璋冩暣涓?${newValue}%`);
    }
  }

  toggleMute() {
    const volumeRange = document.getElementById('volumeRange');
    if (volumeRange) {
      const currentValue = parseInt(volumeRange.value);
      if (currentValue > 0) {
        // 闈欓煶
        volumeRange.dataset.previousVolume = currentValue;
        volumeRange.value = 0;
        this.announceToScreenReader('闊抽宸查潤闊?);
      } else {
        // 鎭㈠闊抽噺
        const previousVolume = volumeRange.dataset.previousVolume || '50';
        volumeRange.value = previousVolume;
        this.announceToScreenReader(`闊抽噺鎭㈠涓?${previousVolume}%`);
      }

      const event = new Event('input', { bubbles: true });
      volumeRange.dispatchEvent(event);
    }
  }

  toggleShuffle() {
    const shuffleBtn = document.getElementById('shuffleBtnVisible');
    if (shuffleBtn) {
      shuffleBtn.click();
      const isActive = shuffleBtn.classList.contains('active');
      this.announceToScreenReader(isActive ? '闅忔満鎾斁宸插紑鍚? : '闅忔満鎾斁宸插叧闂?);
    }
  }

  toggleRepeat() {
    const repeatBtn = document.getElementById('repeatBtnVisible');
    if (repeatBtn) {
      repeatBtn.click();
      const isActive = repeatBtn.classList.contains('active');
      this.announceToScreenReader(isActive ? '寰幆鎾斁宸插紑鍚? : '寰幆鎾斁宸插叧闂?);
    }
  }

  closeFocusedModal() {
    // 濡傛灉鏈夋ā鎬佹鎴栦笅鎷夎彍鍗曟墦寮€锛屽叧闂畠浠?
    const modals = document.querySelectorAll('.modal, .dropdown-open');
    modals.forEach(modal => {
      if (modal.style.display !== 'none' && modal.offsetParent !== null) {
        modal.style.display = 'none';
        this.announceToScreenReader('瀵硅瘽妗嗗凡鍏抽棴');
      }
    });
  }

  // 鏇存柊鎾斁鐘舵€佺殑鏃犻殰纰嶄俊鎭?
  updatePlaybackStatus(trackName, isPlaying, currentTime, totalTime) {
    const statusText = isPlaying
      ? `姝ｅ湪鎾斁: ${trackName}, ${currentTime} / ${totalTime}`
      : `鏆傚仠: ${trackName}, ${currentTime} / ${totalTime}`;

    // 鏇存柊鎾斁鎸夐挳鐨勭姸鎬?
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.setAttribute('aria-pressed', isPlaying.toString());
    }

    // 瀹氭湡鏇存柊浣嗕笉杩囦簬棰戠箒
    if (!this.lastStatusUpdate || Date.now() - this.lastStatusUpdate > 5000) {
      this.announceToScreenReader(statusText);
      this.lastStatusUpdate = Date.now();
    }
  }

  // 鏇存柊涓婚鍒囨崲鐨勬棤闅滅淇℃伅
  updateThemeStatus(themeName, trackCount) {
    this.announceToScreenReader(`涓婚宸插垏鎹㈠埌: ${themeName}, 鍏?{trackCount}棣栭煶杞╜);
  }
}

// ========== 闊抽鏍煎紡鍏煎鎬х鐞嗙郴缁?==========
class AudioCompatibilityManager {
  constructor() {
    this.supportedFormats = new Map();
    this.formatFallbacks = new Map();
    this.setupFormatFallbacks();
    this.detectSupportedFormats();
  }

  setupFormatFallbacks() {
    // 璁剧疆鏍煎紡闄嶇骇鏂规
    this.formatFallbacks.set('mp3', ['mp3', 'wav', 'ogg']);
    this.formatFallbacks.set('wav', ['wav', 'mp3', 'ogg']);
    this.formatFallbacks.set('ogg', ['ogg', 'mp3', 'wav']);
    this.formatFallbacks.set('wma', ['mp3', 'wav', 'ogg']); // WMA鍏煎鎬у樊锛屼紭鍏堥檷绾у埌mp3
    this.formatFallbacks.set('aac', ['mp3', 'wav', 'ogg']);
    this.formatFallbacks.set('flac', ['wav', 'mp3', 'ogg']);
  }

  detectSupportedFormats() {
    const audio = document.createElement('audio');
    const formats = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'aac': 'audio/aac',
      'wma': 'audio/x-ms-wma',
      'flac': 'audio/flac'
    };

    for (const [format, mimeType] of Object.entries(formats)) {
      const canPlay = audio.canPlayType(mimeType);
      const isSupported = canPlay === 'probably' || canPlay === 'maybe';
      this.supportedFormats.set(format, isSupported);

      console.log(`闊抽鏍煎紡鏀寔妫€娴?- ${format.toUpperCase()}: ${isSupported ? '鏀寔' : '涓嶆敮鎸?} (${canPlay || 'empty'})`);
    }

    // 杈撳嚭鏀寔鐨勬牸寮忔憳瑕?
    const supportedList = Array.from(this.supportedFormats.entries())
      .filter(([format, supported]) => supported)
      .map(([format]) => format.toUpperCase());

    console.log(`娴忚鍣ㄦ敮鎸佺殑闊抽鏍煎紡: ${supportedList.join(', ')}`);

    if (supportedList.length === 0) {
      window.soundHealingErrorHandler?.showUserFriendlyError(
        '闊抽鍏煎鎬ч棶棰?,
        '褰撳墠娴忚鍣ㄥ彲鑳戒笉鏀寔闊抽鎾斁锛岃灏濊瘯鏇存柊娴忚鍣?
      );
    }
  }

  findCompatibleFormat(originalPath) {
    const pathInfo = this.parseAudioPath(originalPath);
    const originalFormat = pathInfo.extension;

    // 濡傛灉鍘熸牸寮忚鏀寔锛岀洿鎺ヨ繑鍥?
    if (this.supportedFormats.get(originalFormat)) {
      return {
        path: originalPath,
        format: originalFormat,
        isOriginal: true
      };
    }

    // 鏌ユ壘闄嶇骇鏍煎紡
    const fallbacks = this.formatFallbacks.get(originalFormat) || ['mp3', 'wav', 'ogg'];

    for (const fallbackFormat of fallbacks) {
      if (this.supportedFormats.get(fallbackFormat)) {
        const fallbackPath = pathInfo.basePath + '.' + fallbackFormat;
        return {
          path: fallbackPath,
          format: fallbackFormat,
          isOriginal: false,
          originalFormat: originalFormat
        };
      }
    }

    // 濡傛灉閮戒笉鏀寔锛岃繑鍥瀗ull
    return null;
  }

  parseAudioPath(path) {
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return {
        basePath: path,
        extension: 'mp3', // 榛樿鎵╁睍鍚?
        fullPath: path
      };
    }

    return {
      basePath: path.substring(0, lastDotIndex),
      extension: path.substring(lastDotIndex + 1).toLowerCase(),
      fullPath: path
    };
  }

  async createCompatibleAudio(originalPath) {
    const compatibilityInfo = this.findCompatibleFormat(originalPath);

    if (!compatibilityInfo) {
      throw new Error(`鏃犳硶鎵惧埌鍏煎鐨勯煶棰戞牸寮? ${originalPath}`);
    }

    const audio = new Audio();

    // 璁剧疆閿欒澶勭悊
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`闊抽鍔犺浇瓒呮椂: ${compatibilityInfo.path}`));
      }, 10000); // 10绉掕秴鏃?

      audio.addEventListener('canplaythrough', () => {
        clearTimeout(timeout);

        if (!compatibilityInfo.isOriginal) {
          console.log(`闊抽鏍煎紡闄嶇骇: ${originalPath} -> ${compatibilityInfo.path}`);
          window.soundHealingErrorHandler?.showUserFriendlyError(
            '闊抽鏍煎紡宸茶嚜鍔ㄨ皟鏁?,
            `宸蹭娇鐢ㄥ吋瀹规牸寮忔挱鏀?(${compatibilityInfo.format.toUpperCase()})`,
            3000
          );
        }

        resolve({
          audio: audio,
          compatibilityInfo: compatibilityInfo
        });
      });

      audio.addEventListener('error', (event) => {
        clearTimeout(timeout);

        const errorTypes = {
          1: 'MEDIA_ERR_ABORTED',
          2: 'MEDIA_ERR_NETWORK',
          3: 'MEDIA_ERR_DECODE',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
        };

        const errorType = errorTypes[audio.error?.code] || 'UNKNOWN_ERROR';
        const errorMessage = `闊抽鍔犺浇澶辫触: ${compatibilityInfo.path} (${errorType})`;

        console.error(errorMessage);
        window.soundHealingErrorHandler?.showAudioError(compatibilityInfo.path, 'format');

        reject(new Error(errorMessage));
      });

      // 灏濊瘯鍔犺浇闊抽
      audio.preload = 'metadata';
      audio.src = compatibilityInfo.path;
      audio.load();
    });
  }

  // 鎵归噺妫€娴嬮煶棰戞枃浠舵槸鍚﹀瓨鍦?
  async validateAudioFiles(audioConfig) {
    const validationResults = new Map();
    const checkPromises = [];

    for (const [categoryKey, category] of Object.entries(audioConfig.categories)) {
      for (const [audioKey, audioInfo] of Object.entries(category.audio)) {
        const originalPath = audioInfo.file;
        const promise = this.checkAudioFileExists(originalPath)
          .then(exists => {
            validationResults.set(originalPath, exists);
            if (!exists) {
              console.warn(`闊抽鏂囦欢涓嶅瓨鍦? ${originalPath}`);
            }
          })
          .catch(error => {
            validationResults.set(originalPath, false);
            console.error(`闊抽鏂囦欢妫€鏌ュけ璐? ${originalPath}`, error);
          });

        checkPromises.push(promise);
      }
    }

    await Promise.all(checkPromises);
    return validationResults;
  }

  async checkAudioFileExists(path) {
    return new Promise((resolve) => {
      const audio = new Audio();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);

      audio.addEventListener('canplaythrough', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      audio.addEventListener('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      audio.preload = 'metadata';
      audio.src = path;
      audio.load();
    });
  }

  // 鑾峰彇鏍煎紡鏀寔鎶ュ憡
  getCompatibilityReport() {
    const report = {
      supportedFormats: Array.from(this.supportedFormats.entries())
        .filter(([format, supported]) => supported)
        .map(([format]) => format),
      unsupportedFormats: Array.from(this.supportedFormats.entries())
        .filter(([format, supported]) => !supported)
        .map(([format]) => format),
      hasBasicSupport: this.supportedFormats.get('mp3') || this.supportedFormats.get('wav'),
      recommendedAction: null
    };

    if (!report.hasBasicSupport) {
      report.recommendedAction = '寤鸿鏇存柊娴忚鍣ㄤ互鑾峰緱鏇村ソ鐨勯煶棰戞敮鎸?;
    } else if (report.supportedFormats.length < 2) {
      report.recommendedAction = '闊抽鍏煎鎬ф湁闄愶紝鏌愪簺鍔熻兘鍙兘鍙楀奖鍝?;
    }

    return report;
  }
}

// 鍒濆鍖栫郴缁?
window.addEventListener('DOMContentLoaded', () => {
  window.soundHealingErrorHandler = new ErrorHandler();
  window.soundHealingPerformance = new PerformanceManager();
  window.soundHealingAccessibility = new AccessibilityManager();
  window.soundHealingCompatibility = new AudioCompatibilityManager();

  // 杈撳嚭鍏煎鎬ф姤鍛?
  setTimeout(() => {
    const compatibilityReport = window.soundHealingCompatibility.getCompatibilityReport();
    console.log('=== 闊抽鍏煎鎬ф姤鍛?===');
    console.log('鏀寔鏍煎紡:', compatibilityReport.supportedFormats);
    console.log('涓嶆敮鎸佹牸寮?', compatibilityReport.unsupportedFormats);
    console.log('鍩虹鏀寔:', compatibilityReport.hasBasicSupport ? '鏄? : '鍚?);
    if (compatibilityReport.recommendedAction) {
      console.log('寤鸿:', compatibilityReport.recommendedAction);
      window.soundHealingErrorHandler?.showUserFriendlyError(
        '闊抽鍏煎鎬ф彁閱?,
        compatibilityReport.recommendedAction,
        4000
      );
    }
  }, 1000);

  // 椤甸潰鍗歌浇鏃舵竻鐞嗚祫婧?
  window.addEventListener('beforeunload', () => {
    window.soundHealingPerformance?.cleanup();
  });
});

(() => {
  'use strict';

  const pad = (value) => String(value).padStart(2, '0');
  const sysTimeEl = document.getElementById('sysTime');
  const btEl = document.getElementById('bt');
  const uptimeEl = document.getElementById('uptime');
  const bigClock = document.getElementById('bigClock');
  const dateStr = document.getElementById('dateStr');

  const updateSys = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    if (sysTimeEl) sysTimeEl.textContent = `${pad(hour12)}:${minutes}:${seconds} ${meridiem}`;
    if (btEl) btEl.textContent = `${60 + (now.getSeconds() % 35)}%`;
  };

  const updateClock = () => {
    const now = new Date();
    if (bigClock) bigClock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (dateStr) dateStr.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const updateUptime = (start) => {
    if (!uptimeEl) return;
    const diff = Math.floor((Date.now() - start) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    uptimeEl.textContent = `${hours} hour, ${minutes} mins`;
  };

  const start = Date.now();
  updateSys();
  updateClock();
  updateUptime(start);
  setInterval(updateSys, 1000);
  setInterval(updateClock, 1000);
  setInterval(() => updateUptime(start), 60000);
})();

// ========== 鑷劧鍦烘櫙鍔ㄧ敾绯荤粺 ==========
(() => {
  'use strict';

  const cvs = document.getElementById('natureCanvas');
  if (!cvs) return;

  const ctx = cvs.getContext('2d');
  let w, h, particles = [];
  let currentTheme = 'default';

  // 涓婚鍦烘櫙閰嶇疆
  const sceneConfigs = {
    'Animal sounds': {
      colors: ['#7ba05b', '#9bb86b', '#6d9a4f', '#8fbc7f'],
      particleType: 'leaves',
      particleCount: 25,
      speed: 0.8,
      bgGradient: ['rgba(123,160,91,0.1)', 'rgba(155,184,107,0.05)']
    },
    'Chakra': {
      colors: ['#a56de8', '#b884f0', '#9960e0', '#c89cf5'],
      particleType: 'energy',
      particleCount: 30,
      speed: 1.2,
      bgGradient: ['rgba(165,109,232,0.1)', 'rgba(184,132,240,0.05)']
    },
    'Fire': {
      colors: ['#e8956d', '#f0a684', '#e0835f', '#f5b89c'],
      particleType: 'sparks',
      particleCount: 35,
      speed: 1.5,
      bgGradient: ['rgba(232,149,109,0.15)', 'rgba(240,166,132,0.08)']
    },
    'Rain': {
      colors: ['#6db5e8', '#84c6f0', '#5fa8e0', '#9cd1f5'],
      particleType: 'drops',
      particleCount: 40,
      speed: 2.0,
      bgGradient: ['rgba(109,181,232,0.1)', 'rgba(132,198,240,0.05)']
    },
    'hypnosis': {
      colors: ['#a56de8', '#7986cb', '#9575cd', '#ba68c8'],
      particleType: 'cosmic',
      particleCount: 20,
      speed: 0.6,
      bgGradient: ['rgba(165,109,232,0.08)', 'rgba(121,134,203,0.04)']
    },
    'default': {
      colors: ['#e8b86d', '#f0c884', '#e0a85f', '#f5d29c'],
      particleType: 'gentle',
      particleCount: 20,
      speed: 1.0,
      bgGradient: ['rgba(232,184,109,0.08)', 'rgba(240,200,132,0.04)']
    }
  };

  class Particle {
    constructor(config) {
      this.reset(config);
      this.age = Math.random() * 100;
    }

    reset(config) {
      this.x = Math.random() * w;
      this.y = -10;
      this.size = Math.random() * 4 + 2;
      this.speedY = config.speed + Math.random() * 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.opacity = Math.random() * 0.6 + 0.3;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update(config) {
      this.age++;
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      // 鐢熷懡鍛ㄦ湡閫忔槑搴﹀彉鍖?
      if (this.age < 20) {
        this.opacity = (this.age / 20) * 0.6;
      } else if (this.y > h - 50) {
        this.opacity *= 0.95;
      }

      if (this.y > h + 10 || this.opacity < 0.01) {
        this.reset(config);
        this.age = 0;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      const config = sceneConfigs[currentTheme] || sceneConfigs.default;

      switch (config.particleType) {
        case 'leaves':
          this.drawLeaf();
          break;
        case 'drops':
          this.drawRainDrop();
          break;
        case 'sparks':
          this.drawSpark();
          break;
        case 'energy':
          this.drawEnergyParticle();
          break;
        case 'cosmic':
          this.drawCosmicParticle();
          break;
        default:
          this.drawGentle();
      }

      ctx.restore();
    }

    drawLeaf() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawRainDrop() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-0.5, -this.size, 1, this.size * 1.5);
    }

    drawSpark() {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.3;
      ctx.beginPath();
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(this.size, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.7);
      ctx.lineTo(0, this.size * 0.7);
      ctx.stroke();
    }

    drawEnergyParticle() {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCosmicParticle() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }

    drawGentle() {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const resize = () => {
    const {width, height} = cvs.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    cvs.width = Math.floor(width * ratio);
    cvs.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    w = width;
    h = height;
  };

  const initParticles = () => {
    const config = sceneConfigs[currentTheme] || sceneConfigs.default;
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle(config));
    }
  };

  const draw = () => {
    const config = sceneConfigs[currentTheme] || sceneConfigs.default;

    // 娓呯┖鐢诲竷骞剁粯鍒惰儗鏅笎鍙?
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, config.bgGradient[0]);
    gradient.addColorStop(1, config.bgGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 鏇存柊鍜岀粯鍒剁矑瀛?
    particles.forEach(particle => {
      particle.update(config);
      particle.draw();
    });

    requestAnimationFrame(draw);
  };

  // 涓婚鍒囨崲鍔熻兘
  window.updateNatureScene = (theme) => {
    currentTheme = theme;
    initParticles();
  };

  resize();
  initParticles();
  window.addEventListener('resize', resize, {passive: true});

  // 娓呯悊鍑芥暟
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', resize);
  }, {once: true});

  requestAnimationFrame(draw);
})();

// ========== 铏氭嫙涓婚杞挱绯荤粺 ==========
(() => {
  'use strict';

  // 涓婚鏁版嵁
  const themes = [
    { key: 'Animal sounds', name: '妫灄鏍栨伅鍦?, icon: '馃', count: 26 },
    { key: 'Fire', name: '娓╂殩澹佺倝', icon: '馃敟', count: 3 },
    { key: 'hypnosis', name: '姊﹀鑺卞洯', icon: '馃寵', count: 70 },
    { key: 'meditation', name: '绂呭灞辫胺', icon: '馃鈥嶁檧锔?, count: 14 },
    { key: 'Rain', name: '闆ㄦ灄鍦ｅ湴', icon: '鈽?, count: 14 },
    { key: 'running water', name: '婧祦绉樺', icon: '馃挧', count: 6 },
    { key: 'Singing bowl sound', name: '棰傞挼鍦ｆ', icon: '馃幍', count: 61 },
    { key: 'Chakra', name: '鑳介噺鍦哄煙', icon: '馃寛', count: 7 },
    { key: 'Subconscious Therapy', name: '娼滆瘑鏄熷煙', icon: '馃寣', count: 11 }
  ];

  let currentThemeIndex = 0;
  let currentTheme = null;

  // 涓婚鑹插僵鏄犲皠
  const themeColors = {
    'Animal sounds': {
      primary: '#7ba05b',
      secondary: '#9bb86b',
      accent: '#6d9a4f'
    },
    'Fire': {
      primary: '#e8956d',
      secondary: '#f0a684',
      accent: '#e0835f'
    },
    'Rain': {
      primary: '#6db5e8',
      secondary: '#84c6f0',
      accent: '#5fa8e0'
    },
    'hypnosis': {
      primary: '#a56de8',
      secondary: '#b884f0',
      accent: '#9960e0'
    },
    'meditation': {
      primary: '#8fbc7f',
      secondary: '#a5d095',
      accent: '#7ba069'
    },
    'running water': {
      primary: '#6db5e8',
      secondary: '#9cd1f5',
      accent: '#5fa8e0'
    },
    'Singing bowl sound': {
      primary: '#e8b86d',
      secondary: '#f0c884',
      accent: '#e0a85f'
    },
    'Chakra': {
      primary: '#a56de8',
      secondary: '#c89cf5',
      accent: '#9960e0'
    },
    'Subconscious Therapy': {
      primary: '#9575cd',
      secondary: '#ba68c8',
      accent: '#7986cb'
    }
  };

  // 鏇存柊涓婚鑹插僵
  const updateThemeColors = (themeKey) => {
    const colors = themeColors[themeKey] || themeColors['Singing bowl sound'];
    const root = document.documentElement;

    // 鏇存柊CSS鑷畾涔夊睘鎬?
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);

    // 鏇存柊鐣岄潰鍏冪礌鐨勫搧鐗岃壊褰?
    updateBrandElements(colors);
  };

  // 鏇存柊鍝佺墝鍏冪礌
  const updateBrandElements = (colors) => {
    // 鏇存柊褰撳墠涓婚鍥炬爣棰滆壊
    const currentThemeIcon = document.getElementById('currentThemeIcon');
    if (currentThemeIcon) {
      currentThemeIcon.style.filter = `hue-rotate(${getHueRotation(colors.primary)}deg)`;
    }

    // 鏇存柊浠〃鐩樺搧鐗屽浘鏍?
    const brandIcon = document.querySelector('.brand-icon');
    if (brandIcon) {
      brandIcon.style.filter = `hue-rotate(${getHueRotation(colors.primary)}deg)`;
    }

    // 涓虹姸鎬佸崱鐗囨坊鍔犱富棰樿壊褰╂彁绀?
    document.querySelectorAll('.status-card').forEach((card, index) => {
      if (index === 0) { // 褰撳墠涓婚鍗＄墖
        card.style.borderColor = `${colors.primary}40`;
        card.style.background = `${colors.primary}08`;
      }
    });
  };

  // 璁＄畻鑹茬浉鏃嬭浆瑙掑害
  const getHueRotation = (color) => {
    // 绠€鍖栫殑鑹茬浉鏄犲皠
    const colorMap = {
      '#7ba05b': 60,   // 妫灄缁?
      '#e8956d': 20,   // 鐏劙姗?
      '#6db5e8': 200,  // 姘磋摑
      '#a56de8': 270,  // 绱壊
      '#8fbc7f': 90,   // 鍐ユ兂缁?
      '#e8b86d': 40,   // 閲戣壊
      '#9575cd': 250   // 鐤楁剤绱?
    };
    return colorMap[color] || 0;
  };

  // 鑾峰彇DOM鍏冪礌
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const activeNameEl = document.getElementById('carouselActiveName');
  const currentThemeNameEl = document.getElementById('currentThemeName');
  const currentThemeCountEl = document.getElementById('currentThemeCount');
  const trackListEl = document.getElementById('trackList');
  const playFirstBtn = document.getElementById('playFirstBtn');

  // 鏇存柊涓婚鏄剧ず
  const updateThemeDisplay = () => {
    currentTheme = themes[currentThemeIndex];

    if (activeNameEl) activeNameEl.textContent = currentTheme.name;

    // 鏇存柊宸︿晶鐤楁剤闈㈡澘
    if (currentThemeNameEl) currentThemeNameEl.textContent = currentTheme.name;
    if (currentThemeCountEl) currentThemeCountEl.textContent = `${currentTheme.count} 棣栭煶杞╜;

    // 鏇存柊鍦烘櫙鍥炬爣
    const sceneIcon = document.getElementById('sceneIcon');
    if (sceneIcon) sceneIcon.textContent = currentTheme.icon;

    // 鏇存柊鑷劧鍦烘櫙鍔ㄧ敾
    if (typeof window.updateNatureScene === 'function') {
      window.updateNatureScene(currentTheme.key);
    }

    // 鏇存柊涓婚鑹插僵
    updateThemeColors(currentTheme.key);

    // 鏇存柊鎾斁鍒楄〃
    updatePlaylist();
  };

  // 鏇存柊鎾斁鍒楄〃
  const updatePlaylist = () => {
    if (!trackListEl || !currentTheme) return;

    // 鑾峰彇闊抽閰嶇疆
    const config = window.AUDIO_CONFIG;
    if (!config || !config.categories[currentTheme.key]) {
      trackListEl.innerHTML = '<div style="color: #ffffff; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8);">闊抽鏂囦欢鍔犺浇涓?..</div>';
      return;
    }

    const tracks = config.categories[currentTheme.key].files;
    let html = `<div style="color: #7ba05b; margin-bottom: 8px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8);">${currentTheme.icon} ${currentTheme.name} (${tracks.length} 棣?</div>`;

    tracks.forEach((track, index) => {
      const trackName = track.replace(/^\d+[-.\s]*/, '').replace(/\.(mp3|wav|ogg)$/i, '');
      html += `<div style="cursor: pointer; padding: 3px 0; color: #ffffff; font-size: 10px; font-weight: 600; text-shadow: 0 2px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8); border-bottom: 1px solid rgba(255,255,255,0.1);" onclick="selectTrack(${index})">${String(index + 1).padStart(2, '0')}. ${trackName}</div>`;
    });

    trackListEl.innerHTML = html;
  };

  // 涓婚鍒囨崲
  const switchTheme = (direction) => {
    currentThemeIndex += direction;
    if (currentThemeIndex < 0) currentThemeIndex = themes.length - 1;
    if (currentThemeIndex >= themes.length) currentThemeIndex = 0;
    updateThemeDisplay();
  };

  // 缁戝畾浜嬩欢
  if (prevBtn) prevBtn.addEventListener('click', () => switchTheme(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => switchTheme(1));

  // 鎾斁鍏ㄩ儴鎸夐挳
  if (playFirstBtn) {
    playFirstBtn.addEventListener('click', () => {
      if (currentTheme) {
        // 杩欓噷搴旇璋冪敤瀹為檯鐨勬挱鏀惧姛鑳?
        console.log('鎾斁涓婚:', currentTheme.name);
        // 鍙互瑙﹀彂鐜版湁鐨勯煶棰戠鐞嗗櫒
      }
    });
  }

  // 閿洏鎺у埗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') switchTheme(-1);
    if (e.key === 'ArrowRight') switchTheme(1);
  });

  // 鍏ㄥ眬鍑芥暟渚涚偣鍑讳簨浠朵娇鐢?
  window.selectTrack = (index) => {
    if (currentTheme) {
      console.log(`閫夋嫨闊宠建: ${currentTheme.name} - ${index + 1}`);
      // 杩欓噷鍙互瑙﹀彂瀹為檯鐨勯煶杞ㄦ挱鏀?
    }
  };

  // 鍒濆鍖?
  updateThemeDisplay();

  // 鍒濆鍖栧搧鐗岃壊褰?
  updateThemeColors(themes[0].key);
})();

(() => {
  'use strict';

  const resolveConfig = () => {
    if (typeof window !== 'undefined' && window.AUDIO_CONFIG && window.AUDIO_CONFIG.categories) {
      return window.AUDIO_CONFIG;
    }
    if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG && AUDIO_CONFIG.categories) {
      return AUDIO_CONFIG;
    }
    return undefined;
  };

  const config = resolveConfig();
  if (!config || !config.categories) {
    console.error('AUDIO_CONFIG 鏈姞杞芥垨鏃犲垎绫绘暟鎹?);
    return;
  }

  const themeOrder = [
    'Animal sounds',
    'Fire',
    'hypnosis',
    'meditation',
    'Rain',
    'running water',
    'Singing bowl sound',
    'Chakra',
    'Subconscious Therapy'
  ].filter((key) => Object.prototype.hasOwnProperty.call(config.categories, key));

  const themeVisuals = {
    'Rain': { className: 'theme-rain', accent: '#7f8dff' },
    'Animal sounds': { className: 'theme-animal', accent: '#66bb6a' },
    'Fire': { className: 'theme-fire', accent: '#ff7043' },
    'running water': { className: 'theme-water', accent: '#4fc3f7' },
    'meditation': { className: 'theme-meditation', accent: '#ba68c8' },
    'hypnosis': { className: 'theme-hypnosis', accent: '#f06292' },
    'Singing bowl sound': { className: 'theme-temple', accent: '#ffca28' },
    'Chakra': { className: 'theme-chakra', accent: '#9c27b0' },
    'Subconscious Therapy': { className: 'theme-cosmic', accent: '#7e57c2' }
  };

  const categorySlugMap = {
    'Animal sounds': 'animal-sounds',
    'Fire': 'fire-sounds',
    'hypnosis': 'hypnosis',
    'meditation': 'meditation',
    'Rain': 'rain-sounds',
    'running water': 'water-sounds',
    'Singing bowl sound': 'singing-bowls',
    'Chakra': 'chakra-healing',
    'Subconscious Therapy': 'subconscious-therapy'
  };

  const categoryAliases = {
    'animal': 'Animal sounds',
    'animals': 'Animal sounds',
    'animal-sounds': 'Animal sounds',
    'fire': 'Fire',
    'fire-sounds': 'Fire',
    'hypnosis': 'hypnosis',
    'meditation': 'meditation',
    'meditate': 'meditation',
    'rain': 'Rain',
    'rain-sounds': 'Rain',
    'rain-sound': 'Rain',
    'sleep': 'Rain',
    'water': 'running water',
    'water-sounds': 'running water',
    'nature': 'Animal sounds',
    'nature-sounds': 'Animal sounds',
    'singing-bowls': 'Singing bowl sound',
    'singing-bowl': 'Singing bowl sound',
    'bowls': 'Singing bowl sound',
    'chakra': 'Chakra',
    'chakra-healing': 'Chakra',
    'subconscious': 'Subconscious Therapy',
    'subconscious-therapy': 'Subconscious Therapy'
  };

  const resolveCategoryFromInput = (value) => {
    if (!value) return null;
    const normalized = value.toString().toLowerCase().trim().replace(/^#/, '');
    if (!normalized) return null;
    const direct = themeOrder.find((key) => key.toLowerCase() === normalized);
    if (direct) return direct;
    for (const [key, slug] of Object.entries(categorySlugMap)) {
      if (slug === normalized) return key;
    }
    const alias = categoryAliases[normalized];
    if (alias && themeOrder.includes(alias)) return alias;
    return null;
  };

  const getInitialCategoryFromUrl = () => {
    try {
      const url = new URL(window.location.href);
      const queryCategory = resolveCategoryFromInput(url.searchParams.get('category'));
      if (queryCategory) return queryCategory;
    } catch (error) {
      console.warn('URL parsing failed when resolving category', error);
    }
    const hashCategory = resolveCategoryFromInput(window.location.hash);
    if (hashCategory) return hashCategory;
    return null;
  };

  const updateUrlForCategory = (categoryKey) => {
    if (!window.history || typeof window.history.replaceState !== 'function') return;
    try {
      const url = new URL(window.location.href);
      const slug = categorySlugMap[categoryKey] || categoryKey.toLowerCase().replace(/\s+/g, '-');
      url.searchParams.set('category', slug);
      url.hash = '';
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Unable to update URL for category', error);
    }
  };

  let suppressUrlSync = false;
  const playlistPanel = document.getElementById('playlistPanel');
  const playlistBackdrop = document.getElementById('playlistBackdrop');
  const currentThemeBadge = document.getElementById('currentThemeBadge');
  const currentThemeName = document.getElementById('currentThemeName');
  const currentThemeCount = document.getElementById('currentThemeCount');
  const trackListEl = document.getElementById('trackList');
  const playFirstBtn = document.getElementById('playFirstBtn');
  const prevBtn = document.getElementById('prevBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  const nowPlayingCategory = document.getElementById('nowPlayingCategory');
  const playbackStatus = document.getElementById('playbackStatus');
  const playbackIcon = document.getElementById('playbackIcon');
  const playbackExtra = document.getElementById('playbackExtra');
  const progressRange = document.getElementById('progressRange');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const volumeRange = document.getElementById('volumeRange');
  const volumeValue = document.getElementById('volumeValue');
  const timerButtons = Array.from(document.querySelectorAll('.timer-button'));
  const timerStatus = document.getElementById('timerStatus');
  const togglePlaylistBtn = document.getElementById('togglePlaylistBtn');
  const themeCarousel = document.getElementById('themeCarousel');
  const carouselTrack = document.getElementById('themeCarouselTrack');
  const carouselPrevBtn = document.getElementById('carouselPrev');
  const carouselNextBtn = document.getElementById('carouselNext');
  const carouselActiveName = document.getElementById('carouselActiveName');

  const audio = new Audio();
  audio.preload = 'metadata';
  audio.crossOrigin = 'anonymous';
  if (typeof window !== 'undefined') {
    window.__soundDeskAudio = audio;
  }

  let currentCategory = null;
  let currentPlaylist = [];
  let currentTrackIndex = -1;
  let isShuffle = false;
  let isRepeat = false;
  const themeCardMap = new Map();
  let trackButtonList = [];
  let sleepTimerTimeout = null;
  let sleepTimerInterval = null;
  let sleepTimerEnd = null;
  let isUserSeeking = false;
  let isDragging = false; // 杩涘害鏉℃嫋鎷界姸鎬?
  let isPlaylistCollapsed = false;
  let carouselIndex = 0;
  let carouselCards = [];
  let carouselStep = 0;
  const carouselRadius = (() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--carousel-radius');
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 240;
  })();

  const themeClassList = Array.from(new Set(Object.values(themeVisuals).map((visual) => visual && visual.className))).filter(Boolean);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 绠€鍗曠殑缈昏瘧鍑芥暟
  const getTranslation = (key) => {
    const translations = {
      'play': '鎾斁',
      'pause': '鏆傚仠',
      'timer-disabled': '鏈紑鍚?
    };
    return translations[key] || key;
  };

  // 鏇存柊鎾斁/鏆傚仠鎸夐挳鐘舵€?
  const updatePlayPauseButton = () => {
    if (!playPauseBtn) return;

    const isPlaying = !audio.paused;
    const playIcon = playPauseBtn.querySelector('.control-icon');
    const playLabel = playPauseBtn.querySelector('.control-label');

    if (playIcon) {
      playIcon.textContent = isPlaying ? '鈴革笍' : '鈻讹笍';
    }

    if (playLabel) {
      const key = isPlaying ? 'pause' : 'play';
      playLabel.textContent = getTranslation(key);
      playLabel.setAttribute('data-i18n', key);
    }

    // 鏇存柊ARIA鐘舵€?
    playPauseBtn.setAttribute('aria-pressed', String(isPlaying));

    // 鏇存柊鎸夐挳鏍峰紡
    if (isPlaying) {
      playPauseBtn.classList.add('playing');
    } else {
      playPauseBtn.classList.remove('playing');
    }

    // 鏇存柊鐘舵€佸崱鐗?
    updatePlaybackStatus(
      isPlaying ? '姝ｅ湪鎾斁' : '鏆傚仠',
      isPlaying ? '鈻讹笍' : '鈴革笍',
      isPlaying ? '浜彈鐤楁剤闊充箰' : '鐐瑰嚮缁х画鎾斁'
    );

    console.log(`鎾斁鎸夐挳鐘舵€佹洿鏂? ${isPlaying ? '鎾斁涓? : '宸叉殏鍋?}`);
  };

  const sanitizeName = (name) => {
    if (!name) return '';
    let decoded = name;
    try {
      decoded = decodeURIComponent(name);
    } catch (_error) {
      decoded = name;
    }
    return decoded.replace(/\.(mp3|wav|ogg|m4a)$/i, '');
  };

  const updateAccent = (accent) => {
    const color = accent || '#8bb4ff';
    document.documentElement.style.setProperty('--accent', color);
    if (playlistPanel) playlistPanel.style.setProperty('--accent', color);
  };

  const updateThemeClass = (target, className) => {
    if (!target) return;
    themeClassList.forEach((cls) => target.classList.remove(cls));
    if (className) target.classList.add(className);
  };

  const updateTrackHighlight = () => {
    trackButtonList.forEach((btn) => {
      const idx = Number(btn.dataset.index);
      btn.classList.toggle('playing', idx === currentTrackIndex);
    });
  };

  // 鏇存柊鎾斁鐘舵€佹樉绀?
  const updatePlaybackStatus = (status, icon, extra) => {
    if (playbackStatus) playbackStatus.textContent = status;
    if (playbackIcon) playbackIcon.textContent = icon;
    if (playbackExtra) playbackExtra.textContent = extra;
  };

  const resetNowPlaying = () => {
    currentTrackIndex = -1;
    if (nowPlayingTitle) nowPlayingTitle.textContent = '鏆傛湭鎾斁';
    if (currentTimeEl) currentTimeEl.textContent = '00:00';
    if (totalTimeEl) totalTimeEl.textContent = '--:--';
    if (progressRange) {
      progressRange.value = '0';
      progressRange.max = '0';
      progressRange.disabled = true;
    }

    // 閲嶇疆瑙嗚杩涘害鏉?
    const progressDisplay = document.getElementById('progressDisplay');
    if (progressDisplay) {
      progressDisplay.style.width = '0%';
    }

    // 鏇存柊鎾斁鐘舵€?
    updatePlaybackStatus('寰呮満', '鈴革笍', '鍑嗗寮€濮嬬枟鎰?);

    updateTrackHighlight();
  };

  const getAudioUrl = (categoryKey, fileName) => {
    const category = config.categories[categoryKey];
    if (!category) return '';
    const baseUrl = config.baseUrl || '';
    const folder = category.folder ? `${category.folder}/` : '';
    return `${baseUrl}${folder}${encodeURIComponent(fileName)}`;
  };

  const renderPlaylist = () => {
    if (!trackListEl) return;

    trackListEl.innerHTML = '';
    trackButtonList = [];
    trackListEl.classList.toggle('collapsed', isPlaylistCollapsed);

    if (!currentPlaylist.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-placeholder';
      empty.textContent = '璇ヤ富棰樻殏鏈敹褰曢煶棰?;
      trackListEl.appendChild(empty);
      return;
    }

    currentPlaylist.forEach((file, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'track-item';
      btn.dataset.index = String(index);
      btn.dataset.filename = file;
      btn.innerHTML = `
        <span class="track-number">${String(index + 1).padStart(2, '0')}</span>
        <div class="track-info">
          <span class="track-name">${sanitizeName(file)}</span>
          <span class="track-duration">--:--</span>
        </div>`;
      btn.addEventListener('click', () => {
        if (currentCategory) playTrack(index);
      });
      trackListEl.appendChild(btn);
      trackButtonList.push(btn);
    });

    updateTrackHighlight();
  };

  const setPlaylistCollapsed = (collapsed) => {
    isPlaylistCollapsed = collapsed;
    if (trackListEl) trackListEl.classList.toggle('collapsed', collapsed);
    if (playlistPanel) playlistPanel.classList.toggle('collapsed', collapsed);
    if (togglePlaylistBtn) {
      togglePlaylistBtn.textContent = collapsed ? '灞曞紑鍒楄〃' : '鏀惰捣鍒楄〃';
      togglePlaylistBtn.setAttribute('aria-expanded', String(!collapsed));
    }
  };

  const updateCarouselRotation = () => {
    if (!carouselTrack || !carouselCards.length) return;
    const rotation = carouselStep ? -carouselIndex * carouselStep : 0;
    carouselTrack.style.transform = `translateZ(-${carouselRadius}px) rotateY(${rotation}deg)`;
    carouselCards.forEach((card, index) => {
      const angle = carouselStep * index;
      card.style.transform = `rotateY(${angle}deg) translateZ(${carouselRadius}px)`;
      card.classList.toggle('active', index === carouselIndex);
    });
    if (carouselActiveName) {
      const key = themeOrder[carouselIndex] || '';
      const data = key ? config.categories[key] : null;
      carouselActiveName.textContent = (data && data.name) || key || '璇烽€夋嫨涓婚';
    }
  };

  const renderThemeCarousel = () => {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = '';
    themeCardMap.clear();
    carouselCards = [];

    const themeCount = themeOrder.length;
    carouselStep = themeCount ? 360 / themeCount : 0;

    themeOrder.forEach((key, index) => {
      const data = config.categories[key];
      if (!data) return;
      const visual = themeVisuals[key] || {};
      const card = document.createElement('button');
      card.type = 'button';
      card.className = ['carousel-card', 'theme-visual', visual.className].filter(Boolean).join(' ');
      card.dataset.category = key;
      const icon = data.icon || '馃幍';
      const title = data.name || key;
      const subtitle = data.description || '娌夋蹈寮忓０闊虫梾绋?;
      card.innerHTML = `
        <span class="carousel-card__icon">${icon}</span>
        <span class="carousel-card__title">${title}</span>
        <span class="carousel-card__subtitle">${subtitle}</span>`;
      card.addEventListener('click', () => {
        carouselIndex = index;
        selectCategory(key);
      });
      carouselTrack.appendChild(card);
      carouselCards.push(card);
      themeCardMap.set(key, card);
    });

    updateCarouselRotation();
  };

  const syncCarouselToCategory = (categoryKey) => {
    const index = themeOrder.indexOf(categoryKey);
    if (index >= 0) {
      carouselIndex = index;
      updateCarouselRotation();
    }
  };

  const rotateCarousel = (direction) => {
    if (!themeOrder.length) return;
    const nextIndex = (carouselIndex + direction + themeOrder.length) % themeOrder.length;
    selectCategory(themeOrder[nextIndex]);
  };

  const selectCategory = (categoryKey, options = {}) => {
    const { skipUrlSync = false } = options;
    const data = config.categories[categoryKey];
    if (!data) return;

    const visual = themeVisuals[categoryKey] || {};
    updateThemeClass(playlistPanel, visual.className);
    updateThemeClass(playlistBackdrop, visual.className);
    updateAccent(visual.accent);

    themeCardMap.forEach((card, key) => {
      card.classList.toggle('active', key === categoryKey);
    });
    syncCarouselToCategory(categoryKey);

    const isNewCategory = currentCategory !== categoryKey;
    currentCategory = categoryKey;

    if (isNewCategory) {
      currentPlaylist = Array.isArray(data.files) ? data.files.slice() : [];
      renderPlaylist();

      // 鍙湁鍦ㄩ煶棰戞病鏈夋挱鏀炬椂鎵嶉噸缃挱鏀惧櫒鐘舵€?
      // 濡傛灉闊抽姝ｅ湪鎾斁锛屼繚鎸佹挱鏀剧姸鎬佷絾鏇存柊鎾斁鍒楄〃
      if (audio.paused || !audio.src) {
        audio.removeAttribute('src');
        audio.load();
        resetNowPlaying();
        clearSleepTimer({ keepButtons: true });
      }
      // 濡傛灉闊抽姝ｅ湪鎾斁锛屼繚鎸佹挱鏀剧姸鎬侊紝鍙洿鏂癠I鏄剧ず
    }

    if (!skipUrlSync && !suppressUrlSync) updateUrlForCategory(categoryKey);

    if (currentThemeBadge) currentThemeBadge.textContent = data.icon || '馃幍';
    if (currentThemeName) currentThemeName.textContent = data.name || categoryKey;
    if (currentThemeCount) currentThemeCount.textContent = `${currentPlaylist.length} 棣栭煶棰慲;
    if (nowPlayingCategory) nowPlayingCategory.textContent = data.name || categoryKey;
  };

  const ensureCategorySelected = () => {
    if (!currentCategory && themeOrder.length) selectCategory(themeOrder[0]);
  };

  const updatePlayButton = () => {
    if (!playPauseBtn) return;
    const isPlaying = Boolean(audio.src) && !audio.paused;

    // 鏇存柊鎾斁/鏆傚仠鎸夐挳
    const playIcon = playPauseBtn.querySelector('.control-icon');
    const playLabel = playPauseBtn.querySelector('.control-label');
    if (playIcon) playIcon.textContent = isPlaying ? '鈴革笍' : '鈻讹笍';
    if (playLabel) {
      if (isPlaying) {
        playLabel.textContent = window.translate ? window.translate('pause') : '鏆傚仠';
      } else {
        playLabel.textContent = window.translate ? window.translate('play') : '鎾斁';
      }
    }
    playPauseBtn.classList.add('primary');

    // 鍚屾鏇存柊鎾斁鐘舵€佸崱鐗?
    if (isPlaying) {
      updatePlaybackStatus(
        window.translate ? window.translate('playing') : '姝ｅ湪鎾斁',
        '鈻讹笍',
        window.translate ? window.translate('enjoying-music') : '浜彈鐤楁剤闊充箰'
      );
    } else if (audio.src) {
      updatePlaybackStatus(
        window.translate ? window.translate('paused-status') : '鏆傚仠涓?,
        '鈴革笍',
        window.translate ? window.translate('continue-journey') : '缁х画鐤楁剤涔嬫梾'
      );
    } else {
      updatePlaybackStatus(
        window.translate ? window.translate('standby') : '寰呮満涓?,
        '鈴革笍',
        window.translate ? window.translate('ready-to-start') : '鍑嗗寮€濮嬬枟鎰?
      );
    }
  };

  const playTrack = (index) => {
    ensureCategorySelected();
    if (!currentPlaylist.length) return;

    let targetIndex = index;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= currentPlaylist.length) targetIndex = currentPlaylist.length - 1;

    const fileName = currentPlaylist[targetIndex];
    const url = getAudioUrl(currentCategory, fileName);
    if (!url) return;

    if (!audio.paused) audio.pause();
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }

    currentTrackIndex = targetIndex;
    updateTrackHighlight();

    if (nowPlayingTitle) nowPlayingTitle.textContent = sanitizeName(fileName);
    if (nowPlayingCategory) {
      const category = config.categories[currentCategory];
      nowPlayingCategory.textContent = (category && category.name) || currentCategory;
    }

    if (progressRange) {
      progressRange.disabled = false;
      progressRange.value = '0';
      progressRange.max = audio.duration ? String(Math.floor(audio.duration)) : '0';
    }
    if (currentTimeEl) currentTimeEl.textContent = '00:00';
    if (totalTimeEl) totalTimeEl.textContent = '--:--';

    audio.currentTime = 0;
    audio.play().catch((error) => console.error('鎾斁澶辫触', error));

    const btn = trackButtonList[targetIndex];
    if (btn && btn.scrollIntoView) {
      btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const playNext = ({ autoplay = false } = {}) => {
    if (!currentPlaylist.length) return;

    if (isShuffle) {
      let nextIndex = Math.floor(Math.random() * currentPlaylist.length);
      if (currentPlaylist.length > 1) {
        while (nextIndex === currentTrackIndex) {
          nextIndex = Math.floor(Math.random() * currentPlaylist.length);
        }
      }
      playTrack(nextIndex);
      return;
    }

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < currentPlaylist.length) {
      playTrack(nextIndex);
      return;
    }

    // 鍒拌揪鍒楄〃鏈熬鐨勫鐞?
    if (autoplay && !isRepeat) {
      // 鑷姩鎾斁缁撴潫锛屼笖闈炲惊鐜ā寮忥紝鍋滄鎾斁
      audio.pause();
      audio.currentTime = 0;
      updatePlayButton();
      return;
    }

    // 鎵嬪姩鐐瑰嚮鎴栧惊鐜ā寮忥紝鍥炲埌绗竴棣?
    playTrack(0);
  };

  const playPrev = () => {
    if (!currentPlaylist.length) return;

    if (isShuffle) {
      let prevIndex = Math.floor(Math.random() * currentPlaylist.length);
      if (currentPlaylist.length > 1) {
        while (prevIndex === currentTrackIndex) {
          prevIndex = Math.floor(Math.random() * currentPlaylist.length);
        }
      }
      playTrack(prevIndex);
      return;
    }

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = currentPlaylist.length - 1;
    playTrack(prevIndex);
  };

  const clearSleepTimer = ({ keepButtons = false, statusText = null } = {}) => {
    if (sleepTimerTimeout) {
      clearTimeout(sleepTimerTimeout);
      sleepTimerTimeout = null;
    }
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    sleepTimerEnd = null;
    if (!keepButtons) {
      timerButtons.forEach((btn) => {
        const minutes = Number(btn.dataset.timer || '0');
        btn.classList.toggle('active', minutes === 0);
      });
    }
    if (timerStatus) timerStatus.textContent = statusText;
  };

  const setSleepTimer = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) {
      clearSleepTimer();
      return;
    }

    clearSleepTimer({ keepButtons: true, statusText: getTranslation('timer-disabled') });
    sleepTimerEnd = Date.now() + minutes * 60000;

    // 鏇存柊timer-button鐘舵€侊紙濡傛灉瀛樺湪锛?
    timerButtons.forEach((btn) => {
      const value = Number(btn.dataset.timer || '0');
      btn.classList.toggle('active', value === minutes);
    });

    // 鏇存柊涓嬫媺妗嗛€夋嫨
    const timerSelect = document.getElementById('timerSelect');
    if (timerSelect) {
      timerSelect.value = String(minutes);
    }

    const update = () => {
      if (!timerStatus) return;
      if (!sleepTimerEnd) {
        timerStatus.textContent = getTranslation('timer-disabled');
        return;
      }
      const remaining = sleepTimerEnd - Date.now();
      if (remaining <= 0) {
        timerStatus.textContent = '鎾斁宸茬粨鏉?;
        clearSleepTimer({ keepButtons: false, statusText: '鎾斁宸茬粨鏉? });
        audio.pause();
        audio.currentTime = 0;
        updatePlayButton();
        return;
      }
      const totalSeconds = Math.ceil(remaining / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      timerStatus.textContent = `鍓╀綑 ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    update();
    sleepTimerInterval = setInterval(update, 1000);
    sleepTimerTimeout = setTimeout(() => {
      clearSleepTimer({ statusText: '鎾斁宸茬粨鏉? });
      audio.pause();
      audio.currentTime = 0;
      updatePlayButton();
    }, minutes * 60000);
  };

  if (volumeRange) {
    const initialVolume = Number(volumeRange.value || '50') / 100;
    audio.volume = Math.min(Math.max(initialVolume, 0), 1);
    if (volumeValue) volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
    volumeRange.addEventListener('input', () => {
      const value = Number(volumeRange.value || '0');
      const volume = Math.min(Math.max(value / 100, 0), 1);
      audio.volume = volume;
      if (volumeValue) volumeValue.textContent = `${Math.round(volume * 100)}%`;
    });
  }

  if (progressRange) {
    progressRange.disabled = true;
    progressRange.addEventListener('input', () => {
      isUserSeeking = true;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(Number(progressRange.value));
    });
    const seekHandler = () => {
      if (!Number.isFinite(audio.duration)) return;
      const value = Number(progressRange.value || '0');
      audio.currentTime = Math.min(Math.max(value, 0), audio.duration || 0);
      isUserSeeking = false;
    };
    progressRange.addEventListener('change', seekHandler);
    progressRange.addEventListener('mouseup', () => { isUserSeeking = false; });
    progressRange.addEventListener('touchend', () => { isUserSeeking = false; });
    progressRange.addEventListener('keyup', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        seekHandler();
      }
    });
    progressRange.addEventListener('mousedown', () => { isUserSeeking = true; });
    progressRange.addEventListener('touchstart', () => { isUserSeeking = true; });
  }

  audio.addEventListener('loadedmetadata', () => {
    if (progressRange && Number.isFinite(audio.duration)) {
      progressRange.max = String(Math.floor(audio.duration));
    }
    if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
    if (currentTrackIndex >= 0 && trackButtonList[currentTrackIndex]) {
      const durationEl = trackButtonList[currentTrackIndex].querySelector('.track-duration');
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (isUserSeeking || isDragging) return; // 娣诲姞isDragging妫€鏌?
    if (progressRange && Number.isFinite(audio.currentTime)) {
      progressRange.value = String(Math.floor(audio.currentTime));
    }
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);

    // 鏇存柊瑙嗚杩涘害鏉?
    const progressDisplay = document.getElementById('progressDisplay');
    if (progressDisplay && Number.isFinite(audio.currentTime) && Number.isFinite(audio.duration) && audio.duration > 0) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressDisplay.style.width = `${percentage}%`;
    }
  });

  // 鐩戝惉鎾斁鐘舵€佸彉鍖栵紝鑷姩鏇存柊鎸夐挳鐘舵€?
  audio.addEventListener('play', () => {
    updatePlayPauseButton();
    console.log('闊抽寮€濮嬫挱鏀?);
  });

  audio.addEventListener('pause', () => {
    updatePlayPauseButton();
    console.log('闊抽宸叉殏鍋?);
  });

  audio.addEventListener('ended', () => {
    updatePlayPauseButton();
    console.log('闊抽鎾斁缁撴潫');
  });

  audio.addEventListener('ended', () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    playNext({ autoplay: true });
  });

  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);

  // 闅忔満鎾斁妯″紡鎺у埗
  const shuffleBtnVisible = document.getElementById('shuffleBtnVisible');
  if (shuffleBtnVisible) {
    shuffleBtnVisible.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtnVisible.classList.toggle('active', isShuffle);
      shuffleBtnVisible.setAttribute('aria-pressed', String(isShuffle));

      // 鏇存柊鍥炬爣鍜屾爣绛?
      const icon = shuffleBtnVisible.querySelector('.mode-icon');
      const label = shuffleBtnVisible.querySelector('.mode-label');
      if (icon) icon.textContent = isShuffle ? '馃攢' : '馃攢';
      if (label) {
        if (isShuffle) {
          label.textContent = window.translate ? window.translate('shuffle-on') : '闅忔満寮€';
        } else {
          label.textContent = window.translate ? window.translate('shuffle') : '闅忔満';
        }
      }

      // 鍚屾闅愯棌鎸夐挳鐘舵€?
      if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
      }

      console.log(`闅忔満鎾斁妯″紡: ${isShuffle ? '寮€鍚? : '鍏抽棴'}`);
    });
  }

  // 寰幆鎾斁妯″紡鎺у埗
  const repeatBtnVisible = document.getElementById('repeatBtnVisible');
  if (repeatBtnVisible) {
    repeatBtnVisible.addEventListener('click', () => {
      isRepeat = !isRepeat;
      repeatBtnVisible.classList.toggle('active', isRepeat);
      repeatBtnVisible.setAttribute('aria-pressed', String(isRepeat));

      // 鏇存柊鍥炬爣鍜屾爣绛?
      const icon = repeatBtnVisible.querySelector('.mode-icon');
      const label = repeatBtnVisible.querySelector('.mode-label');
      if (icon) icon.textContent = isRepeat ? '馃攣' : '馃攣';
      if (label) label.textContent = isRepeat ? '寰幆寮€' : '寰幆';

      // 鍚屾闅愯棌鎸夐挳鐘舵€?
      if (repeatBtn) {
        repeatBtn.classList.toggle('active', isRepeat);
        repeatBtn.setAttribute('aria-pressed', String(isRepeat));
      }

      console.log(`寰幆鎾斁妯″紡: ${isRepeat ? '寮€鍚? : '鍏抽棴'}`);
    });
  }


  if (togglePlaylistBtn) {
    togglePlaylistBtn.addEventListener('click', () => {
      setPlaylistCollapsed(!isPlaylistCollapsed);
    });
  }

  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', () => rotateCarousel(-1));
  }

  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', () => rotateCarousel(1));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      ensureCategorySelected();
      if (currentTrackIndex === -1) {
        playTrack(0);
      } else {
        playPrev();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      ensureCategorySelected();
      if (currentTrackIndex === -1) {
        playTrack(0);
      } else {
        playNext({ autoplay: false }); // 鎵嬪姩鐐瑰嚮锛岄潪鑷姩鎾斁
      }
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      ensureCategorySelected();
      if (!currentPlaylist.length) return;

      // 濡傛灉娌℃湁閫変腑浠讳綍闊宠建锛屼粠绗竴棣栧紑濮嬫挱鏀?
      if (currentTrackIndex === -1 || !audio.src) {
        playTrack(0);
        return;
      }

      // 鎾斁/鏆傚仠鍒囨崲锛屼繚鎸佸綋鍓嶆挱鏀句綅缃?
      if (audio.paused) {
        console.log(`鎭㈠鎾斁: ${formatTime(audio.currentTime)}`);
        audio.play().catch((error) => {
          console.error('鎾斁澶辫触:', error);
          window.soundHealingErrorHandler?.showAudioError('', 'permission');
        });
      } else {
        console.log(`鏆傚仠鎾斁: ${formatTime(audio.currentTime)}`);
        audio.pause();
      }

      // 鏇存柊鎾斁鎸夐挳鐘舵€?
      updatePlayPauseButton();
    });
  }

  if (playFirstBtn) {
    playFirstBtn.addEventListener('click', () => {
      ensureCategorySelected();
      if (currentPlaylist.length) playTrack(0);
    });
  }

  // 瀹氭椂鍣ㄩ€夋嫨涓嬫媺妗嗕簨浠?
  const timerSelect = document.getElementById('timerSelect');
  if (timerSelect) {
    timerSelect.addEventListener('change', () => {
      const minutes = Number(timerSelect.value || '0');
      setSleepTimer(minutes);
    });
  }

  // ========== 澧炲己鐨勪氦浜掑紡杩涘害鏉℃嫋鎷藉姛鑳?==========
  const progressContainer = document.getElementById('progressContainer');
  const progressThumb = document.getElementById('progressThumb');
  const progressFill = document.getElementById('progressDisplay');

  if (progressContainer && progressThumb && progressFill) {
    let wasPlaying = false;
    let dragStartTime = 0;

    // 纭繚杩涘害鏉″鍣ㄥ彲浠ユ帴鏀剁劍鐐瑰拰鐐瑰嚮
    progressContainer.style.cursor = 'pointer';
    progressContainer.setAttribute('title', '鐐瑰嚮鎴栨嫋鎷借皟鑺傛挱鏀捐繘搴?);

    // 鑾峰彇杩涘害鏉′綅缃櫨鍒嗘瘮
    const getProgressFromMouseX = (mouseX) => {
      const rect = progressContainer.getBoundingClientRect();
      const x = mouseX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      return percentage;
    };

    // 鏇存柊杩涘害鏄剧ず鍜岄煶棰戞椂闂?
    const updateProgressAndTime = (percentage, updateAudio = false) => {
      // 鏇存柊瑙嗚杩涘害鏉?
      progressFill.style.width = `${percentage}%`;

      if (audio.duration && Number.isFinite(audio.duration)) {
        const currentTime = (percentage / 100) * audio.duration;

        // 鏇存柊鏃堕棿鏄剧ず
        const currentTimeEl = document.getElementById('currentTime');
        if (currentTimeEl) {
          currentTimeEl.textContent = formatTime(currentTime);
        }

        // 鏇存柊闊抽瀹為檯鎾斁浣嶇疆
        if (updateAudio) {
          audio.currentTime = currentTime;

          // 鍚屾鏇存柊闅愯棌鐨刾rogressRange
          if (progressRange) {
            progressRange.value = String(Math.floor(currentTime));
          }

          // 閫氱煡鏃犻殰纰嶅姛鑳?
          if (window.soundHealingAccessibility) {
            window.soundHealingAccessibility.updatePlaybackStatus(
              currentPlaylist[currentTrackIndex]?.name || '鏈煡闊宠建',
              !audio.paused,
              formatTime(currentTime),
              formatTime(audio.duration)
            );
          }
        }
      }
    };

    // 鍗曞嚮鐩存帴璺宠浆
    const handleClick = (e) => {
      if (!audio.duration || !Number.isFinite(audio.duration)) return;

      // 闃叉鎷栨嫿鏃惰Е鍙戠偣鍑?
      if (Date.now() - dragStartTime < 200) return;

      const percentage = getProgressFromMouseX(e.clientX);
      updateProgressAndTime(percentage, true);

      console.log(`杩涘害鏉＄偣鍑昏烦杞? ${percentage.toFixed(1)}%`);
      e.preventDefault();
      e.stopPropagation();
    };

    // 寮€濮嬫嫋鎷?
    const startDrag = (e) => {
      if (!audio.duration || !Number.isFinite(audio.duration)) return;

      isDragging = true;
      wasPlaying = !audio.paused;
      dragStartTime = Date.now();

      // 鏆傚仠鎾斁浠ヤ究鎷栨嫿
      if (wasPlaying) {
        audio.pause();
        console.log('鎷栨嫿寮€濮嬶紝鏆傚仠鎾斁');
      }

      progressContainer.classList.add('dragging');
      progressThumb.classList.add('dragging');

      // 绔嬪嵆鏇存柊鍒扮偣鍑讳綅缃紙浠呰瑙夛紝涓嶆洿鏂伴煶棰戯級
      const percentage = getProgressFromMouseX(e.clientX || e.touches?.[0]?.clientX);
      updateProgressAndTime(percentage, false);

      e.preventDefault();
      e.stopPropagation();
    };

    // 鎷栨嫿杩囩▼涓?
    const onDrag = (e) => {
      if (!isDragging) return;

      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const percentage = getProgressFromMouseX(clientX);
      updateProgressAndTime(percentage, false);

      e.preventDefault();
    };

    // 缁撴潫鎷栨嫿
    const endDrag = (e) => {
      if (!isDragging) return;

      const clientX = e.clientX || e.changedTouches?.[0]?.clientX || e.clientX;
      const percentage = getProgressFromMouseX(clientX);

      isDragging = false;
      progressContainer.classList.remove('dragging');
      progressThumb.classList.remove('dragging');

      // 鏈€缁堟洿鏂伴煶棰戜綅缃?
      updateProgressAndTime(percentage, true);

      // 濡傛灉涔嬪墠鍦ㄦ挱鏀撅紝缁х画鎾斁
      if (wasPlaying) {
        audio.play().catch((error) => {
          console.error('鎭㈠鎾斁澶辫触:', error);
          window.soundHealingErrorHandler?.showAudioError('', 'permission');
        });
        console.log('鎷栨嫿缁撴潫锛屾仮澶嶆挱鏀?);
        updatePlayPauseButton(); // 鏇存柊鎸夐挳鐘舵€?
      }

      console.log(`杩涘害鏉℃嫋鎷藉畬鎴? ${percentage.toFixed(1)}%`);
    };

    // 榧犳爣浜嬩欢
    progressContainer.addEventListener('click', handleClick);
    progressThumb.addEventListener('mousedown', startDrag);
    progressContainer.addEventListener('mousedown', (e) => {
      // 闃叉鐐瑰嚮鍜屾嫋鎷藉啿绐?
      if (e.target === progressThumb) return;

      const rect = progressContainer.getBoundingClientRect();
      const isNearThumb = Math.abs(e.clientX - (rect.left + (parseFloat(progressFill.style.width) / 100) * rect.width)) < 20;

      if (isNearThumb) {
        startDrag(e);
      } else {
        handleClick(e);
      }
    });

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);

    // 瑙︽懜浜嬩欢
    progressThumb.addEventListener('touchstart', startDrag, { passive: false });
    progressContainer.addEventListener('touchstart', (e) => {
      if (e.target === progressThumb) return;
      startDrag(e);
    }, { passive: false });

    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag, { passive: false });

    // 閿洏浜嬩欢鏀寔
    progressContainer.addEventListener('keydown', (e) => {
      if (!audio.duration || !Number.isFinite(audio.duration)) return;

      const currentPercentage = (audio.currentTime / audio.duration) * 100;
      let newPercentage = currentPercentage;

      switch(e.key) {
        case 'ArrowLeft':
          newPercentage = Math.max(0, currentPercentage - 5);
          break;
        case 'ArrowRight':
          newPercentage = Math.min(100, currentPercentage + 5);
          break;
        case 'Home':
          newPercentage = 0;
          break;
        case 'End':
          newPercentage = 100;
          break;
        default:
          return;
      }

      updateProgressAndTime(newPercentage, true);
      e.preventDefault();
    });

    console.log('鉁?澧炲己鐨勮繘搴︽潯鎷栨嫿鍔熻兘宸插垵濮嬪寲');
  } else {
    console.warn('鉂?杩涘害鏉″厓绱犳湭鎵惧埌锛屾棤娉曞垵濮嬪寲鎷栨嫿鍔熻兘');
  }

  // 淇濈暀鍘熸湁timer-button鏀寔锛堝鏋滃瓨鍦級
  timerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const minutes = Number(btn.dataset.timer || '0');
      setSleepTimer(minutes);
    });
  });

  // 鍒濆鍖栧嚱鏁?
  const syncCategoryFromUrl = () => {
    const category = getInitialCategoryFromUrl();
    if (category && category !== currentCategory) {
      suppressUrlSync = true;
      selectCategory(category, { skipUrlSync: true });
      suppressUrlSync = false;
    }
  };

  window.addEventListener('popstate', syncCategoryFromUrl);
  window.addEventListener('hashchange', syncCategoryFromUrl);
  const initializeApp = () => {
    // 璁剧疆鍒濆鎾斁鐘舵€?
    updatePlaybackStatus('寰呮満涓?, '鈴革笍', '鍑嗗寮€濮嬬枟鎰?);

    // 鍒濆鍖栨挱鏀炬ā寮忔寜閽姸鎬?
    const shuffleBtnVisible = document.getElementById('shuffleBtnVisible');
    const repeatBtnVisible = document.getElementById('repeatBtnVisible');

    if (shuffleBtnVisible) {
      shuffleBtnVisible.classList.toggle('active', isShuffle);
      shuffleBtnVisible.setAttribute('aria-pressed', String(isShuffle));
    }

    if (repeatBtnVisible) {
      repeatBtnVisible.classList.toggle('active', isRepeat);
      repeatBtnVisible.setAttribute('aria-pressed', String(isRepeat));
    }

    renderThemeCarousel();
    setPlaylistCollapsed(false);

    const initialCategory = getInitialCategoryFromUrl();
    if (initialCategory && themeOrder.includes(initialCategory)) {
      selectCategory(initialCategory);
    } else if (themeOrder.length) {
      selectCategory(themeOrder[0]);
    }
    updatePlayButton();
  };

  // 鍚姩搴旂敤
  initializeApp();
})();


// ========== 涓绘尟骞呭彲瑙嗗寲绯荤粺 ==========
(() => {
  'use strict';

  const mainCanvas = document.getElementById('mainAmplitudeCanvas');
  if (!mainCanvas) return;

  const ctx = mainCanvas.getContext('2d');
  const audio = window.__soundDeskAudio;

  // 璁剧疆canvas鍒嗚鲸鐜?
  const setCanvasSize = () => {
    const rect = mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mainCanvas.width = rect.width * dpr;
    mainCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  };

  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);

  // 娓呯悊鍑芥暟
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', setCanvasSize);
  }, {once: true});

  // 鎸箙鏁版嵁瀛樺偍
  const amplitudeData = [];
  const maxDataPoints = 80; // 鏄剧ず鏇村鏁版嵁鐐?
  let animationId = null;
  let isPlaying = false;

  // 鏌斿拰鐨勫績璺宠妭濂忕畻娉?
  let heartbeatPhase = 0;
  let pulseIntensity = 1;
  const generateAmplitude = () => {
    if (!isPlaying) {
      // 闈欐€佹椂寰急娉㈠姩
      return 0.08 + Math.random() * 0.05;
    }

    // 鏌斿拰鐨勫績璺宠妭濂?
    heartbeatPhase += 0.06; // 鍑忓皯鐩镐綅澧為噺锛岃鑺傚鏇存參

    // 涓诲績璺虫尝褰?- 鏇村姞鏌斿拰
    const mainPulse = Math.sin(heartbeatPhase) * 0.4 + 0.5;

    // 娆＄骇蹇冭烦娉㈠舰 - 鍑忓皯骞呭害
    const secondaryPulse = Math.sin(heartbeatPhase * 1.2) * 0.15;

    // 鍑忓皯闅忔満鍙樺寲锛岃鍔ㄧ敾鏇村钩绋?
    const randomness = (Math.random() - 0.5) * 0.15;

    // 鏇寸紦鎱㈢殑寮哄害鍙樺寲
    pulseIntensity += (Math.random() - 0.5) * 0.008;
    pulseIntensity = Math.max(0.8, Math.min(1.2, pulseIntensity));

    const amplitude = (mainPulse + secondaryPulse + randomness) * pulseIntensity;
    return Math.max(0.1, Math.min(0.9, amplitude));
  };

  // 娓叉煋涓绘尟骞呭彲瑙嗗寲锛堜笂涓嬫尝鍔ㄦ牱寮忥級
  const renderMainAmplitude = () => {
    const width = mainCanvas.getBoundingClientRect().width;
    const height = mainCanvas.getBoundingClientRect().height;

    // 娓呯┖鐢诲竷
    ctx.clearRect(0, 0, width, height);

    // 鑾峰彇褰撳墠鎸箙鍊?
    const currentAmplitude = generateAmplitude();

    // 缁樺埗榛戣壊鑳屾櫙
    ctx.fillStyle = 'rgba(20, 25, 35, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // 娉㈠舰鍙傛暟
    const baseY = height - 4; // 搴曢儴鍩哄噯绾?
    const maxAmplitude = height * 0.85; // 鏈€澶ф尟骞呬负楂樺害鐨?5%
    const barCount = 60; // 鍥哄畾60涓潯褰?
    const barWidth = (width - (barCount + 1) * 2) / barCount;
    const barSpacing = 2;

    // 缁樺埗鍨傜洿鍚戜笂鏉″舰
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barSpacing) + barSpacing;

      // 姣忎釜鏉″舰鏈夌暐寰笉鍚岀殑鐩镐綅鍜岄鐜囷紝鍒涢€犳洿鑷劧鐨勬晥鏋?
      const phaseOffset = (i / barCount) * Math.PI * 4; // 澧炲姞鐩镐綅宸紝璁╂尝鍔ㄦ洿骞崇紦
      const frequency = 0.8 + (i % 3) * 0.05; // 闄嶄綆棰戠巼鍙樺寲锛屾洿鍔犳煍鍜?

      // 璁＄畻璇ユ潯褰㈢殑鎸箙锛堝熀浜庡綋鍓嶉煶棰戞尟骞呭姞涓婃尝鍔ㄦ晥鏋滐級
      const timePhase = Date.now() * 0.0015; // 澶у箙闄嶄綆鏃堕棿鐩镐綅閫熷害锛岃鍔ㄧ敾鏇存參鏇存煍鍜?
      const smoothWave = Math.abs(Math.sin(timePhase * frequency + phaseOffset));
      const waveAmplitude = currentAmplitude * (0.5 + 0.5 * smoothWave); // 鍑忓皯鎸箙鍙樺寲鑼冨洿

      // 鏉″舰楂樺害锛堝彧鍚戜笂寤朵几锛?
      const barHeight = waveAmplitude * maxAmplitude;
      const topY = baseY - barHeight;

      // 鍒涘缓娓愬彉鑹诧紙浠庨《閮ㄥ埌搴曢儴锛?
      const barGradient = ctx.createLinearGradient(0, topY, 0, baseY);

      if (isPlaying) {
        // 鎾斁鏃朵娇鐢ㄤ寒鐧借壊娓愬彉
        const intensity = waveAmplitude;
        barGradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 + intensity * 0.6})`);
        barGradient.addColorStop(0.6, `rgba(220, 220, 220, ${0.7 + intensity * 0.3})`);
        barGradient.addColorStop(1, `rgba(180, 180, 180, ${0.8 + intensity * 0.2})`);
      } else {
        // 闈欐鏃朵娇鐢ㄦ殫鐏拌壊
        barGradient.addColorStop(0, 'rgba(120, 120, 120, 0.5)');
        barGradient.addColorStop(0.6, 'rgba(100, 100, 100, 0.7)');
        barGradient.addColorStop(1, 'rgba(80, 80, 80, 0.9)');
      }

      ctx.fillStyle = barGradient;
      ctx.fillRect(x, topY, barWidth, barHeight);

      // 娣诲姞椤堕儴楂樹寒
      if (waveAmplitude > 0.1) {
        ctx.fillStyle = isPlaying ? 'rgba(255, 255, 255, 0.9)' : 'rgba(150, 150, 150, 0.6)';
        ctx.fillRect(x, topY, barWidth, Math.max(1, barHeight * 0.1));
      }
    }

    // 缁樺埗搴曢儴鍩哄噯绾?
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(width, baseY);
    ctx.stroke();

    // 缁х画鍔ㄧ敾
    animationId = requestAnimationFrame(renderMainAmplitude);
  };

  // 鐩戝惉闊抽鎾斁鐘舵€?
  if (audio) {
    audio.addEventListener('play', () => {
      isPlaying = true;
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
    });

    audio.addEventListener('ended', () => {
      isPlaying = false;
    });
  }

  // 鍚姩涓绘尟骞呭姩鐢?
  renderMainAmplitude();

  // 娓呯悊鍑芥暟
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }, {once: true});
})();

// ========== 澧炲己澶氳瑷€绯荤粺 ==========
(() => {
  'use strict';

  // 鏀寔鐨勮瑷€鍒楄〃
  const supportedLanguages = [
    { code: 'en-US', name: 'English', flag: '馃嚭馃嚫' },
    { code: 'zh-CN', name: '涓枃', flag: '馃嚚馃嚦' },
    { code: 'ja-JP', name: '鏃ユ湰瑾?, flag: '馃嚡馃嚨' },
    { code: 'ko-KR', name: '頃滉淡鞏?, flag: '馃嚢馃嚪' },
    { code: 'es-ES', name: 'Espa帽ol', flag: '馃嚜馃嚫' }
  ];

  // 缈昏瘧鏁版嵁
  const translations = {
    'en-US': {
      'amplitude': 'Amplitude',
      'sound-healing': 'sound healing',
      'brand-title': 'Sound Healing Space',
      'brand-subtitle': 'Return your mind to tranquility',
      'current-theme': 'Current Theme',
      'select-theme': 'Select Theme',
      'start-journey': 'Start your healing journey',
      'playback-status': 'Playback Status',
      'paused': 'Paused',
      'ready-to-heal': 'Ready to heal',
      'session-info': 'Session Info',
      'healing-time': 'Focused healing time',
      'sound-amplitude': 'Sound Amplitude',
      'amplitude-description': 'Higher peaks = louder sound 鈥?Lower valleys = softer sound',
      'silent': 'Silent',
      'heartbeat-rhythm': 'Heartbeat-like rhythm',
      'headphone-tip': 'Use headphones for the best healing experience',
      'click-to-switch': 'Click to switch scenes',
      'not-playing': 'Not playing',
      'select-theme-to-start': 'Select a theme to start healing',
      'previous': 'Previous',
      'play': 'Play',
      'pause': 'Pause',
      'next': 'Next',
      'shuffle': 'Shuffle',
      'repeat': 'Repeat',
      'shuffle-on': 'Shuffle On',
      'repeat-on': 'Repeat On',
      'playing': 'Playing',
      'paused-status': 'Paused',
      'standby': 'Standby',
      'enjoying-music': 'Enjoying healing music',
      'continue-journey': 'Continue healing journey',
      'ready-to-start': 'Ready to start healing',
      'high-amplitude': 'High Amplitude',
      'medium-amplitude': 'Medium Amplitude',
      'low-amplitude': 'Low Amplitude',
      'timer-disabled': 'No limit',
      'timer-enabled': 'Timer set',
      'select-theme-for-tracklist': 'Select a theme to view track list',
      'theme-scene': 'Theme Scene',
      'play-all': 'Play All',
      'toggle-display': 'Toggle Display',
      'timer-no-limit': 'No limit',
      'timer-15min': '15 minutes',
      'timer-30min': '30 minutes',
      'timer-60min': '60 minutes',
      'timer-90min': '90 minutes'
    },
    'zh-CN': {
      'amplitude': 'Amplitude',
      'sound-healing': '澹伴煶鐤楁剤',
      'brand-title': '澹伴煶鐤楁剤绌洪棿',
      'brand-subtitle': '璁╁績鐏靛洖褰掑畞闈?,
      'current-theme': '褰撳墠涓婚',
      'select-theme': '璇烽€夋嫨涓婚',
      'start-journey': '寮€濮嬫偍鐨勭枟鎰堜箣鏃?,
      'playback-status': '鎾斁鐘舵€?,
      'paused': '鏆傚仠',
      'ready-to-heal': '鍑嗗寮€濮嬬枟鎰?,
      'session-info': '鏈浼氳瘽',
      'healing-time': '涓撴敞鐤楁剤鏃跺厜',
      'sound-amplitude': '澹伴煶鎸箙',
      'amplitude-description': '娉㈠嘲瓒婇珮澹伴煶瓒婂搷 鈥?娉㈣胺瓒婁綆澹伴煶瓒婅交',
      'silent': '闈欓粯涓?,
      'heartbeat-rhythm': '蹇冭烦鑸殑鑺傚璧蜂紡',
      'headphone-tip': '浣跨敤鑰虫満鑾峰緱鏈€浣崇枟鎰堜綋楠?,
      'click-to-switch': '鐐瑰嚮鍒囨崲鍦烘櫙',
      'not-playing': '鏆傛湭鎾斁',
      'select-theme-to-start': '璇烽€夋嫨涓婚寮€濮嬬枟鎰?,
      'previous': '涓婁竴棣?,
      'play': '鎾斁',
      'pause': '鏆傚仠',
      'next': '涓嬩竴棣?,
      'shuffle': '闅忔満',
      'repeat': '寰幆',
      'shuffle-on': '闅忔満寮€',
      'repeat-on': '寰幆寮€',
      'playing': '姝ｅ湪鎾斁',
      'paused-status': '鏆傚仠涓?,
      'standby': '寰呮満涓?,
      'enjoying-music': '浜彈鐤楁剤闊充箰',
      'continue-journey': '缁х画鐤楁剤涔嬫梾',
      'ready-to-start': '鍑嗗寮€濮嬬枟鎰?,
      'high-amplitude': '楂樻尟骞?,
      'medium-amplitude': '涓尟骞?,
      'low-amplitude': '浣庢尟骞?,
      'timer-disabled': '鏈紑鍚?,
      'timer-enabled': '瀹氭椂宸茶缃?,
      'select-theme-for-tracklist': '璇烽€夋嫨涓婚鏌ョ湅闊宠建鍒楄〃',
      'theme-scene': '涓婚鍦烘櫙',
      'play-all': '鎾斁鍏ㄩ儴',
      'toggle-display': '鍒囨崲鏄剧ず',
      'timer-no-limit': '鏃犻檺鍒?,
      'timer-15min': '15鍒嗛挓',
      'timer-30min': '30鍒嗛挓',
      'timer-60min': '60鍒嗛挓',
      'timer-90min': '90鍒嗛挓'
    },
    'ja-JP': {
      'amplitude': 'Amplitude',
      'sound-healing': '銈点偊銉炽儔銉掋兗銉兂銈?,
      'brand-title': '銈点偊銉炽儔銉掋兗銉兂銈扮┖闁?,
      'brand-subtitle': '蹇冦倰闈欏瘋銇埢銇?,
      'current-theme': '鐝惧湪銇儐銉笺優',
      'select-theme': '銉嗐兗銉炪倰閬告姙',
      'start-journey': '銉掋兗銉兂銈般伄鏃呫倰濮嬨倎銈?,
      'playback-status': '鍐嶇敓鐘舵厠',
      'paused': '涓€鏅傚仠姝?,
      'ready-to-heal': '銉掋兗銉兂銈版簴鍌欏畬浜?,
      'session-info': '銈汇儍銈枫儳銉虫儏鍫?,
      'healing-time': '闆嗕腑銉掋兗銉兂銈版檪闁?,
      'sound-amplitude': '闊炽伄鎸箙',
      'amplitude-description': '楂樸亜銉斻兗銈?= 澶с亶銇煶 鈥?浣庛亜璋?= 灏忋仌銇煶',
      'silent': '鐒￠煶',
      'heartbeat-rhythm': '蹇冩媿銇倛銇嗐仾銉偤銉?,
      'headphone-tip': '鏈€楂樸伄銉掋兗銉兂銈颁綋楱撱伀銇儤銉冦儔銉曘偐銉炽倰銇斾娇鐢ㄣ亸銇犮仌銇?,
      'click-to-switch': '銈儶銉冦偗銇椼仸銈枫兗銉炽倰鍒囥倞鏇裤亪',
      'not-playing': '鍐嶇敓銇椼仸銇勩伨銇涖倱',
      'select-theme-to-start': '銉掋兗銉兂銈般倰濮嬨倎銈嬨儐銉笺優銈掗伕鎶炪仐銇︺亸銇犮仌銇?,
      'previous': '鍓嶃伕',
      'play': '鍐嶇敓',
      'pause': '涓€鏅傚仠姝?,
      'next': '娆°伕',
      'shuffle': '銈枫儯銉冦儠銉?,
      'repeat': '銉償銉笺儓',
      'shuffle-on': '銈枫儯銉冦儠銉?銈兂',
      'repeat-on': '銉償銉笺儓 銈兂',
      'playing': '鍐嶇敓涓?,
      'paused-status': '涓€鏅傚仠姝腑',
      'standby': '銈广偪銉炽儛銈?,
      'enjoying-music': '銉掋兗銉兂銈伴煶妤姐倰妤姐仐銈撱仹銇勩伨銇?,
      'continue-journey': '銉掋兗銉兂銈般伄鏃呫倰缍氥亼銈?,
      'ready-to-start': '銉掋兗銉兂銈伴枊濮嬫簴鍌欏畬浜?,
      'high-amplitude': '楂樻尟骞?,
      'medium-amplitude': '涓尟骞?,
      'low-amplitude': '浣庢尟骞?,
      'timer-disabled': '鍒堕檺銇仐',
      'timer-enabled': '銈裤偆銉炪兗瑷畾娓堛伩',
      'select-theme-for-tracklist': '銉嗐兗銉炪倰閬告姙銇椼仸銉堛儵銉冦偗銉偣銉堛倰琛ㄧず',
      'theme-scene': '銉嗐兗銉炪偡銉笺兂',
      'play-all': '鍏ㄣ仸鍐嶇敓',
      'toggle-display': '琛ㄧず鍒囨浛',
      'timer-no-limit': '鍒堕檺銇仐',
      'timer-15min': '15鍒?,
      'timer-30min': '30鍒?,
      'timer-60min': '60鍒?,
      'timer-90min': '90鍒?
    },
    'ko-KR': {
      'amplitude': 'Amplitude',
      'sound-healing': '靷毚霌?頌愲',
      'brand-title': '靷毚霌?頌愲 瓿店皠',
      'brand-subtitle': '毵堨潓鞚?瓿犾殧頃溂搿?霃岆牑氤措偞雼?,
      'current-theme': '順勳灛 韰岆',
      'select-theme': '韰岆 靹犿儩',
      'start-journey': '頌愲 鞐枆鞚?鞁滌瀾頃橃劯鞖?,
      'playback-status': '鞛儩 靸來儨',
      'paused': '鞚检嫓鞝曥',
      'ready-to-heal': '頌愲 欷€牍?鞕勲',
      'session-info': '靹胳厴 鞝曤炒',
      'healing-time': '歆戩 頌愲 鞁滉皠',
      'sound-amplitude': '靻岆Μ 歆勴彮',
      'amplitude-description': '雴掛潃 頂柬伂 = 韥?靻岆Μ 鈥?雮潃 瓿?= 鞛戩潃 靻岆Μ',
      'silent': '氍挫潓',
      'heartbeat-rhythm': '鞁灔氚曤彊 臧欖潃 毽摤',
      'headphone-tip': '斓滉碃鞚?頌愲 瓴巾棙鞚?鞙勴暣 項る摐韽办潉 靷毄頃橃劯鞖?,
      'click-to-switch': '韥措Ν頃橃棳 鞛ル┐ 鞝勴櫂',
      'not-playing': '鞛儩 欷戩澊 鞎勲嫎',
      'select-theme-to-start': '頌愲鞚?鞁滌瀾頃?韰岆毳?靹犿儩頃橃劯鞖?,
      'previous': '鞚挫爠',
      'play': '鞛儩',
      'pause': '鞚检嫓鞝曥',
      'next': '雼れ潓',
      'shuffle': '靺旐攲',
      'repeat': '氚橂车',
      'shuffle-on': '靺旐攲 旒滌',
      'repeat-on': '氚橂车 旒滌',
      'playing': '鞛儩 欷?,
      'paused-status': '鞚检嫓鞝曥霅?,
      'standby': '雽€旮?,
      'enjoying-music': '頌愲 鞚岇晠 臧愳儊 欷?,
      'continue-journey': '頌愲 鞐枆 瓿勳啀頃橁赴',
      'ready-to-start': '頌愲 鞁滌瀾 欷€牍?鞕勲',
      'high-amplitude': '雴掛潃 歆勴彮',
      'medium-amplitude': '欷戧皠 歆勴彮',
      'low-amplitude': '雮潃 歆勴彮',
      'timer-disabled': '鞝滍暅 鞐嗢潓',
      'timer-enabled': '韮€鞚措ǜ 靹れ爼霅?,
      'select-theme-for-tracklist': '韰岆毳?靹犿儩頃橃棳 韸鸽灆 氇╇ 氤搓赴',
      'theme-scene': '韰岆 鞛ル┐',
      'play-all': '鞝勳泊 鞛儩',
      'toggle-display': '響滌嫓 鞝勴櫂',
      'timer-no-limit': '鞝滍暅 鞐嗢潓',
      'timer-15min': '15攵?,
      'timer-30min': '30攵?,
      'timer-60min': '60攵?,
      'timer-90min': '90攵?
    },
    'es-ES': {
      'amplitude': 'Amplitude',
      'sound-healing': 'sanaci贸n sonora',
      'brand-title': 'Espacio de Sanaci贸n Sonora',
      'brand-subtitle': 'Devuelve tu mente a la tranquilidad',
      'current-theme': 'Tema Actual',
      'select-theme': 'Seleccionar Tema',
      'start-journey': 'Comienza tu viaje de sanaci贸n',
      'playback-status': 'Estado de Reproducci贸n',
      'paused': 'Pausado',
      'ready-to-heal': 'Listo para sanar',
      'session-info': 'Informaci贸n de Sesi贸n',
      'healing-time': 'Tiempo de sanaci贸n concentrada',
      'sound-amplitude': 'Amplitud de Sonido',
      'amplitude-description': 'Picos altos = sonido fuerte 鈥?Valles bajos = sonido suave',
      'silent': 'Silencioso',
      'heartbeat-rhythm': 'Ritmo como latido del coraz贸n',
      'headphone-tip': 'Usa auriculares para la mejor experiencia de sanaci贸n',
      'click-to-switch': 'Haz clic para cambiar escenas',
      'not-playing': 'No reproduciendo',
      'select-theme-to-start': 'Selecciona un tema para comenzar la sanaci贸n',
      'previous': 'Anterior',
      'play': 'Reproducir',
      'pause': 'Pausar',
      'next': 'Siguiente',
      'shuffle': 'Aleatorio',
      'repeat': 'Repetir',
      'shuffle-on': 'Aleatorio Activado',
      'repeat-on': 'Repetir Activado',
      'playing': 'Reproduciendo',
      'paused-status': 'Pausado',
      'standby': 'En Espera',
      'enjoying-music': 'Disfrutando m煤sica de sanaci贸n',
      'continue-journey': 'Continuar viaje de sanaci贸n',
      'ready-to-start': 'Listo para comenzar sanaci贸n',
      'high-amplitude': 'Amplitud Alta',
      'medium-amplitude': 'Amplitud Media',
      'low-amplitude': 'Amplitud Baja',
      'timer-disabled': 'Sin l铆mite',
      'timer-enabled': 'Temporizador establecido',
      'select-theme-for-tracklist': 'Selecciona un tema para ver la lista de pistas',
      'theme-scene': 'Escena Tem谩tica',
      'play-all': 'Reproducir Todo',
      'toggle-display': 'Alternar Visualizaci贸n',
      'timer-no-limit': 'Sin l铆mite',
      'timer-15min': '15 minutos',
      'timer-30min': '30 minutos',
      'timer-60min': '60 minutos',
      'timer-90min': '90 minutos'
    }
  };

  // 褰撳墠璇█锛堥粯璁や负鑻辫锛?
  let currentLanguage = 'en-US';
  let currentLanguageIndex = 0;

  // DOM鍏冪礌
  const languageToggle = document.getElementById('languageToggle');
  const currentLanguageDisplay = document.getElementById('currentLanguage');

  // 鑾峰彇娴忚鍣ㄨ瑷€锛岄粯璁や负鑻辫
  const getBrowserLanguage = () => {
    const lang = navigator.language || navigator.userLanguage || 'en-US';
    return translations[lang] ? lang : 'en-US';
  };

  // 鏇存柊鎵€鏈夌炕璇戞枃鏈紙澧炲己鐗堬級
  const updateTranslations = () => {
    const elements = document.querySelectorAll('[data-i18n]');
    const currentTranslations = translations[currentLanguage];

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (currentTranslations[key]) {
        element.textContent = currentTranslations[key];
      }
    });

    // 鏇存柊璇█鏄剧ず
    if (currentLanguageDisplay) {
      const langInfo = supportedLanguages.find(lang => lang.code === currentLanguage);
      currentLanguageDisplay.textContent = langInfo ? langInfo.name : 'English';
    }

    // 瀹炴椂鏇存柊鍔ㄦ€佺敓鎴愮殑鍐呭
    updateDynamicContent();

    // 淇濆瓨璇█璁剧疆
    localStorage.setItem('soundHealing_language', currentLanguage);

    console.log(`Language switched to: ${currentLanguage}`);
  };

  // 鏇存柊鍔ㄦ€佸唴瀹癸紙瑙ｅ喅瀹炴椂缈昏瘧闂锛?
  const updateDynamicContent = () => {
    // 鏇存柊鎾斁鎺у埗鎸夐挳鐘舵€?
    const playPauseBtn = document.querySelector('#playPauseBtn .control-label');
    const shuffleLabel = document.querySelector('#shuffleBtnVisible .mode-label');
    const repeatLabel = document.querySelector('#repeatBtnVisible .mode-label');

    if (playPauseBtn) {
      const isPlaying = playPauseBtn.textContent.includes('鏆傚仠') || playPauseBtn.textContent.includes('Pause');
      playPauseBtn.textContent = t(isPlaying ? 'pause' : 'play');
    }

    if (shuffleLabel) {
      const isActive = document.getElementById('shuffleBtnVisible')?.classList.contains('active');
      shuffleLabel.textContent = t(isActive ? 'shuffle-on' : 'shuffle');
    }

    if (repeatLabel) {
      const isActive = document.getElementById('repeatBtnVisible')?.classList.contains('active');
      repeatLabel.textContent = t(isActive ? 'repeat-on' : 'repeat');
    }

    // 鏇存柊鐘舵€佹枃鏈?
    const playbackStatus = document.getElementById('playbackStatus');
    const currentThemeName = document.getElementById('currentThemeName');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingCategory = document.getElementById('nowPlayingCategory');

    if (playbackStatus && playbackStatus.textContent) {
      const statusMap = {
        '鏆傚仠': 'paused',
        'Paused': 'paused',
        'Pausado': 'paused',
        '鞚检嫓鞝曥': 'paused',
        '涓€鏅傚仠姝?: 'paused',
        '姝ｅ湪鎾斁': 'playing',
        'Playing': 'playing',
        'Reproduciendo': 'playing',
        '鞛儩 欷?: 'playing',
        '鍐嶇敓涓?: 'playing'
      };

      const currentStatus = playbackStatus.textContent;
      for (const [text, key] of Object.entries(statusMap)) {
        if (currentStatus.includes(text)) {
          playbackStatus.textContent = t(key);
          break;
        }
      }
    }
  };

  // 寰幆鍒囨崲璇█
  const toggleLanguage = () => {
    currentLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
    currentLanguage = supportedLanguages[currentLanguageIndex].code;
    updateTranslations();
  };

  // 鑾峰彇缈昏瘧鏂囨湰
  const t = (key) => {
    return translations[currentLanguage][key] || translations['en-US'][key] || key;
  };

  // 鍔ㄦ€佺炕璇戝嚱鏁帮紙渚涘叾浠栨ā鍧椾娇鐢級
  window.translate = t;
  window.updateTranslations = updateTranslations;
  window.getCurrentLanguage = () => currentLanguage;

  // 鍒濆鍖栬瑷€
  const initializeLanguage = () => {
    // 浠庢湰鍦板瓨鍌ㄨ幏鍙栬瑷€璁剧疆锛屽惁鍒欎娇鐢ㄨ嫳璇綔涓洪粯璁よ瑷€
    const savedLanguage = localStorage.getItem('soundHealing_language');
    currentLanguage = savedLanguage || 'en-US';

    // 鎵惧埌瀵瑰簲鐨勮瑷€绱㈠紩
    currentLanguageIndex = supportedLanguages.findIndex(lang => lang.code === currentLanguage);
    if (currentLanguageIndex === -1) {
      currentLanguageIndex = 0; // 榛樿鑻辫
      currentLanguage = 'en-US';
    }

    updateTranslations();
  };

  // 浜嬩欢鐩戝惉鍣?
  if (languageToggle) {
    languageToggle.addEventListener('click', toggleLanguage);
  }

  // 鐩戝惉鍏朵粬浜嬩欢浠ユ洿鏂板姩鎬佸唴瀹?
  document.addEventListener('DOMContentLoaded', () => {
    // 鐩戝惉鎾斁鐘舵€佸彉鍖?
    const observer = new MutationObserver(() => {
      setTimeout(updateDynamicContent, 100);
    });

    // 瑙傚療鍙兘鍙樺寲鐨勫厓绱?
    const elementsToObserve = [
      'playbackStatus', 'currentThemeName', 'nowPlayingTitle', 'nowPlayingCategory',
      'playPauseBtn', 'shuffleBtnVisible', 'repeatBtnVisible'
    ];

    elementsToObserve.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    });
  });

  // 鍒濆鍖?
  initializeLanguage();
})();





