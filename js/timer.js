/**
 * timer.js
 * Обратный отсчёт до конца акции для одной или нескольких карточек.
 * Работает от единого setInterval (раз в секунду), чтобы не плодить
 * десятки независимых таймеров на странице.
 */

const COUNTDOWN = (() => {
  // registry: Map<element, { endDate, onExpire, expired }>
  const registry = new Map();
  let intervalId = null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatParts(diffMs) {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }

  function renderInto(el, parts) {
    const dayEl = el.querySelector('[data-unit="days"]');
    const hourEl = el.querySelector('[data-unit="hours"]');
    const minEl = el.querySelector('[data-unit="minutes"]');
    const secEl = el.querySelector('[data-unit="seconds"]');
    if (dayEl) dayEl.textContent = pad(parts.days);
    if (hourEl) hourEl.textContent = pad(parts.hours);
    if (minEl) minEl.textContent = pad(parts.minutes);
    if (secEl) secEl.textContent = pad(parts.seconds);
  }

  function tick() {
    const now = Date.now();
    registry.forEach((entry, el) => {
      if (entry.expired) return;
      const diff = entry.endDate.getTime() - now;
      if (diff <= 0) {
        entry.expired = true;
        renderInto(el, { days: 0, hours: 0, minutes: 0, seconds: 0 });
        el.classList.add("countdown--expired");
        if (typeof entry.onExpire === "function") {
          entry.onExpire();
        }
        return;
      }
      renderInto(el, formatParts(diff));
    });
  }

  function ensureLoop() {
    if (intervalId === null) {
      intervalId = setInterval(tick, 1000);
    }
  }

  /**
   * Регистрирует элемент таймера.
   * @param {HTMLElement} el - контейнер с [data-unit="days|hours|minutes|seconds"] внутри
   * @param {Date|string} endDate - дата окончания
   * @param {Function} [onExpire] - вызывается один раз, когда время истекло
   */
  function register(el, endDate, onExpire) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const alreadyExpired = end.getTime() - Date.now() <= 0;
    registry.set(el, { endDate: end, onExpire, expired: alreadyExpired });
    if (alreadyExpired) {
      renderInto(el, { days: 0, hours: 0, minutes: 0, seconds: 0 });
      el.classList.add("countdown--expired");
      if (typeof onExpire === "function") onExpire();
    } else {
      renderInto(el, formatParts(end.getTime() - Date.now()));
    }
    ensureLoop();
  }

  function unregister(el) {
    registry.delete(el);
    if (registry.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function isExpired(endDate) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    return end.getTime() - Date.now() <= 0;
  }

  return { register, unregister, isExpired };
})();
