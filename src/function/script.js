// ==============================
// Header (fixo) - efeito de scroll
// ==============================
const handleHeaderScroll = () => {
  const header = document.querySelector('header');
  if (!header) {
    return;
  }

  const isPastThreshold = window.scrollY > 50;
  header.classList.toggle('scrolled', isPastThreshold);
};

window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

// ==============================
// Inicializações após carregar o DOM
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  initNewsCarousel();
  initLucideIcons();
  initCameraSelector();
});

// ==============================
// Notícias - carrossel automático
// ==============================
const AUTOPLAY_INTERVAL_MS = 5000;

function initNewsCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) {
    return;
  }

  const cards = Array.from(track.children);
  if (!cards.length) {
    return;
  }

  const nextButton = document.querySelector('.carousel-button.next');
  const prevButton = document.querySelector('.carousel-button.prev');
  const cardWidth = cards[0].getBoundingClientRect().width;
  const step = cardWidth + 30; // 30px = espaçamento lateral
  let currentIndex = 0;

  const moveToSlide = (targetIndex) => {
    const normalizedIndex = (targetIndex + cards.length) % cards.length;
    track.style.transform = `translateX(-${step * normalizedIndex}px)`;
    currentIndex = normalizedIndex;
  };

  nextButton?.addEventListener('click', () => {
    moveToSlide(currentIndex + 1);
  });

  prevButton?.addEventListener('click', () => {
    moveToSlide(currentIndex - 1);
  });

  setInterval(() => {
    moveToSlide(currentIndex + 1);
  }, AUTOPLAY_INTERVAL_MS);
}

// ==============================
// Ícones - renderização Lucide
// ==============================
function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ==============================
// Formulário - seleção de câmeras
// ==============================
function initCameraSelector() {
  const cameraButtons = Array.from(document.querySelectorAll('.cam-btn'));
  if (!cameraButtons.length) {
    return;
  }

  const hiddenField = document.getElementById('camera-selecionada');
  const helperLabel = document.getElementById('cam-selecionada-label');
  const helperContainer = document.querySelector('.cam-helper');

  if (helperContainer && !helperContainer.hasAttribute('aria-live')) {
    helperContainer.setAttribute('aria-live', 'polite');
  }

  if (!hiddenField || !helperLabel || !helperContainer) {
    return;
  }

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
