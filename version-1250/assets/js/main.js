(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupCardFilter() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector('[data-card-filter]');
    var sort = panel.querySelector('[data-card-sort]');
    var cards = selectAll('[data-movie-card]', list);

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var visible = keyword === '' || cardText(card).indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !visible);
      });
    }

    function applySort() {
      var value = sort ? sort.value : 'default';
      var sorted = cards.slice();
      if (value === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        });
      } else if (value === 'year') {
        sorted.sort(function (a, b) {
          return Number((b.getAttribute('data-year') || '').replace(/\D/g, '')) - Number((a.getAttribute('data-year') || '').replace(/\D/g, ''));
        });
      } else if (value === 'title') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-play]');
    var toggle = player.querySelector('[data-player-toggle]');
    var mute = player.querySelector('[data-player-mute]');
    var full = player.querySelector('[data-player-fullscreen]');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var ready = false;
    var requested = false;

    function attach() {
      if (ready || !video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            video.play().catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      }
      ready = true;
    }

    function play() {
      requested = true;
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        video.play().catch(function () {});
      }
    }

    function pause() {
      if (video) {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (!video || video.paused) {
          play();
        } else {
          pause();
        }
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          pause();
        }
      });
      video.addEventListener('play', function () {
        if (toggle) {
          toggle.textContent = '暂停';
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (toggle) {
          toggle.textContent = '播放';
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    if (mute) {
      mute.addEventListener('click', function () {
        if (!video) {
          return;
        }
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (full) {
      full.addEventListener('click', function () {
        var target = player.querySelector('.player-inner') || video;
        if (!target) {
          return;
        }
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (target.requestFullscreen) {
          target.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function createResultCard(item) {
    return [
      '<a class="movie-card" href="./' + item.url + '" data-movie-card>',
      '<div class="poster-wrap">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.category) + '</span>',
      '<span class="poster-year">' + escapeHtml(item.year) + '</span>',
      '<span class="poster-play">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h2>' + escapeHtml(item.title) + '</h2>',
      '<p>' + escapeHtml(item.description) + '</p>',
      '<div class="movie-meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><strong>' + escapeHtml(item.rating) + '</strong></div>',
      '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || typeof SearchItems === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = page.querySelector('[data-search-input]');
    var title = page.querySelector('[data-search-title]');
    var subtitle = page.querySelector('[data-search-subtitle]');
    var results = page.querySelector('[data-search-results]');
    if (input) {
      input.value = query;
    }
    if (!results) {
      return;
    }
    if (!query) {
      results.innerHTML = '';
      if (title) {
        title.textContent = '热门搜索';
      }
      if (subtitle) {
        subtitle.textContent = '可使用上方搜索框查找影片。';
      }
      return;
    }
    var normalized = query.toLowerCase();
    var matched = SearchItems.filter(function (item) {
      var text = [
        item.title,
        item.description,
        item.category,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags.join(' ')
      ].join(' ').toLowerCase();
      return text.indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = '“' + query + '”的搜索结果';
    }
    if (subtitle) {
      subtitle.textContent = matched.length ? '已匹配到相关影片。' : '没有找到相关影片，换个关键词试试。';
    }
    results.innerHTML = matched.map(createResultCard).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupCardFilter();
    setupPlayer();
    setupSearchPage();
  });
})();
