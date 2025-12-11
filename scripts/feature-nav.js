<<<<<<< HEAD
import { HEADER_CONTENT } from './site-config.js';

const renderNav = () => {
  const navList = document.querySelector('[data-feature-nav]');
  if (!navList) return;

  const fragment = document.createDocumentFragment();

  HEADER_CONTENT.navLinks.forEach((link) => {
    const item = document.createElement('li');
    item.className = 'feature-nav__item';

    const anchor = document.createElement('a');
    anchor.className = 'feature-nav__link';
    anchor.href = link.target;
    anchor.textContent = link.label;
    anchor.addEventListener('click', handleNavClick(link.target));

    item.appendChild(anchor);
    fragment.appendChild(item);
  });

  navList.replaceChildren(fragment);
};

const handleNavClick = (target) => (event) => {
  event.preventDefault();
  const destination = document.querySelector(target);
  destination?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNav);
} else {
  renderNav();
}
=======
const FEATURE_NAV_CONFIGS = {
  default: [
    {
      id: "browse",
      eyebrow: "Browse",
      title: "글 목록 탐색",
      desc: "전체 글 목록",
      href: "#posts-panel",
    },
    {
      id: "digest",
      eyebrow: "Digest",
      title: "날짜별 요약 보기",
      desc: "스크롤해 날짜 요약 카드 확인하기",
      href: "summary.html",
    },
  ],
  summary: [
    {
      id: "browse",
      eyebrow: "Browse",
      title: "글 목록 탐색",
      desc: "전체 글 목록 화면",
      href: "/",
    },
    {
      id: "digest",
      eyebrow: "Digest",
      title: "날짜별 요약 보기",
      desc: "스크롤해 날짜 요약 카드 확인하기",
      href: "#date-summary",
    },
  ],
};

const renderFeatureNav = () => {
  const placeholders = document.querySelectorAll(
    '[data-component="feature-nav"]'
  );
  placeholders.forEach((placeholder) => {
    const variant = placeholder.dataset.variant || "horizontal";
    const configKey = placeholder.dataset.config || "default";
    const ariaLabel = placeholder.dataset.label || "주요 기능";

    const nav = document.createElement("nav");
    nav.className = "feature-nav";
    nav.setAttribute("aria-label", ariaLabel);

    if (variant === "stacked") nav.classList.add("feature-nav--stacked");

    const items = (
      FEATURE_NAV_CONFIGS[configKey] || FEATURE_NAV_CONFIGS.default
    )
      .map(
        (item) => `
      <a class="feature-nav__item" href="${item.href}">
        <span class="feature-nav__eyebrow">${item.eyebrow}</span>
        <strong>${item.title}</strong>
        <span class="feature-nav__desc">${item.desc}</span>
      </a>
    `
      )
      .join("");

    nav.innerHTML = items;
    placeholder.replaceWith(nav);
  });
};

document.addEventListener("DOMContentLoaded", renderFeatureNav);
>>>>>>> 547ea76 (feat : 하이라이트 기능 추가)
