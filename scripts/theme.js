const THEME_STORAGE_KEY = 'handmade-theme';
const DEFAULT_THEME = 'default';
const AVAILABLE_THEMES = ['default', 'gray'];

const root = document.documentElement;
const chips = () => document.querySelectorAll('[data-theme-choice]');

const applyTheme = (theme) => {
  const safeTheme = AVAILABLE_THEMES.includes(theme) ? theme : DEFAULT_THEME;
  root.dataset.theme = safeTheme;
  highlightActiveChip(safeTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
  } catch (error) {
    console.warn('테마를 저장하지 못했습니다.', error);
  }
};

const highlightActiveChip = (activeTheme) => {
  chips().forEach((chip) => {
    const themeName = chip.dataset.themeChoice;
    chip.classList.toggle('is-active', themeName === activeTheme);
    chip.setAttribute('aria-pressed', themeName === activeTheme ? 'true' : 'false');
  });
};

const bindPaletteControls = () => {
  chips().forEach((chip) => {
    chip.addEventListener('click', () => applyTheme(chip.dataset.themeChoice));
  });
};

const initTheme = () => {
  const storedTheme = (() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  })();

  applyTheme(storedTheme || DEFAULT_THEME);
  bindPaletteControls();
};

document.addEventListener('DOMContentLoaded', initTheme);
