(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        reset();
      });
    });
    start();
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var search = document.querySelector("[data-filter-search]");
    var year = document.querySelector("[data-filter-year]");
    var limit = document.querySelector("[data-filter-limit]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    function apply() {
      var term = search ? search.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedLimit = limit ? limit.value : "all";
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        var matchTerm = !term || haystack.indexOf(term) !== -1;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var withinLimit = selectedLimit === "all" || shown < Number(selectedLimit);
        var visible = matchTerm && matchYear && withinLimit;
        card.classList.toggle("hidden", !visible);
        if (matchTerm && matchYear) {
          shown += 1;
        }
      });
    }

    [search, year, limit].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("visible", window.scrollY > 320);
    });
    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
