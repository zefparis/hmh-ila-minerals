"use client";

export function ThemeButton() {
  return (
    <button
      className="theme-btn"
      type="button"
      onClick={() => {
        const r = document.documentElement;
        const dark = r.dataset.theme
          ? r.dataset.theme === "dark"
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
        r.dataset.theme = dark ? "light" : "dark";
        try {
          localStorage.setItem("ila-theme", r.dataset.theme);
        } catch {
          /* storage unavailable */
        }
      }}
    >
      Switch theme
    </button>
  );
}
