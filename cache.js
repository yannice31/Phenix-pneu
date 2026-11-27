document.addEventListener("DOMContentLoaded", () => {
  const navTriggers = Array.from(document.querySelectorAll("[data-section]"));
  const allSections = Array.from(document.querySelectorAll(".content-section"));

  // Groupe de sections affichées ensemble quand on clique sur "Accueil" (#home)
  const homeGroupIds = ["home", "highlights"];
  const homeGroupClasses = ["slidy"];

  function isPartOfHomeGroup(sectionEl) {
    if (sectionEl.id && homeGroupIds.includes(sectionEl.id)) return true;
    return homeGroupClasses.some((cls) => sectionEl.classList.contains(cls));
  }

  function updateActiveNavLinks(targetId) {
    document.querySelectorAll(".navlinks-container a[data-section]").forEach((link) => {
      const isCurrent = link.getAttribute("data-section") === targetId;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function showOnlySection(targetId) {
    if (!targetId) return null;

    if (targetId === "home") {
      allSections.forEach((sec) => {
        if (isPartOfHomeGroup(sec)) {
          sec.classList.remove("hidden");
          sec.classList.add("active");
        } else {
          sec.classList.remove("active");
          sec.classList.add("hidden");
        }
      });

      updateActiveNavLinks("home");
      if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
        AOS.refresh();
      }
      return document.getElementById("home");
    }

    const targetEl = document.getElementById(targetId);
    if (!targetEl) return null;

    // Masque toutes les autres sections (y compris #home, #highlights, .slidy)
    allSections.forEach((sec) => {
      if (sec === targetEl) {
        sec.classList.remove("hidden");
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
        sec.classList.add("hidden");
      }
    });

    updateActiveNavLinks(targetId);

    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
      AOS.refresh();
    }

    return targetEl;
  }

  window.phenixShowSection = showOnlySection;

  navTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      const targetId = trigger.getAttribute("data-section");
      if (!targetId) return;

      const targetEl = showOnlySection(targetId);
      if (targetEl) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // État initial au chargement : uniquement l'accueil (#home + #highlights + .slidy)
  showOnlySection("home");
});