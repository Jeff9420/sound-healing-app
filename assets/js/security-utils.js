/**
 * 安全工具函数 - SoundFlows
 * 防止XSS攻击的实用工具
 */

/**
 * HTML转义函数
 * 防止XSS攻击
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的安全字符串
 */
function escapeHtml(str) {
  if (!str) return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 安全地设置元素的HTML内容
 * 自动转义HTML特殊字符
 * @param {HTMLElement} element - 目标元素
 * @param {string} content - 要设置的内容
 */
function setSafeContent(element, content) {
  element.textContent = content;
}

/**
 * 安全地创建包含用户内容的元素
 * @param {string} tagName - 标签名
 * @param {string} text - 文本内容（会被转义）
 * @param {Object} attributes - 属性对象
 * @returns {HTMLElement} 创建的元素
 */
function createSafeElement(tagName, text, attributes = {}) {
  const element = document.createElement(tagName);
  element.textContent = text;

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
}

/**
 * 文件名安全化处理
 * 移除潜在的恶意字符
 * @param {string} fileName - 原始文件名
 * @returns {string} 安全化的文件名
 */
function sanitizeFileName(fileName) {
  if (!fileName) return '';

  // 移除HTML特殊字符和控制字符
  return fileName
    .replace(/[<>"'&]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * 验证文件名是否安全
 * @param {string} fileName - 要验证的文件名
 * @returns {boolean} 是否安全
 */
function isFileNameSafe(fileName) {
  if (!fileName || typeof fileName !== 'string') return false;

  // 检查是否包含HTML特殊字符或控制字符
  return !/[<>"'&\x00-\x1F\x7F]/.test(fileName);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    setSafeContent,
    createSafeElement,
    sanitizeFileName,
    isFileNameSafe
  };
} else if (typeof window !== 'undefined') {
  window.SecurityUtils = {
    escapeHtml,
    setSafeContent,
    createSafeElement,
    sanitizeFileName,
    isFileNameSafe
  };
}