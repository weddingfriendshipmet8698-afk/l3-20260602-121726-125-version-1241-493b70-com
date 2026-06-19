import { H as Hls } from './hls.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var started = false;

    function begin() {
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-src');
        if (!src) {
            return;
        }
        if (!started) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            started = true;
        }
        shell.classList.add('playing');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', begin);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!started) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
    }
});
