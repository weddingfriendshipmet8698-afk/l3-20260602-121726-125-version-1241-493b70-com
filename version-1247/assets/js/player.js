import { H as Hls } from './hls.js';

export function mountPlayer(elementId, streamUrl) {
    var root = document.getElementById(elementId);
    if (!root) {
        return;
    }

    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var button = root.querySelector('.play-button');
    var started = false;
    var hls = null;

    function begin() {
        if (!video || started) {
            return;
        }
        started = true;

        if (cover) {
            cover.setAttribute('hidden', '');
        }

        video.controls = true;
        video.playsInline = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                video.controls = true;
            });
        }
    }

    if (button) {
        button.addEventListener('click', begin);
    }
    if (cover) {
        cover.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
        if (!started) {
            begin();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
