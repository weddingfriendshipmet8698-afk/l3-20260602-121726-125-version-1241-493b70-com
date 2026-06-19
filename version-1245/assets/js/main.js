(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupTopSearch() {
    var forms = document.querySelectorAll('[data-site-search]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = 'search.html';

        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-local-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeChip = '';

    if (!input || cards.length === 0) {
      return;
    }

    if (input.hasAttribute('data-query-param')) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get(input.getAttribute('data-query-param'));

      if (query) {
        input.value = query;
      }
    }

    function apply() {
      var query = normalize(input.value);
      var chip = normalize(activeChip);

      cards.forEach(function (card) {
        var index = normalize(card.getAttribute('data-index'));
        var queryMatch = !query || index.indexOf(query) !== -1;
        var chipMatch = !chip || index.indexOf(chip) !== -1;
        card.classList.toggle('is-hidden-card', !(queryMatch && chipMatch));
      });
    }

    input.addEventListener('input', apply);

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-filter-chip') || '';

        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });

        apply();
      });
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupTopSearch();
    setupHero();
    setupLocalFilter();
  });
})();
