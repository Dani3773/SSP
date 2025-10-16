// ==============================
// Header (fixo) - efeito de scroll
// ==============================
const handleHeaderScroll = () => {
  const header = document.querySelector('header');
  if (!header) return;
  const isPastThreshold = window.scrollY > 50;
  header.classList.toggle('scrolled', isPastThreshold);
};
window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

// ==============================
// Inicializações após carregar o DOM
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  initInfiniteLoopSlider();
  initLucideIcons();
  initCameraSelector();
});

// ==============================
// Slider com Loop Infinito, Autoplay e Hover (VERSÃO CORRIGIDA)
// ==============================
function initInfiniteLoopSlider() {
  const container = document.querySelector('.slider-container, .carousel-container');
  const track = document.querySelector('.slider-track, .carousel-track');
  const prevButton = document.querySelector('.slider-button.prev, .carousel-button.prev');
  const nextButton = document.querySelector('.slider-button.next, .carousel-button.next');

  if (!container || !track) return;

  let slides = Array.from(track.children);
  let originalSlidesCount = 0;
  let isMoving = false;
  let currentIndex;
  let slideWidth;
  let slidesToClone;
  let autoplayInterval;

  function setupSlider() {
    stopAutoplay();
    
    const oldClones = track.querySelectorAll('.clone');
    oldClones.forEach(clone => clone.remove());
    slides = Array.from(track.children).filter(child => !child.classList.contains('clone'));
    originalSlidesCount = slides.length; // Guarda o número de slides originais
    
    if (window.innerWidth <= 768) slidesToClone = 1;
    else if (window.innerWidth <= 960) slidesToClone = 2;
    else slidesToClone = 3;

    if (slides.length <= slidesToClone) {
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        return;
    }
    if(prevButton) prevButton.style.display = 'flex';
    if(nextButton) nextButton.style.display = 'flex';

    for (let i = 0; i < slidesToClone; i++) {
      const cloneEnd = slides[i].cloneNode(true);
      cloneEnd.classList.add('clone');
      track.appendChild(cloneEnd);
      
      const cloneStart = slides[slides.length - 1 - i].cloneNode(true);
      cloneStart.classList.add('clone');
      track.insertBefore(cloneStart, track.firstChild);
    }
    
    slides = Array.from(track.children);
    currentIndex = slidesToClone;
    
    positionTrack();
    startAutoplay();
  }

  function positionTrack() {
    slideWidth = slides[0].getBoundingClientRect().width;
    const slideMargin = window.innerWidth > 768 ? 20 : 0;
    const initialOffset = (slideWidth + slideMargin) * currentIndex;
    
    track.style.transition = 'none';
    track.style.transform = `translateX(-${initialOffset}px)`;
  }
  
  function moveSlider(direction) {
    if (isMoving) return;
    isMoving = true;
    
    currentIndex += direction;
    
    const slideMargin = window.innerWidth > 768 ? 20 : 0;
    const offset = (slideWidth + slideMargin) * currentIndex;

    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${offset}px)`;
  }
  
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
        moveSlider(1);
    }, 5000);
  }

  function stopAutoplay() {
      clearInterval(autoplayInterval);
  }

  track.addEventListener('transitionend', () => {
    isMoving = false;
    
    // --- LÓGICA DE SALTO CORRIGIDA ---
    // Se chegou aos clones do final (ex: clones dos slides 1, 2, 3)
    if (currentIndex >= originalSlidesCount + slidesToClone) {
      currentIndex -= originalSlidesCount; // Salta de volta para os slides originais do início
      positionTrack();
    }
    
    // Se chegou aos clones do início (ex: clones dos slides 4, 5)
    if (currentIndex < slidesToClone) {
      currentIndex += originalSlidesCount; // Salta de volta para os slides originais do fim
      positionTrack();
    }
  });

  // Event Listeners
  nextButton?.addEventListener('click', () => {
      moveSlider(1);
      startAutoplay();
  });
  prevButton?.addEventListener('click', () => {
      moveSlider(-1);
      startAutoplay();
  });

  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  // Inicialização
  setupSlider();
  window.addEventListener('resize', setupSlider);
}

// ==============================
// Demais funções
// ==============================
function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function initCameraSelector() {
  const cameraButtons = Array.from(document.querySelectorAll('.cam-btn'));
  if (!cameraButtons.length) return;
  const hiddenField = document.getElementById('camera-selecionada');
  const helperLabel = document.getElementById('cam-selecionada-label');
  const helperContainer = document.querySelector('.cam-helper');
  if (helperContainer && !helperContainer.hasAttribute('aria-live')) {
    helperContainer.setAttribute('aria-live', 'polite');
  }
  if (!hiddenField || !helperLabel || !helperContainer) return;
  let activeButton = null;
  const updateSelection = (button) => {
    if (!button) {
      helperLabel.textContent = 'nenhuma';
      helperContainer.classList.remove('cam-helper--active');
      hiddenField.value = '';
      return;
    }
    const cameraName =
      button.getAttribute('data-camera') || button.querySelector('h3')?.textContent?.trim() || '';
    const regionName =
      button.getAttribute('data-region') || button.querySelector('p')?.textContent?.trim() || '';
    const status = button.getAttribute('data-status');
    const descriptiveLabel = [cameraName, regionName, status && status !== 'online' ? status : null]
      .filter(Boolean)
      .join(' - ');
    helperLabel.textContent = descriptiveLabel || cameraName || regionName || 'nenhuma';
    helperContainer.classList.add('cam-helper--active');
    hiddenField.value = cameraName;
  };
  cameraButtons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (activeButton === button) {
        button.setAttribute('aria-pressed', 'false');
        button.classList.remove('cam-btn--active');
        activeButton = null;
        updateSelection(null);
        return;
      }
      if (activeButton) {
        activeButton.classList.remove('cam-btn--active');
        activeButton.setAttribute('aria-pressed', 'false');
      }
      button.classList.add('cam-btn--active');
      button.setAttribute('aria-pressed', 'true');
      activeButton = button;
      updateSelection(button);
    });
  });
}
