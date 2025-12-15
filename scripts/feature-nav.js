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
