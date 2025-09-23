
// ========== 全局错误处理和用户反馈系统 ==========
class ErrorHandler {
  constructor() {
    this.setupGlobalHandlers();
    this.setupUserNotification();
  }

  setupGlobalHandlers() {
    // 捕获JavaScript错误
    window.addEventListener('error', (event) => {
      console.error('JavaScript Error:', {
        message: event.error?.message || '未知错误',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });

      // 根据错误类型提供更具体的建议
      let userMessage = '应用程序遇到问题';
      let suggestion = '请刷新页面重试';

      if (event.error?.message?.includes('network')) {
        userMessage = '网络连接错误';
        suggestion = '请检查您的网络连接后重试';
      } else if (event.error?.message?.includes('memory')) {
        userMessage = '内存不足';
        suggestion = '请关闭其他标签页后重试';
      } else if (event.error?.message?.includes('audio')) {
        userMessage = '音频播放错误';
        suggestion = '请尝试选择其他音频文件';
      }

      this.showUserFriendlyError(userMessage, suggestion);
    });

    // 捕获Promise未处理的拒绝
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        timestamp: new Date().toISOString()
      });

      let userMessage = '操作失败';
      let suggestion = '请重试';

      if (event.reason?.message?.includes('fetch')) {
        userMessage = '数据加载失败';
        suggestion = '请检查网络连接后刷新页面';
      } else if (event.reason?.message?.includes('timeout')) {
        userMessage = '请求超时';
        suggestion = '网络较慢，请稍后重试';
      }

      this.showUserFriendlyError(userMessage, suggestion);
      event.preventDefault();
    });
  }

  setupUserNotification() {
    // 创建通知容器
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
      ">×</button>
    `;

    const container = document.getElementById('errorNotificationContainer');
    if (container) {
      container.appendChild(notification);

      // 自动移除
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
      'format': `音频格式不支持：${audioFile}`,
      'network': `加载失败：${audioFile}`,
      'decode': `音频文件损坏：${audioFile}`,
      'permission': '音频播放被浏览器阻止，请点击播放按钮'
    };

    const message = errorMessages[errorType] || `音频播放出错：${audioFile}`;
    this.showUserFriendlyError('音频播放问题', message);
  }
}

// ========== 性能监控和内存管理系统 ==========
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
    // 页面可见性变化时暂停/恢复动画
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
    // 每30秒检查性能
    this.addInterval(() => {
      this.checkMemoryUsage();
      this.optimizeAnimations();
    }, 30000);
  }

  checkMemoryUsage() {
    if (performance.memory) {
      const memInfo = performance.memory;
      const usedPercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;

      console.log(`内存使用: ${Math.round(usedPercent)}%`);

      if (usedPercent > 80) {
        this.emergencyCleanup();
        window.soundHealingErrorHandler?.showUserFriendlyError(
          '内存使用过高',
          '已自动优化，建议关闭其他标签页'
        );
      }
    }
  }

  emergencyCleanup() {
    // 强制垃圾回收和清理
    this.pauseAnimations();
    this.clearOldAudioInstances();

    // 2秒后恢复关键动画
    setTimeout(() => {
      this.resumeAnimations();
    }, 2000);
  }

  // 帧率限制的动画管理
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
    // 重新启动关键动画
    if (window.restartAnimations) {
      window.restartAnimations();
    }
  }

  optimizeAnimations() {
    // 根据设备性能调整动画复杂度
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isLowEnd = devicePixelRatio < 2 && navigator.hardwareConcurrency < 4;

    if (isLowEnd) {
      this.reduceAnimationComplexity();
    }
  }

  reduceAnimationComplexity() {
    // 降低粒子数量和帧率
    const particles = document.querySelectorAll('.floating-particles');
    particles.forEach(container => {
      const children = container.children;
      for (let i = children.length - 1; i >= children.length / 2; i--) {
        if (children[i]) children[i].remove();
      }
    });
  }

  // 音频实例管理
  registerAudioInstance(id, audio) {
    this.audioInstances.set(id, {
      audio,
      lastUsed: Date.now()
    });
  }

  clearOldAudioInstances() {
    const now = Date.now();
    const maxAge = 300000; // 5分钟

    this.audioInstances.forEach((instance, id) => {
      if (now - instance.lastUsed > maxAge && instance.audio.paused) {
        instance.audio.src = '';
        instance.audio.load();
        this.audioInstances.delete(id);
      }
    });
  }

  // 安全的定时器管理
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
    // 清理所有活动的定时器和动画
    this.activeAnimations.forEach(id => cancelAnimationFrame(id));
    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeTimeouts.forEach(id => clearTimeout(id));

    this.activeAnimations.clear();
    this.activeIntervals.clear();
    this.activeTimeouts.clear();

    // 清理音频实例
    this.audioInstances.forEach(instance => {
      instance.audio.pause();
      instance.audio.src = '';
      instance.audio.load();
    });
    this.audioInstances.clear();
  }
}

// ========== 无障碍功能增强系统 ==========
class AccessibilityManager {
  constructor() {
    this.setupKeyboardNavigation();
    this.setupAriaLabels();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
  }

  setupKeyboardNavigation() {
    // 全局键盘快捷键
    document.addEventListener('keydown', (event) => {
      // 防止在输入框中触发快捷键
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
    // 等待DOM加载完成后设置ARIA标签
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.addAriaLabels());
    } else {
      this.addAriaLabels();
    }
  }

  addAriaLabels() {
    // 主要控制按钮
    this.setAriaLabel('playPauseBtn', '播放/暂停', '按空格键播放或暂停音频');
    this.setAriaLabel('prevBtn', '上一首', '按Ctrl+左箭头切换到上一首');
    this.setAriaLabel('nextBtn', '下一首', '按Ctrl+右箭头切换到下一首');
    this.setAriaLabel('shuffleBtnVisible', '随机播放', '按Ctrl+S切换随机播放模式');
    this.setAriaLabel('repeatBtnVisible', '循环播放', '按Ctrl+R切换循环播放模式');

    // 滑块控制
    this.setAriaLabel('volumeRange', '音量控制', '按Ctrl+上下箭头调节音量');
    this.setAriaLabel('progressRange', '播放进度', '拖动调节播放进度');

    // 主题导航
    this.setAriaLabel('carouselPrev', '上一个主题', '切换到上一个音频主题');
    this.setAriaLabel('carouselNext', '下一个主题', '切换到下一个音频主题');

    // 语言切换
    this.setAriaLabel('languageToggle', '语言切换', '点击切换界面语言');

    // 定时器选择
    this.setAriaLabel('timerSelect', '定时器设置', '选择音频播放时长');

    // 播放列表
    this.setAriaLabel('trackList', '音轨列表', '当前主题的音轨列表');
    this.setAriaLabel('playFirstBtn', '播放全部', '从第一首开始播放当前主题的所有音轨');
    this.setAriaLabel('togglePlaylistBtn', '切换显示', '切换播放列表的显示方式');

    // 为进度容器添加可访问性
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
      progressContainer.setAttribute('role', 'slider');
      progressContainer.setAttribute('aria-label', '播放进度控制');
      progressContainer.setAttribute('tabindex', '0');
    }
  }

  setAriaLabel(elementId, label, description) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-label', label);
      element.setAttribute('title', description);

      // 确保按钮可通过键盘访问
      if (element.tagName === 'BUTTON' && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    }
  }

  setupScreenReaderSupport() {
    // 创建屏幕阅读器专用的状态通告区域
    const liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);

    // 创建紧急通告区域
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
      // 清除消息以便下次相同消息能被读出
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  setupFocusManagement() {
    // 改善焦点可见性
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  // 键盘快捷键对应的功能
  togglePlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.click();
      const isPlaying = playPauseBtn.querySelector('.control-icon').textContent.includes('⏸');
      this.announceToScreenReader(isPlaying ? '音频已播放' : '音频已暂停');
    }
  }

  previousTrack() {
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.click();
      this.announceToScreenReader('切换到上一首');
    }
  }

  nextTrack() {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.click();
      this.announceToScreenReader('切换到下一首');
    }
  }

  adjustVolume(delta) {
    const volumeRange = document.getElementById('volumeRange');
    if (volumeRange) {
      const currentValue = parseInt(volumeRange.value);
      const newValue = Math.max(0, Math.min(100, currentValue + delta));
      volumeRange.value = newValue;

      // 触发input事件以更新音量
      const event = new Event('input', { bubbles: true });
      volumeRange.dispatchEvent(event);

      this.announceToScreenReader(`音量调整为 ${newValue}%`);
    }
  }

  toggleMute() {
    const volumeRange = document.getElementById('volumeRange');
    if (volumeRange) {
      const currentValue = parseInt(volumeRange.value);
      if (currentValue > 0) {
        // 静音
        volumeRange.dataset.previousVolume = currentValue;
        volumeRange.value = 0;
        this.announceToScreenReader('音频已静音');
      } else {
        // 恢复音量
        const previousVolume = volumeRange.dataset.previousVolume || '50';
        volumeRange.value = previousVolume;
        this.announceToScreenReader(`音量恢复为 ${previousVolume}%`);
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
      this.announceToScreenReader(isActive ? '随机播放已开启' : '随机播放已关闭');
    }
  }

  toggleRepeat() {
    const repeatBtn = document.getElementById('repeatBtnVisible');
    if (repeatBtn) {
      repeatBtn.click();
      const isActive = repeatBtn.classList.contains('active');
      this.announceToScreenReader(isActive ? '循环播放已开启' : '循环播放已关闭');
    }
  }

  closeFocusedModal() {
    // 如果有模态框或下拉菜单打开，关闭它们
    const modals = document.querySelectorAll('.modal, .dropdown-open');
    modals.forEach(modal => {
      if (modal.style.display !== 'none' && modal.offsetParent !== null) {
        modal.style.display = 'none';
        this.announceToScreenReader('对话框已关闭');
      }
    });
  }

  // 更新播放状态的无障碍信息
  updatePlaybackStatus(trackName, isPlaying, currentTime, totalTime) {
    const statusText = isPlaying
      ? `正在播放: ${trackName}, ${currentTime} / ${totalTime}`
      : `暂停: ${trackName}, ${currentTime} / ${totalTime}`;

    // 更新播放按钮的状态
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.setAttribute('aria-pressed', isPlaying.toString());
    }

    // 定期更新但不过于频繁
    if (!this.lastStatusUpdate || Date.now() - this.lastStatusUpdate > 5000) {
      this.announceToScreenReader(statusText);
      this.lastStatusUpdate = Date.now();
    }
  }

  // 更新主题切换的无障碍信息
  updateThemeStatus(themeName, trackCount) {
    this.announceToScreenReader(`主题已切换到: ${themeName}, 共${trackCount}首音轨`);
  }
}

// ========== 音频格式兼容性管理系统 ==========
class AudioCompatibilityManager {
  constructor() {
    this.supportedFormats = new Map();
    this.formatFallbacks = new Map();
    this.setupFormatFallbacks();
    this.detectSupportedFormats();
  }

  setupFormatFallbacks() {
    // 设置格式降级方案
    this.formatFallbacks.set('mp3', ['mp3', 'wav', 'ogg']);
    this.formatFallbacks.set('wav', ['wav', 'mp3', 'ogg']);
    this.formatFallbacks.set('ogg', ['ogg', 'mp3', 'wav']);
    this.formatFallbacks.set('wma', ['mp3', 'wav', 'ogg']); // WMA兼容性差，优先降级到mp3
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

      console.log(`音频格式支持检测 - ${format.toUpperCase()}: ${isSupported ? '支持' : '不支持'} (${canPlay || 'empty'})`);
    }

    // 输出支持的格式摘要
    const supportedList = Array.from(this.supportedFormats.entries())
      .filter(([format, supported]) => supported)
      .map(([format]) => format.toUpperCase());

    console.log(`浏览器支持的音频格式: ${supportedList.join(', ')}`);

    if (supportedList.length === 0) {
      window.soundHealingErrorHandler?.showUserFriendlyError(
        '音频兼容性问题',
        '当前浏览器可能不支持音频播放，请尝试更新浏览器'
      );
    }
  }

  findCompatibleFormat(originalPath) {
    const pathInfo = this.parseAudioPath(originalPath);
    const originalFormat = pathInfo.extension;

    // 如果原格式被支持，直接返回
    if (this.supportedFormats.get(originalFormat)) {
      return {
        path: originalPath,
        format: originalFormat,
        isOriginal: true
      };
    }

    // 查找降级格式
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

    // 如果都不支持，返回null
    return null;
  }

  parseAudioPath(path) {
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return {
        basePath: path,
        extension: 'mp3', // 默认扩展名
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
      throw new Error(`无法找到兼容的音频格式: ${originalPath}`);
    }

    const audio = new Audio();

    // 设置错误处理
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`音频加载超时: ${compatibilityInfo.path}`));
      }, 10000); // 10秒超时

      audio.addEventListener('canplaythrough', () => {
        clearTimeout(timeout);

        if (!compatibilityInfo.isOriginal) {
          console.log(`音频格式降级: ${originalPath} -> ${compatibilityInfo.path}`);
          window.soundHealingErrorHandler?.showUserFriendlyError(
            '音频格式已自动调整',
            `已使用兼容格式播放 (${compatibilityInfo.format.toUpperCase()})`,
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
        const errorMessage = `音频加载失败: ${compatibilityInfo.path} (${errorType})`;

        console.error(errorMessage);
        window.soundHealingErrorHandler?.showAudioError(compatibilityInfo.path, 'format');

        reject(new Error(errorMessage));
      });

      // 尝试加载音频
      audio.preload = 'metadata';
      audio.src = compatibilityInfo.path;
      audio.load();
    });
  }

  // 批量检测音频文件是否存在
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
              console.warn(`音频文件不存在: ${originalPath}`);
            }
          })
          .catch(error => {
            validationResults.set(originalPath, false);
            console.error(`音频文件检查失败: ${originalPath}`, error);
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

  // 获取格式支持报告
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
      report.recommendedAction = '建议更新浏览器以获得更好的音频支持';
    } else if (report.supportedFormats.length < 2) {
      report.recommendedAction = '音频兼容性有限，某些功能可能受影响';
    }

    return report;
  }
}

// 初始化系统
window.addEventListener('DOMContentLoaded', () => {
  window.soundHealingErrorHandler = new ErrorHandler();
  window.soundHealingPerformance = new PerformanceManager();
  window.soundHealingAccessibility = new AccessibilityManager();
  window.soundHealingCompatibility = new AudioCompatibilityManager();

  // 输出兼容性报告
  setTimeout(() => {
    const compatibilityReport = window.soundHealingCompatibility.getCompatibilityReport();
    console.log('=== 音频兼容性报告 ===');
    console.log('支持格式:', compatibilityReport.supportedFormats);
    console.log('不支持格式:', compatibilityReport.unsupportedFormats);
    console.log('基础支持:', compatibilityReport.hasBasicSupport ? '是' : '否');
    if (compatibilityReport.recommendedAction) {
      console.log('建议:', compatibilityReport.recommendedAction);
      window.soundHealingErrorHandler?.showUserFriendlyError(
        '音频兼容性提醒',
        compatibilityReport.recommendedAction,
        4000
      );
    }
  }, 1000);

  // 页面卸载时清理资源
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

// ========== 自然场景动画系统 ==========
(() => {
  'use strict';

  const cvs = document.getElementById('natureCanvas');
  if (!cvs) return;

  const ctx = cvs.getContext('2d');
  let w, h, particles = [];
  let currentTheme = 'default';

  // 主题场景配置
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

      // 生命周期透明度变化
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

    // 清空画布并绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, config.bgGradient[0]);
    gradient.addColorStop(1, config.bgGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 更新和绘制粒子
    particles.forEach(particle => {
      particle.update(config);
      particle.draw();
    });

    requestAnimationFrame(draw);
  };

  // 主题切换功能
  window.updateNatureScene = (theme) => {
    currentTheme = theme;
    initParticles();
  };

  resize();
  initParticles();
  window.addEventListener('resize', resize, {passive: true});

  // 清理函数
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', resize);
  }, {once: true});

  requestAnimationFrame(draw);
})();

// ========== 虚拟主题轮播系统 ==========
(() => {
  'use strict';

  // 主题数据
  const themes = [
    { key: 'Animal sounds', name: '森林栖息地', icon: '🦅', count: 26 },
    { key: 'Fire', name: '温暖壁炉', icon: '🔥', count: 3 },
    { key: 'hypnosis', name: '梦境花园', icon: '🌙', count: 70 },
    { key: 'meditation', name: '禅境山谷', icon: '🧘‍♀️', count: 14 },
    { key: 'Rain', name: '雨林圣地', icon: '☔', count: 14 },
    { key: 'running water', name: '溪流秘境', icon: '💧', count: 6 },
    { key: 'Singing bowl sound', name: '颂钵圣殿', icon: '🎵', count: 61 },
    { key: 'Chakra', name: '能量场域', icon: '🌈', count: 7 },
    { key: 'Subconscious Therapy', name: '潜识星域', icon: '🌌', count: 11 }
  ];

  let currentThemeIndex = 0;
  let currentTheme = null;

  // 主题色彩映射
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

  // 更新主题色彩
  const updateThemeColors = (themeKey) => {
    const colors = themeColors[themeKey] || themeColors['Singing bowl sound'];
    const root = document.documentElement;

    // 更新CSS自定义属性
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);

    // 更新界面元素的品牌色彩
    updateBrandElements(colors);
  };

  // 更新品牌元素
  const updateBrandElements = (colors) => {
    // 更新当前主题图标颜色
    const currentThemeIcon = document.getElementById('currentThemeIcon');
    if (currentThemeIcon) {
      currentThemeIcon.style.filter = `hue-rotate(${getHueRotation(colors.primary)}deg)`;
    }

    // 更新仪表盘品牌图标
    const brandIcon = document.querySelector('.brand-icon');
    if (brandIcon) {
      brandIcon.style.filter = `hue-rotate(${getHueRotation(colors.primary)}deg)`;
    }

    // 为状态卡片添加主题色彩提示
    document.querySelectorAll('.status-card').forEach((card, index) => {
      if (index === 0) { // 当前主题卡片
        card.style.borderColor = `${colors.primary}40`;
        card.style.background = `${colors.primary}08`;
      }
    });
  };

  // 计算色相旋转角度
  const getHueRotation = (color) => {
    // 简化的色相映射
    const colorMap = {
      '#7ba05b': 60,   // 森林绿
      '#e8956d': 20,   // 火焰橙
      '#6db5e8': 200,  // 水蓝
      '#a56de8': 270,  // 紫色
      '#8fbc7f': 90,   // 冥想绿
      '#e8b86d': 40,   // 金色
      '#9575cd': 250   // 疗愈紫
    };
    return colorMap[color] || 0;
  };

  // 获取DOM元素
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const activeNameEl = document.getElementById('carouselActiveName');
  const currentThemeNameEl = document.getElementById('currentThemeName');
  const currentThemeCountEl = document.getElementById('currentThemeCount');
  const trackListEl = document.getElementById('trackList');
  const playFirstBtn = document.getElementById('playFirstBtn');

  // 更新主题显示
  const updateThemeDisplay = () => {
    currentTheme = themes[currentThemeIndex];

    if (activeNameEl) activeNameEl.textContent = currentTheme.name;

    // 更新左侧疗愈面板
    if (currentThemeNameEl) currentThemeNameEl.textContent = currentTheme.name;
    if (currentThemeCountEl) currentThemeCountEl.textContent = `${currentTheme.count} 首音轨`;

    // 更新场景图标
    const sceneIcon = document.getElementById('sceneIcon');
    if (sceneIcon) sceneIcon.textContent = currentTheme.icon;

    // 更新自然场景动画
    if (typeof window.updateNatureScene === 'function') {
      window.updateNatureScene(currentTheme.key);
    }

    // 更新主题色彩
    updateThemeColors(currentTheme.key);

    // 更新播放列表
    updatePlaylist();
  };

  // 更新播放列表
  const updatePlaylist = () => {
    if (!trackListEl || !currentTheme) return;

    // 获取音频配置
    const config = window.AUDIO_CONFIG;
    if (!config || !config.categories[currentTheme.key]) {
      trackListEl.innerHTML = '<div style="color: #ffffff; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8);">音频文件加载中...</div>';
      return;
    }

    const tracks = config.categories[currentTheme.key].files;
    let html = `<div style="color: #7ba05b; margin-bottom: 8px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8);">${currentTheme.icon} ${currentTheme.name} (${tracks.length} 首)</div>`;

    tracks.forEach((track, index) => {
      const trackName = track.replace(/^\d+[-.\s]*/, '').replace(/\.(mp3|wav|ogg)$/i, '');
      html += `<div style="cursor: pointer; padding: 3px 0; color: #ffffff; font-size: 10px; font-weight: 600; text-shadow: 0 2px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8); border-bottom: 1px solid rgba(255,255,255,0.1);" onclick="selectTrack(${index})">${String(index + 1).padStart(2, '0')}. ${trackName}</div>`;
    });

    trackListEl.innerHTML = html;
  };

  // 主题切换
  const switchTheme = (direction) => {
    currentThemeIndex += direction;
    if (currentThemeIndex < 0) currentThemeIndex = themes.length - 1;
    if (currentThemeIndex >= themes.length) currentThemeIndex = 0;
    updateThemeDisplay();
  };

  // 绑定事件
  if (prevBtn) prevBtn.addEventListener('click', () => switchTheme(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => switchTheme(1));

  // 播放全部按钮
  if (playFirstBtn) {
    playFirstBtn.addEventListener('click', () => {
      if (currentTheme) {
        // 这里应该调用实际的播放功能
        console.log('播放主题:', currentTheme.name);
        // 可以触发现有的音频管理器
      }
    });
  }

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') switchTheme(-1);
    if (e.key === 'ArrowRight') switchTheme(1);
  });

  // 全局函数供点击事件使用
  window.selectTrack = (index) => {
    if (currentTheme) {
      console.log(`选择音轨: ${currentTheme.name} - ${index + 1}`);
      // 这里可以触发实际的音轨播放
    }
  };

  // 初始化
  updateThemeDisplay();

  // 初始化品牌色彩
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
    console.error('AUDIO_CONFIG 未加载或无分类数据');
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
  let isDragging = false; // 进度条拖拽状态
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

  // 简单的翻译函数
  const getTranslation = (key) => {
    const translations = {
      'play': '播放',
      'pause': '暂停',
      'timer-disabled': '未开启'
    };
    return translations[key] || key;
  };

  // 更新播放/暂停按钮状态
  const updatePlayPauseButton = () => {
    if (!playPauseBtn) return;

    const isPlaying = !audio.paused;
    const playIcon = playPauseBtn.querySelector('.control-icon');
    const playLabel = playPauseBtn.querySelector('.control-label');

    if (playIcon) {
      playIcon.textContent = isPlaying ? '⏸️' : '▶️';
    }

    if (playLabel) {
      const key = isPlaying ? 'pause' : 'play';
      playLabel.textContent = getTranslation(key);
      playLabel.setAttribute('data-i18n', key);
    }

    // 更新ARIA状态
    playPauseBtn.setAttribute('aria-pressed', String(isPlaying));

    // 更新按钮样式
    if (isPlaying) {
      playPauseBtn.classList.add('playing');
    } else {
      playPauseBtn.classList.remove('playing');
    }

    // 更新状态卡片
    updatePlaybackStatus(
      isPlaying ? '正在播放' : '暂停',
      isPlaying ? '▶️' : '⏸️',
      isPlaying ? '享受疗愈音乐' : '点击继续播放'
    );

    console.log(`播放按钮状态更新: ${isPlaying ? '播放中' : '已暂停'}`);
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

  // 更新播放状态显示
  const updatePlaybackStatus = (status, icon, extra) => {
    if (playbackStatus) playbackStatus.textContent = status;
    if (playbackIcon) playbackIcon.textContent = icon;
    if (playbackExtra) playbackExtra.textContent = extra;
  };

  const resetNowPlaying = () => {
    currentTrackIndex = -1;
    if (nowPlayingTitle) nowPlayingTitle.textContent = '暂未播放';
    if (currentTimeEl) currentTimeEl.textContent = '00:00';
    if (totalTimeEl) totalTimeEl.textContent = '--:--';
    if (progressRange) {
      progressRange.value = '0';
      progressRange.max = '0';
      progressRange.disabled = true;
    }

    // 重置视觉进度条
    const progressDisplay = document.getElementById('progressDisplay');
    if (progressDisplay) {
      progressDisplay.style.width = '0%';
    }

    // 更新播放状态
    updatePlaybackStatus('待机', '⏸️', '准备开始疗愈');

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
      empty.textContent = '该主题暂未收录音频';
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
      togglePlaylistBtn.textContent = collapsed ? '展开列表' : '收起列表';
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
      carouselActiveName.textContent = (data && data.name) || key || '请选择主题';
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
      const icon = data.icon || '🎵';
      const title = data.name || key;
      const subtitle = data.description || '沉浸式声音旅程';
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

  const selectCategory = (categoryKey) => {
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

      // 只有在音频没有播放时才重置播放器状态
      // 如果音频正在播放，保持播放状态但更新播放列表
      if (audio.paused || !audio.src) {
        audio.removeAttribute('src');
        audio.load();
        resetNowPlaying();
        clearSleepTimer({ keepButtons: true });
      }
      // 如果音频正在播放，保持播放状态，只更新UI显示
    }

    if (currentThemeBadge) currentThemeBadge.textContent = data.icon || '🎵';
    if (currentThemeName) currentThemeName.textContent = data.name || categoryKey;
    if (currentThemeCount) currentThemeCount.textContent = `${currentPlaylist.length} 首音频`;
    if (nowPlayingCategory) nowPlayingCategory.textContent = data.name || categoryKey;
  };

  const ensureCategorySelected = () => {
    if (!currentCategory && themeOrder.length) selectCategory(themeOrder[0]);
  };

  const updatePlayButton = () => {
    if (!playPauseBtn) return;
    const isPlaying = Boolean(audio.src) && !audio.paused;

    // 更新播放/暂停按钮
    const playIcon = playPauseBtn.querySelector('.control-icon');
    const playLabel = playPauseBtn.querySelector('.control-label');
    if (playIcon) playIcon.textContent = isPlaying ? '⏸️' : '▶️';
    if (playLabel) {
      if (isPlaying) {
        playLabel.textContent = window.translate ? window.translate('pause') : '暂停';
      } else {
        playLabel.textContent = window.translate ? window.translate('play') : '播放';
      }
    }
    playPauseBtn.classList.add('primary');

    // 同步更新播放状态卡片
    if (isPlaying) {
      updatePlaybackStatus(
        window.translate ? window.translate('playing') : '正在播放',
        '▶️',
        window.translate ? window.translate('enjoying-music') : '享受疗愈音乐'
      );
    } else if (audio.src) {
      updatePlaybackStatus(
        window.translate ? window.translate('paused-status') : '暂停中',
        '⏸️',
        window.translate ? window.translate('continue-journey') : '继续疗愈之旅'
      );
    } else {
      updatePlaybackStatus(
        window.translate ? window.translate('standby') : '待机中',
        '⏸️',
        window.translate ? window.translate('ready-to-start') : '准备开始疗愈'
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
    audio.play().catch((error) => console.error('播放失败', error));

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

    // 到达列表末尾的处理
    if (autoplay && !isRepeat) {
      // 自动播放结束，且非循环模式，停止播放
      audio.pause();
      audio.currentTime = 0;
      updatePlayButton();
      return;
    }

    // 手动点击或循环模式，回到第一首
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

    // 更新timer-button状态（如果存在）
    timerButtons.forEach((btn) => {
      const value = Number(btn.dataset.timer || '0');
      btn.classList.toggle('active', value === minutes);
    });

    // 更新下拉框选择
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
        timerStatus.textContent = '播放已结束';
        clearSleepTimer({ keepButtons: false, statusText: '播放已结束' });
        audio.pause();
        audio.currentTime = 0;
        updatePlayButton();
        return;
      }
      const totalSeconds = Math.ceil(remaining / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      timerStatus.textContent = `剩余 ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    update();
    sleepTimerInterval = setInterval(update, 1000);
    sleepTimerTimeout = setTimeout(() => {
      clearSleepTimer({ statusText: '播放已结束' });
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
    if (isUserSeeking || isDragging) return; // 添加isDragging检查
    if (progressRange && Number.isFinite(audio.currentTime)) {
      progressRange.value = String(Math.floor(audio.currentTime));
    }
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);

    // 更新视觉进度条
    const progressDisplay = document.getElementById('progressDisplay');
    if (progressDisplay && Number.isFinite(audio.currentTime) && Number.isFinite(audio.duration) && audio.duration > 0) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressDisplay.style.width = `${percentage}%`;
    }
  });

  // 监听播放状态变化，自动更新按钮状态
  audio.addEventListener('play', () => {
    updatePlayPauseButton();
    console.log('音频开始播放');
  });

  audio.addEventListener('pause', () => {
    updatePlayPauseButton();
    console.log('音频已暂停');
  });

  audio.addEventListener('ended', () => {
    updatePlayPauseButton();
    console.log('音频播放结束');
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

  // 随机播放模式控制
  const shuffleBtnVisible = document.getElementById('shuffleBtnVisible');
  if (shuffleBtnVisible) {
    shuffleBtnVisible.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtnVisible.classList.toggle('active', isShuffle);
      shuffleBtnVisible.setAttribute('aria-pressed', String(isShuffle));

      // 更新图标和标签
      const icon = shuffleBtnVisible.querySelector('.mode-icon');
      const label = shuffleBtnVisible.querySelector('.mode-label');
      if (icon) icon.textContent = isShuffle ? '🔀' : '🔀';
      if (label) {
        if (isShuffle) {
          label.textContent = window.translate ? window.translate('shuffle-on') : '随机开';
        } else {
          label.textContent = window.translate ? window.translate('shuffle') : '随机';
        }
      }

      // 同步隐藏按钮状态
      if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
      }

      console.log(`随机播放模式: ${isShuffle ? '开启' : '关闭'}`);
    });
  }

  // 循环播放模式控制
  const repeatBtnVisible = document.getElementById('repeatBtnVisible');
  if (repeatBtnVisible) {
    repeatBtnVisible.addEventListener('click', () => {
      isRepeat = !isRepeat;
      repeatBtnVisible.classList.toggle('active', isRepeat);
      repeatBtnVisible.setAttribute('aria-pressed', String(isRepeat));

      // 更新图标和标签
      const icon = repeatBtnVisible.querySelector('.mode-icon');
      const label = repeatBtnVisible.querySelector('.mode-label');
      if (icon) icon.textContent = isRepeat ? '🔁' : '🔁';
      if (label) label.textContent = isRepeat ? '循环开' : '循环';

      // 同步隐藏按钮状态
      if (repeatBtn) {
        repeatBtn.classList.toggle('active', isRepeat);
        repeatBtn.setAttribute('aria-pressed', String(isRepeat));
      }

      console.log(`循环播放模式: ${isRepeat ? '开启' : '关闭'}`);
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
        playNext({ autoplay: false }); // 手动点击，非自动播放
      }
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      ensureCategorySelected();
      if (!currentPlaylist.length) return;

      // 如果没有选中任何音轨，从第一首开始播放
      if (currentTrackIndex === -1 || !audio.src) {
        playTrack(0);
        return;
      }

      // 播放/暂停切换，保持当前播放位置
      if (audio.paused) {
        console.log(`恢复播放: ${formatTime(audio.currentTime)}`);
        audio.play().catch((error) => {
          console.error('播放失败:', error);
          window.soundHealingErrorHandler?.showAudioError('', 'permission');
        });
      } else {
        console.log(`暂停播放: ${formatTime(audio.currentTime)}`);
        audio.pause();
      }

      // 更新播放按钮状态
      updatePlayPauseButton();
    });
  }

  if (playFirstBtn) {
    playFirstBtn.addEventListener('click', () => {
      ensureCategorySelected();
      if (currentPlaylist.length) playTrack(0);
    });
  }

  // 定时器选择下拉框事件
  const timerSelect = document.getElementById('timerSelect');
  if (timerSelect) {
    timerSelect.addEventListener('change', () => {
      const minutes = Number(timerSelect.value || '0');
      setSleepTimer(minutes);
    });
  }

  // ========== 增强的交互式进度条拖拽功能 ==========
  const progressContainer = document.getElementById('progressContainer');
  const progressThumb = document.getElementById('progressThumb');
  const progressFill = document.getElementById('progressDisplay');

  if (progressContainer && progressThumb && progressFill) {
    let wasPlaying = false;
    let dragStartTime = 0;

    // 确保进度条容器可以接收焦点和点击
    progressContainer.style.cursor = 'pointer';
    progressContainer.setAttribute('title', '点击或拖拽调节播放进度');

    // 获取进度条位置百分比
    const getProgressFromMouseX = (mouseX) => {
      const rect = progressContainer.getBoundingClientRect();
      const x = mouseX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      return percentage;
    };

    // 更新进度显示和音频时间
    const updateProgressAndTime = (percentage, updateAudio = false) => {
      // 更新视觉进度条
      progressFill.style.width = `${percentage}%`;

      if (audio.duration && Number.isFinite(audio.duration)) {
        const currentTime = (percentage / 100) * audio.duration;

        // 更新时间显示
        const currentTimeEl = document.getElementById('currentTime');
        if (currentTimeEl) {
          currentTimeEl.textContent = formatTime(currentTime);
        }

        // 更新音频实际播放位置
        if (updateAudio) {
          audio.currentTime = currentTime;

          // 同步更新隐藏的progressRange
          if (progressRange) {
            progressRange.value = String(Math.floor(currentTime));
          }

          // 通知无障碍功能
          if (window.soundHealingAccessibility) {
            window.soundHealingAccessibility.updatePlaybackStatus(
              currentPlaylist[currentTrackIndex]?.name || '未知音轨',
              !audio.paused,
              formatTime(currentTime),
              formatTime(audio.duration)
            );
          }
        }
      }
    };

    // 单击直接跳转
    const handleClick = (e) => {
      if (!audio.duration || !Number.isFinite(audio.duration)) return;

      // 防止拖拽时触发点击
      if (Date.now() - dragStartTime < 200) return;

      const percentage = getProgressFromMouseX(e.clientX);
      updateProgressAndTime(percentage, true);

      console.log(`进度条点击跳转: ${percentage.toFixed(1)}%`);
      e.preventDefault();
      e.stopPropagation();
    };

    // 开始拖拽
    const startDrag = (e) => {
      if (!audio.duration || !Number.isFinite(audio.duration)) return;

      isDragging = true;
      wasPlaying = !audio.paused;
      dragStartTime = Date.now();

      // 暂停播放以便拖拽
      if (wasPlaying) {
        audio.pause();
        console.log('拖拽开始，暂停播放');
      }

      progressContainer.classList.add('dragging');
      progressThumb.classList.add('dragging');

      // 立即更新到点击位置（仅视觉，不更新音频）
      const percentage = getProgressFromMouseX(e.clientX || e.touches?.[0]?.clientX);
      updateProgressAndTime(percentage, false);

      e.preventDefault();
      e.stopPropagation();
    };

    // 拖拽过程中
    const onDrag = (e) => {
      if (!isDragging) return;

      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const percentage = getProgressFromMouseX(clientX);
      updateProgressAndTime(percentage, false);

      e.preventDefault();
    };

    // 结束拖拽
    const endDrag = (e) => {
      if (!isDragging) return;

      const clientX = e.clientX || e.changedTouches?.[0]?.clientX || e.clientX;
      const percentage = getProgressFromMouseX(clientX);

      isDragging = false;
      progressContainer.classList.remove('dragging');
      progressThumb.classList.remove('dragging');

      // 最终更新音频位置
      updateProgressAndTime(percentage, true);

      // 如果之前在播放，继续播放
      if (wasPlaying) {
        audio.play().catch((error) => {
          console.error('恢复播放失败:', error);
          window.soundHealingErrorHandler?.showAudioError('', 'permission');
        });
        console.log('拖拽结束，恢复播放');
        updatePlayPauseButton(); // 更新按钮状态
      }

      console.log(`进度条拖拽完成: ${percentage.toFixed(1)}%`);
    };

    // 鼠标事件
    progressContainer.addEventListener('click', handleClick);
    progressThumb.addEventListener('mousedown', startDrag);
    progressContainer.addEventListener('mousedown', (e) => {
      // 防止点击和拖拽冲突
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

    // 触摸事件
    progressThumb.addEventListener('touchstart', startDrag, { passive: false });
    progressContainer.addEventListener('touchstart', (e) => {
      if (e.target === progressThumb) return;
      startDrag(e);
    }, { passive: false });

    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag, { passive: false });

    // 键盘事件支持
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

    console.log('✅ 增强的进度条拖拽功能已初始化');
  } else {
    console.warn('❌ 进度条元素未找到，无法初始化拖拽功能');
  }

  // 保留原有timer-button支持（如果存在）
  timerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const minutes = Number(btn.dataset.timer || '0');
      setSleepTimer(minutes);
    });
  });

  // 初始化函数
  const initializeApp = () => {
    // 设置初始播放状态
    updatePlaybackStatus('待机中', '⏸️', '准备开始疗愈');

    // 初始化播放模式按钮状态
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
    if (themeOrder.length) selectCategory(themeOrder[0]);
    updatePlayButton();
  };

  // 启动应用
  initializeApp();
})();


// ========== 主振幅可视化系统 ==========
(() => {
  'use strict';

  const mainCanvas = document.getElementById('mainAmplitudeCanvas');
  if (!mainCanvas) return;

  const ctx = mainCanvas.getContext('2d');
  const audio = window.__soundDeskAudio;

  // 设置canvas分辨率
  const setCanvasSize = () => {
    const rect = mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mainCanvas.width = rect.width * dpr;
    mainCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  };

  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);

  // 清理函数
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', setCanvasSize);
  }, {once: true});

  // 振幅数据存储
  const amplitudeData = [];
  const maxDataPoints = 80; // 显示更多数据点
  let animationId = null;
  let isPlaying = false;

  // 柔和的心跳节奏算法
  let heartbeatPhase = 0;
  let pulseIntensity = 1;
  const generateAmplitude = () => {
    if (!isPlaying) {
      // 静态时微弱波动
      return 0.08 + Math.random() * 0.05;
    }

    // 柔和的心跳节奏
    heartbeatPhase += 0.06; // 减少相位增量，让节奏更慢

    // 主心跳波形 - 更加柔和
    const mainPulse = Math.sin(heartbeatPhase) * 0.4 + 0.5;

    // 次级心跳波形 - 减少幅度
    const secondaryPulse = Math.sin(heartbeatPhase * 1.2) * 0.15;

    // 减少随机变化，让动画更平稳
    const randomness = (Math.random() - 0.5) * 0.15;

    // 更缓慢的强度变化
    pulseIntensity += (Math.random() - 0.5) * 0.008;
    pulseIntensity = Math.max(0.8, Math.min(1.2, pulseIntensity));

    const amplitude = (mainPulse + secondaryPulse + randomness) * pulseIntensity;
    return Math.max(0.1, Math.min(0.9, amplitude));
  };

  // 渲染主振幅可视化（上下波动样式）
  const renderMainAmplitude = () => {
    const width = mainCanvas.getBoundingClientRect().width;
    const height = mainCanvas.getBoundingClientRect().height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 获取当前振幅值
    const currentAmplitude = generateAmplitude();

    // 绘制黑色背景
    ctx.fillStyle = 'rgba(20, 25, 35, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // 波形参数
    const baseY = height - 4; // 底部基准线
    const maxAmplitude = height * 0.85; // 最大振幅为高度的85%
    const barCount = 60; // 固定60个条形
    const barWidth = (width - (barCount + 1) * 2) / barCount;
    const barSpacing = 2;

    // 绘制垂直向上条形
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barSpacing) + barSpacing;

      // 每个条形有略微不同的相位和频率，创造更自然的效果
      const phaseOffset = (i / barCount) * Math.PI * 4; // 增加相位差，让波动更平缓
      const frequency = 0.8 + (i % 3) * 0.05; // 降低频率变化，更加柔和

      // 计算该条形的振幅（基于当前音频振幅加上波动效果）
      const timePhase = Date.now() * 0.0015; // 大幅降低时间相位速度，让动画更慢更柔和
      const smoothWave = Math.abs(Math.sin(timePhase * frequency + phaseOffset));
      const waveAmplitude = currentAmplitude * (0.5 + 0.5 * smoothWave); // 减少振幅变化范围

      // 条形高度（只向上延伸）
      const barHeight = waveAmplitude * maxAmplitude;
      const topY = baseY - barHeight;

      // 创建渐变色（从顶部到底部）
      const barGradient = ctx.createLinearGradient(0, topY, 0, baseY);

      if (isPlaying) {
        // 播放时使用亮白色渐变
        const intensity = waveAmplitude;
        barGradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 + intensity * 0.6})`);
        barGradient.addColorStop(0.6, `rgba(220, 220, 220, ${0.7 + intensity * 0.3})`);
        barGradient.addColorStop(1, `rgba(180, 180, 180, ${0.8 + intensity * 0.2})`);
      } else {
        // 静止时使用暗灰色
        barGradient.addColorStop(0, 'rgba(120, 120, 120, 0.5)');
        barGradient.addColorStop(0.6, 'rgba(100, 100, 100, 0.7)');
        barGradient.addColorStop(1, 'rgba(80, 80, 80, 0.9)');
      }

      ctx.fillStyle = barGradient;
      ctx.fillRect(x, topY, barWidth, barHeight);

      // 添加顶部高亮
      if (waveAmplitude > 0.1) {
        ctx.fillStyle = isPlaying ? 'rgba(255, 255, 255, 0.9)' : 'rgba(150, 150, 150, 0.6)';
        ctx.fillRect(x, topY, barWidth, Math.max(1, barHeight * 0.1));
      }
    }

    // 绘制底部基准线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(width, baseY);
    ctx.stroke();

    // 继续动画
    animationId = requestAnimationFrame(renderMainAmplitude);
  };

  // 监听音频播放状态
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

  // 启动主振幅动画
  renderMainAmplitude();

  // 清理函数
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }, {once: true});
})();

// ========== 增强多语言系统 ==========
(() => {
  'use strict';

  // 支持的语言列表
  const supportedLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
  ];

  // 翻译数据
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
      'amplitude-description': 'Higher peaks = louder sound • Lower valleys = softer sound',
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
      'sound-healing': '声音疗愈',
      'brand-title': '声音疗愈空间',
      'brand-subtitle': '让心灵回归宁静',
      'current-theme': '当前主题',
      'select-theme': '请选择主题',
      'start-journey': '开始您的疗愈之旅',
      'playback-status': '播放状态',
      'paused': '暂停',
      'ready-to-heal': '准备开始疗愈',
      'session-info': '本次会话',
      'healing-time': '专注疗愈时光',
      'sound-amplitude': '声音振幅',
      'amplitude-description': '波峰越高声音越响 • 波谷越低声音越轻',
      'silent': '静默中',
      'heartbeat-rhythm': '心跳般的节奏起伏',
      'headphone-tip': '使用耳机获得最佳疗愈体验',
      'click-to-switch': '点击切换场景',
      'not-playing': '暂未播放',
      'select-theme-to-start': '请选择主题开始疗愈',
      'previous': '上一首',
      'play': '播放',
      'pause': '暂停',
      'next': '下一首',
      'shuffle': '随机',
      'repeat': '循环',
      'shuffle-on': '随机开',
      'repeat-on': '循环开',
      'playing': '正在播放',
      'paused-status': '暂停中',
      'standby': '待机中',
      'enjoying-music': '享受疗愈音乐',
      'continue-journey': '继续疗愈之旅',
      'ready-to-start': '准备开始疗愈',
      'high-amplitude': '高振幅',
      'medium-amplitude': '中振幅',
      'low-amplitude': '低振幅',
      'timer-disabled': '未开启',
      'timer-enabled': '定时已设置',
      'select-theme-for-tracklist': '请选择主题查看音轨列表',
      'theme-scene': '主题场景',
      'play-all': '播放全部',
      'toggle-display': '切换显示',
      'timer-no-limit': '无限制',
      'timer-15min': '15分钟',
      'timer-30min': '30分钟',
      'timer-60min': '60分钟',
      'timer-90min': '90分钟'
    },
    'ja-JP': {
      'amplitude': 'Amplitude',
      'sound-healing': 'サウンドヒーリング',
      'brand-title': 'サウンドヒーリング空間',
      'brand-subtitle': '心を静寂に戻す',
      'current-theme': '現在のテーマ',
      'select-theme': 'テーマを選択',
      'start-journey': 'ヒーリングの旅を始める',
      'playback-status': '再生状態',
      'paused': '一時停止',
      'ready-to-heal': 'ヒーリング準備完了',
      'session-info': 'セッション情報',
      'healing-time': '集中ヒーリング時間',
      'sound-amplitude': '音の振幅',
      'amplitude-description': '高いピーク = 大きな音 • 低い谷 = 小さな音',
      'silent': '無音',
      'heartbeat-rhythm': '心拍のようなリズム',
      'headphone-tip': '最高のヒーリング体験にはヘッドフォンをご使用ください',
      'click-to-switch': 'クリックしてシーンを切り替え',
      'not-playing': '再生していません',
      'select-theme-to-start': 'ヒーリングを始めるテーマを選択してください',
      'previous': '前へ',
      'play': '再生',
      'pause': '一時停止',
      'next': '次へ',
      'shuffle': 'シャッフル',
      'repeat': 'リピート',
      'shuffle-on': 'シャッフル オン',
      'repeat-on': 'リピート オン',
      'playing': '再生中',
      'paused-status': '一時停止中',
      'standby': 'スタンバイ',
      'enjoying-music': 'ヒーリング音楽を楽しんでいます',
      'continue-journey': 'ヒーリングの旅を続ける',
      'ready-to-start': 'ヒーリング開始準備完了',
      'high-amplitude': '高振幅',
      'medium-amplitude': '中振幅',
      'low-amplitude': '低振幅',
      'timer-disabled': '制限なし',
      'timer-enabled': 'タイマー設定済み',
      'select-theme-for-tracklist': 'テーマを選択してトラックリストを表示',
      'theme-scene': 'テーマシーン',
      'play-all': '全て再生',
      'toggle-display': '表示切替',
      'timer-no-limit': '制限なし',
      'timer-15min': '15分',
      'timer-30min': '30分',
      'timer-60min': '60分',
      'timer-90min': '90分'
    },
    'ko-KR': {
      'amplitude': 'Amplitude',
      'sound-healing': '사운드 힐링',
      'brand-title': '사운드 힐링 공간',
      'brand-subtitle': '마음을 고요함으로 돌려보내다',
      'current-theme': '현재 테마',
      'select-theme': '테마 선택',
      'start-journey': '힐링 여행을 시작하세요',
      'playback-status': '재생 상태',
      'paused': '일시정지',
      'ready-to-heal': '힐링 준비 완료',
      'session-info': '세션 정보',
      'healing-time': '집중 힐링 시간',
      'sound-amplitude': '소리 진폭',
      'amplitude-description': '높은 피크 = 큰 소리 • 낮은 골 = 작은 소리',
      'silent': '무음',
      'heartbeat-rhythm': '심장박동 같은 리듬',
      'headphone-tip': '최고의 힐링 경험을 위해 헤드폰을 사용하세요',
      'click-to-switch': '클릭하여 장면 전환',
      'not-playing': '재생 중이 아님',
      'select-theme-to-start': '힐링을 시작할 테마를 선택하세요',
      'previous': '이전',
      'play': '재생',
      'pause': '일시정지',
      'next': '다음',
      'shuffle': '셔플',
      'repeat': '반복',
      'shuffle-on': '셔플 켜짐',
      'repeat-on': '반복 켜짐',
      'playing': '재생 중',
      'paused-status': '일시정지됨',
      'standby': '대기',
      'enjoying-music': '힐링 음악 감상 중',
      'continue-journey': '힐링 여행 계속하기',
      'ready-to-start': '힐링 시작 준비 완료',
      'high-amplitude': '높은 진폭',
      'medium-amplitude': '중간 진폭',
      'low-amplitude': '낮은 진폭',
      'timer-disabled': '제한 없음',
      'timer-enabled': '타이머 설정됨',
      'select-theme-for-tracklist': '테마를 선택하여 트랙 목록 보기',
      'theme-scene': '테마 장면',
      'play-all': '전체 재생',
      'toggle-display': '표시 전환',
      'timer-no-limit': '제한 없음',
      'timer-15min': '15분',
      'timer-30min': '30분',
      'timer-60min': '60분',
      'timer-90min': '90분'
    },
    'es-ES': {
      'amplitude': 'Amplitude',
      'sound-healing': 'sanación sonora',
      'brand-title': 'Espacio de Sanación Sonora',
      'brand-subtitle': 'Devuelve tu mente a la tranquilidad',
      'current-theme': 'Tema Actual',
      'select-theme': 'Seleccionar Tema',
      'start-journey': 'Comienza tu viaje de sanación',
      'playback-status': 'Estado de Reproducción',
      'paused': 'Pausado',
      'ready-to-heal': 'Listo para sanar',
      'session-info': 'Información de Sesión',
      'healing-time': 'Tiempo de sanación concentrada',
      'sound-amplitude': 'Amplitud de Sonido',
      'amplitude-description': 'Picos altos = sonido fuerte • Valles bajos = sonido suave',
      'silent': 'Silencioso',
      'heartbeat-rhythm': 'Ritmo como latido del corazón',
      'headphone-tip': 'Usa auriculares para la mejor experiencia de sanación',
      'click-to-switch': 'Haz clic para cambiar escenas',
      'not-playing': 'No reproduciendo',
      'select-theme-to-start': 'Selecciona un tema para comenzar la sanación',
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
      'enjoying-music': 'Disfrutando música de sanación',
      'continue-journey': 'Continuar viaje de sanación',
      'ready-to-start': 'Listo para comenzar sanación',
      'high-amplitude': 'Amplitud Alta',
      'medium-amplitude': 'Amplitud Media',
      'low-amplitude': 'Amplitud Baja',
      'timer-disabled': 'Sin límite',
      'timer-enabled': 'Temporizador establecido',
      'select-theme-for-tracklist': 'Selecciona un tema para ver la lista de pistas',
      'theme-scene': 'Escena Temática',
      'play-all': 'Reproducir Todo',
      'toggle-display': 'Alternar Visualización',
      'timer-no-limit': 'Sin límite',
      'timer-15min': '15 minutos',
      'timer-30min': '30 minutos',
      'timer-60min': '60 minutos',
      'timer-90min': '90 minutos'
    }
  };

  // 当前语言（默认为英语）
  let currentLanguage = 'en-US';
  let currentLanguageIndex = 0;

  // DOM元素
  const languageToggle = document.getElementById('languageToggle');
  const currentLanguageDisplay = document.getElementById('currentLanguage');

  // 获取浏览器语言，默认为英语
  const getBrowserLanguage = () => {
    const lang = navigator.language || navigator.userLanguage || 'en-US';
    return translations[lang] ? lang : 'en-US';
  };

  // 更新所有翻译文本（增强版）
  const updateTranslations = () => {
    const elements = document.querySelectorAll('[data-i18n]');
    const currentTranslations = translations[currentLanguage];

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (currentTranslations[key]) {
        element.textContent = currentTranslations[key];
      }
    });

    // 更新语言显示
    if (currentLanguageDisplay) {
      const langInfo = supportedLanguages.find(lang => lang.code === currentLanguage);
      currentLanguageDisplay.textContent = langInfo ? langInfo.name : 'English';
    }

    // 实时更新动态生成的内容
    updateDynamicContent();

    // 保存语言设置
    localStorage.setItem('soundHealing_language', currentLanguage);

    console.log(`Language switched to: ${currentLanguage}`);
  };

  // 更新动态内容（解决实时翻译问题）
  const updateDynamicContent = () => {
    // 更新播放控制按钮状态
    const playPauseBtn = document.querySelector('#playPauseBtn .control-label');
    const shuffleLabel = document.querySelector('#shuffleBtnVisible .mode-label');
    const repeatLabel = document.querySelector('#repeatBtnVisible .mode-label');

    if (playPauseBtn) {
      const isPlaying = playPauseBtn.textContent.includes('暂停') || playPauseBtn.textContent.includes('Pause');
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

    // 更新状态文本
    const playbackStatus = document.getElementById('playbackStatus');
    const currentThemeName = document.getElementById('currentThemeName');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingCategory = document.getElementById('nowPlayingCategory');

    if (playbackStatus && playbackStatus.textContent) {
      const statusMap = {
        '暂停': 'paused',
        'Paused': 'paused',
        'Pausado': 'paused',
        '일시정지': 'paused',
        '一時停止': 'paused',
        '正在播放': 'playing',
        'Playing': 'playing',
        'Reproduciendo': 'playing',
        '재생 중': 'playing',
        '再生中': 'playing'
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

  // 循环切换语言
  const toggleLanguage = () => {
    currentLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
    currentLanguage = supportedLanguages[currentLanguageIndex].code;
    updateTranslations();
  };

  // 获取翻译文本
  const t = (key) => {
    return translations[currentLanguage][key] || translations['en-US'][key] || key;
  };

  // 动态翻译函数（供其他模块使用）
  window.translate = t;
  window.updateTranslations = updateTranslations;
  window.getCurrentLanguage = () => currentLanguage;

  // 初始化语言
  const initializeLanguage = () => {
    // 从本地存储获取语言设置，否则使用英语作为默认语言
    const savedLanguage = localStorage.getItem('soundHealing_language');
    currentLanguage = savedLanguage || 'en-US';

    // 找到对应的语言索引
    currentLanguageIndex = supportedLanguages.findIndex(lang => lang.code === currentLanguage);
    if (currentLanguageIndex === -1) {
      currentLanguageIndex = 0; // 默认英语
      currentLanguage = 'en-US';
    }

    updateTranslations();
  };

  // 事件监听器
  if (languageToggle) {
    languageToggle.addEventListener('click', toggleLanguage);
  }

  // 监听其他事件以更新动态内容
  document.addEventListener('DOMContentLoaded', () => {
    // 监听播放状态变化
    const observer = new MutationObserver(() => {
      setTimeout(updateDynamicContent, 100);
    });

    // 观察可能变化的元素
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

  // 初始化
  initializeLanguage();
})();
