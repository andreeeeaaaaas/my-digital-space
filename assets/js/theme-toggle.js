// Theme toggle: one nav button flips data-theme on <html> between light and dark.
// With no saved choice the site follows prefers-color-scheme.
(() => {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  if (!button) return;

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () =>
    root.dataset.theme || (systemDark.matches ? "dark" : "light");

  function updateLabel() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${next} mode`);
  }

  button.addEventListener("click", () => {
    const theme = currentTheme() === "dark" ? "light" : "dark";
    root.classList.add("theme-switching");
    root.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      // Storage blocked: the choice lasts for this page only.
    }
    updateLabel();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("theme-switching"))
    );
  });

  systemDark.addEventListener("change", updateLabel);
  updateLabel();
})();
