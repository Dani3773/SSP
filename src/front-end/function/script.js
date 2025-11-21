/* =========================================================
   SSP - Front Script (UI Geral)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initLucideIcons();
  initLoginModal();         
  initPasswordToggle();     
  initInfiniteLoopSlider(); 
  loadCameras();            // Carregar câmeras do banco
  initNewsletterForm();     
  initComiteLogin();        
  initDenunciaForm();       
  loadNews();
  initMenuToggle();
  loadAnalytics();          // Carregar análises
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
   Menu Toggle (mobile)
   ========================================================= */
function initMenuToggle() {
  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  const nav = document.getElementById('primary-nav');
  if (!button) return;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    if (menu) menu.classList.toggle('open');
    if (nav) nav.classList.toggle('open');
  });
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
   Carregar Câmeras do Banco de Dados
   ========================================================= */
async function loadCameras() {
  const cameraSection = document.querySelector('.cam');
  if (!cameraSection) return;

  try {
    // Buscar câmeras e denúncias em paralelo para popular estatísticas do mapa
    const [camerasResp, denunciasResp] = await Promise.all([
      fetch('/api/cameras'),
      fetch('/api/denuncias').catch(() => ({ ok: false }))
    ]);

    if (!camerasResp.ok) throw new Error('Erro ao carregar câmeras');

    const cameras = await camerasResp.json();
    let denuncias = [];
    if (denunciasResp && denunciasResp.ok) {
      try { denuncias = await denunciasResp.json(); } catch (e) { denuncias = []; }
    }

    if (cameras.length === 0) {
      cameraSection.innerHTML = '<p style="text-align: center; color: #6b7280;">Nenhuma câmera disponível no momento.</p>';
      return;
    }

    // Limpar seção e adicionar câmeras dinâmicas
    cameraSection.innerHTML = '';
    
    cameras.forEach(camera => {
      // Determinar status e ícone
      let statusClass = '';
      let statusText = 'Online';
      let iconName = 'video';
      let updateText = 'Câmera ativa';

      if (camera.status === 'offline') {
        statusClass = 'cam-status--offline';
        statusText = 'Offline';
        iconName = 'wifi-off';
        updateText = 'Sem sinal';
      } else if (camera.status === 'maintenance') {
        statusClass = 'cam-status--warning';
        statusText = 'Manutenção';
        iconName = 'alert-octagon';
        updateText = 'Em manutenção';
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cam-btn';
      button.setAttribute('data-camera', camera.name);
      button.setAttribute('data-status', camera.status || 'online');
      button.setAttribute('data-region', camera.location);
      button.setAttribute('data-updated', updateText);
      
      button.innerHTML = `
        <div class="cam-btn__top">
          <i data-lucide="${iconName}"></i>
          <span class="cam-status ${statusClass}">${statusText}</span>
        </div>
        <h3>${camera.name}</h3>
        <p>${camera.location}</p>
        <small>${updateText}</small>
      `;
      
      cameraSection.appendChild(button);
    });

    // Re-inicializar ícones Lucide
    initLucideIcons();

    // Inicializar seletor de câmera após carregar
    initCameraSelector();

    // Atualizar preview do mapa com dados reais (remoção de "fake")
    try {
      const mapPreview = document.getElementById('map-preview');
      const mapBadge = document.getElementById('map-badge');
      if (mapPreview) {
        // limpar
        while (mapPreview.firstChild) mapPreview.removeChild(mapPreview.firstChild);
        if (cameras.length > 0) {
          const onlineCount = cameras.filter(c => c.status === 'online').length;
          if (mapBadge) mapBadge.textContent = `${onlineCount} online`;
          const rep = cameras.find(c => c.status === 'online') || cameras[0];
          const wrap = document.createElement('div');
          wrap.className = 'map-thumb';
          const title = document.createElement('h4');
          title.textContent = rep.name || 'Câmera';
          const loc = document.createElement('p');
          loc.textContent = rep.location || '';
          const small = document.createElement('small');
          small.textContent = `Status: ${rep.status || 'desconhecido'}`;
          wrap.appendChild(title);
          wrap.appendChild(loc);
          wrap.appendChild(small);
          mapPreview.appendChild(wrap);
        } else {
          if (mapBadge) mapBadge.textContent = 'Nenhuma câmera';
          const p = document.createElement('p');
          p.textContent = 'Nenhuma câmera disponível';
          mapPreview.appendChild(p);
        }
      }
      // Preencher indicadores do mapa na homepage, quando existirem
      try {
        const mapSyncEl = document.getElementById('map-sync');
        const mapCoverageEl = document.getElementById('map-coverage');
        const mapAlertsEl = document.getElementById('map-alerts');
        const mapPatrolsEl = document.getElementById('map-patrols');

        if (mapSyncEl) mapSyncEl.textContent = `Última sincr.: ${new Date().toLocaleString('pt-BR')}`;
        if (mapCoverageEl) mapCoverageEl.textContent = String(cameras.length || 0);

        // Calcular alertas (últimas 24h ou urgente/alta prioridade)
        let alertsCount = 0;
        if (Array.isArray(denuncias) && denuncias.length) {
          const since24 = new Date(Date.now() - 24 * 3600 * 1000);
          alertsCount = denuncias.filter(d => {
            try {
              const created = new Date(d.createdAt || d.dataOcorrencia);
              return d.urgente || d.prioridade === 'alta' || created >= since24;
            } catch (e) { return false; }
          }).length;
        }
        if (mapAlertsEl) mapAlertsEl.textContent = String(alertsCount);

        // Tentativa de inferir número de patrulhas envolvidas (se presente nos dados)
        let patrolsCount = '—';
        if (Array.isArray(denuncias) && denuncias.length) {
          const patrolIds = new Set(denuncias.map(d => d.patrulha || d.patrol || d.patrolId || d.responsavel).filter(Boolean));
          patrolsCount = patrolIds.size || 0;
        }
        if (mapPatrolsEl) mapPatrolsEl.textContent = String(patrolsCount);
      } catch (e) {
        console.warn('Não foi possível preencher indicadores do mapa:', e);
      }
    } catch (e) { console.warn('Não foi possível atualizar preview do mapa', e); }

  } catch (error) {
    console.error('Erro ao carregar câmeras:', error);
    cameraSection.innerHTML = '<p style="text-align: center; color: #ef4444;">Erro ao carregar câmeras. Tente novamente mais tarde.</p>';
  }
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

      // Redirecionar para página do comitê (caminho adaptativo para funcionar em páginas locais e index)
      try {
        const path = window.location && window.location.pathname ? window.location.pathname : '';
        if (path.includes('/pages/')) {
          // Already in pages/ folder, use relative routing
          window.location.href = 'comdex.html';
        } else {
          window.location.href = '/pages/comdex.html';
        }
      } catch (e) {
        window.location.href = '/pages/comdex.html';
      }
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
    const origin = (window.location && window.location.origin) ? window.location.origin : '';
    news.forEach(item => {
      const article = document.createElement('article');
      article.className = 'card-noticia';
      article.setAttribute('data-category', item.category || 'geral');
      // Resolve image: if server path, prefix with origin
      let img = item.image || '../img/imagem1.webp';
      try {
        if (typeof img === 'string' && img.startsWith('/api/communications')) {
          img = origin ? origin + img : '../img/imagem1.webp';
        }
      } catch (e) { img = item.image || '../img/imagem1.webp'; }

      // make headline a link to the full news page with anchor (so Comitê-created items open there)
      const newsLink = `pages/noticias.html#news-${encodeURIComponent(String(item.id || ''))}`;

      article.innerHTML = `
        <a class="card-noticia-link" href="${newsLink}">
          <div class="card-media">
            <img src="${img}" alt="${item.title || 'Notícia'}">
          </div>
          <div class="card-content">
            <h3>${item.title || 'Título'}</h3>
            <p>${(item.description || '').slice(0, 140)}</p>
          </div>
        </a>
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

  // Auto-preencher data e hora atuais
  const dataInput = document.getElementById('data');
  const horaInput = document.getElementById('hora');
  
  if (dataInput && !dataInput.value) {
    const hoje = new Date();
    dataInput.value = hoje.toISOString().split('T')[0];
  }
  
  if (horaInput && !horaInput.value) {
    const agora = new Date();
    horaInput.value = agora.toTimeString().slice(0, 5);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Validar campos obrigatórios
    const titulo = document.getElementById('titulo').value.trim();
    const tipo = document.getElementById('tipo').value;
    const gravidade = document.getElementById('gravidade').value;
    const camera = document.getElementById('camera-selecionada').value;

    if (!titulo) {
      alert('❌ Por favor, preencha o título da denúncia.');
      document.getElementById('titulo').focus();
      return;
    }

    if (!tipo) {
      alert('❌ Por favor, selecione o tipo de ocorrência.');
      document.getElementById('tipo').focus();
      return;
    }

    if (!gravidade) {
      alert('❌ Por favor, selecione a gravidade do caso.');
      document.getElementById('gravidade').focus();
      return;
    }

    if (!camera) {
      alert('❌ Por favor, selecione uma câmera antes de enviar a denúncia.');
      document.querySelector('.cam')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Coletar dados do formulário
      const denunciaData = {
        titulo: titulo,
        tipoOcorrencia: tipo,
        dataOcorrencia: document.getElementById('data').value,
        horaOcorrencia: document.getElementById('hora').value,
        localizacao: document.getElementById('localizacao').value,
        descricao: document.getElementById('descricao').value,
        suspeitos: document.getElementById('suspeitos').value || 'Não informado',
        camera: camera,
        tipo: 'externo',
        origem: 'web',
        prioridade: gravidade,
        urgente: gravidade === 'alta'
      };

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
      alert(`✅ Denúncia enviada com sucesso!\n\nProtocolo: ${result.id}\n\nAguarde contato da equipe de segurança.`);

      // Limpar formulário
      form.reset();
      document.getElementById('cam-selecionada-label').textContent = 'nenhuma';

      // Restaurar data e hora atuais
      if (dataInput) {
        const hoje = new Date();
        dataInput.value = hoje.toISOString().split('T')[0];
      }
      
      if (horaInput) {
        const agora = new Date();
        horaInput.value = agora.toTimeString().slice(0, 5);
      }

      // Desmarcar câmera selecionada
      document.querySelectorAll('.cam-btn--active').forEach(btn => {
        btn.classList.remove('cam-btn--active');
        btn.setAttribute('aria-pressed', 'false');
      });

    } catch (error) {
      alert('❌ Erro ao enviar denúncia: ' + error.message);
    } finally {
      // Reabilitar botão
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/* =========================================================
   Carregar Análises com Dados Reais
   ========================================================= */
async function loadAnalytics() {
  try {
    // Preferir rota analítica consolidada (mais completa)
    let stats = null;
    try {
      const res = await fetch('/api/analyses/stats');
      if (res.ok) {
        stats = await res.json();
      }
    } catch (e) {
      // ignorar: fallback abaixo continuará a funcionar
      console.warn('Não foi possível obter /api/analyses/stats:', e.message);
    }

    // Se rota consolidada não disponível, obter recursos separadamente
    let denuncias = [];
    let cameras = [];
    if (stats) {
      denuncias = stats.listaDenuncias || [];
      cameras = stats.listaCameras || [];
    } else {
      // Buscar denúncias e câmeras em paralelo
      const [denunciasResponse, camerasResponse] = await Promise.all([
        fetch('/api/denuncias'),
        fetch('/api/cameras')
      ]);

      if (!denunciasResponse.ok || !camerasResponse.ok) {
        throw new Error('Erro ao carregar dados');
      }

      denuncias = await denunciasResponse.json();
      cameras = await camerasResponse.json();
    }

    // 1. Total de ocorrências (últimos 7 dias) - usar stats se disponível
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const denunciasRecentes = denuncias.filter(d => (new Date(d.createdAt || d.dataOcorrencia) >= seteDiasAtras));
    const elTotalOcorrencias = document.getElementById('total-ocorrencias');
    if (elTotalOcorrencias) {
      elTotalOcorrencias.textContent = (stats && stats.denuncias && typeof stats.denuncias.semana !== 'undefined') ? stats.denuncias.semana : denunciasRecentes.length;
    }

    // 2. Taxa de resolução
    const resolvidas = denuncias.filter(d => d.status === 'resolvido' || d.status === 'concluído' || d.status === 'resolvida').length;
    const taxaResolucao = stats && typeof stats.taxaResolucao !== 'undefined' ? stats.taxaResolucao : (denuncias.length > 0 ? Math.round((resolvidas / denuncias.length) * 100) : 0);
    const elTaxaResolucao = document.getElementById('taxa-resolucao');
    if (elTaxaResolucao) elTaxaResolucao.textContent = taxaResolucao + '%';
    
    const resolucaoTrend = taxaResolucao >= 80 ? 'Excelente desempenho' : 
                taxaResolucao >= 60 ? 'Em crescimento' : 'Melhorando';
    const elResolucaoTrend = document.getElementById('resolucao-trend');
    if (elResolucaoTrend) elResolucaoTrend.textContent = resolucaoTrend;

    // 3. Tempo médio de resposta (simulado baseado em prioridade)
    const tempoMedio = stats && typeof stats.tempoMedioResposta !== 'undefined' ? stats.tempoMedioResposta : (denuncias.filter(d => d.urgente || d.prioridade === 'alta').length > 5 ? '3min' : '5min');
    const elTempoResposta = document.getElementById('tempo-resposta');
    if (elTempoResposta) elTempoResposta.textContent = tempoMedio;
    const elTempoTrend = document.getElementById('tempo-trend');
    if (elTempoTrend) elTempoTrend.textContent = stats && stats.tempoMedioResposta ? 'Baseado em dados' : (denuncias.filter(d => d.urgente || d.prioridade === 'alta').length > 5 ? '12% mais rápido' : 'Dentro da meta');

    // 4. Total de câmeras
    // Total de câmeras
    const elTotalCameras = document.getElementById('total-cameras');
    if (elTotalCameras) elTotalCameras.textContent = stats && stats.cameras ? (stats.cameras.total || cameras.length) : cameras.length;
    const camerasOnline = stats && stats.cameras && typeof stats.cameras.online !== 'undefined' ? stats.cameras.online : cameras.filter(c => c.status === 'online').length;
    const elCamerasInfo = document.getElementById('cameras-info');
    if (elCamerasInfo) elCamerasInfo.textContent = `${camerasOnline} ativas de ${stats && stats.cameras ? (stats.cameras.total || cameras.length) : cameras.length}`;

    // 5. Gráfico de barras (últimos 7 dias)
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const contagemPorDia = new Array(7).fill(0);
    denunciasRecentes.forEach(d => {
      const data = new Date(d.createdAt || d.dataOcorrencia);
      const diaSemana = data.getDay();
      contagemPorDia[diaSemana]++;
    });

    // Reorganizar para começar na segunda-feira
    const dadosGrafico = [
      { dia: 'Seg', valor: contagemPorDia[1] },
      { dia: 'Ter', valor: contagemPorDia[2] },
      { dia: 'Qua', valor: contagemPorDia[3] },
      { dia: 'Qui', valor: contagemPorDia[4] },
      { dia: 'Sex', valor: contagemPorDia[5] },
      { dia: 'Sáb', valor: contagemPorDia[6] },
      { dia: 'Dom', valor: contagemPorDia[0] }
    ];

    const maxValor = Math.max(...dadosGrafico.map(d => d.valor), 1);
    const chartGrid = document.getElementById('chart-grid');
    if (chartGrid) {
      const bars = chartGrid.querySelectorAll('.chart-bar');
      bars.forEach((bar, index) => {
        const dados = dadosGrafico[index];
        const altura = (dados.valor / maxValor) * 100;
        bar.style.height = altura + '%';
        const barValue = bar.querySelector('.bar-value');
        if (barValue) barValue.textContent = dados.valor;
        const barLabel = bar.querySelector('.bar-label');
        if (barLabel) barLabel.textContent = dados.dia;
        const hoje = new Date().getDay();
        const diaAtual = (hoje + 6) % 7; // Ajustar para começar na segunda
        if (index === diaAtual) {
          bar.classList.add('chart-bar--active');
        } else {
          bar.classList.remove('chart-bar--active');
        }
      });
    }

    // Atualizar badge de última atualização se disponível
    if (stats && stats.ultimaAtualizacao) {
      const badge = document.querySelector('.analises-badge');
      if (badge) {
        const date = new Date(stats.ultimaAtualizacao);
        badge.innerHTML = `<i data-lucide="refresh-cw" aria-hidden="true"></i> Atualizado em ${date.toLocaleString('pt-BR')}`;
        initLucideIcons();
      }
    }
  } catch (error) {
    console.error('Erro ao carregar análises:', error);
    // Manter valores padrão em caso de erro
  }
}
