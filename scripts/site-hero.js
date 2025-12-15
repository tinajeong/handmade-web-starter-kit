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
