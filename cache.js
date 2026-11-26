document.addEventListener("DOMContentLoaded", () => {
  const contentSections = document.querySelectorAll(".content-section");
  const accueilSections = [
    document.getElementById("home"),
    document.getElementById("highlights"),
    document.querySelector(".presentation"),
    document.querySelector(".pre"),
    document.querySelector(".slidy")
  ];

  function hideEverything() {
    contentSections.forEach((sec) => {
      sec.classList.remove("active");
      sec.classList.add("hidden");
    });
    accueilSections.forEach((sec) => {
      if (sec) {
        sec.classList.remove("active");
        sec.classList.add("hidden");
      }
    });
  }

  function showAccueil() {
    accueilSections.forEach((sec) => {
      if (sec) {
        sec.classList.remove("hidden");
        sec.classList.add("active");
      }
    });
  }

  function openSection(sectionId, shouldScroll = true) {
    if (!sectionId) return;

    hideEverything();

    if (sectionId === "home") {
      showAccueil();
      if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.remove("hidden");
      target.classList.add("active");
      if (shouldScroll) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  // 🔹 Tous les liens internes (header, hero, footer) avec data-section ou href="#..."
  const internalLinks = document.querySelectorAll('a[data-section], a[href^="#"]');
  internalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      const sectionId =
        link.getAttribute("data-section") ||
        (href.startsWith("#") ? href.slice(1) : "");

      if (!sectionId) return;
      e.preventDefault();
      openSection(sectionId, true);
    });
  });

  // 🔹 Arrivée directe avec un #hash dans l'URL
  const hash = window.location.hash ? window.location.hash.slice(1) : "";
  if (hash && document.getElementById(hash)) {
    openSection(hash, true);
  } else {
    showAccueil();
  }
});