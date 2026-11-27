document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".order-form");
  const confirmationMsg = document.getElementById("confirmation-message");
  const counter = document.getElementById("counter");
  const CART_STORAGE_KEY = "phenix_pneu_cart_v1";

  if (!form) return;

  if (counter) {
    fetch("Compteur.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.totalCommandes !== "undefined") {
          counter.textContent = data.totalCommandes;
        }
      })
      .catch(() => {});
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";

    if (confirmationMsg) {
      confirmationMsg.classList.add("hidden");
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      if (confirmationMsg) {
        confirmationMsg.textContent = "✅ Votre commande a été envoyée avec succès !";
        confirmationMsg.classList.remove("hidden");
      }

      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (_) {}

      form.reset();
    } catch (_) {
      alert(
        "Une erreur est survenue lors de l'envoi du formulaire. Vous pouvez aussi envoyer votre demande directement sur WhatsApp."
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
});