document.addEventListener("DOMContentLoaded", () => {
  const orderSection = document.getElementById("command");
  const form = orderSection
    ? orderSection.querySelector(".order-form")
    : document.querySelector(".order-form");
  const confirmationEl = document.getElementById("confirmation-message");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const formLoadedAt = Date.now();
  const MIN_SUBMIT_DELAY_MS = 2000; // 2 secondes minimum pour éviter les soumissions instantanées de robots

  if (!form) return;

  const FORMSPREE_URL = form.getAttribute("action") || "https://formspree.io/f/xkjryyov";
  const texteBoutonInitial = submitBtn ? submitBtn.textContent.trim() : "Envoyer par Email";

  function afficherMessage(texte, estErreur = false) {
    if (!confirmationEl) return;
    confirmationEl.textContent = texte;
    confirmationEl.style.color = estErreur ? "#b91c1c" : "#1e6b38";
    confirmationEl.classList.remove("hidden");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const gotchaValue = String(formData.get("_gotcha") || "").trim();
    const elapsedMs = Date.now() - formLoadedAt;

    // Anti-spam : si le champ piège est rempli ou si l'envoi est trop rapide (< 2s)
    if (gotchaValue !== "" || elapsedMs < MIN_SUBMIT_DELAY_MS) {
      form.reset();
      const quantiteInput = document.getElementById("quantity");
      if (quantiteInput) {
        quantiteInput.value = "1";
      }
      afficherMessage(
        "✅ Votre commande a été envoyée avec succès ! Nous vous contacterons rapidement.",
        false
      );
      return;
    }

    const produitSelect = document.getElementById("product");
    const produitLibelle =
      produitSelect && produitSelect.selectedOptions.length > 0
        ? produitSelect.selectedOptions[0].textContent.trim()
        : formData.get("product");

    const nomClient = String(formData.get("name") || "").trim();
    const prenomsClient = String(formData.get("nickname") || "").trim();
    const nomComplet = prenomsClient ? `${prenomsClient} ${nomClient}` : nomClient;

    const payload = {
      _subject: `Nouvelle commande Phénix Pneu — ${produitLibelle} (${nomComplet})`,
      _gotcha: gotchaValue,
      type_formulaire: "Commande",
      nom: nomClient,
      prenoms: prenomsClient,
      email: String(formData.get("email") || "").trim(),
      telephone: String(formData.get("phone") || "").trim(),
      produit_valeur: String(formData.get("product") || "").trim(),
      produit: String(produitLibelle || "").trim(),
      quantite: String(formData.get("quantity") || "1").trim(),
      details: String(formData.get("details") || "").trim(),
    };

    if (confirmationEl) {
      confirmationEl.classList.add("hidden");
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";
    }

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const messageErreur =
          data && Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.map((err) => err.message).join(", ")
            : "Erreur lors de l'envoi de la commande.";
        throw new Error(messageErreur);
      }

      form.reset();
      const quantiteInput = document.getElementById("quantity");
      if (quantiteInput) {
        quantiteInput.value = "1";
      }

      afficherMessage(
        "✅ Votre commande a été envoyée avec succès ! Nous vous contacterons rapidement.",
        false
      );
    } catch (error) {
      afficherMessage(
        "❌ L'envoi a échoué. Vérifiez votre connexion ou utilisez le bouton WhatsApp.",
        true
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = texteBoutonInitial;
      }
    }
  });
});