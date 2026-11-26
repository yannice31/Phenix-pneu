document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".testimonials-container");
  const form = document.getElementById("avis-form");
  const feedback = document.getElementById("avis-feedback");
  const submitBtn = form ? form.querySelector(".avis-submit-btn") : null;

  if (!container || !form) return;

  const FORMSPREE_URL = "https://formspree.io/f/mrbaokde";
  const STORAGE_KEY = "phenix_pneu_avis_v1";

  function genererId() {
    return `avis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function lireAvisStockes() {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      const parsed = brut ? JSON.parse(brut) : [];
      if (!Array.isArray(parsed)) return [];

      let modifie = false;
      const normalises = parsed.map((item) => {
        if (!item.id) {
          modifie = true;
          return { ...item, id: genererId() };
        }
        return item;
      });

      if (modifie) {
        enregistrerAvisStockes(normalises);
      }

      return normalises;
    } catch (e) {
      return [];
    }
  }

  function enregistrerAvisStockes(liste) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
    } catch (e) {
      // Ignorer si localStorage est bloqué
    }
  }

  function mettreAJourAvisDansStockage(avisModifie) {
    const liste = lireAvisStockes().map((item) =>
      item.id === avisModifie.id ? { ...item, ...avisModifie } : item
    );
    enregistrerAvisStockes(liste);
  }

  function supprimerAvisParId(id, carteElement) {
    const listeMiseAJour = lireAvisStockes().filter((item) => item.id !== id);
    enregistrerAvisStockes(listeMiseAJour);

    if (carteElement && carteElement.parentNode) {
      carteElement.remove();
    }

    if (feedback) {
      feedback.textContent = "🗑️ Votre avis a bien été supprimé de cet appareil.";
      feedback.style.color = "#374151";
      feedback.classList.remove("hidden");
    }
  }

  async function envoyerVersFormspree(avis, estModification = false) {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: estModification
          ? `Avis client modifié Phénix Pneu (${avis.note}/5) — ${avis.nom}`
          : `Nouvel avis client Phénix Pneu (${avis.note}/5) — ${avis.nom}`,
        type_formulaire: estModification ? "Avis Client (Modifié)" : "Avis Client",
        nom: avis.nom,
        ville: avis.ville,
        note: `${avis.note}/5`,
        message: avis.message,
      }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi vers Formspree");
    }
  }

  function formaterEtoiles(note) {
    const n = Math.min(5, Math.max(1, Number(note) || 5));
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function afficherZoneEdition(carte, avisActuel, figure) {
    // Évite d'ouvrir deux formulaires d'édition en même temps sur la même carte
    if (carte.querySelector(".avis-edit-form")) return;

    figure.classList.add("hidden");

    const editForm = document.createElement("form");
    editForm.className = "avis-edit-form";

    const nomInput = document.createElement("input");
    nomInput.type = "text";
    nomInput.value = avisActuel.nom;
    nomInput.required = true;
    nomInput.setAttribute("aria-label", "Nom ou prénom");

    const villeInput = document.createElement("input");
    villeInput.type = "text";
    villeInput.value = avisActuel.ville;
    villeInput.required = true;
    villeInput.setAttribute("aria-label", "Ville ou quartier");

    const noteSelect = document.createElement("select");
    noteSelect.setAttribute("aria-label", "Note sur 5");
    [5, 4, 3].forEach((val) => {
      const opt = document.createElement("option");
      opt.value = String(val);
      opt.textContent = `${"★".repeat(val)}${"☆".repeat(5 - val)} (${val}/5)`;
      if (Number(avisActuel.note) === val) opt.selected = true;
      noteSelect.appendChild(opt);
    });

    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.value = avisActuel.message;
    textarea.required = true;
    textarea.setAttribute("aria-label", "Texte de l'avis");

    const actions = document.createElement("div");
    actions.className = "avis-edit-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "avis-save-btn";
    saveBtn.textContent = "Enregistrer";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "avis-cancel-btn";
    cancelBtn.textContent = "Annuler";

    cancelBtn.addEventListener("click", () => {
      editForm.remove();
      figure.classList.remove("hidden");
    });

    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nouveauNom = nomInput.value.trim();
      const nouvelleVille = villeInput.value.trim();
      const nouvelleNote = noteSelect.value;
      const nouveauMessage = textarea.value.trim();

      if (!nouveauNom || !nouvelleVille || !nouveauMessage) return;

      saveBtn.disabled = true;
      saveBtn.textContent = "Mise à jour...";

      const avisMisAJour = {
        ...avisActuel,
        nom: nouveauNom,
        ville: nouvelleVille,
        note: nouvelleNote,
        message: nouveauMessage,
      };

      try {
        await envoyerVersFormspree(avisMisAJour, true);

        Object.assign(avisActuel, avisMisAJour);
        mettreAJourAvisDansStockage(avisMisAJour);

        const starsEl = figure.querySelector(".avis-stars");
        const quoteEl = figure.querySelector("blockquote");
        const captionEl = figure.querySelector("figcaption");

        if (starsEl) starsEl.textContent = formaterEtoiles(avisMisAJour.note);
        if (quoteEl) quoteEl.textContent = avisMisAJour.message;
        if (captionEl) {
          captionEl.textContent = `— ${avisMisAJour.nom}, ${avisMisAJour.ville} (En attente de validation — modifié)`;
        }

        editForm.remove();
        figure.classList.remove("hidden");

        if (feedback) {
          feedback.textContent =
            "✏️ Votre avis a bien été mis à jour et renvoyé pour validation.";
          feedback.style.color = "#1e6b38";
          feedback.classList.remove("hidden");
        }
      } catch (error) {
        if (feedback) {
          feedback.textContent =
            "❌ Impossible d'enregistrer la modification pour le moment. Réessayez.";
          feedback.style.color = "#b91c1c";
          feedback.classList.remove("hidden");
        }
        saveBtn.disabled = false;
        saveBtn.textContent = "Enregistrer";
      }
    });

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    editForm.appendChild(nomInput);
    editForm.appendChild(villeInput);
    editForm.appendChild(noteSelect);
    editForm.appendChild(textarea);
    editForm.appendChild(actions);

    carte.appendChild(editForm);
  }

  function creerCarteAvis(avis) {
    const avisCourant = { ...avis };
    const carte = document.createElement("div");
    carte.className = "testimonial testimonial-user";
    carte.dataset.avisId = avisCourant.id;

    const figure = document.createElement("figure");

    const stars = document.createElement("div");
    stars.className = "avis-stars";
    stars.textContent = formaterEtoiles(avisCourant.note);

    const blockquote = document.createElement("blockquote");
    blockquote.textContent = avisCourant.message;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = `— ${avisCourant.nom}, ${avisCourant.ville} (En attente de validation)`;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "avis-card-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "avis-edit-btn";
    editBtn.textContent = "Modifier";
    editBtn.addEventListener("click", () => {
      afficherZoneEdition(carte, avisCourant, figure);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "avis-delete-btn";
    deleteBtn.textContent = "Supprimer";
    deleteBtn.addEventListener("click", () => {
      const confirme = window.confirm("Voulez-vous vraiment supprimer cet avis ?");
      if (confirme) {
        supprimerAvisParId(avisCourant.id, carte);
      }
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    figure.appendChild(stars);
    figure.appendChild(blockquote);
    figure.appendChild(figcaption);
    figure.appendChild(actionsDiv);
    carte.appendChild(figure);

    return carte;
  }

  // Réafficher les avis déjà enregistrés sur ce navigateur
  lireAvisStockes().forEach((avis) => {
    container.appendChild(creerCarteAvis(avis));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomInput = document.getElementById("avis-nom");
    const villeInput = document.getElementById("avis-ville");
    const noteSelect = document.getElementById("avis-note");
    const messageInput = document.getElementById("avis-message");

    const nom = nomInput ? nomInput.value.trim() : "";
    const ville = villeInput ? villeInput.value.trim() : "";
    const note = noteSelect ? noteSelect.value : "5";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!nom || !ville || !message) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";
    }

    const nouvelAvis = {
      id: genererId(),
      nom,
      ville,
      note,
      message,
    };

    try {
      await envoyerVersFormspree(nouvelAvis, false);

      container.appendChild(creerCarteAvis(nouvelAvis));
      enregistrerAvisStockes([...lireAvisStockes(), nouvelAvis]);

      form.reset();

      if (feedback) {
        feedback.textContent =
          "✅ Merci ! Votre avis a bien été envoyé et sera publié après validation.";
        feedback.style.color = "#1e6b38";
        feedback.classList.remove("hidden");
      }
    } catch (error) {
      if (feedback) {
        feedback.textContent =
          "❌ L'envoi a échoué. Vérifiez votre connexion internet et réessayez.";
        feedback.style.color = "#b91c1c";
        feedback.classList.remove("hidden");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Publier mon avis";
      }
    }
  });
});