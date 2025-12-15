const COLOR_THEMES = [
  {
    id: "default",
    label: "Pop Yellow",
    description: "원래 감성",
    swatchBase: "#ffd000",
    swatchContrast: "#000000",
  },
  {
    id: "gray",
    label: "Gray Mode",
    description: "중성 회색",
    swatchBase: "#d7d7d7",
    swatchContrast: "#1f1f1f",
  },
  {
    id: "dark",
    label: "Dark Mode",
    description: "야간 모드",
    swatchBase: "#bb86fc",
    swatchContrast: "#121212",
  },
];

const THEME_STORAGE_KEY = "preferred-theme";
const DEFAULT_THEME = COLOR_THEMES[0].id;

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* noop */
    }
  },
};

const applyTheme = (themeId, { persist = true } = {}) => {
  const resolvedTheme = COLOR_THEMES.some(({ id }) => id === themeId)
    ? themeId
    : DEFAULT_THEME;

  if (resolvedTheme === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }

  if (persist) {
    storage.set(THEME_STORAGE_KEY, resolvedTheme);
  }

  reflectActiveTheme(resolvedTheme);
};

const reflectActiveTheme = (activeId) => {
  document
    .querySelectorAll('[data-theme-button]')
    .forEach((button) => {
      const isActive = button.dataset.themeButton === activeId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
};

const buildPalette = () => {
  const storedTheme = storage.get(THEME_STORAGE_KEY) || DEFAULT_THEME;

  document
    .querySelectorAll('[data-component="color-palette"]')
    .forEach((placeholder) => {
      const labelText = "";
      const variant = placeholder.dataset.variant || "default";

      const wrapper = document.createElement("div");
      wrapper.className = "color-palette";
      if (variant !== "default") {
        wrapper.classList.add(`color-palette--${variant}`);
      }

      let label;
      if (labelText.trim().length > 0) {
        label = document.createElement("span");
        label.className = "color-palette__label";
        label.textContent = labelText;
      }

      const list = document.createElement("ul");
      list.className = "color-palette__list";

      COLOR_THEMES.forEach((theme) => {
        const item = document.createElement("li");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "color-palette__button";
        button.dataset.themeButton = theme.id;
        button.dataset.tooltip = theme.label;
        button.setAttribute("aria-label", `${theme.label} — ${theme.description}`);
        button.title = `${theme.label} · ${theme.description}`;
        button.style.setProperty("--swatch-base", theme.swatchBase);
        button.style.setProperty("--swatch-contrast", theme.swatchContrast);
        button.addEventListener("click", () => applyTheme(theme.id));

        item.appendChild(button);
        list.appendChild(item);
      });

      wrapper.append(...[label, list].filter(Boolean));
      placeholder.replaceWith(wrapper);
    });

  applyTheme(storedTheme, { persist: false });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildPalette);
} else {
  buildPalette();
}
