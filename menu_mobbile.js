// menu_mobbile.js
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.getElementById("mobile-nav");

  if (!hamburger || !navMenu) return;

  function setMenuState(isOpen) {
    navMenu.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  }

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !navMenu.classList.contains("open");
    setMenuState(isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      setMenuState(false);
    }
  });
});