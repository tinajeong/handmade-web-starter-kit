const grid = document.getElementById("posts-grid");

const fetchPosts = async () => {
  const response = await fetch("manifest.json");
  if (!response.ok) throw new Error("글 목록을 불러오지 못했습니다.");
  return response.json();
};

const buildPostUrl = (id) => `index.html?post=${id}`;

const renderPosts = async () => {
  if (!grid) return;

  try {
    const posts = await fetchPosts();
    if (!posts.length) {
      grid.innerHTML = `<p class="muted">작성된 글이 없습니다.</p>`;
      return;
    }

    const cards = posts
      .slice()
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .map(
        (post) => `
        <article class="post-card">
          <p class="post-card__date">${post.date}</p>
          <h3 class="post-card__title">${post.title}</h3>
          <p class="post-card__summary">${post.summary}</p>
          <div class="post-card__actions">
            <button
              class="heart-button heart-button--small"
              data-heart-button
              data-post-id="${post.id}"
              aria-pressed="false">
              <span class="heart-button__icon" aria-hidden="true">♥</span>
              <span class="heart-button__label" data-heart-label>좋아요</span>
            </button>
            <a class="post-card__link" href="${buildPostUrl(post.id)}">바로 읽기</a>
          </div>
        </article>
      `
      )
      .join("");

    grid.innerHTML = cards;
    wireHeartButtons();
  } catch (error) {
    grid.innerHTML = `<p class="muted">⚠️ ${error.message}</p>`;
  }
};

const wireHeartButtons = () => {
  if (!window.PostHearts) return;
  grid
    .querySelectorAll("[data-heart-button]")
    .forEach((button) => window.PostHearts.bindButton(button));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderPosts);
} else {
  renderPosts();
}
