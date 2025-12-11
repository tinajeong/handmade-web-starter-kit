<<<<<<< HEAD
import { HEADER_CONTENT } from './site-config.js';

const renderHero = () => {
  const eyebrow = document.querySelector('[data-hero-eyebrow]');
  const title = document.querySelector('[data-hero-title]');
  const lede = document.querySelector('[data-hero-lede]');

  if (eyebrow) eyebrow.textContent = HEADER_CONTENT.eyebrow;
  if (title) title.textContent = HEADER_CONTENT.title;
  if (lede) lede.textContent = HEADER_CONTENT.lede;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderHero);
} else {
  renderHero();
}
=======
const HERO_CONFIGS = {
  default: {
    eyebrow: "Tech Blog",
    title: "Dev Log",
    lede: "Marked와 Highlight.js로 구현한 심플한 블로그입니다.",
    href: "/",
    context: null,
  },
  summary: {
    eyebrow: "Tech Blog",
    title: "Dev Log",
    lede: "Marked와 Highlight.js로 구현한 심플한 블로그입니다.",
    href: "/",
    context: "Daily Digest · 날짜별 요약 페이지",
  },
};

const renderHero = () => {
  document
    .querySelectorAll('[data-component="site-hero"]')
    .forEach((placeholder) => {
      const configKey = placeholder.dataset.config || "default";
      const config = HERO_CONFIGS[configKey] || HERO_CONFIGS.default;

      const wrapper = document.createElement("div");
      wrapper.className = "site-hero";
      wrapper.innerHTML = `
      <p class="eyebrow">${config.eyebrow}</p>
      <h1 class="site-title"><a href="${config.href}">${config.title}</a></h1>
      ${config.context ? `<p class="hero-context">${config.context}</p>` : ""}
    `;

      placeholder.replaceWith(wrapper);
    });
};

document.addEventListener("DOMContentLoaded", renderHero);
>>>>>>> 547ea76 (feat : 하이라이트 기능 추가)
