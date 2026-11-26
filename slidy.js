document.addEventListener("DOMContentLoaded", () => {
  const sliderContainer = document.querySelector(".slider-container");
  const slider = document.querySelector(".slider-container .slider");
  const slides = document.querySelectorAll(".slider-container .slide");
  const prevBtn = document.querySelector(".slider-container .prev");
  const nextBtn = document.querySelector(".slider-container .next");

  const priceBox = document.getElementById("price-display");
  const priceText = document.getElementById("price-text");
  const closePriceBtn = document.getElementById("close-price");

  if (!slider || slides.length === 0) return;

  const AUTOPLAY_DELAY = 4000; // 4 secondes entre chaque diapositive
  let currentIndex = 0;
  let autoplayTimer = null;
  let isPausedByHover = false;

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function startAutoplay() {
    stopAutoplay();
    if (isPausedByHover || document.hidden) return;
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    startAutoplay();
  }

  prevBtn?.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
    restartAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
    restartAutoplay();
  });

  // Pause au survol de la souris et reprise quand on quitte le carrousel
  sliderContainer?.addEventListener("mouseenter", () => {
    isPausedByHover = true;
    stopAutoplay();
  });

  sliderContainer?.addEventListener("mouseleave", () => {
    isPausedByHover = false;
    startAutoplay();
  });

  // Pause si l'onglet du navigateur passe en arrière-plan
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Affichage du repère de prix au clic sur une image
  slides.forEach((slide) => {
    const img = slide.querySelector("img");
    img?.addEventListener("click", () => {
      if (!priceBox || !priceText) return;
      const label = img.alt || "Modèle";
      const price = img.dataset.price || "Sur devis";
      priceText.textContent = `${label} — Repère de prix : ${price}`;
      priceBox.classList.remove("hidden");
      stopAutoplay();
    });
  });

  closePriceBtn?.addEventListener("click", () => {
    priceBox?.classList.add("hidden");
    startAutoplay();
  });

  // Démarrage du défilement automatique
  startAutoplay();
});