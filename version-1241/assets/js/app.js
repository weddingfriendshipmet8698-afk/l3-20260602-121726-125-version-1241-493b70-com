(function () {
    function query(selector, root) {
        return (root || document).querySelector(selector);
    }

    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = query('[data-mobile-toggle]');
        var panel = query('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = query('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = queryAll('[data-hero-slide]', hero);
        var dots = queryAll('[data-hero-dot]', hero);
        var prev = query('[data-hero-prev]', hero);
        var next = query('[data-hero-next]', hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initRails() {
        queryAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
                var rail = document.getElementById(id);
                if (!rail) {
                    return;
                }
                var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
                rail.scrollBy({ left: direction * 520, behavior: 'smooth' });
            });
        });
    }

    function initFilters() {
        var input = query('[data-filter-input]');
        var year = query('[data-year-filter]');
        var list = query('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = queryAll('[data-card]', list);
        var count = query('.filter-count');

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();
                var yearValue = card.getAttribute('data-year') || '';
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!selectedYear || yearValue === selectedYear);
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '显示 ' + visible + ' 部';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
    }

    function initPlayers() {
        queryAll('[data-player]').forEach(function (shell) {
            var video = query('video', shell);
            var playButton = query('[data-play-button]', shell);
            var message = query('[data-player-message]', shell);
            var src = shell.getAttribute('data-src');
            var hlsInstance = null;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add('is-visible');
            }

            function prepareVideo() {
                if (!video || video.dataset.ready === 'true') {
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                showMessage('网络错误，正在尝试重新加载视频。');
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                showMessage('媒体错误，正在尝试恢复播放。');
                                hlsInstance.recoverMediaError();
                            } else {
                                showMessage('播放出错，请稍后再试。');
                                hlsInstance.destroy();
                            }
                        }
                    });
                    video.dataset.ready = 'true';
                    return Promise.resolve();
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.dataset.ready = 'true';
                    return Promise.resolve();
                }

                showMessage('当前浏览器不支持 HLS 播放。');
                return Promise.reject(new Error('HLS is not supported'));
            }

            function togglePlay() {
                prepareVideo().then(function () {
                    video.controls = true;
                    if (video.paused) {
                        video.play().then(function () {
                            shell.classList.add('is-playing');
                        }).catch(function () {
                            showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                        });
                    } else {
                        video.pause();
                        shell.classList.remove('is-playing');
                    }
                }).catch(function () {});
            }

            if (playButton) {
                playButton.addEventListener('click', togglePlay);
            }
            if (video) {
                video.addEventListener('click', togglePlay);
                video.addEventListener('pause', function () {
                    shell.classList.remove('is-playing');
                });
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function cardHtml(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card" data-card data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
                '<a href="' + escapeHtml(movie.url) + '" class="card-poster">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="card-year">' + escapeHtml(movie.year) + '</span>' +
                    '<span class="card-play">▶</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="card-meta">' +
                        '<span>' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.type) + '</span>' +
                        '<span>' + escapeHtml(movie.genre) + '</span>' +
                    '</div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = query('[data-search-results]');
        var summary = query('[data-search-summary]');
        var input = query('[data-search-page-input]');
        var form = query('[data-search-page-form]');
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function render(keyword) {
            keyword = (keyword || '').trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = '';
                if (summary) {
                    summary.textContent = '请输入关键词开始搜索。';
                }
                return;
            }
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(cardHtml).join('');
            if (summary) {
                summary.textContent = '关键词“' + keyword + '”找到 ' + matched.length + ' 条结果。';
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var keyword = input ? input.value : '';
                var url = new URL(window.location.href);
                url.searchParams.set('q', keyword);
                window.history.replaceState({}, '', url.toString());
                render(keyword);
            });
        }

        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
        render(initial);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initRails();
        initFilters();
        initPlayers();
        initSearchPage();
    });
})();
