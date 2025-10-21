/*   ============================== -->
<!--             Header             -->
<!-- ==============================  */

/* Deixar header fixo */

const handleHeaderScroll = () => {
  const header = document.querySelector('header');
  if (!header) return;
  const isPastThreshold = window.scrollY > 50;
  header.classList.toggle('scrolled', isPastThreshold);
};
window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

/*    ==============================  -->
<!-- Inicializações após carregar o DOM  -->
<!--  ==============================   */


document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initInfiniteLoopSlider(); 
  initLucideIcons();
  initCameraSelector();
});


/*   ============================== -->
<!--   Menu hamburguer responsivo   -->
<!-- ==============================  */

function initHamburgerMenu() {
  const header = document.querySelector('header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!header || !toggle || !nav) return;

  const navLinks = Array.from(nav.querySelectorAll('a, button'));

  const closeMenu = (focusToggle = false) => {
    if (!header.classList.contains('menu-open')) return;
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    if (focusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 960) closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(true);
  });

  document.addEventListener('click', (event) => {
    if (!header.classList.contains('menu-open')) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });
}


/*     ==========================================   -->
<!--   Slider com Loop Infinito, Autoplay e Hover   -->
<!--   ==========================================    */

function initInfiniteLoopSlider() {
  // Seletores compatíveis com teu HTML original
  const container = document.querySelector('.slider-container, .carousel-container');
  const track = document.querySelector('.slider-track, .carousel-track');
  const prevButton = document.querySelector('.slider-button.prev, .carousel-button.prev');
  const nextButton = document.querySelector('.slider-button.next, .carousel-button.next');
  if (!container || !track) return;

  let slides = Array.from(track.children);
  let originalSlidesCount = 0;
  let isMoving = false;
  let currentIndex = 0;
  let slideWidth = 0;
  let slidesToClone = 0;
  let autoplayInterval;

  // Lê a margem real do CSS (esquerda + direita) do primeiro slide
  function getSlideMargin() {
    const first = slides[0];
    if (!first) return 0;
    const cs = getComputedStyle(first);
    const ml = parseFloat(cs.marginLeft) || 0;
    const mr = parseFloat(cs.marginRight) || 0;
    return ml + mr;
  }

  function recalcSlideWidth() {
    // largura do "conteúdo" do card (sem margens)
    if (!slides.length) return 0;
    slideWidth = slides[0].getBoundingClientRect().width;
    return slideWidth;
  }

  function setupSlider() {
    stopAutoplay();

    // Remove clones antigos
    track.querySelectorAll('.clone').forEach((c) => c.remove());

    // Recoleta apenas os originais
    slides = Array.from(track.children).filter((el) => !el.classList.contains('clone'));
    originalSlidesCount = slides.length;

    // Quantos clonar (mesma lógica que tu usava)
    if (window.innerWidth <= 768) {
      slidesToClone = 1;
    } else if (window.innerWidth <= 960) {
      slidesToClone = 2;
    } else {
      slidesToClone = 3;
    }

    // Se não tem slides suficientes, esconde botões e não clona
    if (slides.length <= slidesToClone) {
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      currentIndex = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      return;
    }
    if (prevButton) prevButton.style.display = 'flex';
    if (nextButton) nextButton.style.display = 'flex';

    // Clona para o fim e para o início
    for (let i = 0; i < slidesToClone; i++) {
      const cloneEnd = slides[i].cloneNode(true);
      cloneEnd.classList.add('clone');
      track.appendChild(cloneEnd);

      const cloneStart = slides[slides.length - 1 - i].cloneNode(true);
      cloneStart.classList.add('clone');
      track.insertBefore(cloneStart, track.firstChild);
    }

    // Recoleta com clones
    slides = Array.from(track.children);
    currentIndex = slidesToClone;

    // Recalcula largura real do slide
    recalcSlideWidth();
    positionTrack();
    startAutoplay();
  }

  function positionTrack() {
    // Usa a MESMA margem lida do CSS
    const slideMargin = getSlideMargin();
    const initialOffset = (slideWidth + slideMargin) * currentIndex;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${initialOffset}px)`;
  }

  function moveSlider(direction) {
    if (isMoving) return;
    isMoving = true;

    currentIndex += direction;

    const slideMargin = getSlideMargin();
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
    if (autoplayInterval) clearInterval(autoplayInterval);
  }

  // Ajuste de limites e salto invisível
  track.addEventListener('transitionend', () => {
    isMoving = false;

    if (currentIndex >= originalSlidesCount + slidesToClone) {
      currentIndex -= originalSlidesCount;
      positionTrack();
    }
    if (currentIndex < slidesToClone) {
      currentIndex += originalSlidesCount;
      positionTrack();
    }
  });

  // Controles
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

  // Reflow em resize (mantém 3/2/1 certinho)
  window.addEventListener('resize', () => {
    // Recalcular tudo (clones, largura, índice)
    setupSlider();
  });

  // Boot
  setupSlider();
}

// ==============================
// Ícones Lucide
// ==============================
function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ==============================
// Seletor de câmera (formulário)
// ==============================
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

// ==============================
// Validação do formulário de inscrição por e-mail
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.querySelector('.newsletter-form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const emailValue = emailInput.value.trim();

      if (!validateEmail(emailValue)) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }

      alert('Inscrição realizada com sucesso!');
      newsletterForm.reset();
    });
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
