document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  const quickOrderButtons = document.querySelectorAll(".order-quick-btn");
  const loadMoreBtn = document.getElementById("load-more-btn");

  const numeroWhatsApp = "22661571286";
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

  // 1. Filtrage par catégorie
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categorieActive = button.dataset.filter || "all";

      // Quand on revient sur "Tout", on réinitialise à 6 modèles par défaut
      if (categorieActive === "all") {
        afficherTousEnModeTout = false;
      }

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      mettreAJourAffichage();
    });
  });

  // 2. Bouton "Voir plus / Voir moins" dans l'onglet "Tout"
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      afficherTousEnModeTout = !afficherTousEnModeTout;
      mettreAJourAffichage();

      // Si on replie la liste, on remonte doucement vers le haut du catalogue
      if (!afficherTousEnModeTout) {
        document
          .getElementById("catalogue")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // 3. Redirection directe vers WhatsApp avec le lien de l'image
  quickOrderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;

      const modelTitle =
        card.querySelector("h3")?.textContent.trim() || "Modèle Phénix Pneu";
      const modelPrice =
        card.querySelector(".price")?.textContent.trim() || "Sur devis";
      const imgElement = card.querySelector("img");
      const imageUrl = imgElement ? imgElement.src : "";

      const lignes = [
        "Bonjour *Phénix Pneu*, je souhaite commander ce modèle :",
        "",
        `• *Modèle :* ${modelTitle}`,
        `• *Prix affiché :* ${modelPrice}`,
        imageUrl ? `• *Photo du modèle :* ${imageUrl}` : null,
        "",
        "Pouvez-vous me confirmer la disponibilité et le délai de livraison ?",
      ].filter(Boolean);

      const message = lignes.join("\n");
      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`;

      window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
    });
  });

  // Affichage initial au chargement de la page
  mettreAJourAffichage();
});