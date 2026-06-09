function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);

  const button = document.getElementById("themeToggleButton");
  if (button) {
    button.textContent = isDark ? "White Background" : "Black Background";
    button.setAttribute("aria-pressed", String(isDark));
  }
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
  localStorage.setItem("organizeYourPcTheme", nextTheme);
  applyTheme(nextTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("organizeYourPcTheme") || "light";
  applyTheme(savedTheme);
});
