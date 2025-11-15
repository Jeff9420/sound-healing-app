/**
 * 播放器管理器 - 确保使用模态框播放器，禁用固定播放器
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  function waitForElements(callback, maxAttempts = 50) {
    let attempts = 0;

    function check() {
      const fixedPlayer = document.getElementById('fixedPlayer');
      const modalPlayer = document.getElementById('playerModal');

      if (fixedPlayer || modalPlayer) {
        callback(fixedPlayer, modalPlayer);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(check, 100);
      }
    }

    check();
  }

  // 禁用固定播放器
  function disableFixedPlayer(fixedPlayer) {
    if (fixedPlayer) {
      // 完全隐藏固定播放器
      fixedPlayer.style.display = 'none';
      fixedPlayer.style.visibility = 'hidden';
      fixedPlayer.style.opacity = '0';
      fixedPlayer.style.pointerEvents = 'none';
      fixedPlayer.style.height = '0';
      fixedPlayer.style.width = '0';
      fixedPlayer.style.overflow = 'hidden';

      // 从DOM中移除（可选）
      // fixedPlayer.remove();

      console.log('✅ 固定播放器已禁用');
    }
  }

  // 确保模态播放器正常工作
  function ensureModalPlayer(modalPlayer) {
    if (modalPlayer) {
      // 确保模态播放器有正确的z-index
      modalPlayer.style.zIndex = '10000';

      console.log('✅ 模态播放器已就绪');
    }
  }

  // 监听音频播放事件，确保显示模态播放器
  function setupAudioEventListeners() {
    // 监听音频播放事件
    window.addEventListener('audioPlay', (e) => {
      if (window.playerModalController) {
        window.playerModalController.show();
      }
    });

    // 监听audio元素的play事件
    document.addEventListener('play', (e) => {
      if (e.target.tagName === 'AUDIO' && window.playerModalController) {
        setTimeout(() => {
          window.playerModalController.show();
        }, 100);
      }
    }, true);
  }

  // 处理页面点击事件 - 添加浮动播放按钮
  function createFloatingPlayButton() {
    // 检查是否已存在
    if (document.getElementById('floatingPlayBtn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'floatingPlayBtn';
    button.innerHTML = '🎵';
    button.title = '打开播放器';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      if (window.playerModalController) {
        window.playerModalController.show();
      }
    });

    document.body.appendChild(button);
    console.log('✅ 浮动播放按钮已创建');
  }

  // 初始化
  function init() {
    waitForElements((fixedPlayer, modalPlayer) => {
      // 禁用固定播放器
      disableFixedPlayer(fixedPlayer);

      // 确保模态播放器正常
      ensureModalPlayer(modalPlayer);

      // 设置事件监听器
      setupAudioEventListeners();

      // 创建浮动播放按钮（可选）
      // createFloatingPlayButton();
    });

    console.log('🎵 播放器管理器已初始化 - 使用模态播放器');
  }

  // 如果DOM已经加载，立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();