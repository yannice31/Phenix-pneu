document.addEventListener("DOMContentLoaded", () => {
  const phone = "22664682596";
  const waBtn = document.querySelector(".whatsapp-btn");
  const form = document.querySelector(".order-form");

  const clean = (val, fallback = "-") => {
    const str = String(val ?? "").trim();
    return str.length ? str : fallback;
  };

  // 1. Envoi via le bouton WhatsApp du formulaire
  if (waBtn && form) {
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const formValues = Object.fromEntries(new FormData(form));

      const message = [
        "Commande Phénix-pneu :",
        `Nom : ${clean(formValues.name)}`,
        `Prénom : ${clean(formValues.nickname)}`,
        `Email : ${clean(formValues.email)}`,
        `Numéro : ${clean(formValues.phone)}`,
        `Produit : ${clean(formValues.product)}`,
        `Quantité : ${clean(formValues.quantity, "1")}`,
        `Détails : ${clean(formValues.details)}`
      ].join("\n");

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  // 2. Clic direct sur une image produit (grilles et carrousel)
  const productImages = document.querySelectorAll(".grids-item img, .slide img");

  productImages.forEach((img) => {
    img.style.cursor = "pointer";
    img.title = "Cliquer pour commander ce produit sur WhatsApp";

    img.addEventListener("click", (e) => {
      const parentLink = img.closest("a");
      if (parentLink) e.preventDefault();

      const productName = clean(img.getAttribute("data-name") || img.alt, "Meuble recyclé");
      const productPrice = clean(img.getAttribute("data-price"), "Sur demande");
      const imageUrl = img.src;

      const message = [
        "Bonjour Phénix-pneu, je suis intéressé(e) par ce produit :",
        `• Modèle : ${productName}`,
        `• Prix indiqué : ${productPrice}`,
        `• Photo du produit : ${imageUrl}`,
        "",
        "Est-il disponible ?"
      ].join("\n");

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });
});