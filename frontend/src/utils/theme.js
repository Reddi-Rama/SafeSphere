/**
 * SafeSphere Theme Manager
 * Refined Light and Dark mode with persistence
 */

import { storage } from "./storage.js";

const THEME_KEY = "theme";

export function initTheme() {
  const saved = storage.get(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = saved || (prefersDark ? "dark" : "light");
  applyTheme(currentTheme);
  return currentTheme;
}

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  storage.set(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent("safesphere:themechange", { detail: { theme } }));
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
