(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        var keyword = normalize(inputs.map(function (input) { return input.value; }).filter(Boolean).pop() || '');
        var selected = normalize(selects.map(function (select) { return select.value; }).filter(Boolean).pop() || '');
        items.forEach(function (item) {
            var text = normalize(item.getAttribute('data-search-text'));
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okSelected = !selected || text.indexOf(selected) !== -1;
            item.classList.toggle('hidden', !(okKeyword && okSelected));
        });
    }

    inputs.forEach(function (input) {
        input.addEventListener('input', function () {
            inputs.forEach(function (other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            applyFilter();
        });
    });

    selects.forEach(function (select) {
        select.addEventListener('change', applyFilter);
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }
})();
