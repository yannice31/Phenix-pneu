document.addEventListener("DOMContentLoaded", () => {
  const phone = "22664682596";

  // 1. Formulaire de commande existant
  const waBtn = document.querySelector(".whatsapp-btn");
  const form = document.querySelector(".order-form");

  if (waBtn && form) {
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const formValues = Object.fromEntries(new FormData(form));
      const message = [
        "Commande :",
        `Nom: ${formValues.name || "-"}`,
        `Prénom: ${formValues.nickname || "-"}`,
        `Email: ${formValues.email || "-"}`,
        `Numéro: ${formValues.phone || "-"}`,
        `Produit: ${formValues.product || "-"}`,
        `Quantité: ${formValues.quantity || 1}`,
        `Détails: ${formValues.details || "-"}`
      ].join("\n");

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    });
  }

  // 2. Clic direct sur une image produit (grilles et carrousel)
  const productImages = document.querySelectorAll(".grids-item img, .slide img");

  productImages.forEach((img) => {
    img.style.cursor = "pointer";
    img.title = "Cliquer pour commander ce produit sur WhatsApp";

    img.addEventListener("click", () => {
      const productName = img.getAttribute("data-name") || img.alt || "Meuble recyclé";
      const productPrice = img.getAttribute("data-price") || "Sur demande";
      const imageUrl = img.src; // URL complète de l'image

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