  // image dfilante
  const slider = document.querySelector('.slider');
  const slides = document.querySelectorAll('.slide img');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const priceDisplay = document.getElementById('price-display');
  let index = 0;
  let autoSlide;
  function showSlide(i){
    if (i < 0){
       index = slides.length - 1;
    }else if (i >= slides.length){
       index = 0;
    }else {
      index = i;
    }
    slider.style.transform = `translateX(${-index * 70}%)`;
  }
  showSlide(index);
  if (prevBtn && nextBtn) {
  
  prevBtn.addEventListener('click', () => showSlide(index - 1));
  nextBtn.addEventListener('click', () => showSlide(index + 1));
  }
  //Defilement
  function startAutoSlide(){
    autoSlide = setInterval(() => showSlide(index +1), 3000);
  }
  function stopAutoSlide() {
    clearInterval(autoSlide);
  }
  showSlide(index);
  startAutoSlide();
//pause
slides.forEach(img =>{
  img.addEventListener('click', () => {
    stopAutoSlide(); //pause
    const price = img.getAttribute('data-price');
    document.getElementById('price-text').textContent = `Prix : ${price}`;
    priceDisplay.classList.remove('hidden')
  });
});
//reprise
document.getElementById('close-price').addEventListener('click', () => {
  priceDisplay.classList.add('hidden');

  startAutoSlide();
});