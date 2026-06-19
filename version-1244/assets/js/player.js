import { H as Hls } from "../vendor/hls.esm.js";

(function () {
  function attachPlayer(container) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-player-toggle]");
    var src = container.getAttribute("data-video-src");
    if (!video || !src) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    function play() {
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          container.classList.add("is-playing");
        }).catch(function () {
          container.classList.remove("is-playing");
        });
      } else {
        container.classList.add("is-playing");
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
        container.classList.remove("is-playing");
      }
    }

    video.controls = true;
    video.addEventListener("play", function () {
      container.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      container.classList.remove("is-playing");
    });
    video.addEventListener("click", toggle);
    if (button) {
      button.addEventListener("click", play);
    }
  }

  document.querySelectorAll("[data-player]").forEach(attachPlayer);
})();
