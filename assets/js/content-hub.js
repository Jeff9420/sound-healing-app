document.addEventListener("DOMContentLoaded", function() {
    const videoButtons = document.querySelectorAll("[data-track='content-video'][data-video]");

    videoButtons.forEach(function(btn) {
        btn.addEventListener("click", function() {
            const videoSrc = btn.getAttribute("data-video");
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "content_video_open",
                video: videoSrc,
                cta_source: btn.dataset.cta || "content_hub"
            });

            if (typeof gtag === "function") {
                gtag("event", "content_video_open", {
                    video: videoSrc,
                    cta_source: btn.dataset.cta || "content_hub"
                });
            }

            const overlay = document.createElement("div");
            overlay.className = "content-video-overlay";
            overlay.innerHTML = "<div class='content-video-dialog'>" +
                "<button class='content-video-close' aria-label='关闭视频'>&times;</button>" +
                "<video controls autoplay playsinline>" +
                "<source src='" + videoSrc + "' type='video/mp4'>" +
                "</video></div>";

            document.body.appendChild(overlay);
            overlay.querySelector('.content-video-close').addEventListener('click', function() {
                overlay.remove();
            });
        });
    });
});

