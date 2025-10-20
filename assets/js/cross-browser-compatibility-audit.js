/**
 * Cross-Browser Compatibility Audit System for Sound Healing Application
 * Automated detection and polyfill management
 */

class CrossBrowserCompatibilityAudit {
    constructor() {
        this.auditResults = {
            browser: {},
            features: {},
            audio: {},
            canvas: {},
            css: {},
            js: {},
            performance: {},
            recommendations: [],
            polyfills: [],
            criticalIssues: []
        };

        this.compatibilityMatrix = {
            chrome: { minVersion: '70', features: {} },
            firefox: { minVersion: '65', features: {} },
            safari: { minVersion: '12', features: {} },
            edge: { minVersion: '79', features: {} },
            ie11: { minVersion: '11', features: {} }
        };

        this.initializeAudit();
    }

    async initializeAudit() {
        console.log('🔍 开始跨浏览器兼容性审计...');

        this.detectBrowserEnvironment();
        await this.auditCoreFeatures();
        this.auditAudioSystem();
        this.auditCanvasFeatures();
        this.auditCSSFeatures();
        this.auditJavaScriptFeatures();
        this.auditPerformanceFeatures();
        this.generateRecommendations();
        this.outputAuditResults();
    }

    detectBrowserEnvironment() {
        const ua = navigator.userAgent;
        const browserInfo = this.parseUserAgent(ua);

        this.auditResults.browser = {
            ...browserInfo,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            deviceMemory: navigator.deviceMemory || 4,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            vendor: navigator.vendor,
            connection: this.getConnectionInfo(),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isTablet: /iPad|Android(?!.*Mobile)|Tablet/i.test(ua)
        };

        console.log('📋 浏览器环境检测完成:', this.auditResults.browser.name);
    }

    parseUserAgent(ua) {
        let browser = { name: 'Unknown', version: 'Unknown', engine: 'Unknown', compatibility: 'unknown' };

        // Chrome/Chromium detection
        if (/Chrome/.test(ua) && !/Edge/.test(ua)) {
            browser.name = 'chrome';
            browser.version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
            browser.engine = 'Blink';
            browser.compatibility = this.checkVersionCompatibility(browser.version, this.compatibilityMatrix.chrome.minVersion);
        }
        // Firefox detection
        else if (/Firefox/.test(ua)) {
            browser.name = 'firefox';
            browser.version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
            browser.engine = 'Gecko';
            browser.compatibility = this.checkVersionCompatibility(browser.version, this.compatibilityMatrix.firefox.minVersion);
        }
        // Safari detection
        else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            browser.name = 'safari';
            browser.version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
            browser.engine = 'WebKit';
            browser.compatibility = this.checkVersionCompatibility(browser.version, this.compatibilityMatrix.safari.minVersion);
        }
        // Edge detection
        else if (/Edg/.test(ua)) {
            browser.name = 'edge';
            browser.version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
            browser.engine = 'Blink';
            browser.compatibility = this.checkVersionCompatibility(browser.version, this.compatibilityMatrix.edge.minVersion);
        }
        // Legacy Edge detection
        else if (/Edge/.test(ua)) {
            browser.name = 'edge';
            browser.version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
            browser.engine = 'EdgeHTML';
            browser.compatibility = 'partial'; // Legacy Edge has partial support
        }
        // Internet Explorer detection
        else if (/MSIE|Trident/.test(ua)) {
            browser.name = 'ie11';
            browser.version = ua.match(/MSIE (\d+)|rv:(\d+)/)?.[1] || '11';
            browser.engine = 'Trident';
            browser.compatibility = 'limited'; // IE11 has very limited support
        }

        return browser;
    }

    checkVersionCompatibility(currentVersion, minimumVersion) {
        const current = parseInt(currentVersion, 10);
        const minimum = parseInt(minimumVersion, 10);

        if (isNaN(current) || isNaN(minimum)) return 'unknown';

        if (current >= minimum) return 'full';
        if (current >= minimum - 10) return 'partial';
        return 'incompatible';
    }

    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return { type: 'unknown', effectiveType: 'unknown', downlink: 'unknown' };

        return {
            type: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink ? `${connection.downlink} Mbps` : 'unknown',
            rtt: connection.rtt || 'unknown',
            saveData: connection.saveData || false
        };
    }

    async auditCoreFeatures() {
        console.log('🔧 审计核心功能...');

        const features = {
            // Audio APIs
            webAudioAPI: !!(window.AudioContext || window.webkitAudioContext),
            audioElement: !!document.createElement('audio').canPlayType,
            mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),

            // Canvas and Graphics
            canvas2D: this.testCanvas2D(),
            webGL: this.testWebGL(),
            requestAnimationFrame: this.testRequestAnimationFrame(),

            // Storage APIs
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            indexedDB: !!window.indexedDB,

            // Network APIs
            fetchAPI: !!window.fetch,
            serviceWorker: 'serviceWorker' in navigator,
            cacheAPI: 'caches' in window,

            // UI APIs
            fullscreenAPI: this.testFullscreenAPI(),
            notificationAPI: 'Notification' in window,
            geolocationAPI: 'geolocation' in navigator,

            // Device APIs
            touchEvents: 'ontouchstart' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            deviceMotion: 'DeviceMotionEvent' in window,
            batteryAPI: 'getBattery' in navigator,

            // PWA APIs
            webAppManifest: !!document.querySelector('link[rel="manifest"]'),
            beforeInstallPrompt: 'beforeinstallprompt' in window,
            pushManager: 'PushManager' in window,

            // Modern JavaScript
            promises: !!window.Promise,
            asyncAwait: this.testAsyncAwait(),
            es6Modules: this.testES6Modules(),
            webWorkers: !!window.Worker,
            sharedWorkers: !!window.SharedWorker,

            // CSS Features
            cssVariables: CSS.supports('color', 'var(--test)'),
            cssGrid: CSS.supports('display', 'grid'),
            flexbox: CSS.supports('display', 'flex'),
            cssCustomProperties: CSS.supports('all', 'initial'),

            // Security
            secureContext: location.protocol === 'https:',
            sri: 'integrity' in document.createElement('link'),
            csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        };

        this.auditResults.features = features;
        console.log('✅ 核心功能审计完成');
    }

    testCanvas2D() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    testRequestAnimationFrame() {
        return !!(window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   window.msRequestAnimationFrame);
    }

    testLocalStorage() {
        try {
            const testKey = 'localStorage_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    testSessionStorage() {
        try {
            const testKey = 'sessionStorage_test';
            sessionStorage.setItem(testKey, 'test');
            sessionStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    testFullscreenAPI() {
        return !!(document.fullscreenEnabled ||
                   document.webkitFullscreenEnabled ||
                   document.mozFullScreenEnabled ||
                   document.msFullscreenEnabled);
    }

    testAsyncAwait() {
        try {
            eval('async function test() {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    testES6Modules() {
        try {
            eval('import test from "test"');
            return true;
        } catch (e) {
            // Fallback: check if script type="module" is supported
            const script = document.createElement('script');
            return 'noModule' in script;
        }
    }

    auditAudioSystem() {
        console.log('🎵 审计音频系统...');

        const audioTests = {
            basicAudio: !!document.createElement('audio').canPlayType,
            audioFormats: this.testAudioFormats(),
            webAudioContext: !!(window.AudioContext || window.webkitAudioContext),
            audioWorklet: 'AudioWorklet' in window,
            mediaRecorder: 'MediaRecorder' in window,
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            audioConstraints: this.testAudioConstraints(),
            webAudioFeatures: this.testWebAudioFeatures()
        };

        // Critical issue detection for audio
        if (!audioTests.basicAudio) {
            this.auditResults.criticalIssues.push({
                severity: 'critical',
                category: 'audio',
                issue: 'HTML5 Audio API not supported',
                impact: 'Core audio playback functionality will not work',
                fix: 'Upgrade to a modern browser or use polyfill solutions'
            });
        }

        if (!audioTests.webAudioContext) {
            this.auditResults.criticalIssues.push({
                severity: 'high',
                category: 'audio',
                issue: 'Web Audio API not supported',
                impact: 'Advanced audio features (mixing, effects) will not work',
                fix: 'Upgrade browser or implement fallback audio system'
            });
        }

        this.auditResults.audio = audioTests;
        console.log('✅ 音频系统审计完成');
    }

    testAudioFormats() {
        const audio = document.createElement('audio');
        return {
            mp3: audio.canPlayType('audio/mpeg;'),
            wav: audio.canPlayType('audio/wav; codecs="1"'),
            ogg: audio.canPlayType('audio/ogg; codecs="vorbis"'),
            aac: audio.canPlayType('audio/aac;'),
            flac: audio.canPlayType('audio/flac;'),
            webm: audio.canPlayType('audio/webm; codecs="vorbis"'),
            m4a: audio.canPlayType('audio/mp4; codecs="mp4a.40.2"')
        };
    }

    testAudioConstraints() {
        const audio = document.createElement('audio');
        return {
            volume: audio.volume !== undefined,
            playbackRate: audio.playbackRate !== undefined,
            currentTime: audio.currentTime !== undefined,
            duration: audio.duration !== undefined,
            loop: audio.loop !== undefined,
            muted: audio.muted !== undefined,
            controls: audio.controls !== undefined,
            autoplay: audio.autoplay !== undefined,
            preload: audio.preload !== undefined
        };
    }

    testWebAudioFeatures() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return {};

            const ctx = new AudioContextClass();
            const features = {
                createOscillator: !!ctx.createOscillator,
                createGainNode: !!ctx.createGain,
                createAnalyser: !!ctx.createAnalyser,
                createDelay: !!ctx.createDelay,
                createConvolver: !!ctx.createConvolver,
                createBiquadFilter: !!ctx.createBiquadFilter,
                createPanner: !!ctx.createPanner,
                createStereoPanner: !!ctx.createStereoPanner,
                createScriptProcessor: !!ctx.createScriptProcessor
            };

            ctx.close();
            return features;
        } catch (e) {
            return {};
        }
    }

    auditCanvasFeatures() {
        console.log('🎨 审计Canvas功能...');

        const canvasTests = {
            canvas2D: this.testCanvas2D(),
            webGL: this.testWebGL(),
            webGL2: this.testWebGL2(),
            offscreenCanvas: this.testOffscreenCanvas(),
            canvasFeatures: this.testCanvasFeatures(),
            imageDataSupport: this.testImageDataSupport(),
            performanceFeatures: this.testCanvasPerformanceFeatures()
        };

        if (!canvasTests.canvas2D) {
            this.auditResults.criticalIssues.push({
                severity: 'critical',
                category: 'canvas',
                issue: 'Canvas 2D not supported',
                impact: 'All visual effects and animations will not work',
                fix: 'Upgrade browser or implement CSS fallbacks'
            });
        }

        this.auditResults.canvas = canvasTests;
        console.log('✅ Canvas功能审计完成');
    }

    testWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }

    testOffscreenCanvas() {
        return 'OffscreenCanvas' in window;
    }

    testCanvasFeatures() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return {};

        return {
            fillText: typeof ctx.fillText === 'function',
            drawImage: typeof ctx.drawImage === 'function',
            createLinearGradient: typeof ctx.createLinearGradient === 'function',
            createRadialGradient: typeof ctx.createRadialGradient === 'function',
            createPattern: typeof ctx.createPattern === 'function',
            globalCompositeOperation: ctx.globalCompositeOperation !== undefined,
            setLineDash: typeof ctx.setLineDash === 'function',
            createImageData: typeof ctx.createImageData === 'function',
            getImageData: typeof ctx.getImageData === 'function',
            putImageData: typeof ctx.putImageData === 'function',
            save: typeof ctx.save === 'function',
            restore: typeof ctx.restore === 'function',
            transform: typeof ctx.transform === 'function',
            scale: typeof ctx.scale === 'function',
            rotate: typeof ctx.rotate === 'function',
            translate: typeof ctx.translate === 'function'
        };
    }

    testImageDataSupport() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const imageData = ctx.createImageData(1, 1);
            return imageData && imageData.data && imageData.data.length === 4;
        } catch (e) {
            return false;
        }
    }

    testCanvasPerformanceFeatures() {
        return {
            requestIdleCallback: 'requestIdleCallback' in window,
            performanceNow: 'performance' in window && typeof performance.now === 'function',
            performanceMark: 'performance' in window && typeof performance.mark === 'function',
            performanceMeasure: 'performance' in window && typeof performance.measure === 'function',
            willChange: CSS.supports('will-change', 'transform'),
            contain: CSS.supports('contain', 'layout'),
            transform: CSS.supports('transform', 'translate3d(0,0,0)')
        };
    }

    auditCSSFeatures() {
        console.log('🎭 审计CSS功能...');

        const cssTests = {
            layout: this.testLayoutFeatures(),
            visual: this.testVisualFeatures(),
            animation: this.testAnimationFeatures(),
            interaction: this.testInteractionFeatures(),
            responsive: this.testResponsiveFeatures(),
            pwa: this.testPWAFeatures(),
            customProperties: this.testCustomProperties()
        };

        this.auditResults.css = cssTests;
        console.log('✅ CSS功能审计完成');
    }

    testLayoutFeatures() {
        return {
            displayGrid: CSS.supports('display', 'grid'),
            displayFlex: CSS.supports('display', 'flex'),
            displayContents: CSS.supports('display', 'contents'),
            positionSticky: CSS.supports('position', 'sticky'),
            boxSizing: CSS.supports('box-sizing', 'border-box'),
            objectFit: CSS.supports('object-fit', 'cover'),
            objectPosition: CSS.supports('object-position', 'center'),
            verticalAlign: CSS.supports('vertical-align', 'middle'),
            textAlign: CSS.supports('text-align', 'center'),
            overflowWrap: CSS.supports('overflow-wrap', 'break-word'),
            wordBreak: CSS.supports('word-break', 'break-word')
        };
    }

    testVisualFeatures() {
        return {
            borderRadius: CSS.supports('border-radius', '5px'),
            boxShadow: CSS.supports('box-shadow', '0 0 10px #000'),
            textShadow: CSS.supports('text-shadow', '1px 1px 1px #000'),
            linearGradient: CSS.supports('background', 'linear-gradient(to right, red, blue)'),
            radialGradient: CSS.supports('background', 'radial-gradient(circle, red, blue)'),
            conicGradient: CSS.supports('background', 'conic-gradient(red, blue)'),
            clipPath: CSS.supports('clip-path', 'circle()'),
            mask: CSS.supports('mask', 'url(#mask)'),
            filter: CSS.supports('filter', 'blur(5px)'),
            backdropFilter: CSS.supports('backdrop-filter', 'blur(5px)'),
            mixBlendMode: CSS.supports('mix-blend-mode', 'multiply'),
            isolation: CSS.supports('isolation', 'isolate'),
            transform3d: CSS.supports('transform', 'translate3d(0,0,0)'),
            perspective: CSS.supports('perspective', '1000px')
        };
    }

    testAnimationFeatures() {
        return {
            transition: CSS.supports('transition', 'all 1s'),
            animation: CSS.supports('animation', 'test 1s'),
            keyframes: CSS.supports('@keyframes', 'test {}'),
            transform: CSS.supports('transform', 'rotate(1deg)'),
            animationPlayState: CSS.supports('animation-play-state', 'paused'),
            animationFillMode: CSS.supports('animation-fill-mode', 'forwards'),
            animationDirection: CSS.supports('animation-direction', 'alternate'),
            animationIterationCount: CSS.supports('animation-iteration-count', 'infinite')
        };
    }

    testInteractionFeatures() {
        return {
            cursor: CSS.supports('cursor', 'pointer'),
            userSelect: CSS.supports('user-select', 'none'),
            pointerEvents: CSS.supports('pointer-events', 'none'),
            touchAction: CSS.supports('touch-action', 'pan-y'),
            resize: CSS.supports('resize', 'both'),
            scrollbarWidth: CSS.supports('scrollbar-width', 'thin'),
            overscrollBehavior: CSS.supports('overscroll-behavior', 'contain'),
            appearance: CSS.supports('appearance', 'none')
        };
    }

    testResponsiveFeatures() {
        return {
            mediaQueries: !!window.matchMedia,
            vwUnits: CSS.supports('width', '1vw'),
            vhUnits: CSS.supports('height', '1vh'),
            vminUnits: CSS.supports('width', '1vmin'),
            vmaxUnits: CSS.supports('width', '1vmax'),
            remUnits: CSS.supports('font-size', '1rem'),
            calc: CSS.supports('width', 'calc(100% - 50px)'),
            aspectRatio: CSS.supports('aspect-ratio', '16/9'),
            containerQueries: CSS.supports('container-type', 'size'),
            picture: !!window.HTMLPictureElement,
            srcset: !!document.createElement('img').srcset
        };
    }

    testPWAFeatures() {
        return {
            displayModes: CSS.supports('display', 'standalone'),
            appRegion: CSS.supports('-webkit-app-region', 'drag'),
            colorScheme: CSS.supports('color-scheme', 'dark'),
            forcedColors: CSS.supports('forced-color-adjust', 'none'),
            prefersColorScheme: !!window.matchMedia('(prefers-color-scheme: dark)').media,
            prefersReducedMotion: !!window.matchMedia('(prefers-reduced-motion: reduce)').media,
            prefersReducedData: !!window.matchMedia('(prefers-reduced-data: reduce)').media
        };
    }

    testCustomProperties() {
        return {
            cssVariables: CSS.supports('color', 'var(--test)'),
            customProperties: CSS.supports('--custom', 'value'),
            calcWithVar: CSS.supports('width', 'calc(var(--test) * 1px)'),
            environmentVariables: CSS.supports('background-color', 'env(safe-area-inset-top)')
        };
    }

    auditJavaScriptFeatures() {
        console.log('⚡ 审计JavaScript功能...');

        const jsTests = {
            es6Features: this.testES6Features(),
            asyncFeatures: this.testAsyncFeatures(),
            webAPIs: this.testWebAPIs(),
            storageAPIs: this.testStorageAPIs(),
            workerAPIs: this.testWorkerAPIs(),
            securityAPIs: this.testSecurityAPIs(),
            performanceAPIs: this.testPerformanceAPIs(),
            internationalizationAPIs: this.testInternationalizationAPIs()
        };

        this.auditResults.js = jsTests;
        console.log('✅ JavaScript功能审计完成');
    }

    testES6Features() {
        return {
            arrowFunctions: this.testArrowFunctions(),
            templateLiterals: this.testTemplateLiterals(),
            destructuring: this.testDestructuring(),
            defaultParameters: this.testDefaultParameters(),
            restParameters: this.testRestParameters(),
            spreadOperator: this.testSpreadOperator(),
            classes: this.testClasses(),
            modules: this.testES6Modules(),
            symbols: typeof Symbol !== 'undefined',
            iterators: this.testIterators(),
            generators: this.testGenerators(),
            promises: typeof Promise !== 'undefined',
            proxy: typeof Proxy !== 'undefined',
            reflect: typeof Reflect !== 'undefined',
            map: typeof Map !== 'undefined',
            set: typeof Set !== 'undefined',
            weakMap: typeof WeakMap !== 'undefined',
            weakSet: typeof WeakSet !== 'undefined'
        };
    }

    testArrowFunctions() {
        try {
            eval('() => {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    testTemplateLiterals() {
        try {
            eval('`test`');
            return true;
        } catch (e) {
            return false;
        }
    }

    testDestructuring() {
        try {
            eval('const {a} = {a:1}');
            return true;
        } catch (e) {
            return false;
        }
    }

    testDefaultParameters() {
        try {
            eval('function test(a = 1) {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    testRestParameters() {
        try {
            eval('function test(...args) {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    testSpreadOperator() {
        try {
            eval('[...[1,2,3]]');
            return true;
        } catch (e) {
            return false;
        }
    }

    testClasses() {
        try {
            eval('class Test {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    testIterators() {
        try {
            const obj = {};
            obj[Symbol.iterator] = function* () { yield 1; };
            return [...obj][0] === 1;
        } catch (e) {
            return false;
        }
    }

    testGenerators() {
        try {
            eval('function* test() { yield 1; }');
            return true;
        } catch (e) {
            return false;
        }
    }

    testAsyncFeatures() {
        return {
            asyncAwait: this.testAsyncAwait(),
            asyncGenerators: this.testAsyncGenerators(),
            fetchAPI: typeof fetch !== 'undefined',
            streamsAPI: typeof ReadableStream !== 'undefined',
            webSockets: typeof WebSocket !== 'undefined',
            eventSource: typeof EventSource !== 'undefined',
            sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
            atomics: typeof Atomics !== 'undefined'
        };
    }

    testAsyncGenerators() {
        try {
            eval('async function* test() { yield 1; }');
            return true;
        } catch (e) {
            return false;
        }
    }

    testWebAPIs() {
        return {
            intersectionObserver: typeof IntersectionObserver !== 'undefined',
            mutationObserver: typeof MutationObserver !== 'undefined',
            resizeObserver: typeof ResizeObserver !== 'undefined',
            performanceObserver: typeof PerformanceObserver !== 'undefined',
            broadcastChannel: typeof BroadcastChannel !== 'undefined',
            messageChannel: typeof MessageChannel !== 'undefined',
            webRTC: typeof RTCPeerConnection !== 'undefined',
            mediaDevices: typeof navigator.mediaDevices !== 'undefined',
            gamepad: typeof navigator.getGamepads !== 'undefined',
           振动: typeof navigator.vibrate === 'function'
        };
    }

    testStorageAPIs() {
        return {
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            indexedDB: typeof indexedDB !== 'undefined',
            cacheAPI: typeof caches !== 'undefined',
            fileSystem: typeof FileSystemHandle !== 'undefined',
            webSQL: typeof openDatabase !== 'undefined'
        };
    }

    testWorkerAPIs() {
        return {
            webWorkers: typeof Worker !== 'undefined',
            sharedWorkers: typeof SharedWorker !== 'undefined',
            serviceWorkers: 'serviceWorker' in navigator,
            worklets: 'AudioWorklet' in window,
            paintWorklets: 'registerPaint' in CSS
        };
    }

    testSecurityAPIs() {
        return {
            crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
            secureContext: location.protocol === 'https:',
            credentialManager: typeof navigator.credentials !== 'undefined',
            webAuthn: typeof navigator.credentials !== 'undefined' && typeof navigator.credentials.create === 'function',
            permissions: typeof navigator.permissions !== 'undefined',
            reporting: typeof ReportingObserver !== 'undefined'
        };
    }

    testPerformanceAPIs() {
        return {
            performance: typeof performance !== 'undefined',
            performanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function',
            performanceMark: typeof performance !== 'undefined' && typeof performance.mark === 'function',
            performanceMeasure: typeof performance !== 'undefined' && typeof performance.measure === 'function',
            performanceObserver: typeof PerformanceObserver !== 'undefined',
            userTiming: typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function',
            memory: typeof performance !== 'undefined' && performance.memory !== 'undefined',
            navigation: typeof performance !== 'undefined' && performance.navigation !== 'undefined',
            timing: typeof performance !== 'undefined' && performance.timing !== 'undefined'
        };
    }

    testInternationalizationAPIs() {
        return {
            intl: typeof Intl !== 'undefined',
            dateTimeFormat: typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined',
            numberFormat: typeof Intl !== 'undefined' && typeof Intl.NumberFormat !== 'undefined',
            collator: typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined',
            pluralRules: typeof Intl !== 'undefined' && typeof Intl.PluralRules !== 'undefined',
            relativeTimeFormat: typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat !== 'undefined'
        };
    }

    auditPerformanceFeatures() {
        console.log('📊 审计性能功能...');

        const performanceTests = {
            basicPerformance: this.testBasicPerformance(),
            memoryInfo: this.testMemoryInfo(),
            frameRate: this.testFrameRate(),
            deviceCapabilities: this.testDeviceCapabilities(),
            networkPerformance: this.testNetworkPerformance()
        };

        this.auditResults.performance = performanceTests;
        console.log('✅ 性能功能审计完成');
    }

    testBasicPerformance() {
        if (typeof performance === 'undefined') return {};

        const timing = performance.timing;
        const navigation = performance.navigation;

        return {
            timing: {
                domContentLoaded: timing ? timing.domContentLoadedEventEnd - timing.navigationStart : null,
                loadComplete: timing ? timing.loadEventEnd - timing.navigationStart : null,
                domInteractive: timing ? timing.domInteractive - timing.navigationStart : null
            },
            navigation: navigation ? {
                type: navigation.type,
                redirectCount: navigation.redirectCount
            } : null,
            now: typeof performance.now === 'function'
        };
    }

    testMemoryInfo() {
        if (!performance || !performance.memory) {
            return { supported: false };
        }

        return {
            supported: true,
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
    }

    testFrameRate() {
        return new Promise((resolve) => {
            let frameCount = 0;
            let startTime = performance.now();
            let lastFrameTime = startTime;
            const testDuration = 1000; // 1 second

            function countFrames() {
                const currentTime = performance.now();
                frameCount++;
                lastFrameTime = currentTime;

                if (currentTime - startTime >= testDuration) {
                    const actualDuration = currentTime - startTime;
                    const fps = Math.round((frameCount / actualDuration) * 1000);

                    resolve({
                        fps: fps,
                        frameCount: frameCount,
                        duration: actualDuration,
                        averageFrameTime: actualDuration / frameCount
                    });
                } else {
                    requestAnimationFrame(countFrames);
                }
            }

            requestAnimationFrame(countFrames);
        });
    }

    testDeviceCapabilities() {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            deviceMemory: navigator.deviceMemory || 4,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            connection: this.getConnectionInfo(),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages || [navigator.language],
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    testNetworkPerformance() {
        const connection = this.getConnectionInfo();

        return {
            connection: connection,
            online: navigator.onLine,
            offlineDetection: 'ononline' in window && 'onoffline' in window,
            connectionMonitoring: connection !== null
        };
    }

    generateRecommendations() {
        console.log('💡 生成兼容性建议...');

        const recommendations = [];
        const polyfills = [];

        const browser = this.auditResults.browser;
        const features = this.auditResults.features;

        // Browser upgrade recommendations
        if (browser.compatibility === 'incompatible') {
            recommendations.push({
                priority: 'critical',
                category: 'browser',
                title: '浏览器版本过低',
                description: `当前 ${browser.name} ${browser.version} 版本过低，建议升级到最新版本`,
                action: '升级浏览器以获得完整功能支持'
            });
        }

        // Audio system recommendations
        if (!features.webAudioAPI) {
            polyfills.push({
                name: 'Web Audio API Polyfill',
                description: 'Web Audio API 不支持时的基础音频功能',
                url: 'https://github.com/mohayonao/web-audio-api-polyfill'
            });
        }

        // Canvas recommendations
        if (!features.webGL) {
            recommendations.push({
                priority: 'medium',
                category: 'graphics',
                title: 'WebGL 不支持',
                description: 'WebGL 不支持，3D 图形功能将不可用',
                action: '使用 Canvas 2D 降级方案'
            });
        }

        // CSS feature recommendations
        if (!features.cssGrid) {
            recommendations.push({
                priority: 'medium',
                category: 'css',
                title: 'CSS Grid 不支持',
                description: 'CSS Grid 不支持，某些高级布局将显示异常',
                action: '使用 Flexbox 或浮动布局作为降级方案'
            });
        }

        if (!features.cssVariables) {
            polyfills.push({
                name: 'CSS Variables Polyfill',
                description: '为不支持 CSS 变量的浏览器提供支持',
                url: 'https://github.com/postcss/postcss-custom-properties'
            });
        }

        // JavaScript feature recommendations
        if (!features.asyncAwait) {
            polyfills.push({
                name: 'Async/Await Polyfill',
                description: '为不支持 async/await 的浏览器提供支持',
                url: 'https://github.com/matthew-andrews/isomorphic-fetch'
            });
        }

        if (!features.promises) {
            polyfills.push({
                name: 'Promise Polyfill',
                description: '为不支持 Promise 的浏览器提供支持',
                url: 'https://github.com/stefanpenner/es6-promise'
            });
        }

        // Performance recommendations
        if (browser.isMobile || navigator.deviceMemory < 4) {
            recommendations.push({
                priority: 'high',
                category: 'performance',
                title: '检测到低端设备',
                description: '当前设备性能有限，建议优化资源加载和动画',
                action: '启用性能优化模式，减少动画复杂度'
            });
        }

        // Security recommendations
        if (!features.secureContext) {
            recommendations.push({
                priority: 'high',
                category: 'security',
                title: '非安全上下文',
                description: '应用运行在非 HTTPS 环境下，某些功能将受限',
                action: '部署到 HTTPS 服务器以获得完整功能支持'
            });
        }

        // PWA recommendations
        if (!features.serviceWorker) {
            recommendations.push({
                priority: 'medium',
                category: 'pwa',
                title: 'Service Worker 不支持',
                description: 'Service Worker 不支持，离线功能和推送通知将不可用',
                action: '应用仍可正常使用，但缺少 PWA 功能'
            });
        }

        this.auditResults.recommendations = recommendations;
        this.auditResults.polyfills = polyfills;
        console.log('✅ 建议生成完成');
    }

    outputAuditResults() {
        console.log('📋 === 跨浏览器兼容性审计报告 ===');
        console.log('浏览器信息:', this.auditResults.browser);
        console.log('功能支持:', this.auditResults.features);
        console.log('关键问题:', this.auditResults.criticalIssues);
        console.log('建议:', this.auditResults.recommendations);
        console.log('Polyfills:', this.auditResults.polyfills);

        // Store results globally for other modules to access
        window.crossBrowserAuditResults = this.auditResults;

        // Trigger completion event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('crossBrowserAuditComplete', {
                detail: this.auditResults
            }));
        }
    }

    // Public API methods
    getAuditResults() {
        return this.auditResults;
    }

    getCompatibilityMatrix() {
        return this.compatibilityMatrix;
    }

    generateCompatibilityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            browser: this.auditResults.browser,
            features: this.auditResults.features,
            recommendations: this.auditResults.recommendations,
            polyfills: this.auditResults.polyfills,
            criticalIssues: this.auditResults.criticalIssues,
            compatibilityScore: this.calculateCompatibilityScore()
        };

        return report;
    }

    calculateCompatibilityScore() {
        const features = this.auditResults.features;
        const totalFeatures = Object.keys(features).length;
        const supportedFeatures = Object.values(features).filter(Boolean).length;

        return Math.round((supportedFeatures / totalFeatures) * 100);
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.CrossBrowserCompatibilityAudit = CrossBrowserCompatibilityAudit;

    // Initialize audit when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.crossBrowserAudit = new CrossBrowserCompatibilityAudit();
        });
    } else {
        window.crossBrowserAudit = new CrossBrowserCompatibilityAudit();
    }
}

export default CrossBrowserCompatibilityAudit;