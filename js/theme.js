/**
 * theme.js
 * Переключение темы (light/dark). Сохраняет выбор в localStorage.
 * Если пользователь ещё не выбирал тему — берём системную настройку
 * (prefers-color-scheme), а иначе по умолчанию светлая.
 */

const THEME = (() => {
  const STORAGE_KEY = "tour-site-theme";

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = saved === "dark" || saved === "light" ? saved : (systemPrefersDark() ? "dark" : "light");
    apply(theme, false);
    return theme;
  }

  function apply(theme, persist = true) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    apply(next);
    return next;
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  return { init, toggle, getTheme };
})();
