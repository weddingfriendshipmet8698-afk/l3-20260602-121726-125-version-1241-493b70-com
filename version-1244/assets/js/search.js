(function () {
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var state = document.querySelector("[data-search-state]");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var movies = window.SEARCH_MOVIES || [];

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function card(movie) {
    return [
      "<article class=\"movie-card\">",
      "<a class=\"card-media poster-frame\" href=\"" + escapeHtml(movie.url) + "\">",
      "<img class=\"poster-img\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.remove()\">",
      "<span class=\"card-year\">" + escapeHtml(movie.year) + "</span>",
      "<span class=\"play-mark\">▶</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<a class=\"card-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>",
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function render(value) {
    var term = String(value || "").trim().toLowerCase();
    if (input) {
      input.value = value || "";
    }
    if (!term) {
      state.textContent = "请输入关键词开始搜索";
      results.innerHTML = "";
      return;
    }
    var matched = movies.filter(function (movie) {
      return movie.search.indexOf(term) !== -1;
    }).slice(0, 120);
    state.textContent = matched.length ? "搜索结果" : "未找到相关影片";
    results.innerHTML = matched.map(card).join("");
  }

  if (input) {
    input.addEventListener("input", function () {
      render(input.value);
    });
  }
  render(query);
})();
