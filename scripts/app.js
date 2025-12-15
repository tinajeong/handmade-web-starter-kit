const selectors = {
  viewer: document.getElementById("post-viewer"),
  nav: document.getElementById("post-nav"),
};

const state = {
  posts: [],
  activeId: null,
  postCache: new Map(),
  activeFetch: null,
};

const init = async () => {
  if (!selectors.viewer) return;

  selectors.viewer.setAttribute("tabindex", "-1");
  selectors.viewer.setAttribute("aria-live", "polite");

  selectors.viewer.innerHTML = `
    <div class="placeholder-msg">
      <h2>글을 불러오는 중...</h2>
      <p class="muted">잠시만 기다려 주세요.</p>
    </div>
  `;

  selectors.nav?.addEventListener("click", handleNavClick);
  window.addEventListener("popstate", handleLocationChange);

  try {
    state.posts = await fetchManifest();
    if (!state.posts.length) {
      selectors.viewer.innerHTML = `<div class="placeholder-msg">작성된 글이 없습니다.</div>`;
      return;
    }

    const initialId = getInitialPostId() ?? state.posts[0].id;
    selectPost(initialId, { updateLocation: false });
  } catch (error) {
    selectors.viewer.innerHTML = `<div class="placeholder-msg">⚠️ ${error.message}</div>`;
  }
};

const fetchManifest = async () => {
  const response = await fetch("manifest.json");
  if (!response.ok) throw new Error("글 목록을 불러오지 못했습니다.");
  return response.json();
};

const getPostIdFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("post");
  return value ? Number(value) : null;
};

const getPostIdFromHash = () => {
  const hash = window.location.hash;
  if (!hash.startsWith("#post-")) return null;
  const id = Number(hash.replace("#post-", ""));
  return Number.isNaN(id) ? null : id;
};

const getInitialPostId = () => getPostIdFromQuery() ?? getPostIdFromHash();

const selectPost = (postId, options = {}) => {
  const { updateLocation = true } = options;
  const numericId = Number(postId);
  if (state.activeId === numericId) return;

  const post = state.posts.find(({ id }) => id === numericId);
  if (!post) return;

  state.activeId = numericId;
  if (updateLocation) syncLocation(numericId);
  loadPost(post);
  updatePostNav(post);
};

const handleLocationChange = () => {
  const postId = getInitialPostId();
  if (postId) selectPost(postId, { updateLocation: false });
};

const loadPost = async (post) => {
  if (state.activeFetch) state.activeFetch.abort();

  const controller = new AbortController();
  state.activeFetch = controller;
  selectors.viewer.classList.add("is-loading");

  try {
    const markdownText = await getPostContent(post, controller.signal);
    if (controller.signal.aborted) return;

    renderMarkdown(post, markdownText);
    selectors.viewer.focus({ preventScroll: true });
  } catch (error) {
    if (error.name === "AbortError") return;
    selectors.viewer.innerHTML = `<div class="placeholder-msg">⚠️ ${error.message}</div>`;
  } finally {
    selectors.viewer.classList.remove("is-loading");
    if (state.activeFetch === controller) {
      state.activeFetch = null;
    }
  }
};

const getPostContent = async (post, signal) => {
  if (state.postCache.has(post.file)) {
    return state.postCache.get(post.file);
  }

  const response = await fetch(post.file, { signal });
  if (!response.ok) throw new Error("글 내용을 불러오지 못했습니다.");

  const markdownText = await response.text();
  state.postCache.set(post.file, markdownText);
  return markdownText;
};

const renderMarkdown = (post, markdownText) => {
  const htmlContent = marked.parse(markdownText);

  selectors.viewer.innerHTML = `
    <header class="post-header post-header--full">
      <div class="post-title-group">
        <p class="eyebrow">${post.date}</p>
        <h1 class="post-title">${post.title}</h1>
      </div>
    </header>
    <div class="post-body">${htmlContent}</div>
  `;

  selectors.viewer.querySelectorAll("pre code").forEach(hljs.highlightElement);
};

const syncLocation = (postId) => {
  const url = new URL(window.location.href);
  url.searchParams.set("post", postId);
  url.hash = `post-${postId}`;
  history.replaceState(null, "", url);
};

const updatePostNav = (currentPost) => {
  if (!selectors.nav) return;

  const index = state.posts.findIndex(({ id }) => id === currentPost.id);
  const prev = state.posts[index - 1] ?? null;
  const next = state.posts[index + 1] ?? null;

  updateNavLink("prev", prev);
  updateNavLink("next", next);
};

const updateNavLink = (direction, post) => {
  if (!selectors.nav) return;
  const link = selectors.nav.querySelector(`[data-direction="${direction}"]`);
  if (!link) return;

  const titleEl = link.querySelector(".post-nav__title");
  const isPrev = direction === "prev";

  link.querySelector(".post-nav__eyebrow").textContent = isPrev
    ? "이전 글"
    : "다음 글";

  if (!post) {
    link.setAttribute("aria-disabled", "true");
    link.removeAttribute("href");
    link.dataset.postId = "";
    if (titleEl)
      titleEl.textContent = isPrev ? "첫 번째 글입니다" : "마지막 글입니다";
    return;
  }

  link.setAttribute("aria-disabled", "false");
  link.href = buildPostUrl(post.id);
  link.dataset.postId = post.id;
  if (titleEl) titleEl.textContent = post.title;
};

const handleNavClick = (event) => {
  const link = event.target.closest("[data-direction]");
  if (!link || link.getAttribute("aria-disabled") === "true") return;

  const targetId = Number(link.dataset.postId);
  if (!targetId) return;

  event.preventDefault();
  selectPost(targetId);
};

const buildPostUrl = (postId) => `?post=${postId}`;

init();
