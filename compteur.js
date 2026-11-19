
// Charger le compteur initial

const counter = document.getElementById("counter");
fetch('Compteur.json')
  .then(res => res.json())
  .then(data => { counter.textContent = data.totalCommandes; })
  .catch(() => { counter.textContent = "Erreur"; });

// Soumission du formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  // Feedback utilisateur
  document.getElementById("confirmation-message").textContent = "⏳ Envoi en cours...";

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      document.getElementById("confirmation-message").textContent = "✅ Votre commande a été envoyée avec succès !";
      form.reset();

      // Mise à jour du compteur
      const updateRes = await fetch('Update_Compteur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const updateData = await updateRes.json();
      counter.textContent = updateData.totalCommandes;
    } else {
      document.getElementById("confirmation-message").textContent = "❌ Une erreur est survenue. Réessayez plus tard.";
    }
  } catch (error) {
    document.getElementById("confirmation-message").textContent = " Impossible de contacter le serveur.";
  }
});