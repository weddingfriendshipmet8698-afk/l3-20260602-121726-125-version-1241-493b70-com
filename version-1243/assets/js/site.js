(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        resetTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterList = document.querySelector('[data-filter-list]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    if (!filterList) {
      return;
    }

    var query = normalize(filterInput && filterInput.value);
    var region = normalize(filterRegion && filterRegion.value);
    var type = normalize(filterType && filterType.value);
    var category = normalize(filterCategory && filterCategory.value);
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));

      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
      var matchType = !type || normalize(card.getAttribute('data-type')) === type;
      var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;

      card.classList.toggle('is-filter-hidden', !(matchQuery && matchRegion && matchType && matchCategory));
    });
  }

  [filterInput, filterRegion, filterType, filterCategory].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runFilter);
      control.addEventListener('change', runFilter);
    }
  });

  if (filterInput && window.location.search) {
    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');
    if (queryParam) {
      filterInput.value = queryParam;
      runFilter();
    }
  }
})();
