(function () {
    const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];
    const VIDEO_THRESHOLDS = [25, 50, 75, 95];

    function pushEvent(name, detail) {
        const payload = Object.assign(
            {
                event: name,
                path: window.location.pathname
            },
            detail || {}
        );

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);

        if (typeof window.gtag === "function") {
            const { event, ...gtagPayload } = payload;
            window.gtag("event", name, gtagPayload);
        }
    }

    function throttle(fn, wait) {
        let last = 0;
        return function throttled() {
            const now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

    function setupScrollDepth() {
        if (window.__scrollDepthTrackingActive) return;
        window.__scrollDepthTrackingActive = true;

        const fired = new Set();

        const calculate = () => {
            const doc = document.documentElement;
            const body = document.body;
            const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
            const viewport = window.innerHeight || doc.clientHeight;
            const height = Math.max(doc.scrollHeight, body.scrollHeight) || 1;
            const progress = Math.min(100, Math.round(((scrollTop + viewport) / height) * 100));

            SCROLL_THRESHOLDS.forEach((threshold) => {
                if (!fired.has(threshold) && progress >= threshold) {
                    fired.add(threshold);
                    pushEvent("scroll_depth", { percentage: threshold });
                }
            });

            if (fired.size === SCROLL_THRESHOLDS.length) {
                window.removeEventListener("scroll", onScroll);
            }
        };

        const onScroll = throttle(calculate, 200);
        window.addEventListener("scroll", onScroll, { passive: true });
        calculate();
    }

    function setupVideoTracking() {
        const videos = document.querySelectorAll("video");
        if (!videos.length) return;

        const progressState = new WeakMap();

        videos.forEach((video, index) => {
            const id = video.id || video.dataset.videoId || `video-${index + 1}`;
            const title =
                video.dataset.title ||
                video.getAttribute("aria-label") ||
                video.getAttribute("title") ||
                document.title;

            progressState.set(video, new Set());

            const eventContext = () => ({
                video_id: id,
                video_title: title,
                duration: Math.round(video.duration || 0),
                current_time: Math.round(video.currentTime || 0)
            });

            video.addEventListener("play", () => {
                pushEvent("video_play", eventContext());
            });

            video.addEventListener("pause", () => {
                pushEvent("video_pause", eventContext());
            });

            video.addEventListener("ended", () => {
                const cache = progressState.get(video);
                cache.add(100);
                pushEvent("video_complete", eventContext());
            });

            video.addEventListener(
                "timeupdate",
                throttle(() => {
                    const duration = video.duration;
                    if (!duration || !isFinite(duration)) return;

                    const percent = (video.currentTime / duration) * 100;
                    const cache = progressState.get(video);

                    VIDEO_THRESHOLDS.forEach((threshold) => {
                        if (percent >= threshold && !cache.has(threshold)) {
                            cache.add(threshold);
                            pushEvent("video_progress", Object.assign({ percentage: threshold }, eventContext()));
                        }
                    });
                }, 500)
            );
        });
    }

    function init() {
        setupScrollDepth();
        setupVideoTracking();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

