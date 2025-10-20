/**
 * Cross-Browser Polyfills for Sound Healing Application
 * Provides fallback implementations for unsupported features
 */

(function(global) {
    'use strict';

    console.log('🔧 加载跨浏览器 polyfills...');

    // ================================================================
    // CORE JavaScript Polyfills
    // ================================================================

    // Promise polyfill (if needed)
    if (typeof Promise === 'undefined') {
        console.log('📦 加载 Promise polyfill');

        // Simple Promise implementation
        global.Promise = function(executor) {
            this.state = 'pending';
            this.value = undefined;
            this.reason = undefined;
            this.onFulfilled = [];
            this.onRejected = [];

            const resolve = (value) => {
                if (this.state === 'pending') {
                    this.state = 'fulfilled';
                    this.value = value;
                    this.onFulfilled.forEach(fn => fn(value));
                }
            };

            const reject = (reason) => {
                if (this.state === 'pending') {
                    this.state = 'rejected';
                    this.reason = reason;
                    this.onRejected.forEach(fn => fn(reason));
                }
            };

            try {
                executor(resolve, reject);
            } catch (error) {
                reject(error);
            }
        };

        Promise.prototype.then = function(onFulfilled, onRejected) {
            return new Promise((resolve, reject) => {
                const handleFulfilled = (value) => {
                    if (typeof onFulfilled === 'function') {
                        try {
                            resolve(onFulfilled(value));
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        resolve(value);
                    }
                };

                const handleRejected = (reason) => {
                    if (typeof onRejected === 'function') {
                        try {
                            resolve(onRejected(reason));
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(reason);
                    }
                };

                if (this.state === 'fulfilled') {
                    setTimeout(handleFulfilled, 0, this.value);
                } else if (this.state === 'rejected') {
                    setTimeout(handleRejected, 0, this.reason);
                } else {
                    this.onFulfilled.push(handleFulfilled);
                    this.onRejected.push(handleRejected);
                }
            });
        };

        Promise.prototype.catch = function(onRejected) {
            return this.then(null, onRejected);
        };

        Promise.resolve = function(value) {
            return new Promise(resolve => resolve(value));
        };

        Promise.reject = function(reason) {
            return new Promise((resolve, reject) => reject(reason));
        };

        Promise.all = function(promises) {
            return new Promise((resolve, reject) => {
                const results = [];
                let completed = 0;
                const total = promises.length;

                if (total === 0) {
                    resolve(results);
                    return;
                }

                promises.forEach((promise, index) => {
                    Promise.resolve(promise).then(value => {
                        results[index] = value;
                        completed++;
                        if (completed === total) {
                            resolve(results);
                        }
                    }, reject);
                });
            });
        };
    }

    // RequestAnimationFrame polyfill
    (function() {
        let lastTime = 0;
        const vendors = ['ms', 'moz', 'webkit', 'o'];

        for (let x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
            global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
            global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] ||
                                      global[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!global.requestAnimationFrame) {
            global.requestAnimationFrame = function(callback, element) {
                const currTime = new Date().getTime();
                const timeToCall = Math.max(0, 16 - (currTime - lastTime));
                const id = global.setTimeout(() => {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!global.cancelAnimationFrame) {
            global.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    // Object.assign polyfill
    if (typeof Object.assign !== 'function') {
        (function() {
            Object.assign = function(target) {
                if (target === null || target === undefined) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                const to = Object(target);
                for (let index = 1; index < arguments.length; index++) {
                    const nextSource = arguments[index];

                    if (nextSource !== null && nextSource !== undefined) {
                        for (const nextKey in nextSource) {
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            };
        }());
    }

    // Array.includes polyfill
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            const O = Object(this);
            const len = parseInt(O.length, 10) || 0;
            if (len === 0) return false;

            const n = parseInt(fromIndex, 10) || 0;
            let k = n >= 0 ? n : Math.max(len + n, 0);

            while (k < len) {
                if (O[k] === searchElement) return true;
                k++;
            }
            return false;
        };
    }

    // String.includes polyfill
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            }
            return this.indexOf(search, start) !== -1;
        };
    }

    // Array.from polyfill
    if (!Array.from) {
        Array.from = function(arrayLike) {
            const result = [];
            for (let i = 0; i < arrayLike.length; i++) {
                result.push(arrayLike[i]);
            }
            return result;
        };
    }

    // ================================================================
    // AUDIO POLYFILLS
    // ================================================================

    // Enhanced AudioContext polyfill with fallback
    (function() {
        if (!global.AudioContext && !global.webkitAudioContext) {
            console.warn('⚠️ Web Audio API 不可用，使用基础音频降级');

            // Create a basic AudioContext stub
            global.AudioContext = function() {
                this.sampleRate = 44100;
                this.state = 'running';
                this.destination = {
                    maxChannelCount: 2,
                    channelCount: 2
                };

                // Stub methods that will be no-ops
                this.createOscillator = function() {
                    return {
                        connect: function() {},
                        start: function() {},
                        stop: function() {},
                        frequency: { value: 440 }
                    };
                };

                this.createGain = function() {
                    return {
                        connect: function() {},
                        gain: { value: 1 }
                    };
                };

                this.createAnalyser = function() {
                    return {
                        connect: function() {},
                        getByteTimeDomainData: function() {},
                        getByteFrequencyData: function() {},
                        frequencyBinCount: 256
                    };
                };

                this.createBufferSource = function() {
                    return {
                        connect: function() {},
                        start: function() {},
                        stop: function() {}
                    };
                };

                this.close = function() {
                    return Promise.resolve();
                };
            };
        }
    }());

    // MediaDevices getUserMedia polyfill
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices = navigator.mediaDevices || {};

        navigator.mediaDevices.getUserMedia = function(constraints) {
            // Get the correct getUserMedia function
            const getUserMedia = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not supported'));
            }

            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }

    // ================================================================
    // CANVAS POLYFILLS
    // ================================================================

    // Canvas 2D text fallback for older browsers
    if (document.createElement('canvas').getContext) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx && !ctx.fillText) {
            console.warn('⚠️ Canvas text 不支持，使用文本降级方案');

            // Store original methods
            const originalFillStyle = CanvasRenderingContext2D.prototype.fillStyle;
            const originalFont = CanvasRenderingContext2D.prototype.font;

            // Add text drawing support using DOM overlay
            CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
                // Create DOM text element
                const textEl = document.createElement('div');
                textEl.style.position = 'absolute';
                textEl.style.left = x + 'px';
                textEl.style.top = y + 'px';
                textEl.style.color = originalFillStyle;
                textEl.style.font = originalFont;
                textEl.style.pointerEvents = 'none';
                textEl.textContent = text;

                // Add to canvas parent
                if (this.canvas.parentNode) {
                    this.canvas.parentNode.appendChild(textEl);

                    // Store reference for cleanup
                    if (!this.canvas._textElements) {
                        this.canvas._textElements = [];
                    }
                    this.canvas._textElements.push(textEl);
                }
            };
        }
    }

    // ================================================================
    // STORAGE POLYFILLS
    // ================================================================

    // localStorage polyfill with memory fallback
    (function() {
        if (typeof localStorage === 'undefined') {
            console.warn('⚠️ localStorage 不可用，使用内存存储');

            const localStorageWrapper = {
                _data: {},
                _listeners: {},

                setItem: function(key, value) {
                    const oldValue = this._data[key];
                    this._data[key] = String(value);

                    // Trigger storage event
                    if (this._listeners['storage']) {
                        this._listeners['storage'].forEach(listener => {
                            listener({
                                key: key,
                                oldValue: oldValue,
                                newValue: String(value),
                                url: window.location.href
                            });
                        });
                    }
                },

                getItem: function(key) {
                    return this._data[key] || null;
                },

                removeItem: function(key) {
                    const oldValue = this._data[key];
                    delete this._data[key];

                    // Trigger storage event
                    if (this._listeners['storage']) {
                        this._listeners['storage'].forEach(listener => {
                            listener({
                                key: key,
                                oldValue: oldValue,
                                newValue: null,
                                url: window.location.href
                            });
                        });
                    }
                },

                clear: function() {
                    this._data = {};

                    // Trigger storage event
                    if (this._listeners['storage']) {
                        this._listeners['storage'].forEach(listener => {
                            listener({
                                key: null,
                                oldValue: null,
                                newValue: null,
                                url: window.location.href
                            });
                        });
                    }
                },

                get length() {
                    return Object.keys(this._data).length;
                },

                key: function(index) {
                    const keys = Object.keys(this._data);
                    return keys[index] || null;
                },

                addEventListener: function(type, listener) {
                    if (!this._listeners[type]) {
                        this._listeners[type] = [];
                    }
                    this._listeners[type].push(listener);
                },

                removeEventListener: function(type, listener) {
                    if (this._listeners[type]) {
                        const index = this._listeners[type].indexOf(listener);
                        if (index > -1) {
                            this._listeners[type].splice(index, 1);
                        }
                    }
                }
            };

            Object.defineProperty(localStorageWrapper, 'data', {
                get: function() {
                    return JSON.stringify(localStorageWrapper._data);
                },
                set: function(data) {
                    try {
                        localStorageWrapper._data = JSON.parse(data);
                    } catch (e) {
                        console.warn('Failed to set localStorage data:', e);
                    }
                }
            });

            global.localStorage = localStorageWrapper;
        }
    })();

    // ================================================================
    // CSS SUPPORT POLYFILLS
    // ================================================================

    // CSS Variables fallback for older browsers
    (function() {
        if (!window.CSS || !CSS.supports || !CSS.supports('color', 'var(--test)')) {
            console.warn('⚠️ CSS Variables 不支持，使用 JavaScript 降级');

            // Create CSS Variables processor
            const cssVariablesProcessor = {
                _variables: {},
                _rules: {},

                parse: function(cssText) {
                    const regex = /var\(--([^)]+)\)/g;
                    let match;

                    while ((match = regex.exec(cssText)) !== null) {
                        const varName = match[1];
                        cssText = cssText.replace(match[0], this._variables[varName] || 'inherit');
                    }

                    return cssText;
                },

                update: function(variables) {
                    Object.assign(this._variables, variables);
                    this.applyToElements();
                },

                applyToElements: function() {
                    const elements = document.querySelectorAll('[style*="var("]');

                    elements.forEach(element => {
                        const computedStyle = element.getAttribute('style');
                        if (computedStyle) {
                            const newStyle = this.parse(computedStyle);
                            element.setAttribute('style', newStyle);
                        }
                    });
                }
            };

            global.cssVariablesProcessor = cssVariablesProcessor;
        }
    })();

    // ================================================================
    // WEB API POLYFILLS
    // ================================================================

    // Fetch API polyfill (using XHR)
    if (!window.fetch) {
        console.warn('⚠️ Fetch API 不可用，使用 XHR polyfill');

        window.fetch = function(url, options = {}) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // Handle request
                xhr.open(options.method || 'GET', url, true);

                // Set headers
                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }

                // Handle response
                xhr.onload = function() {
                    const response = {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: parseHeaders(xhr.getAllResponseHeaders()),
                        url: xhr.responseURL,
                        text: () => Promise.resolve(xhr.responseText),
                        json: () => {
                            try {
                                return Promise.resolve(JSON.parse(xhr.responseText));
                            } catch (e) {
                                return Promise.reject(e);
                            }
                        },
                        blob: () => Promise.resolve(new Blob([xhr.response]))
                    };

                    resolve(response);
                };

                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };

                xhr.ontimeout = function() {
                    reject(new Error('Request timeout'));
                };

                // Send request
                if (options.body) {
                    xhr.send(options.body);
                } else {
                    xhr.send();
                }
            });
        };

        function parseHeaders(headersString) {
            const headers = {};
            headersString.split('\n').forEach(line => {
                const parts = line.split(': ');
                if (parts.length === 2) {
                    headers[parts[0]] = parts[1];
                }
            });
            return headers;
        }
    }

    // Service Worker polyfill (stub)
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker 不可用，使用空实现');

        navigator.serviceWorker = {
            register: function(url) {
                console.warn(`Service Worker 注册失败: ${url} (不支持)`);
                return Promise.resolve({
                    installing: null,
                    waiting: null,
                    active: null,
                    scope: window.location.origin,
                    update: function() { return Promise.resolve(); }
                });
            },
            getRegistration: function() {
                return Promise.resolve(null);
            },
            getRegistrations: function() {
                return Promise.resolve([]);
            },
            addEventListener: function() {},
            removeEventListener: function() {}
        };
    }

    // Intersection Observer polyfill (basic)
    if (!window.IntersectionObserver) {
        console.warn('⚠️ Intersection Observer 不可用，使用滚动事件降级');

        window.IntersectionObserver = function(callback, options = {}) {
            this.callback = callback;
            this.options = options;
            this.elements = [];

            // Use scroll events as fallback
            this._scrollHandler = () => {
                this.elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const isVisible = (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= window.innerHeight &&
                        rect.right <= window.innerWidth
                    );

                    callback([{
                        target: element,
                        isIntersecting: isVisible,
                        intersectionRatio: isVisible ? 1 : 0
                    }]);
                });
            };

            window.addEventListener('scroll', this._scrollHandler);
            window.addEventListener('resize', this._scrollHandler);
        };

        window.IntersectionObserver.prototype = {
            observe: function(element) {
                if (!this.elements.includes(element)) {
                    this.elements.push(element);
                }
                this._scrollHandler();
            },

            unobserve: function(element) {
                const index = this.elements.indexOf(element);
                if (index > -1) {
                    this.elements.splice(index, 1);
                }
            },

            disconnect: function() {
                this.elements = [];
                window.removeEventListener('scroll', this._scrollHandler);
                window.removeEventListener('resize', this._scrollHandler);
            }
        };
    }

    // ================================================================
    // PERFORMANCE POLYFILLS
    // ================================================================

    // Performance API polyfill
    if (!window.performance) {
        window.performance = {};
    }

    if (!window.performance.now) {
        window.performance.now = function() {
            return Date.now() - (window.performance.timing || {}).navigationStart || 0;
        };
    }

    if (!window.performance.mark) {
        window.performance.mark = function(name) {
            if (!window.performance._marks) {
                window.performance._marks = {};
            }
            window.performance._marks[name] = Date.now();
        };
    }

    if (!window.performance.measure) {
        window.performance.measure = function(name, startMark, endMark) {
            if (!window.performance._measures) {
                window.performance._measures = {};
            }

            const startTime = window.performance._marks[startMark] || 0;
            const endTime = endMark === undefined ? Date.now() : (window.performance._marks[endMark] || 0);

            window.performance._measures[name] = {
                startTime: startTime,
                duration: endTime - startTime
            };
        };
    }

    // ================================================================
    // MOBILE-SPECIFIC POLYFILLS
    // ================================================================

    // Touch events polyfill for mouse events
    if (!('ontouchstart' in window)) {
        console.warn('⚠️ 触摸事件不可用，使用鼠标事件降级');

        // Add touch event support using mouse events
        const touchEvents = {
            touchstart: 'mousedown',
            touchmove: 'mousemove',
            touchend: 'mouseup',
            touchcancel: 'mouseup'
        };

        Object.keys(touchEvents).forEach(touchEvent => {
            const mouseEvent = touchEvents[touchEvent];

            document.addEventListener(mouseEvent, function(e) {
                const touch = {
                    identifier: Date.now(),
                    pageX: e.pageX,
                    pageY: e.pageY,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                    target: e.target,
                    preventDefault: function() { e.preventDefault(); },
                    stopPropagation: function() { e.stopPropagation(); }
                };

                const event = new CustomEvent(touchEvent, {
                    bubbles: true,
                    cancelable: true,
                    detail: { touches: [touch], changedTouches: [touch] }
                });

                e.target.dispatchEvent(event);
            });
        });
    }

    // ================================================================
    // UTILITY FUNCTIONS
    // ================================================================

    // Browser detection utility
    global.browserUtils = {
        isIE: function() {
            return !!document.documentMode;
        },

        isEdge: function() {
            return /Edge/.test(navigator.userAgent);
        },

        isChrome: function() {
            return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
        },

        isFirefox: function() {
            return /Firefox/.test(navigator.userAgent);
        },

        isSafari: function() {
            return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        },

        isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        isTablet: function() {
            return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
        },

        getBrowserInfo: function() {
            const ua = navigator.userAgent;
            let browser = 'Unknown';
            let version = 'Unknown';

            if (/Chrome/.test(ua) && !/Edge/.test(ua)) {
                browser = 'Chrome';
                version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
            } else if (/Firefox/.test(ua)) {
                browser = 'Firefox';
                version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
            } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
                browser = 'Safari';
                version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
            } else if (/Edge/.test(ua)) {
                browser = 'Edge';
                version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
            } else if (/MSIE|Trident/.test(ua)) {
                browser = 'Internet Explorer';
                version = ua.match(/MSIE (\d+)|rv:(\d+)/)?.[1] || 'Unknown';
            }

            return { browser, version };
        }
    };

    // Feature detection utility
    global.featureDetection = {
        supportsAudioContext: function() {
            return !!(window.AudioContext || window.webkitAudioContext);
        },

        supportsWebGL: function() {
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        },

        supportsLocalStorage: function() {
            try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },

        supportsServiceWorker: function() {
            return 'serviceWorker' in navigator;
        },

        supportsFetch: function() {
            return 'fetch' in window;
        },

        supportsCSSVariables: function() {
            return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
        }
    };

    // ================================================================
    // INITIALIZATION
    // ================================================================

    console.log('✅ 跨浏览器 polyfills 加载完成');

    // Initialize polyfill system
    global.polyfillSystem = {
        loaded: true,
        version: '1.0.0',
        audioFallback: !global.featureDetection.supportsAudioContext(),
        storageFallback: !global.featureDetection.supportsLocalStorage(),
        fetchFallback: !global.featureDetection.supportsFetch(),
        webglFallback: !global.featureDetection.supportsWebGL(),
        cssVariablesFallback: !global.featureDetection.supportsCSSVariables(),
        serviceWorkerFallback: !global.featureDetection.supportsServiceWorker()
    };

    // Emit ready event
    setTimeout(() => {
        const event = new CustomEvent('polyfillsReady', {
            detail: global.polyfillSystem
        });
        window.dispatchEvent(event);
    }, 0);

})(typeof window !== 'undefined' ? window : this);