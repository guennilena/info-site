(function () {
  const STORAGE_KEY = "theme";
  const prismLink = document.getElementById("prism-theme");

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    // Prism Theme umschalten (falls Link vorhanden)
    if (prismLink) {
      prismLink.href = theme === "dark"
        ? "/assets/prism-dark.css"
        : "/assets/prism-light.css";
    }

    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
    setTheme(current === "dark" ? "light" : "dark");
  }

  // Initial theme
  setTheme(getSavedTheme() || getSystemTheme());

  // Hook button
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);
  });
})();
