(() => {
  const overlay = document.querySelector("[data-search-overlay]");
  if (!overlay) return;

  const openTriggers = document.querySelectorAll("[data-search-open]");
  const closeTriggers = overlay.querySelectorAll("[data-search-close]");
  const input = overlay.querySelector("[data-search-input]");
  const resultsList = overlay.querySelector("[data-search-results]");
  const emptyState = overlay.querySelector("[data-search-empty]");

  let posts = [];
  let isLoading = false;
  let hasLoaded = false;
  let lastFocused = null;

  const isOverlayVisible = () => !overlay.classList.contains("hidden");

  const showMessage = (message) => {
    if (!emptyState) return;
    emptyState.textContent = message;
    emptyState.hidden = false;
  };

  const hideMessage = () => {
    if (!emptyState) return;
    emptyState.hidden = true;
  };

  const escapeHTML = (value = "") =>
    value.replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[char] ?? char;
    });

  const buildPostUrl = (id) => `index.html?post=${encodeURIComponent(id)}`;

  const toTimestamp = (value) => {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const renderResults = (query) => {
    if (!resultsList) return;

    if (!query) {
      resultsList.innerHTML = "";
      if (isLoading) {
        showMessage("글 목록을 불러오는 중...");
      } else {
        showMessage("검색어를 입력해 주세요.");
      }
      return;
    }

    if (!hasLoaded) {
      resultsList.innerHTML = "";
      if (isLoading) {
        showMessage("글 목록을 불러오는 중...");
      } else {
        showMessage("목록을 준비하는 중입니다.");
      }
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const matches = posts
      .filter((post) => {
        const haystack = `${post.title ?? ""} ${post.summary ?? ""} ${
          post.date ?? ""
        }`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));

    if (!matches.length) {
      resultsList.innerHTML = "";
      showMessage("일치하는 결과가 없습니다.");
      return;
    }

    const markup = matches
      .map((post) => {
        const title = escapeHTML(post.title ?? "제목 없음");
        const date = escapeHTML(post.date ?? "");
        const summary = post.summary
          ? `<p class="search-result-summary">${escapeHTML(post.summary)}</p>`
          : "";

        return `
          <a class="search-result-item" data-search-result-link role="option" href="${buildPostUrl(
            post.id
          )}">
            <p class="search-result-title">${title}</p>
            <p class="search-result-date">${date}</p>
            ${summary}
          </a>
        `;
      })
      .join("");

    hideMessage();
    resultsList.innerHTML = markup;
  };

  const loadPosts = async () => {
    if (isLoading || hasLoaded) return;

    isLoading = true;
    showMessage("글 목록을 불러오는 중...");

    try {
      const response = await fetch("manifest.json");
      if (!response.ok) throw new Error("글 목록을 불러오지 못했습니다.");

      const data = await response.json();
      posts = Array.isArray(data) ? data : [];
      hasLoaded = true;

      if (!posts.length) {
        showMessage("아직 발행된 글이 없습니다.");
      } else {
        renderResults(input?.value.trim() ?? "");
      }
    } catch (error) {
      console.error(error);
      hasLoaded = false;
      showMessage(`⚠️ ${error.message}`);
    } finally {
      isLoading = false;
    }
  };

  const openOverlay = () => {
    if (isOverlayVisible()) return;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    lastFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    requestAnimationFrame(() => input?.focus());
    if (!hasLoaded && !isLoading) {
      loadPosts();
    } else {
      renderResults(input?.value.trim() ?? "");
    }
  };

  const closeOverlay = () => {
    if (!isOverlayVisible()) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  const onInput = (event) => {
    const query = event.target.value.trim();
    if (!hasLoaded && !isLoading) {
      loadPosts();
    }
    renderResults(query);
  };

  const isTextInput = (element) => {
    if (!(element instanceof HTMLElement)) return false;
    const tagName = element.tagName;
    return (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      element.isContentEditable
    );
  };

  openTriggers.forEach((trigger) =>
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openOverlay();
    })
  );

  closeTriggers.forEach((trigger) =>
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeOverlay();
    })
  );

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOverlay();
    }
  });

  resultsList?.addEventListener("click", (event) => {
    const link = event.target.closest("[data-search-result-link]");
    if (!link) return;
    closeOverlay();
  });

  input?.addEventListener("input", onInput);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOverlayVisible()) {
      event.preventDefault();
      closeOverlay();
      return;
    }

    const activeElement = document.activeElement;
    const isCmdK =
      (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    const isSlash = event.key === "/";

    if (isCmdK) {
      event.preventDefault();
      if (isOverlayVisible()) {
        closeOverlay();
      } else {
        openOverlay();
      }
      return;
    }

    if (
      isSlash &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isOverlayVisible()
    ) {
      if (isTextInput(activeElement)) return;
      event.preventDefault();
      openOverlay();
    }
  });

  showMessage("검색어를 입력해 주세요.");
})();
