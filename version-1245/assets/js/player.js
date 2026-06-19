(function () {
  function loadSource(player, callback) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-hls');

    if (!video || !source) {
      return;
    }

    if (player.getAttribute('data-ready') === '1') {
      callback();
      return;
    }

    player.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      callback();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      player._hls = hls;
      hls.on(window.Hls.Events.MANIFEST_PARSED, callback);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
      return;
    }

    video.src = source;
    callback();
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    function play() {
      loadSource(player, function () {
        cover.classList.add('is-hidden');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            cover.classList.remove('is-hidden');
          });
        }
      });
    }

    cover.addEventListener('click', play);

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
      cover.classList.remove('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.movie-player').forEach(setupPlayer);
  });
})();
