import { H as Hls } from './hls.js';

var video = document.querySelector('.video-player');
var playButton = document.querySelector('[data-play-button]');
var hlsInstance = null;

function getStream() {
  if (!video) {
    return '';
  }

  return video.getAttribute('data-m3u8') || '';
}

function attachStream() {
  var stream = getStream();

  if (!video || !stream) {
    return Promise.resolve();
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    if (video.src !== stream) {
      video.src = stream;
    }
    return video.play();
  }

  if (Hls && Hls.isSupported()) {
    if (!hlsInstance) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    }
    return video.play();
  }

  video.src = stream;
  return video.play();
}

function startPlayback() {
  attachStream().then(function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  }).catch(function () {
    if (playButton) {
      playButton.classList.remove('is-hidden');
    }
  });
}

if (playButton) {
  playButton.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });
}
