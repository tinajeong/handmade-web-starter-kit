const selectors = {
  listContainer: document.getElementById('post-list'),
  viewer: document.getElementById('post-viewer'),
  loadingMessage: '<li class="muted">로딩 중...</li>',
  searchInput: document.getElementById('post-search'),
  searchClear: document.querySelector('[data-search-clear]'),
};

const state = {
  posts: [],
  filteredPosts: [],
  activeId: null,
  postCache: new Map(),
  activeFetch: null,
  searchIndex: new Map(),
  searchQuery: '',
};

const init = async () => {
  if (!selectors.listContainer || !selectors.viewer) return;

  selectors.viewer.setAttribute('tabindex', '-1');
  selectors.viewer.setAttribute('aria-live', 'polite');
  renderLoadingList();

  selectors.listContainer.addEventListener('click', handleListClick);
  selectors.listContainer.addEventListener('keydown', handleListKeydown);
  window.addEventListener('hashchange', handleHashChange);
  selectors.searchInput?.addEventListener('input', handleSearchInput);
  selectors.searchInput?.addEventListener('search', handleSearchInput);
  selectors.searchClear?.addEventListener('click', clearSearch);

  try {
    state.posts = await fetchManifest();
    state.filteredPosts = state.posts;
    renderList(state.filteredPosts);

    const initialId = getPostIdFromHash() ?? state.posts[0]?.id;
    if (initialId) {
      selectPost(initialId);
    }
  } catch (error) {
    console.error(error);
    selectors.listContainer.innerHTML = '<li class="muted">글 목록을 불러올 수 없습니다.</li>';
  }
};

const fetchManifest = async () => {
  const response = await fetch('manifest.json');
  if (!response.ok) throw new Error('목록을 불러오지 못했습니다.');
  return response.json();
};

const renderLoadingList = () => {
  selectors.listContainer.innerHTML = selectors.loadingMessage;
};

const renderList = (posts) => {
  if (!posts.length) {
    selectors.listContainer.innerHTML = '<li class="muted">검색 결과가 없습니다.</li>';
    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const item = document.createElement('li');
    item.className = 'post-list__item';
    item.dataset.postId = post.id;
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `${post.title} — ${post.date}`);

    const date = document.createElement('span');
    date.className = 'post-list__date';
    date.textContent = post.date;

    const titleLink = document.createElement('a');
    titleLink.className = 'post-list__title';
    titleLink.href = `#post-${post.id}`;
    titleLink.textContent = post.title;

    const summary = document.createElement('p');
    summary.className = 'post-list__summary';
    summary.textContent = post.summary;

    item.append(date, titleLink, summary);
    fragment.appendChild(item);
  });

  selectors.listContainer.replaceChildren(fragment);
};

const debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const handleListClick = (event) => {
  const listItem = event.target.closest('li[data-post-id]');
  if (!listItem || !selectors.listContainer.contains(listItem)) return;

  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  event.preventDefault();
  selectPost(Number(listItem.dataset.postId));
};

const handleListKeydown = (event) => {
  if (!['Enter', ' '].includes(event.key)) return;

  const listItem = event.target.closest('li[data-post-id]');
  if (!listItem) return;

  event.preventDefault();
  selectPost(Number(listItem.dataset.postId));
};

const handleHashChange = () => {
  const postId = getPostIdFromHash();
  if (postId) {
    selectPost(postId, { updateHash: false });
  }
};

const handleSearchInput = (event) => {
  state.searchQuery = event.target.value.trim();
  debouncedApplySearch();
};

const clearSearch = () => {
  if (!selectors.searchInput) return;
  selectors.searchInput.value = '';
  state.searchQuery = '';
  applySearch();
  selectors.searchInput.focus();
};

const debouncedApplySearch = debounce(() => {
  applySearch().catch((error) => console.error(error));
}, 150);

const applySearch = async () => {
  const query = state.searchQuery.toLowerCase();

  if (!query) {
    state.filteredPosts = state.posts;
    renderList(state.filteredPosts);
    if (state.activeId) updateActiveItem(state.activeId);
    if (!state.activeId && state.filteredPosts[0]) {
      selectPost(state.filteredPosts[0].id);
    }
    return;
  }

  await buildSearchIndex();

  state.filteredPosts = state.posts.filter((post) => {
    const record = state.searchIndex.get(post.id);
    if (!record) return false;

    return record.title.includes(query) || record.content.includes(query);
  });

  renderList(state.filteredPosts);

  if (!state.filteredPosts.length) {
    state.activeId = null;
    selectors.viewer.innerHTML = '<div class="placeholder-msg">🔍 검색 결과가 없습니다.</div>';
    return;
  }

  if (!state.filteredPosts.some(({ id }) => id === state.activeId)) {
    selectPost(state.filteredPosts[0].id);
  } else if (state.activeId) {
    updateActiveItem(state.activeId);
  }
};

const buildSearchIndex = async () => {
  const pendingPosts = state.posts.filter((post) => !state.searchIndex.has(post.id));
  if (!pendingPosts.length) return;

  const normalizeText = (text) => text
    .toLowerCase()
    .replace(/[`*_#>\[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const entries = await Promise.all(
    pendingPosts.map(async (post) => {
      const markdownText = await getPostContent(post);
      return {
        id: post.id,
        title: normalizeText(post.title),
        content: normalizeText(markdownText),
      };
    }),
  );

  entries.forEach(({ id, title, content }) => {
    state.searchIndex.set(id, { title, content });
  });
};

const selectPost = (postId, options = {}) => {
  const { updateHash = true } = options;
  if (state.activeId === postId) return;

  const post = state.posts.find(({ id }) => id === postId);
  if (!post) return;

  updateActiveItem(postId);
  if (updateHash) syncHash(postId);
  loadPost(post);
};

const updateActiveItem = (postId) => {
  state.activeId = postId;

  selectors.listContainer.querySelectorAll('li[data-post-id]').forEach((item) => {
    const isActive = Number(item.dataset.postId) === postId;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'true' : 'false');

    const titleLink = item.querySelector('.post-list__title');
    if (titleLink) {
      titleLink.setAttribute('aria-current', isActive ? 'true' : 'false');
    }
  });
};

const loadPost = async (post) => {
  if (state.activeFetch) {
    state.activeFetch.abort();
  }

  const controller = new AbortController();
  state.activeFetch = controller;
  selectors.viewer.classList.add('is-loading');

  try {
    const markdownText = await getPostContent(post, controller.signal);
    if (controller.signal.aborted) return;

    renderMarkdown(post, markdownText);

    if (window.innerWidth < 768) {
      selectors.viewer.scrollIntoView({ behavior: 'smooth' });
    }

    selectors.viewer.focus({ preventScroll: true });
  } catch (error) {
    if (error.name === 'AbortError') return;
    selectors.viewer.innerHTML = `<div class="placeholder-msg">⚠️ ${error.message}</div>`;
  } finally {
    selectors.viewer.classList.remove('is-loading');
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
  if (!response.ok) throw new Error('글 내용을 불러오지 못했습니다.');

  const markdownText = await response.text();
  state.postCache.set(post.file, markdownText);
  return markdownText;
};

const renderMarkdown = (post, markdownText) => {
  const htmlContent = marked.parse(markdownText);

  selectors.viewer.innerHTML = `
    <header class="post-header">
      <p class="eyebrow">${post.date}</p>
      <h1 class="post-title">${post.title}</h1>
    </header>
    <div class="post-body">${htmlContent}</div>
  `;

  selectors.viewer.querySelectorAll('pre code').forEach(hljs.highlightElement);
};

const syncHash = (postId) => {
  const targetHash = `#post-${postId}`;
  if (window.location.hash !== targetHash) {
    history.replaceState(null, '', targetHash);
  }
};

const getPostIdFromHash = () => {
  const hash = window.location.hash;
  if (!hash.startsWith('#post-')) return null;

  const postId = Number(hash.replace('#post-', ''));
  return Number.isFinite(postId) ? postId : null;
};

document.addEventListener('DOMContentLoaded', init);
