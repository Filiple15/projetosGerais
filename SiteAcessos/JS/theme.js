const toggleBtn = document.getElementById("themeToggle");
const icon = toggleBtn.querySelector("i");
const root = document.documentElement;

// Detecta preferência salva ou sistema
const savedTheme = localStorage.getItem("theme");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
} else if (systemDark) {
  root.setAttribute("data-theme", "dark");
}

// Atualiza ícone
function updateIcon() {
  const isDark = root.getAttribute("data-theme") === "dark";
  icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
}

updateIcon();

// Toggle manual
toggleBtn.addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";

  root.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateIcon();
});
