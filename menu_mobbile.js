document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".main-navlinks");

  if (!hamburger || !navMenu) return;

  function setMenuState(isOpen) {
    hamburger.classList.toggle("is-open", isOpen);
    navMenu.classList.toggle("is-open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  }

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    const currentlyOpen = navMenu.classList.contains("is-open");
    setMenuState(!currentlyOpen);
  });

  // Fermer le menu après avoir cliqué sur un lien
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  // Fermer si l'utilisateur clique en dehors du menu
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      setMenuState(false);
    }
  });

  // Fermer avec la touche Echap
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  // Réinitialiser proprement si l'écran repasse en mode bureau
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
  });
});