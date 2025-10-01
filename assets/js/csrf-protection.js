/**
 * CSRF保护模块 - SoundFlows
 * 防止跨站请求伪造攻击
 */

class CSRFProtection {
  constructor() {
    this.tokenName = 'csrf_token';
    this.headerName = 'X-CSRF-Token';
    this.tokenLength = 32;
    this.token = null;

    this.init();
  }

  /**
   * 初始化CSRF保护
   */
  init() {
    // 生成或获取现有token
    this.token = this.getOrCreateToken();

    // 保护所有fetch请求
    this.protectFetch();

    // 保护表单提交
    this.protectForms();

    console.log('🛡️ CSRF保护已启用');
  }

  /**
   * 获取或创建CSRF token
   */
  getOrCreateToken() {
    let token = this.getCookie(this.tokenName);

    if (!token) {
      token = this.generateToken();
      this.setCookie(this.tokenName, token, {
        expires: 365, // 1年有效期
        secure: true,
        sameSite: 'strict'
      });
    }

    return token;
  }

  /**
   * 生成随机token
   */
  generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < this.tokenLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 获取cookie值
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  /**
   * 设置cookie
   */
  setCookie(name, value, options = {}) {
    let cookie = `${name}=${value}`;

    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookie += `; expires=${date.toUTCString()}`;
    }

    if (options.path) {
      cookie += `; path=${options.path}`;
    } else {
      cookie += '; path=/';
    }

    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookie += '; secure';
    }

    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookie;
  }

  /**
   * 保护fetch请求
   */
  protectFetch() {
    const originalFetch = window.fetch;

    window.fetch = async (url, options = {}) => {
      // 只对同源URL添加CSRF保护
      if (this.isSameOrigin(url)) {
        options = options || {};
        options.headers = options.headers || {};

        // 添加CSRF token到请求头
        options.headers[this.headerName] = this.token;

        // 对于非简单请求，确保credentials包含
        if (options.credentials === undefined) {
          options.credentials = 'same-origin';
        }
      }

      return originalFetch(url, options);
    };
  }

  /**
   * 保护表单提交
   */
  protectForms() {
    document.addEventListener('submit', (event) => {
      const form = event.target;

      // 只保护同源表单
      if (this.isSameOrigin(form.action)) {
        // 添加隐藏的CSRF token字段
        if (!form.querySelector(`input[name="${this.tokenName}"]`)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = this.tokenName;
          input.value = this.token;
          form.appendChild(input);
        }
      }
    });
  }

  /**
   * 检查是否同源
   */
  isSameOrigin(url) {
    if (!url || typeof url !== 'string') return false;

    // 相对路径视为同源
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }

    try {
      const target = new URL(url, window.location.origin);
      return target.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  /**
   * 验证CSRF token
   */
  validateToken(token) {
    return token === this.token;
  }

  /**
   * 刷新token
   */
  refreshToken() {
    this.token = this.generateToken();
    this.setCookie(this.tokenName, this.token, {
      expires: 365,
      secure: true,
      sameSite: 'strict'
    });
    console.log('🔄 CSRF token已刷新');
  }

  /**
   * 获取当前token
   */
  getToken() {
    return this.token;
  }
}

// 创建全局实例
if (typeof window !== 'undefined') {
  window.csrfProtection = new CSRFProtection();

  // 导出到全局命名空间
  window.CSRFProtection = CSRFProtection;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSRFProtection;
}