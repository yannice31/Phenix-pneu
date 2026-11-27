document.addEventListener("DOMContentLoaded", () => {
  const sliderContainer = document.querySelector(".slidy .slider-container");
  const slider = sliderContainer?.querySelector(".slider");
  const slides = slider ? Array.from(slider.querySelectorAll(".slide")) : [];
  const prevBtn = sliderContainer?.querySelector(".prev");
  const nextBtn = sliderContainer?.querySelector(".next");

  if (!sliderContainer || !slider || !slides.length) return;

  const AUTOPLAY_DELAY = 3500;
  let currentIndex = 0;
  let autoplayTimer = null;

  let isPausedByModal = false;
  let isPausedByHover = false;

  function updateSlidePosition() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function goToSlide(index) {
    const total = slides.length;
    currentIndex = ((index % total) + total) % total;
    updateSlidePosition();
  }

  function canAutoplay() {
    if (document.hidden) return false;
    if (isPausedByModal || isPausedByHover) return false;
    return true;
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (!canAutoplay()) return;
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTOPLAY_DELAY);
  }

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    goToSlide(currentIndex - 1);
    startAutoplay();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    goToSlide(currentIndex + 1);
    startAutoplay();
  });

  sliderContainer.addEventListener("mouseenter", () => {
    isPausedByHover = true;
    stopAutoplay();
  });

  sliderContainer.addEventListener("mouseleave", () => {
    isPausedByHover = false;
    startAutoplay();
  });

  document.addEventListener("catalog:modal-open", () => {
    isPausedByModal = true;
    stopAutoplay();
  });

  document.addEventListener("catalog:modal-close", () => {
    isPausedByModal = false;
    startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  updateSlidePosition();
  startAutoplay();
});