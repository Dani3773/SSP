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
    const response = await fetch('/api/cameras');
    if (!response.ok) throw new Error('Erro ao carregar câmeras');
    
    const cameras = await response.json();

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
    // Carregar denúncias e câmeras em paralelo
    const [denunciasResponse, camerasResponse] = await Promise.all([
      fetch('/api/denuncias'),
      fetch('/api/cameras')
    ]);

    if (!denunciasResponse.ok || !camerasResponse.ok) {
      throw new Error('Erro ao carregar dados');
    }

    const denuncias = await denunciasResponse.json();
    const cameras = await camerasResponse.json();

    // 1. Total de ocorrências (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const denunciasRecentes = denuncias.filter(d => {
      const dataDenuncia = new Date(d.createdAt || d.dataOcorrencia);
      return dataDenuncia >= seteDiasAtras;
    });

    document.getElementById('total-ocorrencias').textContent = denunciasRecentes.length;

    // 2. Taxa de resolução
    const resolvidas = denuncias.filter(d => d.status === 'resolvido' || d.status === 'concluído').length;
    const taxaResolucao = denuncias.length > 0 ? Math.round((resolvidas / denuncias.length) * 100) : 0;
    document.getElementById('taxa-resolucao').textContent = taxaResolucao + '%';
    
    const resolucaoTrend = taxaResolucao >= 80 ? 'Excelente desempenho' : 
                          taxaResolucao >= 60 ? 'Em crescimento' : 'Melhorando';
    document.getElementById('resolucao-trend').textContent = resolucaoTrend;

    // 3. Tempo médio de resposta (simulado baseado em prioridade)
    const denunciasUrgentes = denuncias.filter(d => d.urgente || d.prioridade === 'alta');
    const tempoMedio = denunciasUrgentes.length > 5 ? '3min' : '5min';
    document.getElementById('tempo-resposta').textContent = tempoMedio;
    document.getElementById('tempo-trend').textContent = 
      denunciasUrgentes.length > 5 ? '12% mais rápido' : 'Dentro da meta';

    // 4. Total de câmeras
    document.getElementById('total-cameras').textContent = cameras.length;
    const camerasOnline = cameras.filter(c => c.status === 'online').length;
    document.getElementById('cameras-info').textContent = 
      `${camerasOnline} ativas de ${cameras.length}`;

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
    const bars = chartGrid.querySelectorAll('.chart-bar');

    bars.forEach((bar, index) => {
      const dados = dadosGrafico[index];
      const altura = (dados.valor / maxValor) * 100;
      
      bar.style.height = altura + '%';
      bar.querySelector('.bar-value').textContent = dados.valor;
      bar.querySelector('.bar-label').textContent = dados.dia;
      
      // Marcar o dia atual
      const hoje = new Date().getDay();
      const diaAtual = (hoje + 6) % 7; // Ajustar para começar na segunda
      if (index === diaAtual) {
        bar.classList.add('chart-bar--active');
      } else {
        bar.classList.remove('chart-bar--active');
      }
    });

  } catch (error) {
    console.error('Erro ao carregar análises:', error);
    // Manter valores padrão em caso de erro
  }
}
