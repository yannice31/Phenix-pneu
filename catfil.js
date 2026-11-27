document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  const loadMoreBtn = document.getElementById("load-more-btn");

  const LIMITE_DEFAUT_TOUT = 6;

  let categorieActive = "all";
  let afficherTousEnModeTout = false;

  function mettreAJourAffichage() {
    const cartesCorrespondantes = productCards.filter((card) => {
      const cardCategory = card.dataset.category;
      return categorieActive === "all" || cardCategory === categorieActive;
    });

    const appliquerLimite =
      categorieActive === "all" && !afficherTousEnModeTout;

    productCards.forEach((card) => {
      const appartientCategorie =
        categorieActive === "all" || card.dataset.category === categorieActive;

      if (!appartientCategorie) {
        card.classList.add("is-filtered-out");
        return;
      }

      if (appliquerLimite) {
        const indexDansCategorie = cartesCorrespondantes.indexOf(card);
        const depasseLimite = indexDansCategorie >= LIMITE_DEFAUT_TOUT;
        card.classList.toggle("is-filtered-out", depasseLimite);
      } else {
        card.classList.remove("is-filtered-out");
      }
    });

    if (loadMoreBtn) {
      const yAPlusDeCartes = cartesCorrespondantes.length > LIMITE_DEFAUT_TOUT;
      if (categorieActive === "all" && yAPlusDeCartes) {
        loadMoreBtn.classList.remove("hidden");
        loadMoreBtn.textContent = afficherTousEnModeTout
          ? "Voir moins de modèles"
          : `Voir plus de modèles (${cartesCorrespondantes.length - LIMITE_DEFAUT_TOUT} de plus)`;
      } else {
        loadMoreBtn.classList.add("hidden");
      }
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categorieActive = button.dataset.filter || "all";

      if (categorieActive === "all") {
        afficherTousEnModeTout = false;
      }

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      mettreAJourAffichage();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      afficherTousEnModeTout = !afficherTousEnModeTout;
      mettreAJourAffichage();

      if (!afficherTousEnModeTout) {
        document
          .getElementById("catalogue")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  mettreAJourAffichage();
});