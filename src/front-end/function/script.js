/* =========================================================
   SSP - Front Script (UI Geral)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initLucideIcons();
  initLoginModal();         
  initPasswordToggle();     
  initInfiniteLoopSlider(); 
  initCameraSelector();     
  initNewsletterForm();     
  initComiteLogin();        
  initDenunciaForm();       
  loadNews();               
});

/* =========================================================
   Header fixo no scroll
   ========================================================= */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  const handleHeaderScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();
}

/* =========================================================
   Lucide Icons
   ========================================================= */
function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* =========================================================
   Modal do Comitê (abrir, fechar, foco, overlay)
   ========================================================= */
function initLoginModal() {
  const overlay    = document.getElementById('overlay-comite');
  const modal      = document.getElementById('login');
  const btnClose   = document.getElementById('modal-comite-cancel');
  const btnTrigger = document.querySelector('.menu-cta');
  const userInput  = document.getElementById('comite-user');
  const errorEl    = document.getElementById('comite-error');

  if (!overlay || !modal) return;

  const lockBody = (on) => {
    document.body.classList.toggle('comite-modal-open', !!on);
  };

  function openComiteModal() {
    overlay.classList.add('show');
    modal.hidden = false;
    lockBody(true);
    if (errorEl) errorEl.textContent = '';
    (userInput || modal).focus();
  }

  function closeComiteModal(focusTrigger = false) {
    const modal = document.getElementById('login');
    if (modal) {
      modal.classList.add('exiting');
      // Aguardar a animação terminar antes de esconder
      setTimeout(() => {
        overlay.classList.remove('show');
        modal.hidden = true;
        modal.classList.remove('exiting');
        lockBody(false);
        if (focusTrigger && btnTrigger) btnTrigger.focus();
      }, 300); // Tempo da animação de saída
    } else {
      overlay.classList.remove('show');
      lockBody(false);
      if (focusTrigger && btnTrigger) btnTrigger.focus();
    }
  }

  btnTrigger?.addEventListener('click', openComiteModal);
  btnClose?.addEventListener('click', () => closeComiteModal(true));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeComiteModal(true);
  });

  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('show') && e.key === 'Escape') closeComiteModal(true);
  });

  if (location.hash === '#openComite') {
    openComiteModal();
  }

  window.__SSP__ = window.__SSP__ || {};
  window.__SSP__.openComiteModal = openComiteModal;
  window.__SSP__.closeComiteModal = closeComiteModal;
}

/* =========================================================
   Toggle de Senha (eye / eye-off)
   ========================================================= */
function initPasswordToggle() {
  const pass = document.getElementById('comite-pass');
  const btn = document.querySelector('.toggle-pass');
  if (!pass || !btn) return;

  btn.addEventListener('click', () => {
    const showing = pass.type === 'text';
    pass.type = showing ? 'password' : 'text';

    const icon = btn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', showing ? 'eye' : 'eye-off');
      initLucideIcons();
    }

    pass.focus({ preventScroll: true });
  });
}

/* =========================================================
   Slider / Carrossel de Notícias
   ========================================================= */
function initInfiniteLoopSlider() {
  const container   = document.querySelector('.slider-container, .carousel-container');
  const track       = document.querySelector('.slider-track, .carousel-track');
  const prevButton  = document.querySelector('.slider-button.prev, .carousel-button.prev');
  const nextButton  = document.querySelector('.slider-button.next, .carousel-button.next');
  if (!container || !track) return;

  let slides = Array.from(track.children);
  let originalSlidesCount = 0;
  let isMoving = false;
  let currentIndex = 0;
  let slideWidth = 0;
  let slidesToClone = 0;
  let autoplayInterval;

  function getSlideMargin() {
    const first = slides[0];
    if (!first) return 0;
    const cs = getComputedStyle(first);
    return (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0);
  }

  function recalcSlideWidth() {
    if (!slides.length) return 0;
    slideWidth = slides[0].getBoundingClientRect().width;
    return slideWidth;
  }

  function setupSlider() {
    stopAutoplay();
    track.querySelectorAll('.clone').forEach((c) => c.remove());
    slides = Array.from(track.children).filter((el) => !el.classList.contains('clone'));
    originalSlidesCount = slides.length;

    if (window.innerWidth <= 768) slidesToClone = 1;
    else if (window.innerWidth <= 960) slidesToClone = 2;
    else slidesToClone = 3;

    if (slides.length <= slidesToClone) {
      prevButton?.style?.setProperty('display', 'none');
      nextButton?.style?.setProperty('display', 'none');
      currentIndex = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      return;
    }

    prevButton?.style?.setProperty('display', 'flex');
    nextButton?.style?.setProperty('display', 'flex');

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
    recalcSlideWidth();
    positionTrack();
    startAutoplay();
  }

  function positionTrack() {
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
    autoplayInterval = setInterval(() => moveSlider(1), 5000);
  }

  function stopAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
  }

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

  nextButton?.addEventListener('click', () => { moveSlider(1); startAutoplay(); });
  prevButton?.addEventListener('click', () => { moveSlider(-1); startAutoplay(); });

  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);
  window.addEventListener('resize', setupSlider);

  setupSlider();
}

/* =========================================================
   Seletor de câmera (formulário denúncia)
   ========================================================= */
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
    const cameraName = button.getAttribute('data-camera') || button.querySelector('h3')?.textContent?.trim() || '';
    const regionName = button.getAttribute('data-region') || button.querySelector('p')?.textContent?.trim() || '';
    const status = button.getAttribute('data-status');
    const descriptiveLabel = [cameraName, regionName, status && status !== 'online' ? status : null]
      .filter(Boolean).join(' - ');
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

/* =========================================================
   Login do Comitê (conexão com back-end)
   ========================================================= */
function initComiteLogin() {
  const loginBtn = document.getElementById('comite-acess');
  const userInput = document.getElementById('comite-user');
  const passInput = document.getElementById('comite-pass');
  const errorEl = document.getElementById('comite-error');

  if (!loginBtn || !userInput || !passInput || !errorEl) return;

  // Função para fazer login
  const performLogin = async () => {
    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
      errorEl.textContent = 'Preencha usuário e senha.';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Acessando...';

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      // Salvar token no localStorage
      localStorage.setItem('ssp-token', data.token);
      localStorage.setItem('ssp-user', JSON.stringify(data.user));

      // Redirecionar para página do comitê
      window.location.href = 'pages/comdex.html';
    } catch (error) {
      errorEl.textContent = error.message;
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Acessar';
    }
  };

  // Event listener para o botão
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await performLogin();
  });

  // Event listener para tecla Enter nos campos de input
  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performLogin();
    }
  };

  userInput.addEventListener('keydown', handleEnterKey);
  passInput.addEventListener('keydown', handleEnterKey);
}

/* =========================================================
   Carregar Notícias Dinâmicas (conexão com back-end)
   ========================================================= */
async function loadNews() {
  const newsTrack = document.getElementById('news-track');
  if (!newsTrack) return;

  try {
    const response = await fetch('/api/communications');
    if (!response.ok) throw new Error('Erro ao carregar notícias');
    const news = await response.json();

    if (news.length === 0) return; // Manter estáticas se vazio

    // Limpar notícias estáticas e adicionar dinâmicas
    newsTrack.innerHTML = '';
    news.forEach(item => {
      const article = document.createElement('article');
      article.className = 'card-noticia';
      article.setAttribute('data-category', item.category || 'geral');
      article.innerHTML = `
        <div class="card-media">
          <img src="${item.image || '../img/imagem1.webp'}" alt="${item.title || 'Notícia'}">
        </div>
        <div class="card-content">
          <h3>${item.title || 'Título'}</h3>
          <p>${item.description || 'Descrição'}</p>
        </div>
      `;
      newsTrack.appendChild(article);
    });

    // Re-inicializar slider se necessário
    initInfiniteLoopSlider();
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
  }
}

/* =========================================================
   Newsletter Form (placeholder)
   ========================================================= */
function initNewsletterForm() {
  // Placeholder para futura implementação
  // const form = document.querySelector('.newsletter-form');
  // if (!form) return;
  // form.addEventListener('submit', ...);
}

/* =========================================================
   Denúncia Form (envio via API)
   ========================================================= */
function initDenunciaForm() {
  const form = document.querySelector('form[name="denuncia"]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Coletar dados do formulário
      const denunciaData = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        camera: document.getElementById('camera-selecionada').value || 'Não especificada'
      };

      // Verificar se há arquivo (por enquanto não suportado)
      const arquivoInput = document.getElementById('arquivo');
      if (arquivoInput.files[0]) {
        alert('Upload de arquivos ainda não está disponível. A denúncia será enviada sem anexo.');
      }

      // Enviar para API
      const response = await fetch('/api/denuncias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(denunciaData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro no envio' }));
        throw new Error(error.error || 'Erro ao enviar denúncia');
      }

      const result = await response.json();

      // Sucesso
      alert('Denúncia enviada com sucesso! ID: ' + result.id);

      // Limpar formulário
      form.reset();
      document.getElementById('cam-selecionada-label').textContent = 'nenhuma';

      // Desmarcar câmera selecionada
      document.querySelectorAll('.cam-btn--active').forEach(btn => {
        btn.classList.remove('cam-btn--active');
        btn.setAttribute('aria-pressed', 'false');
      });

    } catch (error) {
      alert('Erro ao enviar denúncia: ' + error.message);
    } finally {
      // Reabilitar botão
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
