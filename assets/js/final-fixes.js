/**
 * 最终修复 - 解决中文乱码和双滚动条
 */

(function() {
    'use strict';

    function initFinalFixes() {
        console.log('Starting final fixes for encoding and scrollbars...');

        // 1. 修复中文乱码问题
        function fixChineseEncoding() {
            // 修复所有包含乱码的元素
            const corruptedElements = document.querySelectorAll('*');

            corruptedElements.forEach(el => {
                const text = el.textContent;
                if (text && text.includes('���')) {
                    // 检查是否是需要翻译的元素
                    const hasI18n = el.hasAttribute('data-i18n') ||
                                   el.querySelector('[data-i18n]');

                    if (hasI18n) {
                        // 如果有i18n属性，触发重新翻译
                        if (window.i18n && window.i18n.updateContent) {
                            window.i18n.updateContent();
                        }
                    } else {
                        // 根据ID或类名修复已知的问题元素
                        if (el.id === 'experienceLaunchpad' ||
                            el.classList.contains('experience-launchpad')) {
                            // 修复"体验启动台"的乱码
                            if (text.includes('����������')) {
                                el.textContent = text.replace(/����������/g, '体验启动台');
                            }
                            if (text.includes('���ſ��ƻ����㰴�²���ʱ�Զ�����')) {
                                el.textContent = text.replace(/���ſ��ƻ����㰴�²���ʱ�Զ�����/g, '体验启动台：一键播放，智能定时自动关闭');
                            }
                            if (text.includes('ѡ��������Ƶ�������������ᵯ�����������������ϴ�')) {
                                el.textContent = text.replace(/ѡ��������Ƶ�������������ᵯ�����������������ϴ�/g, '选择疗愈音频，即刻进入沉浸式体验，播放器自动弹出、音量随时控制');
                            }
                            if (text.includes('�����򿪲�����')) {
                                el.textContent = text.replace(/�����򿪲�����/g, '立即开启播放');
                            }
                            if (text.includes('ÿ���㿪ʼ������Ƶ�������������Զ�������')) {
                                el.textContent = text.replace(/ÿ���㿪ʼ������Ƶ�������������Զ�������/g, '每天开始疗愈音频播放，自动记录疗愈数据');
                            }
                        }
                    }
                }
            });
        }

        // 2. 彻底解决双滚动条问题
        function fixDoubleScrollbar() {
            // 创建一个强制性的CSS修复
            const css = `
                /* 彻底解决双滚动条问题 */
                html {
                    overflow-x: hidden !important;
                    overflow-y: hidden !important;
                    height: 100%;
                    scrollbar-width: thin;
                }

                body {
                    overflow-x: hidden !important;
                    overflow-y: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    max-width: 100vw !important;
                    position: static !important;
                    min-height: 100%;
                    scrollbar-width: thin;
                }

                /* 移除所有可能的嵌套滚动 */
                * {
                    scrollbar-width: thin;
                }

                /* 固定定位元素不应该有滚动条 */
                .player-modal,
                .player-modal-overlay,
                [style*="position: fixed"] {
                    overflow: visible !important;
                }

                /* 确保只有主文档有滚动条 */
                ::-webkit-scrollbar {
                    width: 8px;
                    background: transparent;
                }

                ::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                }

                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 4px;
                }

                /* 防止任何元素产生额外的滚动条 */
                html, body, * {
                    scrollbar-gutter: stable;
                }
            `;

            // 添加CSS到页面
            let styleEl = document.getElementById('final-scrollbar-fix');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'final-scrollbar-fix';
                styleEl.textContent = css;
                document.head.appendChild(styleEl);
            }

            // 强制设置body样式
            document.body.style.overflowX = 'hidden';
            document.body.style.overflowY = 'auto';
            document.documentElement.style.overflowX = 'hidden';
            document.documentElement.style.overflowY = 'hidden';
        }

        // 3. 监听并修复后续加载的内容
        function monitorAndFix() {
            // 创建一个MutationObserver来监听DOM变化
            const observer = new MutationObserver((mutations) => {
                let needsFix = false;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const text = node.textContent || '';
                                if (text.includes('���')) {
                                    needsFix = true;
                                }
                            }
                        });
                    }
                });

                if (needsFix) {
                    setTimeout(() => {
                        fixChineseEncoding();
                    }, 100);
                }
            });

            // 开始观察
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // 立即执行修复
        fixChineseEncoding();
        fixDoubleScrollbar();

        // 延迟再次执行，确保动态加载的内容也被修复
        setTimeout(() => {
            fixChineseEncoding();
            fixDoubleScrollbar();
        }, 1000);

        // 监听后续变化
        monitorAndFix();

        console.log('Final fixes initialized');
    }

    // 等待DOM加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFinalFixes);
    } else {
        initFinalFixes();
    }

})();
