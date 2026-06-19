(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isHidden = mobilePanel.hasAttribute('hidden');
            if (isHidden) {
                mobilePanel.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
            } else {
                mobilePanel.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(current + 1);
        }, 5200);
    }

    var pageSearch = document.getElementById('pageSearch');
    var yearFilter = document.getElementById('yearFilter');
    var sortFilter = document.getElementById('sortFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResult = document.querySelector('.no-result');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(pageSearch && pageSearch.value);
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var title = normalize(card.getAttribute('data-title'));
            var region = normalize(card.getAttribute('data-region'));
            var genre = normalize(card.getAttribute('data-genre'));
            var tags = normalize(card.getAttribute('data-tags'));
            var cardYear = card.getAttribute('data-year') || '';
            var hitKeyword = !keyword || [title, region, genre, tags].join(' ').indexOf(keyword) !== -1;
            var hitYear = !year || (year === '2019' ? Number(cardYear) <= 2019 : cardYear === year);
            var show = hitKeyword && hitYear;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.style.display = visible ? 'none' : 'block';
        }
    }

    function applySort() {
        if (!cards.length || !sortFilter) {
            return;
        }
        var grid = cards[0].parentNode;
        var sorted = cards.slice();
        var value = sortFilter.value;

        sorted.sort(function (a, b) {
            if (value === 'new') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (value === 'old') {
                return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
            }
            if (value === 'title') {
                return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
            }
            return 0;
        });

        sorted.forEach(function (card) {
            grid.appendChild(card);
        });
        applyFilters();
    }

    if (pageSearch) {
        pageSearch.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', applySort);
    }
})();
