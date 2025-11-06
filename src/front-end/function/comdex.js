// ==============================
// Helper para requests autenticados
// ==============================
async function apiRequest(endpoint, options = {}) {
  // Tentar API real primeiro (sem autenticação por enquanto para teste)
  try {
    const token = localStorage.getItem('ssp-token');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const response = await fetch(`http://localhost:3000/api${endpoint}`, { ...defaultOptions, ...options });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro na requisição' }));
      throw new Error(error.error || `Erro ${response.status}`);
    }

    return response.json();
  } catch (fetchError) {
    console.warn('API real não disponível, usando dados mock:', fetchError.message);

    // Fallback para dados mock
    if (endpoint === '/communications' && options.method === 'GET') {
      return getMockNews();
    }
    if (endpoint.startsWith('/communications/') && !options.method) {
      const id = endpoint.split('/')[2];
      return getMockNewsById(id);
    }
    if (endpoint === '/communications' && options.method === 'POST') {
      return saveMockNews(JSON.parse(options.body));
    }
    if (endpoint.startsWith('/communications/') && options.method === 'PUT') {
      const id = endpoint.split('/')[2];
      return updateMockNews(id, JSON.parse(options.body));
    }
    if (endpoint.startsWith('/communications/') && options.method === 'DELETE') {
      const id = endpoint.split('/')[2];
      return deleteMockNews(id);
    }

    // Mock para usuários
    if (endpoint === '/users' && options.method === 'GET') {
      return getMockUsers();
    }
    if (endpoint.startsWith('/users/') && !options.method) {
      const id = endpoint.split('/')[2];
      return getMockUserById(id);
    }
    if (endpoint === '/users' && options.method === 'POST') {
      return saveMockUser(JSON.parse(options.body));
    }
    if (endpoint.startsWith('/users/') && options.method === 'PUT') {
      const id = endpoint.split('/')[2];
      return updateMockUser(id, JSON.parse(options.body));
    }
    if (endpoint.startsWith('/users/') && options.method === 'DELETE') {
      const id = endpoint.split('/')[2];
      return deleteMockUser(id);
    }

    throw new Error('Servidor não disponível. Usando dados de teste.');
  }
}

// ==============================
// Mock Data Functions with localStorage persistence
// ==============================
let mockNewsData = [];

// Initialize mock data from localStorage or defaults
function initializeMockData() {
  const stored = localStorage.getItem('ssp-mock-news');
  if (stored) {
    try {
      mockNewsData = JSON.parse(stored);
    } catch (e) {
      console.warn('Erro ao carregar dados mock do localStorage:', e);
      mockNewsData = getDefaultMockNews();
    }
  } else {
    mockNewsData = getDefaultMockNews();
    saveMockDataToStorage();
  }
}

function getDefaultMockNews() {
  return [
    {
      id: 1,
      title: "Nova câmera instalada no centro",
      description: "Foi instalada uma nova câmera de segurança na Praça Central, aumentando a cobertura de monitoramento da área.",
      image: "https://via.placeholder.com/300x200",
      category: "noticia",
      status: "published",
      date: "2025-11-06T10:00:00.000Z",
      createdAt: "2025-11-06T10:00:00.000Z"
    },
    {
      id: 2,
      title: "Sistema de denúncias online ativo",
      description: "O novo sistema de denúncias online está funcionando e permite que cidadãos reportem ocorrências diretamente pelo site.",
      image: "",
      category: "noticia",
      status: "published",
      date: "2025-11-05T14:30:00.000Z",
      createdAt: "2025-11-05T14:30:00.000Z"
    }
  ];
}

function saveMockDataToStorage() {
  try {
    localStorage.setItem('ssp-mock-news', JSON.stringify(mockNewsData));
  } catch (e) {
    console.warn('Erro ao salvar dados mock no localStorage:', e);
  }
}

function getMockNews() {
  return [...mockNewsData];
}

function getMockNewsById(id) {
  const news = mockNewsData.find(n => n.id == id);
  if (!news) {
    throw new Error('Notícia não encontrada');
  }
  return { ...news };
}

function saveMockNews(newsData) {
  const newId = Math.max(...mockNewsData.map(n => n.id), 0) + 1;
  const newNews = {
    ...newsData,
    id: newId,
    createdAt: new Date().toISOString(),
    date: newsData.date || new Date().toISOString()
  };
  mockNewsData.push(newNews);
  saveMockDataToStorage();
  return newNews;
}

function updateMockNews(id, updateData) {
  const index = mockNewsData.findIndex(n => n.id == id);
  if (index === -1) {
    throw new Error('Notícia não encontrada');
  }
  mockNewsData[index] = { ...mockNewsData[index], ...updateData };
  saveMockDataToStorage();
  return mockNewsData[index];
}

function deleteMockNews(id) {
  const index = mockNewsData.findIndex(n => n.id == id);
  if (index === -1) {
    throw new Error('Notícia não encontrada');
  }
  mockNewsData.splice(index, 1);
  saveMockDataToStorage();
  return { success: true };
}

// ==============================
// Mock Data Functions for Users
// ==============================
let mockUsersData = [];

function getMockUsers() {
  if (mockUsersData.length === 0) {
    mockUsersData = [
      {
        id: 1,
        username: "admin",
        name: "Administrador do Sistema",
        email: "admin@ssp.gov",
        role: "admin",
        createdAt: "2025-11-01T10:00:00.000Z"
      },
      {
        id: 2,
        username: "supervisor",
        name: "Supervisor Silva",
        email: "supervisor@ssp.gov",
        role: "supervisor",
        createdAt: "2025-11-02T14:30:00.000Z"
      }
    ];
  }
  return [...mockUsersData];
}

function getMockUserById(id) {
  const user = mockUsersData.find(u => u.id == id);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  return { ...user };
}

function saveMockUser(userData) {
  const newId = Math.max(...mockUsersData.map(u => u.id), 0) + 1;
  const newUser = {
    ...userData,
    id: newId,
    createdAt: new Date().toISOString()
  };
  mockUsersData.push(newUser);
  return newUser;
}

function updateMockUser(id, updateData) {
  const index = mockUsersData.findIndex(u => u.id == id);
  if (index === -1) {
    throw new Error('Usuário não encontrado');
  }
  mockUsersData[index] = { ...mockUsersData[index], ...updateData, updatedAt: new Date().toISOString() };
  return mockUsersData[index];
}

function deleteMockUser(id) {
  const index = mockUsersData.findIndex(u => u.id == id);
  if (index === -1) {
    throw new Error('Usuário não encontrado');
  }
  mockUsersData.splice(index, 1);
  return { success: true };
}

// ==============================
// Permission Control Functions
// ==============================
function getCurrentUser() {
  const token = localStorage.getItem('ssp-token');
  if (!token) return null;
  
  try {
    // Decodificar JWT (simples, sem validação completa)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    console.warn('Erro ao decodificar token:', e);
    return null;
  }
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

function checkPermissions() {
  const userCard = document.querySelector('.card-users');
  const userSection = document.getElementById('section-usuarios');
  
  if (!isAdmin()) {
    // Ocultar card de usuários para não-admins
    if (userCard) {
      userCard.style.display = 'none';
    }
    // Ocultar seção de usuários se estiver aberta
    if (userSection) {
      userSection.style.display = 'none';
    }
  } else {
    // Mostrar para admins
    if (userCard) {
      userCard.style.display = 'block';
    }
  }
}

// ==============================
// Section Navigation (Toggle)
// ==============================
function toggleSection(sectionName) {
  const section = document.getElementById(`section-${sectionName}`);
  const allCards = document.querySelectorAll('.quick-card');
  const clickedCard = event.currentTarget;
  
  // Verificar permissões para seção de usuários
  if (sectionName === 'usuarios' && !isAdmin()) {
    showNotification('Acesso negado: apenas administradores podem gerenciar usuários', 'error');
    return;
  }
  
  // Se a seção já está aberta, fecha
  if (section.classList.contains('active')) {
    section.classList.remove('active');
    clickedCard.classList.remove('active');
  } else {
    // Fecha todas as outras seções
    document.querySelectorAll('.management-section').forEach(s => {
      s.classList.remove('active');
    });
    
    // Remove active de todos os cards
    allCards.forEach(card => {
      card.classList.remove('active');
    });
    
    // Abre a seção clicada
    section.classList.add('active');
    clickedCard.classList.add('active');
    
    // Carrega dados específicos da seção
    loadSectionData(sectionName);
    
    // Scroll suave até a seção
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function loadSectionData(sectionName) {
  switch(sectionName) {
    case 'noticias':
      loadNews(true); // true = modo silencioso
      break;
    case 'analises':
      loadAnalysis(true); // true = modo silencioso
      break;
    case 'cameras':
      loadCameras(true); // true = modo silencioso
      break;
    case 'denuncias':
      loadDenunciasTable(true); // true = modo silencioso
      break;
    case 'usuarios':
      loadUsers(true); // true = modo silencioso
      break;
  }
}

// ==============================
// Modal Functions
// ==============================
function openModal(type, data = null) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  overlay.classList.add('active');
  modal.classList.add('active');
  
  // Define conteúdo do modal baseado no tipo
  switch(type) {
    case 'add-noticia':
      modalTitle.textContent = 'Adicionar Nova Notícia';
      modalBody.innerHTML = getNewsForm();
      showNotification('Criando nova notícia...', 'info');
      break;
    case 'edit-noticia':
      modalTitle.textContent = 'Editar Notícia';
      modalBody.innerHTML = getNewsForm(data);
      break;
    case 'view-noticia':
      modalTitle.textContent = 'Visualizar Notícia';
      modalBody.innerHTML = getNewsView(data);
      break;
    case 'add-analise':
      modalTitle.textContent = 'Adicionar Nova Análise';
      modalBody.innerHTML = getAnalysisForm();
      showNotification('Criando nova análise...', 'info');
      break;
    case 'view-analysis':
      modalTitle.textContent = 'Visualizar Análise';
      modalBody.innerHTML = getAnalysisView(data);
      break;
    case 'edit-analysis':
      modalTitle.textContent = 'Editar Análise';
      modalBody.innerHTML = getAnalysisForm(data);
      break;
    case 'add-camera':
      modalTitle.textContent = 'Adicionar Nova Câmera';
      modalBody.innerHTML = getCameraForm();
      showNotification('Adicionando nova câmera...', 'info');
      break;
    case 'edit-camera':
      modalTitle.textContent = 'Editar Câmera';
      modalBody.innerHTML = getCameraForm(data);
      break;
    case 'view-camera':
      modalTitle.textContent = 'Visualizar Câmera';
      modalBody.innerHTML = getCameraView(data);
      break;
    case 'add-denuncia':
      modalTitle.textContent = 'Criar Nova Denúncia';
      modalBody.innerHTML = getDenunciaForm();
      showNotification('Criando nova denúncia...', 'info');
      break;
    case 'edit-usuario':
      modalTitle.textContent = 'Editar Usuário';
      modalBody.innerHTML = getUserForm(data);
      break;
    case 'view-usuario':
      modalTitle.textContent = 'Visualizar Usuário';
      modalBody.innerHTML = getUserView(data);
      break;
    default:
      modalBody.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> Tipo de formulário não reconhecido. Contate o administrador do sistema.</p>';
      console.error('Tipo de modal não reconhecido:', type);
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal-container');
  
  overlay.classList.remove('active');
  modal.classList.remove('active');
  
  // Limpar mapa da câmera se estiver aberto
  if (cameraMap) {
    cameraMap.remove();
    cameraMap = null;
    cameraMarker = null;
  }
}

// ==============================
// Form Templates
// ==============================
function getNewsForm(existingData = null) {
  const isEdit = existingData !== null;
  const data = existingData || {};
  
  return `
    <form onsubmit="handleNewsSubmit(event)" class="admin-form" data-edit="${isEdit}" ${isEdit ? `data-news-id="${data.id}"` : ''}>
      <div class="form-group">
        <label for="news-title">Título da Notícia</label>
        <input type="text" id="news-title" required class="form-input" value="${data.title || ''}">
      </div>
      <div class="form-group">
        <label for="news-content">Conteúdo</label>
        <textarea id="news-content" rows="6" required class="form-input">${data.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="news-image">URL da Imagem</label>
        <input type="url" id="news-image" class="form-input" value="${data.image || ''}">
      </div>
      <div class="form-group">
        <label for="news-status">Status</label>
        <select id="news-status" class="form-input">
          <option value="published" ${data.status === 'published' ? 'selected' : ''}>Publicada</option>
          <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Rascunho</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getAnalysisForm(existingData = null) {
  const isEdit = existingData !== null;
  const data = existingData || {};
  
  return `
    <form onsubmit="handleAnalysisSubmit(event)" class="admin-form" data-edit="${isEdit}" ${isEdit ? `data-analysis-id="${data.id}"` : ''}>
      <div class="form-group">
        <label for="analysis-type">Tipo de Análise</label>
        <input type="text" id="analysis-type" required class="form-input" value="${data.type || ''}" placeholder="Ex: Relatório Mensal, Comparativo Anual">
      </div>
      <div class="form-group">
        <label for="analysis-period">Período</label>
        <input type="text" id="analysis-period" required class="form-input" value="${data.period || ''}" placeholder="Ex: Outubro 2025, 2024 vs 2025">
      </div>
      <div class="form-group">
        <label for="analysis-data">Dados (JSON)</label>
        <textarea id="analysis-data" rows="8" required class="form-input" placeholder="Cole aqui os dados em formato JSON">${data.data || ''}</textarea>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getCameraForm(existingData = null) {
  const isEdit = existingData !== null;
  const data = existingData || {};
  
  return `
    <form onsubmit="handleCameraSubmit(event)" class="admin-form" data-edit="${isEdit}" ${isEdit ? `data-camera-id="${data.id}"` : ''}>
      <div class="form-group">
        <label for="camera-name">Nome da Câmera</label>
        <input type="text" id="camera-name" required class="form-input" value="${data.name || ''}">
      </div>
      <div class="form-group">
        <label for="camera-location">Localização</label>
        <input type="text" id="camera-location" required class="form-input" value="${data.location || ''}">
      </div>
      <div class="form-group">
        <label for="camera-stream">URL do Stream RTSP</label>
        <input type="url" id="camera-stream" class="form-input" value="${data.streamUrl || ''}" placeholder="rtsp://... (opcional)">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="camera-lat">Latitude</label>
          <input type="number" id="camera-lat" step="0.000001" class="form-input" value="${data.latitude || ''}" placeholder="-29.1911">
        </div>
        <div class="form-group">
          <label for="camera-lng">Longitude</label>
          <input type="number" id="camera-lng" step="0.000001" class="form-input" value="${data.longitude || ''}" placeholder="-49.6400">
        </div>
      </div>
      <div class="form-group">
        <label>Selecionar Localização no Mapa</label>
        <button type="button" id="toggle-map-btn" class="btn-secondary" onclick="toggleMapSelection()">
          <i class="fas fa-map-marker-alt"></i> ${data.latitude && data.longitude ? 'Alterar Localização' : 'Selecionar no Mapa'}
        </button>
        <div id="camera-map-container" class="camera-map-container" style="display: none;">
          <div id="camera-map" class="camera-map"></div>
          <p class="map-instruction">Clique no mapa para definir a localização da câmera</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="camera-type">Tipo</label>
          <select id="camera-type" class="form-input">
            <option value="PTZ" ${data.type === 'PTZ' ? 'selected' : ''}>PTZ (Pan-Tilt-Zoom)</option>
            <option value="Dome" ${data.type === 'Dome' ? 'selected' : ''}>Dome</option>
            <option value="Bullet" ${data.type === 'Bullet' ? 'selected' : ''}>Bullet</option>
            <option value="Fixed" ${data.type === 'Fixed' ? 'selected' : ''}>Fixa</option>
          </select>
        </div>
        <div class="form-group">
          <label for="camera-resolution">Resolução</label>
          <select id="camera-resolution" class="form-input">
            <option value="4K" ${data.resolution === '4K' ? 'selected' : ''}>4K</option>
            <option value="1080p" ${data.resolution === '1080p' ? 'selected' : ''}>1080p Full HD</option>
            <option value="720p" ${data.resolution === '720p' ? 'selected' : ''}>720p HD</option>
            <option value="480p" ${data.resolution === '480p' ? 'selected' : ''}>480p</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="camera-status">Status</label>
        <select id="camera-status" class="form-input">
          <option value="online" ${data.status === 'online' ? 'selected' : ''}>Online</option>
          <option value="offline" ${data.status === 'offline' ? 'selected' : ''}>Offline</option>
          <option value="maintenance" ${data.status === 'maintenance' ? 'selected' : ''}>Manutenção</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getUserForm(existingData = null) {
  const isEdit = existingData !== null;
  const data = existingData || {};
  const currentUserIsAdmin = isAdmin();
  
  return `
    <form onsubmit="handleUserSubmit(event)" class="admin-form" data-edit="${isEdit}" ${isEdit ? `data-user-id="${data.id}"` : ''}>
      <div class="form-group">
        <label for="user-name">Nome Completo</label>
        <input type="text" id="user-name" required class="form-input" value="${data.name || ''}">
      </div>
      <div class="form-group">
        <label for="user-username">Nome de Usuário</label>
        <input type="text" id="user-username" required class="form-input" value="${data.username || ''}">
      </div>
      <div class="form-group">
        <label for="user-email">Email</label>
        <input type="email" id="user-email" required class="form-input" value="${data.email || ''}">
      </div>
      ${!isEdit ? `
      <div class="form-group">
        <label for="user-password">Senha</label>
        <input type="password" id="user-password" required class="form-input" placeholder="Digite a senha">
      </div>
      ` : `
      <div class="form-group">
        <label for="user-password">Nova Senha (deixe em branco para manter)</label>
        <input type="password" id="user-password" class="form-input" placeholder="Digite apenas se quiser alterar">
      </div>
      `}
      <div class="form-group">
        <label for="user-role">Cargo</label>
        <select id="user-role" class="form-input">
          ${currentUserIsAdmin ? '<option value="admin" ' + (data.role === 'admin' ? 'selected' : '') + '>Administrador</option>' : ''}
          <option value="supervisor" ${data.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getUserView(user) {
  return `
    <div class="user-view">
      <div class="view-field">
        <label class="view-label">Nome:</label>
        <div class="view-value">${user.name || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Nome de Usuário:</label>
        <div class="view-value">${user.username || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Email:</label>
        <div class="view-value">${user.email || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Cargo:</label>
        <div class="view-value"><span class="role-badge role-${getRoleClass(user.role)}">${getRoleText(user.role)}</span></div>
      </div>
      <div class="view-field">
        <label class="view-label">Data de Cadastro:</label>
        <div class="view-value">${formatDate(user.createdAt)}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Última Atualização:</label>
        <div class="view-value">${user.updatedAt ? formatDate(user.updatedAt) : 'Nunca'}</div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `;
}

function getDenunciaForm(existingData = null) {
  const isEdit = existingData !== null;
  const data = existingData || {};
  
  // Carregar opções de câmera após renderizar
  setTimeout(() => loadCameraOptionsForDenuncia(data.camera), 100);
  
  return `
    <form onsubmit="handleDenunciaSubmit(event)" class="admin-form" data-edit="${isEdit}" ${isEdit ? `data-denuncia-id="${data.id}"` : ''}>
      <div class="form-group">
        <label for="denuncia-titulo">Título da Denúncia</label>
        <input type="text" id="denuncia-titulo" required class="form-input" value="${data.titulo || ''}" placeholder="Ex: Atividade suspeita no centro">
      </div>
      <div class="form-group">
        <label for="denuncia-camera">Câmera Relacionada</label>
        <select id="denuncia-camera" class="form-input">
          <option value="Não especificada">Carregando câmeras...</option>
        </select>
      </div>
      <div class="form-group">
        <label for="denuncia-descricao">Descrição da Ocorrência</label>
        <textarea id="denuncia-descricao" rows="6" required class="form-input" placeholder="Descreva detalhadamente a ocorrência observada...">${data.descricao || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="denuncia-prioridade">Prioridade</label>
          <select id="denuncia-prioridade" class="form-input">
            <option value="baixa" ${data.prioridade === 'baixa' ? 'selected' : ''}>Baixa</option>
            <option value="media" ${data.prioridade === 'media' ? 'selected' : ''}>Média</option>
            <option value="alta" ${data.prioridade === 'alta' ? 'selected' : ''}>Alta</option>
          </select>
        </div>
        <div class="form-group">
          <label for="denuncia-status">Status Inicial</label>
          <select id="denuncia-status" class="form-input">
            <option value="pendente" ${data.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="analisando" ${data.status === 'analisando' ? 'selected' : ''}>Em Análise</option>
          </select>
        </div>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar Denúncia</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

// ==============================
// CRUD Operations - News (Complete)
// ==============================
async function loadNews(silent = false) {
  try {
    const news = await apiRequest('/communications');
    renderNewsTable(news);
    if (!silent) {
      showNotification(`${news.length} notícia${news.length !== 1 ? 's' : ''} carregada${news.length !== 1 ? 's' : ''} com sucesso!`, 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    showNotification('Erro ao carregar notícias: ' + error.message, 'error');
    // Fallback para dados vazios
    renderNewsTable([]);
  }
}

function renderNewsTable(news) {
  const tbody = document.getElementById('news-table-body');
  const countElement = document.getElementById('news-count');
  
  // Update news count
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-newspaper"></i> ${news.length} notícia${news.length !== 1 ? 's' : ''}`;
  }
  
  if (!news || news.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-newspaper" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
          Nenhuma notícia cadastrada ainda
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = news.map(item => `
    <tr>
      <td>${item.id || 'N/A'}</td>
      <td>${item.title || 'Sem título'}</td>
      <td>${formatDate(item.date || item.createdAt)}</td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${getStatusText(item.status)}</span></td>
      <td class="action-buttons-cell">
        <button class="btn-icon btn-view" onclick="viewNews(${item.id})" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon btn-edit" onclick="editNews(${item.id})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete" onclick="deleteNews(${item.id})" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function getStatusClass(status) {
  const statusMap = {
    'published': 'status-active',
    'draft': 'status-draft',
    'inactive': 'status-inactive'
  };
  return statusMap[status] || 'status-inactive';
}

async function viewNews(id) {
  try {
    const news = await apiRequest(`/communications/${id}`);
    openModal('view-noticia', news);
    showNotification(`Visualizando notícia "${news.title}" (ID: ${news.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar notícia: ' + error.message, 'error');
  }
}

async function editNews(id) {
  try {
    const news = await apiRequest(`/communications/${id}`);
    openModal('edit-noticia', news);
    showNotification(`Editando notícia "${news.title}" (ID: ${news.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar notícia: ' + error.message, 'error');
  }
}

async function deleteNews(id) {
  if (!confirm('Tem certeza que deseja excluir esta notícia?')) {
    return;
  }
  
  try {
    // Buscar o título da notícia antes de deletar
    const newsToDelete = mockNewsData.find(n => n.id === id);
    const title = newsToDelete ? newsToDelete.title : 'Notícia';
    
    await apiRequest(`/communications/${id}`, {
      method: 'DELETE'
    });
    
    showNotification(`Notícia "${title}" excluída com sucesso! (ID: ${id})`, 'success');
    setTimeout(() => loadNews(), 300);
  } catch (error) {
    showNotification('Erro ao excluir notícia: ' + error.message, 'error');
  }
}

async function updateNews(event) {
  event.preventDefault();
  
  const form = event.target;
  const newsId = form.dataset.newsId;
  const formData = {
    title: form.querySelector('#news-title').value,
    description: form.querySelector('#news-content').value,
    image: form.querySelector('#news-image').value,
    category: 'noticia',
    status: form.querySelector('#news-status').value
  };
  
  try {
    const updatedNews = await apiRequest(`/communications/${newsId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Notícia "${updatedNews.title}" atualizada com sucesso! (ID: ${updatedNews.id})`, 'success');
    closeModal();
    setTimeout(() => loadNews(), 300);
  } catch (error) {
    showNotification('Erro ao atualizar notícia: ' + error.message, 'error');
  }
}

async function saveNews(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = {
    title: form.querySelector('#news-title').value,
    description: form.querySelector('#news-content').value,
    image: form.querySelector('#news-image').value,
    category: 'noticia',
    status: form.querySelector('#news-status').value,
    date: new Date().toISOString()
  };
  
  try {
    const savedNews = await apiRequest('/communications', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Notícia "${savedNews.title}" salva com sucesso! (ID: ${savedNews.id})`, 'success');
    closeModal();
    setTimeout(() => loadNews(), 300);
  } catch (error) {
    showNotification('Erro ao salvar notícia: ' + error.message, 'error');
  }
}

async function handleNewsSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const isEdit = form.dataset.edit === 'true';
  
  if (isEdit) {
    await updateNews(event);
  } else {
    await saveNews(event);
  }
}

// ==============================
// Notification System
// ==============================
function showNotification(message, type = 'info') {
  // Remove notificações existentes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  // Cria nova notificação
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas ${getNotificationIcon(type)}"></i>
    <span>${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Adiciona ao DOM
  document.body.appendChild(notification);
  
  // Anima entrada
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    'success': 'fa-check-circle',
    'error': 'fa-exclamation-triangle',
    'warning': 'fa-exclamation-circle',
    'info': 'fa-info-circle'
  };
  return icons[type] || 'fa-info-circle';
}

// ==============================
// Denúncias Recebidas
// ==============================
function initializeReceivedData() {
  loadDenuncias();
  updateStats();
}

async function loadDenuncias() {
  try {
    const denuncias = await apiRequest('/denuncias');

    // Salvar no localStorage para filtros funcionarem
    localStorage.setItem('ssp-denuncias-cache', JSON.stringify(denuncias));

    renderDenuncias(denuncias);
  } catch (error) {
    console.error('Erro ao carregar denúncias:', error);
    showNotification('Erro ao carregar denúncias', 'error');
    // Fallback para dados de exemplo se a API falhar
    const denunciasExemplo = [
      {
        id: 1,
        titulo: 'Atividade suspeita no centro',
        camera: 'Câmera 01 - Praça Central',
        descricao: 'Atividade suspeita identificada próximo ao banco. Indivíduo usando capuz observando os arredores.',
        dataHora: '2025-11-04T14:30:00',
        usuario: 'Anônimo',
        status: 'pendente',
        prioridade: 'alta'
      },
      {
        id: 2,
        titulo: 'Veículo abandonado',
        camera: 'Câmera 05 - Rua Principal',
        descricao: 'Veículo estacionado em local proibido há mais de 24 horas.',
        dataHora: '2025-11-03T09:15:00',
        usuario: 'Anônimo',
        status: 'analisando',
        prioridade: 'media'
      }
    ];
    localStorage.setItem('ssp-denuncias-cache', JSON.stringify(denunciasExemplo));
    renderDenuncias(denunciasExemplo);
  }
}

function renderDenuncias(denuncias) {
  const container = document.getElementById('denuncias-content');

  if (!denuncias || denuncias.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Nenhuma denúncia encontrada</h3>
        <p>As denúncias enviadas pelos usuários aparecerão aqui</p>
      </div>
    `;
    return;
  }

  container.innerHTML = denuncias.map(denuncia => `
    <div class="denuncia-card ${denuncia.status} ${denuncia.tipo || 'externo'}">
      <div class="denuncia-header">
        <div class="denuncia-info">
          <h3><i class="fas fa-video"></i> ${denuncia.camera}</h3>
          <div class="denuncia-title">${denuncia.titulo || 'Denúncia sem título'}</div>
          <div class="denuncia-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(denuncia.dataHora)}</span>
            <span><i class="fas fa-clock"></i> ${formatTime(denuncia.dataHora)}</span>
            <span><i class="fas fa-user"></i> ${denuncia.usuario}</span>
            <span class="denuncia-type ${denuncia.tipo || 'externo'}"><i class="fas ${denuncia.tipo === 'interno' ? 'fa-user-shield' : 'fa-users'}"></i> ${denuncia.tipo === 'interno' ? 'Interna' : 'Externa'}</span>
          </div>
        </div>
        <div class="denuncia-status">
          <span class="status-badge ${denuncia.status}">${getStatusText(denuncia.status)}</span>
          <span class="priority-badge ${denuncia.prioridade}">${getPriorityText(denuncia.prioridade)}</span>
        </div>
      </div>

      <div class="denuncia-body">
        <div class="denuncia-field">
          <span class="denuncia-label">Descrição da Ocorrência:</span>
          <div class="denuncia-value">${denuncia.descricao}</div>
        </div>
      </div>

      <div class="denuncia-actions">
        <button class="btn-primary" onclick="viewDenunciaDetails(${denuncia.id})">
          <i class="fas fa-eye"></i> Ver Detalhes
        </button>
        <button class="btn-secondary" onclick="changeDenunciaStatus(${denuncia.id}, 'analisando')">
          <i class="fas fa-search"></i> Analisar
        </button>
        <button class="btn-success" onclick="changeDenunciaStatus(${denuncia.id}, 'resolvida')">
          <i class="fas fa-check"></i> Resolver
        </button>
        <button class="btn-danger" onclick="changeDenunciaStatus(${denuncia.id}, 'arquivada')">
          <i class="fas fa-archive"></i> Arquivar
        </button>
      </div>
    </div>
  `).join('');
}

function filterDenuncias() {
  const status = document.getElementById('filter-status').value;
  const tipo = document.getElementById('filter-tipo').value;
  const period = document.getElementById('filter-period').value;
  const order = document.getElementById('filter-order').value;

  // Buscar denúncias do cache local (simulando dados)
  let denuncias = JSON.parse(localStorage.getItem('ssp-denuncias-cache') || '[]');

  // Aplicar filtro de status
  if (status !== 'all') {
    denuncias = denuncias.filter(d => d.status === status);
  }

  // Aplicar filtro de tipo
  if (tipo !== 'all') {
    denuncias = denuncias.filter(d => (d.tipo || 'externo') === tipo);
  }

  // Aplicar filtro de período
  if (period !== 'all') {
    const now = new Date();
    let filterDate = new Date();

    switch (period) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    denuncias = denuncias.filter(d => new Date(d.dataHora) >= filterDate);
  }

  // Aplicar ordenação
  switch (order) {
    case 'recent':
      denuncias.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
      break;
    case 'oldest':
      denuncias.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
      break;
    case 'priority':
      const priorityOrder = { 'alta': 3, 'media': 2, 'baixa': 1 };
      denuncias.sort((a, b) => priorityOrder[b.prioridade] - priorityOrder[a.prioridade]);
      break;
  }

  // Renderizar denúncias filtradas
  renderDenuncias(denuncias);

  showNotification(`${denuncias.length} denúncia${denuncias.length !== 1 ? 's' : ''} encontrada${denuncias.length !== 1 ? 's' : ''}`, 'info');
}

async function updateStats() {
  try {
    const denuncias = await apiRequest('/denuncias');
    const total = denuncias.length;
    const pendentes = denuncias.filter(d => d.status === 'pendente').length;
    const analisando = denuncias.filter(d => d.status === 'analisando').length;
    const resolvidas = denuncias.filter(d => d.status === 'resolvida').length;
    
    document.getElementById('total-denuncias').textContent = total;
    document.getElementById('pendentes-denuncias').textContent = pendentes;
    document.getElementById('analisando-denuncias').textContent = analisando;
    document.getElementById('resolvidas-denuncias').textContent = resolvidas;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
    // Valores padrão se falhar
    document.getElementById('total-denuncias').textContent = '0';
    document.getElementById('pendentes-denuncias').textContent = '0';
    document.getElementById('analisando-denuncias').textContent = '0';
    document.getElementById('resolvidas-denuncias').textContent = '0';
  }
}

function viewDenunciaDetails(id) {
  // Buscar denúncia na lista atual
  const denuncias = JSON.parse(localStorage.getItem('ssp-denuncias-cache') || '[]');
  const denuncia = denuncias.find(d => d.id == id);

  if (!denuncia) {
    showNotification('Denúncia não encontrada', 'error');
    return;
  }

  // Criar modal com detalhes
  const modalHtml = `
    <div class="denuncia-detail-modal">
      <div class="denuncia-detail-header">
        <h3><i class="fas fa-exclamation-triangle"></i> Detalhes da Denúncia #${denuncia.id}</h3>
        <button class="btn-close-modal" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="denuncia-detail-content">
        <div class="denuncia-detail-section">
          <h4>Informações Gerais</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID:</label>
              <span>${denuncia.id}</span>
            </div>
            <div class="detail-item">
              <label>Data/Hora:</label>
              <span>${formatDate(denuncia.dataHora)} ${formatTime(denuncia.dataHora)}</span>
            </div>
            <div class="detail-item">
              <label>Usuário:</label>
              <span>${denuncia.usuario}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span class="status-badge ${denuncia.status}">${getStatusText(denuncia.status)}</span>
            </div>
            <div class="detail-item">
              <label>Prioridade:</label>
              <span class="priority-badge ${denuncia.prioridade}">${getPriorityText(denuncia.prioridade)}</span>
            </div>
            <div class="detail-item">
              <label>Tipo:</label>
              <span><span class="denuncia-type ${denuncia.tipo || 'externo'}">${denuncia.tipo === 'interno' ? 'Interna' : 'Externa'}</span></span>
            </div>
          </div>
        </div>

        <div class="denuncia-detail-section">
          <h4>Descrição da Ocorrência</h4>
          <div class="denuncia-description">
            <h5>${denuncia.titulo || 'Título não informado'}</h5>
            <p>${denuncia.descricao}</p>
          </div>
        </div>

        ${denuncia.arquivo ? `
        <div class="denuncia-detail-section">
          <h4>Anexo</h4>
          <div class="denuncia-attachment">
            <a href="/uploads/${denuncia.arquivo}" target="_blank" class="btn-secondary">
              <i class="fas fa-download"></i> Baixar Anexo
            </a>
          </div>
        </div>
        ` : ''}

        <div class="denuncia-detail-section">
          <h4>Ações</h4>
          <div class="denuncia-actions-grid">
            <button class="btn-secondary" onclick="changeDenunciaStatus(${denuncia.id}, 'analisando')">
              <i class="fas fa-search"></i> Em Análise
            </button>
            <button class="btn-success" onclick="changeDenunciaStatus(${denuncia.id}, 'resolvida')">
              <i class="fas fa-check"></i> Resolver
            </button>
            <button class="btn-danger" onclick="changeDenunciaStatus(${denuncia.id}, 'arquivada')">
              <i class="fas fa-archive"></i> Arquivar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Abrir modal
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  overlay.classList.add('active');
  modal.classList.add('active');
  modalTitle.textContent = `Denúncia #${denuncia.id}`;
  modalBody.innerHTML = modalHtml;

  showNotification(`Visualizando denúncia #${denuncia.id}`, 'info');
}

async function changeDenunciaStatus(id, newStatus) {
  try {
    await apiRequest(`/denuncias/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    
    showNotification('Status atualizado com sucesso!', 'success');
    setTimeout(() => loadDenuncias(), 500);
  } catch (error) {
    showNotification('Erro ao atualizar status: ' + error.message, 'error');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getStatusText(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'analisando': 'Em Análise',
    'resolvida': 'Resolvida',
    'arquivada': 'Arquivada'
  };
  return statusMap[status] || status;
}

function getPriorityText(priority) {
  const priorityMap = {
    'alta': 'Alta Prioridade',
    'media': 'Média Prioridade',
    'baixa': 'Baixa Prioridade'
  };
  return priorityMap[priority] || priority;
}

async function refreshNews() {
  await loadNews(false); // false = mostrar notificação
}

// ==============================
// CAMERA MANAGEMENT FUNCTIONS
// ==============================
async function loadCameras(silent = false) {
  try {
    const cameras = await apiRequest('/cameras');
    renderCamerasTable(cameras);
    if (!silent) {
      showNotification(`${cameras.length} câmera${cameras.length !== 1 ? 's' : ''} carregada${cameras.length !== 1 ? 's' : ''} com sucesso!`, 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar câmeras:', error);
    showNotification('Erro ao carregar câmeras: ' + error.message, 'error');
    // Fallback para dados vazios
    renderCamerasTable([]);
  }
}

function renderCamerasTable(cameras) {
  const tbody = document.getElementById('cameras-table-body');
  const countElement = document.getElementById('cameras-count');
  
  // Update cameras count
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-video"></i> ${cameras.length} câmera${cameras.length !== 1 ? 's' : ''}`;
  }
  
  if (!cameras || cameras.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-video" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
          Nenhuma câmera cadastrada ainda
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = cameras.map(camera => `
    <tr>
      <td>${camera.id || 'N/A'}</td>
      <td>${camera.name || 'Sem nome'}</td>
      <td>${camera.location || 'Sem localização'}</td>
      <td><span class="status-badge ${getCameraStatusClass(camera.status)}">${getCameraStatusText(camera.status)}</span></td>
      <td>${camera.type || 'N/A'}</td>
      <td class="action-buttons-cell">
        <button class="btn-icon btn-view" onclick="viewCamera(${camera.id})" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon btn-edit" onclick="editCamera(${camera.id})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete" onclick="deleteCamera(${camera.id})" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function getCameraStatusClass(status) {
  const statusMap = {
    'online': 'status-active',
    'offline': 'status-inactive',
    'maintenance': 'status-warning'
  };
  return statusMap[status] || 'status-inactive';
}

function getCameraStatusText(status) {
  const statusMap = {
    'online': 'Online',
    'offline': 'Offline',
    'maintenance': 'Manutenção'
  };
  return statusMap[status] || status;
}

async function viewCamera(id) {
  try {
    const camera = await apiRequest(`/cameras/${id}`);
    openModal('view-camera', camera);
    showNotification(`Visualizando câmera "${camera.name}" (ID: ${camera.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar câmera: ' + error.message, 'error');
  }
}

async function editCamera(id) {
  try {
    const camera = await apiRequest(`/cameras/${id}`);
    openModal('edit-camera', camera);
    showNotification(`Editando câmera "${camera.name}" (ID: ${camera.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar câmera: ' + error.message, 'error');
  }
}

async function deleteCamera(id) {
  if (!confirm('Tem certeza que deseja excluir esta câmera?')) {
    return;
  }
  
  try {
    // Buscar o nome da câmera antes de deletar
    const cameras = await apiRequest('/cameras');
    const cameraToDelete = cameras.find(c => c.id == id);
    const name = cameraToDelete ? cameraToDelete.name : 'Câmera';
    
    await apiRequest(`/cameras/${id}`, {
      method: 'DELETE'
    });
    
    showNotification(`Câmera "${name}" excluída com sucesso! (ID: ${id})`, 'success');
    setTimeout(() => loadCameras(), 300);
  } catch (error) {
    showNotification('Erro ao excluir câmera: ' + error.message, 'error');
  }
}

async function saveCamera(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = {
    name: form.querySelector('#camera-name').value,
    location: form.querySelector('#camera-location').value,
    streamUrl: form.querySelector('#camera-stream').value,
    latitude: parseFloat(form.querySelector('#camera-lat').value) || null,
    longitude: parseFloat(form.querySelector('#camera-lng').value) || null,
    status: form.querySelector('#camera-status').value,
    type: form.querySelector('#camera-type').value,
    resolution: form.querySelector('#camera-resolution').value
  };
  
  try {
    const savedCamera = await apiRequest('/cameras', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Câmera "${savedCamera.name}" salva com sucesso! (ID: ${savedCamera.id})`, 'success');
    closeModal();
    setTimeout(() => loadCameras(), 300);
  } catch (error) {
    showNotification('Erro ao salvar câmera: ' + error.message, 'error');
  }
}

async function updateCamera(event) {
  event.preventDefault();
  
  const form = event.target;
  const cameraId = form.dataset.cameraId;
  const formData = {
    name: form.querySelector('#camera-name').value,
    location: form.querySelector('#camera-location').value,
    streamUrl: form.querySelector('#camera-stream').value,
    latitude: parseFloat(form.querySelector('#camera-lat').value) || null,
    longitude: parseFloat(form.querySelector('#camera-lng').value) || null,
    status: form.querySelector('#camera-status').value,
    type: form.querySelector('#camera-type').value,
    resolution: form.querySelector('#camera-resolution').value
  };
  
  try {
    const updatedCamera = await apiRequest(`/cameras/${cameraId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Câmera "${updatedCamera.name}" atualizada com sucesso! (ID: ${updatedCamera.id})`, 'success');
    closeModal();
    setTimeout(() => loadCameras(), 300);
  } catch (error) {
    showNotification('Erro ao atualizar câmera: ' + error.message, 'error');
  }
}

async function handleCameraSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const isEdit = form.dataset.edit === 'true';
  
  if (isEdit) {
    await updateCamera(event);
  } else {
    await saveCamera(event);
  }
}

// ==============================
// USER MANAGEMENT FUNCTIONS
// ==============================
async function loadUsers(silent = false) {
  if (!isAdmin()) {
    showNotification('Acesso negado: apenas administradores podem gerenciar usuários', 'error');
    return;
  }
  
  try {
    const users = await apiRequest('/users');
    renderUsersTable(users);
    if (!silent) {
      showNotification(`${users.length} usuário${users.length !== 1 ? 's' : ''} carregado${users.length !== 1 ? 's' : ''} com sucesso!`, 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    showNotification('Erro ao carregar usuários: ' + error.message, 'error');
    // Fallback para dados vazios
    renderUsersTable([]);
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  const isUserAdmin = isAdmin();
  
  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
          Nenhum usuário cadastrado ainda
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id || 'N/A'}</td>
      <td>${user.name || user.username || 'Sem nome'}</td>
      <td>${user.email || 'N/A'}</td>
      <td><span class="role-badge role-${getRoleClass(user.role)}">${getRoleText(user.role)}</span></td>
      <td><span class="status-badge status-active">Ativo</span></td>
      <td class="action-buttons-cell">
        <button class="btn-icon btn-view" onclick="viewUser(${user.id})" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        ${isUserAdmin ? `
          <button class="btn-icon btn-edit" onclick="editUser(${user.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
        ` : ''}
        <button class="btn-icon btn-password" onclick="changePassword(${user.id})" title="Alterar Senha">
          <i class="fas fa-key"></i>
        </button>
        ${isUserAdmin ? `
          <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})" title="Desativar">
            <i class="fas fa-user-slash"></i>
          </button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

function getRoleClass(role) {
  const roleMap = {
    'admin': 'admin',
    'supervisor': 'supervisor',
    'operator': 'operator',
    'viewer': 'viewer'
  };
  return roleMap[role] || 'viewer';
}

function getRoleText(role) {
  const roleMap = {
    'admin': 'Administrador',
    'supervisor': 'Supervisor',
    'operator': 'Operador',
    'viewer': 'Visualizador'
  };
  return roleMap[role] || role;
}

async function viewUser(id) {
  try {
    const user = await apiRequest(`/users/${id}`);
    openModal('view-usuario', user);
    showNotification(`Visualizando usuário "${user.name || user.username}" (ID: ${user.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar usuário: ' + error.message, 'error');
  }
}

async function editUser(id) {
  if (!isAdmin()) {
    showNotification('Acesso negado: apenas administradores podem editar usuários', 'error');
    return;
  }
  
  try {
    const user = await apiRequest(`/users/${id}`);
    openModal('edit-usuario', user);
    showNotification(`Editando usuário "${user.name || user.username}" (ID: ${user.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar usuário: ' + error.message, 'error');
  }
}

async function deleteUser(id) {
  if (!isAdmin()) {
    showNotification('Acesso negado: apenas administradores podem desativar usuários', 'error');
    return;
  }
  
  if (!confirm('Tem certeza que deseja desativar este usuário?')) {
    return;
  }
  
  try {
    // Buscar o nome do usuário antes de deletar
    const users = await apiRequest('/users');
    const userToDelete = users.find(u => u.id == id);
    const name = userToDelete ? (userToDelete.name || userToDelete.username) : 'Usuário';
    
    await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
    
    showNotification(`Usuário "${name}" desativado com sucesso! (ID: ${id})`, 'success');
    setTimeout(() => loadUsers(), 300);
  } catch (error) {
    showNotification('Erro ao desativar usuário: ' + error.message, 'error');
  }
}

async function saveUser(event) {
  event.preventDefault();
  
  const form = event.target;
  const role = form.querySelector('#user-role').value;
  
  // Verificar se usuário não-admin está tentando criar admin
  if (role === 'admin' && !isAdmin()) {
    showNotification('Acesso negado: apenas administradores podem criar usuários administradores', 'error');
    return;
  }
  
  const formData = {
    name: form.querySelector('#user-name').value,
    username: form.querySelector('#user-username').value,
    email: form.querySelector('#user-email').value,
    password: form.querySelector('#user-password').value,
    role: role
  };
  
  try {
    const savedUser = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Usuário "${savedUser.name || savedUser.username}" criado com sucesso! (ID: ${savedUser.id})`, 'success');
    closeModal();
    setTimeout(() => loadUsers(), 300);
  } catch (error) {
    showNotification('Erro ao criar usuário: ' + error.message, 'error');
  }
}

async function updateUser(event) {
  event.preventDefault();
  
  const form = event.target;
  const userId = form.dataset.userId;
  const role = form.querySelector('#user-role').value;
  
  // Verificar se usuário não-admin está tentando alterar para admin
  if (role === 'admin' && !isAdmin()) {
    showNotification('Acesso negado: apenas administradores podem alterar usuários para administradores', 'error');
    return;
  }
  
  const formData = {
    name: form.querySelector('#user-name').value,
    username: form.querySelector('#user-username').value,
    email: form.querySelector('#user-email').value,
    role: role
  };
  
  // Só incluir senha se foi preenchida
  const password = form.querySelector('#user-password').value;
  if (password) {
    formData.password = password;
  }
  
  try {
    const updatedUser = await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Usuário "${updatedUser.name || updatedUser.username}" atualizado com sucesso! (ID: ${updatedUser.id})`, 'success');
    closeModal();
    setTimeout(() => loadUsers(), 300);
  } catch (error) {
    showNotification('Erro ao atualizar usuário: ' + error.message, 'error');
  }
}

async function changePassword(userId) {
  const currentUser = getCurrentUser();

  // Verificar se usuário está tentando alterar senha de outro usuário e não é admin
  if (currentUser && currentUser.id != userId && !isAdmin()) {
    showNotification('Acesso negado: você só pode alterar sua própria senha', 'error');
    return;
  }

  // Criar modal elegante para troca de senha
  const modalHtml = `
    <div class="modal-header">
      <h3><i class="fas fa-key"></i> Alterar Senha</h3>
      <button class="btn-close-modal" onclick="closeModal()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="change-password-form" class="admin-form">
        <div class="form-group">
          <label for="new-password">Nova Senha</label>
          <input type="password" id="new-password" class="form-input" placeholder="Digite a nova senha" required>
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirmar Senha</label>
          <input type="password" id="confirm-password" class="form-input" placeholder="Confirme a nova senha" required>
        </div>
        <div class="form-buttons">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary">Alterar Senha</button>
        </div>
      </form>
    </div>
  `;

  // Abrir modal diretamente definindo o conteúdo
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  overlay.classList.add('active');
  modal.classList.add('active');
  modalTitle.textContent = 'Alterar Senha';
  modalBody.innerHTML = modalHtml;

  // Adicionar event listener para o formulário
  const form = document.getElementById('change-password-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem!', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showNotification('A senha deve ter pelo menos 6 caracteres!', 'error');
      return;
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      });

      showNotification('Senha alterada com sucesso!', 'success');
      closeModal();
    } catch (error) {
      showNotification('Erro ao alterar senha: ' + error.message, 'error');
    }
  });
}

async function handleUserSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const isEdit = form.dataset.edit === 'true';
  
  if (isEdit) {
    await updateUser(event);
  } else {
    await saveUser(event);
  }
}

async function changeMyPassword() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showNotification('Usuário não autenticado', 'error');
    return;
  }
  
  await changePassword(currentUser.id);
}

// ==============================
// DENUNCIAS MANAGEMENT FUNCTIONS
// ==============================
async function loadDenunciasTable(silent = false) {
  try {
    const denuncias = await apiRequest('/denuncias');
    renderDenunciasTable(denuncias);
    if (!silent) {
      showNotification(`${denuncias.length} denúncia${denuncias.length !== 1 ? 's' : ''} carregada${denuncias.length !== 1 ? 's' : ''} com sucesso!`, 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar denúncias:', error);
    showNotification('Erro ao carregar denúncias: ' + error.message, 'error');
    // Fallback para dados vazios
    renderDenunciasTable([]);
  }
}

function renderDenunciasTable(denuncias) {
  const tbody = document.getElementById('denuncias-table-body');
  
  if (!denuncias || denuncias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
          Nenhuma denúncia cadastrada ainda
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = denuncias.map(denuncia => `
    <tr>
      <td>${denuncia.id || 'N/A'}</td>
      <td>${denuncia.titulo || 'Sem título'}</td>
      <td>${denuncia.camera || 'N/A'}</td>
      <td>${formatDate(denuncia.dataHora)} ${formatTime(denuncia.dataHora)}</td>
      <td><span class="status-badge ${denuncia.status}">${getStatusText(denuncia.status)}</span></td>
      <td><span class="priority-badge ${denuncia.prioridade}">${getPriorityText(denuncia.prioridade)}</span></td>
      <td><span class="denuncia-type ${denuncia.tipo || 'externo'}">${denuncia.tipo === 'interno' ? 'Interna' : 'Externa'}</span></td>
      <td class="action-buttons-cell">
        <button class="btn-icon btn-view" onclick="viewDenunciaDetails(${denuncia.id})" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon btn-edit" onclick="changeDenunciaStatus(${denuncia.id}, 'analisando')" title="Em Análise">
          <i class="fas fa-search"></i>
        </button>
        <button class="btn-icon btn-success" onclick="changeDenunciaStatus(${denuncia.id}, 'resolvida')" title="Resolver">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn-icon btn-danger" onclick="changeDenunciaStatus(${denuncia.id}, 'arquivada')" title="Arquivar">
          <i class="fas fa-archive"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function saveDenuncia(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = {
    titulo: form.querySelector('#denuncia-titulo').value,
    camera: form.querySelector('#denuncia-camera').value,
    descricao: form.querySelector('#denuncia-descricao').value,
    prioridade: form.querySelector('#denuncia-prioridade').value,
    status: form.querySelector('#denuncia-status').value
  };
  
  try {
    const savedDenuncia = await apiRequest('/denuncias', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Denúncia "${savedDenuncia.titulo}" criada com sucesso! (ID: ${savedDenuncia.id})`, 'success');
    closeModal();
    setTimeout(() => loadDenunciasTable(), 300);
  } catch (error) {
    showNotification('Erro ao criar denúncia: ' + error.message, 'error');
  }
}

async function handleDenunciaSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const isEdit = form.dataset.edit === 'true';
  
  if (isEdit) {
    // Implementar edição se necessário
    showNotification('Edição de denúncias não implementada ainda', 'warning');
  } else {
    await saveDenuncia(event);
  }
}

async function refreshDenuncias() {
  await loadDenunciasTable(false); // false = mostrar notificação
}

async function loadCameraOptionsForDenuncia(selectedCamera = null) {
  const select = document.getElementById('denuncia-camera');
  if (!select) return;
  
  try {
    const cameras = await apiRequest('/cameras');
    select.innerHTML = '<option value="Não especificada">Não especificada</option>';
    
    cameras.forEach(camera => {
      const option = document.createElement('option');
      option.value = `Câmera ${camera.id} - ${camera.name}`;
      option.textContent = `Câmera ${camera.id} - ${camera.name}`;
      if (selectedCamera && option.value === selectedCamera) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar câmeras:', error);
    select.innerHTML = '<option value="Não especificada">Erro ao carregar câmeras</option>';
  }
}

// ==============================
// REFRESH FUNCTIONS (para botões manuais)
// ==============================
async function refreshNews() {
  await loadNews(false); // false = mostrar notificação
}

async function refreshCameras() {
  await loadCameras(false); // false = mostrar notificação
}

async function refreshUsers() {
  await loadUsers(false); // false = mostrar notificação
}

// ==============================
// MAP SELECTION FUNCTIONS
// ==============================
let cameraMap = null;
let cameraMarker = null;

function toggleMapSelection() {
  const mapContainer = document.getElementById('camera-map-container');
  const toggleBtn = document.getElementById('toggle-map-btn');
  
  if (mapContainer.style.display === 'none') {
    mapContainer.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Mapa';
    initializeCameraMap();
  } else {
    mapContainer.style.display = 'none';
    toggleBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Selecionar no Mapa';
    if (cameraMap) {
      cameraMap.remove();
      cameraMap = null;
      cameraMarker = null;
    }
  }
}

function initializeCameraMap() {
  if (cameraMap) return; // Já inicializado
  
  const latInput = document.getElementById('camera-lat');
  const lngInput = document.getElementById('camera-lng');
  
  // Centro padrão em Criciúma
  const defaultLat = -28.6773;
  const defaultLng = -49.3699;
  
  // Usar coordenadas existentes se disponíveis
  const initialLat = parseFloat(latInput.value) || defaultLat;
  const initialLng = parseFloat(lngInput.value) || defaultLng;
  
  cameraMap = L.map('camera-map').setView([initialLat, initialLng], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(cameraMap);
  
  // Adicionar marcador se coordenadas existirem
  if (latInput.value && lngInput.value) {
    cameraMarker = L.marker([initialLat, initialLng]).addTo(cameraMap);
  }
  
  // Event listener para cliques no mapa
  cameraMap.on('click', function(e) {
    const { lat, lng } = e.latlng;
    
    // Atualizar inputs
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
    
    // Atualizar ou criar marcador
    if (cameraMarker) {
      cameraMarker.setLatLng([lat, lng]);
    } else {
      cameraMarker = L.marker([lat, lng]).addTo(cameraMap);
    }
    
    showNotification(`Localização definida: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 'success');
  });
}

// Debug function to show current mock data
function debugMockData() {
  console.log('Mock News Data:', mockNewsData);
  alert(`Total de notícias mock: ${mockNewsData.length}\n\n${mockNewsData.map(n => `- ${n.title} (ID: ${n.id})`).join('\n')}`);
}

// Function to clear all mock data
function clearMockData() {
  if (confirm('Tem certeza que deseja limpar todos os dados de teste?')) {
    mockNewsData = getDefaultMockNews();
    saveMockDataToStorage();
    loadNews();
    showNotification('Dados de teste resetados!', 'info');
  }
}

console.log('Comitê Dashboard initialized successfully! 🔐');

// ==============================
// Initialize Dashboard
// ==============================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard initializing...');
  
  // Verificar permissões do usuário
  checkPermissions();
  
  // Initialize mock data persistence
  initializeMockData();
  
  // Carregar dados iniciais (silenciosamente)
  loadNews(true); // true = modo silencioso, sem notificação
  initializeReceivedData();
  
  // Logout functionality
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('ssp-token');
      window.location.href = '../index.html';
    });
  }
  
  console.log('Dashboard initialized successfully!');
});


// ==============================
// ANALYSIS MANAGEMENT FUNCTIONS
// ==============================
async function loadAnalysis(silent = false) {
  try {
    const analyses = await apiRequest('/analyses');
    renderAnalysisTable(analyses);
    if (!silent) {
      showNotification(`${analyses.length} análise${analyses.length !== 1 ? 's' : ''} carregada${analyses.length !== 1 ? 's' : ''} com sucesso!`, 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar análises:', error);
    showNotification('Erro ao carregar análises: ' + error.message, 'error');
    // Fallback para dados vazios
    renderAnalysisTable([]);
  }
}

function renderAnalysisTable(analyses) {
  const tbody = document.getElementById('analysis-table-body');
  
  if (!analyses || analyses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
          Nenhuma análise cadastrada ainda
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = analyses.map(analysis => `
    <tr>
      <td>${analysis.id || 'N/A'}</td>
      <td>${analysis.type || 'Tipo não especificado'}</td>
      <td>${analysis.period || 'Período não especificado'}</td>
      <td>${formatDate(analysis.createdAt)}</td>
      <td class="action-buttons-cell">
        <button class="btn-icon btn-view" onclick="viewAnalysis(${analysis.id})" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon btn-edit" onclick="editAnalysis(${analysis.id})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete" onclick="deleteAnalysis(${analysis.id})" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function viewAnalysis(id) {
  try {
    const analysis = await apiRequest(`/analyses/${id}`);
    openModal('view-analysis', analysis);
    showNotification(`Visualizando análise "${analysis.type}" (ID: ${analysis.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar análise: ' + error.message, 'error');
  }
}

async function editAnalysis(id) {
  try {
    const analysis = await apiRequest(`/analyses/${id}`);
    openModal('edit-analysis', analysis);
    showNotification(`Editando análise "${analysis.type}" (ID: ${analysis.id})`, 'info');
  } catch (error) {
    showNotification('Erro ao carregar análise: ' + error.message, 'error');
  }
}

async function deleteAnalysis(id) {
  if (!confirm('Tem certeza que deseja excluir esta análise?')) {
    return;
  }
  
  try {
    // Buscar o tipo da análise antes de deletar
    const analyses = await apiRequest('/analyses');
    const analysisToDelete = analyses.find(a => a.id == id);
    const type = analysisToDelete ? analysisToDelete.type : 'Análise';
    
    await apiRequest(`/analyses/${id}`, {
      method: 'DELETE'
    });
    
    showNotification(`Análise "${type}" excluída com sucesso! (ID: ${id})`, 'success');
    setTimeout(() => loadAnalysis(), 300);
  } catch (error) {
    showNotification('Erro ao excluir análise: ' + error.message, 'error');
  }
}

async function saveAnalysis(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = {
    type: form.querySelector('#analysis-type').value,
    period: form.querySelector('#analysis-period').value,
    data: form.querySelector('#analysis-data').value
  };
  
  try {
    const savedAnalysis = await apiRequest('/analyses', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Análise "${savedAnalysis.type}" salva com sucesso! (ID: ${savedAnalysis.id})`, 'success');
    closeModal();
    setTimeout(() => loadAnalysis(), 300);
  } catch (error) {
    showNotification('Erro ao salvar análise: ' + error.message, 'error');
  }
}

async function updateAnalysis(event) {
  event.preventDefault();
  
  const form = event.target;
  const analysisId = form.dataset.analysisId;
  const formData = {
    type: form.querySelector('#analysis-type').value,
    period: form.querySelector('#analysis-period').value,
    data: form.querySelector('#analysis-data').value
  };
  
  try {
    const updatedAnalysis = await apiRequest(`/analyses/${analysisId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    showNotification(`Análise "${updatedAnalysis.type}" atualizada com sucesso! (ID: ${updatedAnalysis.id})`, 'success');
    closeModal();
    setTimeout(() => loadAnalysis(), 300);
  } catch (error) {
    showNotification('Erro ao atualizar análise: ' + error.message, 'error');
  }
}

async function handleAnalysisSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const isEdit = form.dataset.edit === 'true';
  
  if (isEdit) {
    await updateAnalysis(event);
  } else {
    await saveAnalysis(event);
  }
}

function getAnalysisView(analysis) {
  return `
    <div class="analysis-view">
      <div class="view-field">
        <label class="view-label">ID:</label>
        <div class="view-value">${analysis.id || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Tipo de Análise:</label>
        <div class="view-value">${analysis.type || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Período:</label>
        <div class="view-value">${analysis.period || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Dados:</label>
        <div class="view-value">
          <pre style="background: var(--bg-light); padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;">${analysis.data || 'Nenhum dado disponível'}</pre>
        </div>
      </div>
      <div class="view-field">
        <label class="view-label">Data de Criação:</label>
        <div class="view-value">${formatDate(analysis.createdAt)}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Última Atualização:</label>
        <div class="view-value">${analysis.updatedAt ? formatDate(analysis.updatedAt) : 'Nunca'}</div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `;
}

async function refreshAnalysis() {
  await loadAnalysis(false); // false = mostrar notificação
}
