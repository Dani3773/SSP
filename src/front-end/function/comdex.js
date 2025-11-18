// ==============================
// API Configuration
// ==============================
const API_BASE = 'http://localhost:3000/api';

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

    const response = await fetch(`${API_BASE}${endpoint}`, { ...defaultOptions, ...options });

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

    // Mock para análises
    if (endpoint === '/analyses' && options.method === 'GET') {
      return getMockAnalyses();
    }
    if (endpoint.startsWith('/analyses/') && !options.method) {
      const id = endpoint.split('/')[2];
      return getMockAnalysisById(id);
    }
    if (endpoint === '/analyses' && options.method === 'POST') {
      return saveMockAnalysis(JSON.parse(options.body));
    }
    if (endpoint.startsWith('/analyses/') && options.method === 'PUT') {
      const id = endpoint.split('/')[2];
      return updateMockAnalysis(id, JSON.parse(options.body));
    }
    if (endpoint.startsWith('/analyses/') && options.method === 'DELETE') {
      const id = endpoint.split('/')[2];
      return deleteMockAnalysis(id);
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
// Mock Data Functions for Analyses
// ==============================
let mockAnalysesData = [];

function getMockAnalyses() {
  if (mockAnalysesData.length === 0) {
    mockAnalysesData = [
      {
        id: 1,
        type: "Relatório Mensal de Ocorrências",
        period: "Outubro 2025",
        data: JSON.stringify({
          total_ocorrencias: 245,
          aumento_percentual: 12.5,
          principais_tipos: {
            roubo: 45,
            furto: 78,
            violencia_domestica: 32,
            trafico: 15
          },
          bairros_mais_afetados: [
            "Centro",
            "Pinheirinho",
            "Santa Luzia"
          ],
          tendencias: "Aumento significativo em furtos durante finais de semana"
        }, null, 2),
        createdAt: "2025-11-01T10:30:00.000Z"
      },
      {
        id: 2,
        type: "Comparativo Anual 2024 vs 2025",
        period: "Anual",
        data: JSON.stringify({
          comparativo: {
            "2024": {
              total_crimes: 2847,
              taxa_resolucao: 68.5
            },
            "2025": {
              total_crimes: 3124,
              taxa_resolucao: 72.1
            }
          },
          variacao_percentual: {
            crimes: 9.7,
            resolucao: 5.2
          },
          observacoes: "Melhoria significativa na taxa de resolução, possivelmente devido às novas câmeras instaladas"
        }, null, 2),
        createdAt: "2025-10-15T14:20:00.000Z"
      },
      {
        id: 3,
        type: "Análise de Padrões Criminais",
        period: "Trimestre Atual",
        data: JSON.stringify({
          padroes_identificados: [
            "Aumento de furtos em horários comerciais",
            "Concentração de roubos em áreas centrais",
            "Padrão de recorrência em determinados estabelecimentos"
          ],
          recomendacoes: [
            "Reforçar patrulhamento em áreas comerciais",
            "Instalar câmeras adicionais em pontos críticos",
            "Implementar rondas preventivas"
          ],
          impacto_esperado: "Redução estimada de 15-20% nos índices criminais"
        }, null, 2),
        createdAt: "2025-11-05T09:15:00.000Z"
      }
    ];
  }
  return [...mockAnalysesData];
}

function getMockAnalysisById(id) {
  const analysis = mockAnalysesData.find(a => a.id == id);
  if (!analysis) {
    // Se não encontrar no array, inicializar e tentar novamente
    if (mockAnalysesData.length === 0) {
      getMockAnalyses();
      return getMockAnalysisById(id);
    }
    throw new Error('Análise não encontrada');
  }
  return { ...analysis };
}

function saveMockAnalysis(analysisData) {
  if (mockAnalysesData.length === 0) {
    getMockAnalyses();
  }
  const newId = Math.max(...mockAnalysesData.map(a => a.id), 0) + 1;
  const newAnalysis = {
    ...analysisData,
    id: newId,
    createdAt: new Date().toISOString()
  };
  mockAnalysesData.push(newAnalysis);
  return newAnalysis;
}

function updateMockAnalysis(id, updateData) {
  if (mockAnalysesData.length === 0) {
    getMockAnalyses();
  }
  const index = mockAnalysesData.findIndex(a => a.id == id);
  if (index === -1) {
    throw new Error('Análise não encontrada');
  }
  mockAnalysesData[index] = { ...mockAnalysesData[index], ...updateData, updatedAt: new Date().toISOString() };
  return mockAnalysesData[index];
}

function deleteMockAnalysis(id) {
  if (mockAnalysesData.length === 0) {
    getMockAnalyses();
  }
  const index = mockAnalysesData.findIndex(a => a.id == id);
  if (index === -1) {
    throw new Error('Análise não encontrada');
  }
  mockAnalysesData.splice(index, 1);
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
      loadAllAnalytics(); // Carregar estatísticas automáticas
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
// Search/Filter Functions
// ==============================
function filterTable(section) {
  const searchId = `search-${section}`;
  const tableId = `${section}-table-body`;
  
  const searchInput = document.getElementById(searchId);
  const table = document.getElementById(tableId);
  
  if (!searchInput || !table) return;
  
  const filter = searchInput.value.toLowerCase();
  const rows = table.getElementsByTagName('tr');
  
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    let found = false;
    
    // Busca em todas as células da linha
    for (let j = 0; j < cells.length; j++) {
      const cellText = cells[j].textContent || cells[j].innerText;
      if (cellText.toLowerCase().indexOf(filter) > -1) {
        found = true;
        break;
      }
    }
    
    rows[i].style.display = found ? '' : 'none';
  }
}

// ==============================
// Modal Functions
// ==============================
function openChangePasswordModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  overlay.classList.add('active');
  modal.classList.add('active');
  
  modalTitle.innerHTML = '<i class="fas fa-key"></i> Alterar Senha';
  modalBody.innerHTML = `
    <form id="change-password-form" onsubmit="handleChangePassword(event)">
      <div class="form-group">
        <label for="current-password">
          <i class="fas fa-lock"></i> Senha Atual
        </label>
        <input type="password" id="current-password" name="currentPassword" required>
      </div>
      
      <div class="form-group">
        <label for="new-password">
          <i class="fas fa-key"></i> Nova Senha
        </label>
        <input type="password" id="new-password" name="newPassword" required minlength="6">
      </div>
      
      <div class="form-group">
        <label for="confirm-password">
          <i class="fas fa-check-circle"></i> Confirmar Nova Senha
        </label>
        <input type="password" id="confirm-password" name="confirmPassword" required minlength="6">
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button type="submit" class="btn-primary">
          <i class="fas fa-save"></i> Alterar Senha
        </button>
      </div>
    </form>
  `;
}

async function handleChangePassword(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (newPassword !== confirmPassword) {
    showNotification('As senhas não coincidem!', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showNotification('A nova senha deve ter no mínimo 6 caracteres!', 'error');
    return;
  }
  
  try {
    const response = await apiRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    showNotification('Senha alterada com sucesso!', 'success');
    closeModal();
    
    // Opcional: fazer logout após alterar senha
    setTimeout(() => {
      if (confirm('Senha alterada! Deseja fazer logout agora?')) {
        logout();
      }
    }, 1000);
  } catch (error) {
    showNotification('Erro ao alterar senha: ' + error.message, 'error');
  }
}

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
        <label for="news-image">Imagem da Notícia</label>
        <div class="upload-area" id="upload-area" onclick="document.getElementById('news-image-file').click()">
          <div class="upload-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Clique ou arraste uma imagem aqui</p>
            <span class="upload-hint">PNG, JPG ou JPEG (max. 5MB)</span>
          </div>
          ${data.image ? `<img id="preview-image" src="${data.image}" alt="Preview" class="image-preview">` : '<img id="preview-image" class="image-preview" style="display:none;">'}
        </div>
        <input type="file" id="news-image-file" accept="image/png,image/jpeg,image/jpg" style="display:none;" onchange="previewNewsImage(event)">
        ${data.image ? `<input type="hidden" id="existing-image" value="${data.image}">` : ''}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="news-category">Categoria</label>
          <select id="news-category" class="form-input">
            <option value="noticia" ${data.category === 'noticia' ? 'selected' : ''}>Notícia</option>
            <option value="comunicado" ${data.category === 'comunicado' ? 'selected' : ''}>Comunicado</option>
            <option value="alerta" ${data.category === 'alerta' ? 'selected' : ''}>Alerta</option>
            <option value="informacao" ${data.category === 'informacao' ? 'selected' : ''}>Informação</option>
          </select>
        </div>
        <div class="form-group">
          <label for="news-status">Status</label>
          <select id="news-status" class="form-input">
            <option value="published" ${data.status === 'published' ? 'selected' : ''}>Publicada</option>
            <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Rascunho</option>
          </select>
        </div>
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

function getNewsView(news) {
  const categoryText = news.category === 'noticia' ? 'Notícia' : 
                       news.category === 'comunicado' ? 'Comunicado' :
                       news.category === 'alerta' ? 'Alerta' : 'Informação';
  
  return `
    <div class="news-preview">
      ${news.image ? `
        <div class="news-preview-image">
          <img src="${news.image}" alt="${news.title}" onerror="this.style.display='none'">
        </div>
      ` : ''}
      <div class="news-preview-content">
        <div class="news-preview-header">
          <h2 class="news-preview-title">${news.title || 'Sem título'}</h2>
          <span class="status-badge ${getStatusClass(news.status)}">${getStatusText(news.status)}</span>
        </div>
        <div class="news-preview-meta">
          <span><i class="fas fa-calendar-alt"></i> ${formatDateTime(news.date || news.createdAt)}</span>
          <span><i class="fas fa-tag"></i> ${categoryText}</span>
        </div>
        <div class="news-preview-body">
          <p>${news.description || 'Sem descrição'}</p>
        </div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn-primary" onclick="closeModal(); editNews(${news.id})">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `;
}

function getAnalysisView(analysis) {
  return `
    <div class="analysis-view">
      <div class="view-field">
        <label class="view-label">Tipo:</label>
        <div class="view-value">${analysis.type || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Período:</label>
        <div class="view-value">${analysis.period || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Dados:</label>
        <div class="view-value"><pre>${JSON.stringify(JSON.parse(analysis.data || '{}'), null, 2)}</pre></div>
      </div>
      <div class="view-field">
        <label class="view-label">Data de Criação:</label>
        <div class="view-value">${formatDate(analysis.createdAt)}</div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `;
}

function getCameraView(camera) {
  return `
    <div class="camera-view">
      <div class="view-field">
        <label class="view-label">Nome:</label>
        <div class="view-value">${camera.name || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Localização:</label>
        <div class="view-value">${camera.location || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Status:</label>
        <div class="view-value"><span class="status-badge ${getStatusClass(camera.status)}">${getStatusText(camera.status)}</span></div>
      </div>
      <div class="view-field">
        <label class="view-label">Tipo:</label>
        <div class="view-value">${camera.type || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Resolução:</label>
        <div class="view-value">${camera.resolution || 'N/A'}</div>
      </div>
      <div class="view-field">
        <label class="view-label">Coordenadas:</label>
        <div class="view-value">${camera.latitude}, ${camera.longitude}</div>
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
        <label for="denuncia-titulo">Título da Denúncia *</label>
        <input type="text" id="denuncia-titulo" required class="form-input" value="${data.titulo || ''}" placeholder="Ex: Furto na Av. Universitária">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="denuncia-tipo">Tipo de Ocorrência *</label>
          <select id="denuncia-tipo" class="form-input" required>
            <option value="">Selecione o tipo</option>
            <option value="furto" ${data.tipoOcorrencia === 'furto' ? 'selected' : ''}>Furto</option>
            <option value="roubo" ${data.tipoOcorrencia === 'roubo' ? 'selected' : ''}>Roubo</option>
            <option value="vandalismo" ${data.tipoOcorrencia === 'vandalismo' ? 'selected' : ''}>Vandalismo</option>
            <option value="agressao" ${data.tipoOcorrencia === 'agressao' ? 'selected' : ''}>Agressão</option>
            <option value="transito" ${data.tipoOcorrencia === 'transito' ? 'selected' : ''}>Acidente de Trânsito</option>
            <option value="suspeita" ${data.tipoOcorrencia === 'suspeita' ? 'selected' : ''}>Atividade Suspeita</option>
            <option value="outro" ${data.tipoOcorrencia === 'outro' ? 'selected' : ''}>Outro</option>
          </select>
        </div>

        <div class="form-group">
          <label for="denuncia-camera">Câmera de Origem *</label>
          <select id="denuncia-camera" class="form-input" required>
            <option value="">Carregando câmeras...</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="denuncia-data">Data da Ocorrência *</label>
          <input type="date" id="denuncia-data" required class="form-input" value="${data.dataOcorrencia || ''}">
        </div>

        <div class="form-group">
          <label for="denuncia-hora">Horário *</label>
          <input type="time" id="denuncia-hora" required class="form-input" value="${data.horaOcorrencia || ''}">
        </div>
      </div>

      <div class="form-group">
        <label for="denuncia-localizacao">Localização Exata</label>
        <input type="text" id="denuncia-localizacao" class="form-input" value="${data.localizacao || ''}" placeholder="Ex: Em frente ao número 123">
      </div>

      <div class="form-group">
        <label for="denuncia-descricao">Descrição Detalhada *</label>
        <textarea id="denuncia-descricao" rows="5" required class="form-input" placeholder="Descreva o que foi observado nas câmeras...">${data.descricao || ''}</textarea>
      </div>

      <div class="form-group">
        <label for="denuncia-suspeitos">Descrição de Suspeitos (se houver)</label>
        <textarea id="denuncia-suspeitos" rows="3" class="form-input" placeholder="Características físicas, vestimentas, veículo...">${data.suspeitos || ''}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="denuncia-prioridade">Prioridade</label>
          <select id="denuncia-prioridade" class="form-input">
            <option value="baixa" ${data.prioridade === 'baixa' ? 'selected' : ''}>Baixa</option>
            <option value="media" ${data.prioridade === 'media' || !data.prioridade ? 'selected' : ''}>Média</option>
            <option value="alta" ${data.prioridade === 'alta' ? 'selected' : ''}>Alta</option>
          </select>
        </div>

        <div class="form-group">
          <label for="denuncia-status">Status Inicial</label>
          <select id="denuncia-status" class="form-input">
            <option value="pendente" ${data.status === 'pendente' || !data.status ? 'selected' : ''}>Pendente</option>
            <option value="analisando" ${data.status === 'analisando' ? 'selected' : ''}>Em Análise</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-top: 10px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="denuncia-urgente" ${data.urgente || data.prioridade === 'alta' ? 'checked' : ''} style="margin-right: 8px;">
          <span>Marcar como urgente/prioritário</span>
        </label>
      </div>

      <div class="form-buttons">
        <button type="submit" class="btn-primary">
          <i class="fas fa-save"></i> Salvar Denúncia
        </button>
        <button type="button" class="btn-secondary" onclick="closeModal()">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>
    </form>
  `;
}

// ==============================
// Loading State Functions
// ==============================
function showTableLoading(tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;
  
  tbody.innerHTML = `
    <tr>
      <td colspan="10" class="table-loading">
        <div class="spinner"></div>
        <p style="color: var(--text-medium); margin-top: 10px;">Carregando dados...</p>
      </td>
    </tr>
  `;
}

// ==============================
// CRUD Operations - News (Complete)
// ==============================
async function loadNews(silent = false) {
  showTableLoading('news-table-body');
  try {
    const news = await apiRequest('/communications');
    renderNewsTable(news);
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
  const badgeElement = document.getElementById('badge-news');
  
  // Update news count
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-newspaper"></i> ${news.length} notícia${news.length !== 1 ? 's' : ''}`;
  }
  
  // Update badge
  if (badgeElement) {
    badgeElement.textContent = news.length;
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
  } catch (error) {
    showNotification('Erro ao carregar notícia: ' + error.message, 'error');
  }
}

async function editNews(id) {
  try {
    const news = await apiRequest(`/communications/${id}`);
    openModal('edit-noticia', news);
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
  const fileInput = document.getElementById('news-image-file');
  const existingImage = document.getElementById('existing-image');
  let imagePath = existingImage ? existingImage.value : '';
  
  // Fazer upload da nova imagem, se houver
  if (fileInput && fileInput.files.length > 0) {
    try {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      
      const uploadResponse = await fetch(`${API_BASE}/communications/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ssp-token')}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const uploadData = await uploadResponse.json();
      imagePath = uploadData.imagePath;
    } catch (error) {
      showNotification('Erro ao fazer upload da imagem: ' + error.message, 'error');
      return;
    }
  }
  
  const formData = {
    title: form.querySelector('#news-title').value,
    description: form.querySelector('#news-content').value,
    image: imagePath,
    category: form.querySelector('#news-category').value,
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
  const fileInput = document.getElementById('news-image-file');
  let imagePath = '';
  
  // Fazer upload da imagem primeiro, se houver
  if (fileInput && fileInput.files.length > 0) {
    try {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      
      const uploadResponse = await fetch(`${API_BASE}/communications/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ssp-token')}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const uploadData = await uploadResponse.json();
      imagePath = uploadData.imagePath;
    } catch (error) {
      showNotification('Erro ao fazer upload da imagem: ' + error.message, 'error');
      return;
    }
  }
  
  const formData = {
    title: form.querySelector('#news-title').value,
    description: form.querySelector('#news-content').value,
    image: imagePath,
    category: form.querySelector('#news-category').value,
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
// Image Upload Functions
// ==============================
function previewNewsImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validar tipo
  if (!file.type.match('image/(png|jpeg|jpg)')) {
    showNotification('Por favor, selecione uma imagem PNG ou JPEG', 'error');
    event.target.value = '';
    return;
  }
  
  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('A imagem deve ter no máximo 5MB', 'error');
    event.target.value = '';
    return;
  }
  
  // Preview
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('preview-image');
    const uploadContent = document.querySelector('.upload-content');
    
    preview.src = e.target.result;
    preview.style.display = 'block';
    
    // Esconder o conteúdo de upload
    if (uploadContent) {
      uploadContent.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

// Drag and drop
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar eventos de drag and drop quando o modal abrir
  document.addEventListener('click', function(e) {
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
      });
      
      uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
      });
      
      uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const fileInput = document.getElementById('news-image-file');
          fileInput.files = files;
          previewNewsImage({ target: fileInput });
        }
      });
    }
  });
});

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
      <div class="denuncia-detail-content">
        
        <!-- Informações Principais -->
        <div class="denuncia-detail-section">
          <h4><i class="fas fa-info-circle"></i> Informações Principais</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID</label>
              <span>#${denuncia.id}</span>
            </div>
            <div class="detail-item ${denuncia.tipo === 'interno' ? 'highlight' : ''}">
              <label>Tipo</label>
              <span class="denuncia-type ${denuncia.tipo || 'externo'}">${denuncia.tipo === 'interno' ? 'Interna' : 'Externa'}</span>
            </div>
            <div class="detail-item">
              <label>Registrado por</label>
              <span>${denuncia.usuario || 'Anônimo'}</span>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <span class="status-badge ${denuncia.status}">${getStatusText(denuncia.status)}</span>
            </div>
            <div class="detail-item ${denuncia.prioridade === 'alta' || denuncia.urgente ? 'urgent' : ''}">
              <label>Prioridade</label>
              <span class="priority-badge ${denuncia.prioridade}">${getPriorityText(denuncia.prioridade)}</span>
            </div>
            ${denuncia.origem ? `
            <div class="detail-item">
              <label>Origem</label>
              <span style="text-transform: capitalize;">${denuncia.origem.replace('-', ' ')}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Detalhes da Ocorrência -->
        <div class="denuncia-detail-section">
          <h4><i class="fas fa-map-marker-alt"></i> Detalhes da Ocorrência</h4>
          <div class="detail-grid">
            ${denuncia.tipoOcorrencia ? `
            <div class="detail-item">
              <label>Tipo</label>
              <span style="text-transform: capitalize;">${denuncia.tipoOcorrencia}</span>
            </div>
            ` : ''}
            <div class="detail-item">
              <label>Câmera</label>
              <span>${denuncia.camera || 'Não especificada'}</span>
            </div>
            ${denuncia.dataOcorrencia && denuncia.horaOcorrencia ? `
            <div class="detail-item">
              <label>Data e Hora</label>
              <span>${new Date(denuncia.dataOcorrencia + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às ${denuncia.horaOcorrencia}</span>
            </div>
            ` : `
            <div class="detail-item">
              <label>Registrado em</label>
              <span>${formatDate(denuncia.createdAt || denuncia.dataHora)} ${formatTime(denuncia.createdAt || denuncia.dataHora)}</span>
            </div>
            `}
            ${denuncia.localizacao ? `
            <div class="detail-item">
              <label>Localização</label>
              <span>${denuncia.localizacao}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Descrição -->
        <div class="denuncia-detail-section">
          <h4><i class="fas fa-file-alt"></i> Descrição Completa</h4>
          <div class="denuncia-description">
            <p>${denuncia.descricao || 'Sem descrição fornecida.'}</p>
          </div>
        </div>

        ${denuncia.suspeitos ? `
        <!-- Suspeitos -->
        <div class="denuncia-detail-section">
          <h4><i class="fas fa-user-secret"></i> Descrição de Suspeitos</h4>
          <div class="denuncia-description">
            <p>${denuncia.suspeitos}</p>
          </div>
        </div>
        ` : ''}

        ${denuncia.arquivo ? `
        <!-- Anexo -->
        <div class="denuncia-detail-section">
          <h4><i class="fas fa-paperclip"></i> Anexo</h4>
          <div class="denuncia-attachment">
            <a href="/uploads/${denuncia.arquivo}" target="_blank" class="btn-secondary">
              <i class="fas fa-download"></i> Baixar Anexo
            </a>
          </div>
        </div>
        ` : ''}

        <!-- Ações -->
        <div class="denuncia-detail-section">
          <h4><i class="fas fa-cogs"></i> Ações Disponíveis</h4>
          <div class="denuncia-actions-grid">
            <button class="btn-secondary" onclick="changeDenunciaStatus(${denuncia.id}, 'analisando'); closeModal();">
              <i class="fas fa-search"></i> Em Análise
            </button>
            <button class="btn-success" onclick="changeDenunciaStatus(${denuncia.id}, 'resolvida'); closeModal();">
              <i class="fas fa-check-circle"></i> Resolver
            </button>
            <button class="btn-danger" onclick="changeDenunciaStatus(${denuncia.id}, 'arquivada'); closeModal();">
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
  modalTitle.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${denuncia.titulo || 'Denúncia sem título'}`;
  modalBody.innerHTML = modalHtml;
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

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR');
  const timeFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dateFormatted} às ${timeFormatted}`;
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
    'alta': 'Alta',
    'media': 'Média',
    'baixa': 'Baixa'
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
  const badgeElement = document.getElementById('badge-cameras');
  
  // Update cameras count
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-video"></i> ${cameras.length} câmera${cameras.length !== 1 ? 's' : ''}`;
  }
  
  // Update badge
  if (badgeElement) {
    badgeElement.textContent = cameras.length;
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
  const badgeElement = document.getElementById('badge-users');
  const isUserAdmin = isAdmin();
  
  // Update badge
  if (badgeElement) {
    badgeElement.textContent = users.length;
  }
  
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
  } catch (error) {
    console.error('Erro ao carregar denúncias:', error);
    showNotification('Erro ao carregar denúncias: ' + error.message, 'error');
    // Fallback para dados vazios
    renderDenunciasTable([]);
  }
}

function renderDenunciasTable(denuncias) {
  const tbody = document.getElementById('denuncias-table-body');
  const badgeElement = document.getElementById('badge-denuncias');
  
  // Update badge
  if (badgeElement) {
    badgeElement.textContent = denuncias.length;
  }
  
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
  
  tbody.innerHTML = denuncias.map(denuncia => {
    const isUrgente = denuncia.prioridade === 'alta' || denuncia.urgente === true;
    return `
    <tr class="${isUrgente ? 'urgente' : ''}">
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
  `;
  }).join('');
}

async function saveDenuncia(event) {
  event.preventDefault();
  
  const form = event.target;
  const urgente = form.querySelector('#denuncia-urgente')?.checked || false;
  
  const formData = {
    titulo: form.querySelector('#denuncia-titulo').value,
    tipo: form.querySelector('#denuncia-tipo').value,
    camera: form.querySelector('#denuncia-camera').value,
    data: form.querySelector('#denuncia-data').value,
    hora: form.querySelector('#denuncia-hora').value,
    localizacao: form.querySelector('#denuncia-localizacao').value,
    descricao: form.querySelector('#denuncia-descricao').value,
    suspeitos: form.querySelector('#denuncia-suspeitos').value,
    prioridade: form.querySelector('#denuncia-prioridade').value,
    status: form.querySelector('#denuncia-status').value,
    urgente: urgente,
    origem: 'comite-admin'
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
    select.innerHTML = '<option value="">Selecione a câmera</option>' +
                       '<option value="Não especificada">Não especificada</option>';
    
    cameras.forEach(camera => {
      const option = document.createElement('option');
      option.value = `Câmera ${camera.id} - ${camera.name}`;
      option.textContent = `Câmera ${camera.id} - ${camera.name}`;
      if (selectedCamera && option.value === selectedCamera) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    // Preencher data e hora atuais se for novo formulário
    if (!selectedCamera) {
      const hoje = new Date();
      const dataInput = document.getElementById('denuncia-data');
      const horaInput = document.getElementById('denuncia-hora');
      
      if (dataInput && !dataInput.value) {
        dataInput.value = hoje.toISOString().split('T')[0];
      }
      
      if (horaInput && !horaInput.value) {
        const horas = String(hoje.getHours()).padStart(2, '0');
        const minutos = String(hoje.getMinutes()).padStart(2, '0');
        horaInput.value = `${horas}:${minutos}`;
      }
    }
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
  
  // Carregar informações do usuário no header
  loadUserInfo();
  
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
    logoutBtn.addEventListener('click', logout);
  }
  
  console.log('Dashboard initialized successfully!');
});

// Carregar informações do usuário logado
function loadUserInfo() {
  try {
    const token = localStorage.getItem('ssp-token');
    if (token) {
      // Decodificar token JWT (simples, sem validação)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const usernameEl = document.getElementById('header-username');
      const roleEl = document.getElementById('header-role');
      
      if (usernameEl) {
        usernameEl.textContent = payload.username || 'Usuário';
      }
      if (roleEl) {
        roleEl.textContent = payload.role === 'admin' ? 'Administrador' : 'Comitê';
      }
    }
  } catch (error) {
    console.error('Erro ao carregar informações do usuário:', error);
  }
}

// Logout function
function logout() {
  if (confirm('Deseja realmente sair?')) {
    localStorage.removeItem('ssp-token');
    window.location.href = '../index.html';
  }
}


// ==============================
// ANALYSIS MANAGEMENT FUNCTIONS
// ==============================
async function loadAnalysis(silent = false) {
  try {
    const analyses = await apiRequest('/analyses');
    renderAnalysisTable(analyses);
  } catch (error) {
    console.error('Erro ao carregar análises:', error);
    showNotification('Erro ao carregar análises: ' + error.message, 'error');
    // Fallback para dados vazios
    renderAnalysisTable([]);
  }
}

function renderAnalysisTable(analyses) {
  const tbody = document.getElementById('analysis-table-body');
  const badgeElement = document.getElementById('badge-analysis');
  
  // Update badge
  if (badgeElement) {
    badgeElement.textContent = analyses.length;
  }
  
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
      <td>
        ${analysis.type || 'Tipo não especificado'}
        ${analysis.pdfFile ? '<br><small style="color: var(--accent-green);"><i class="fas fa-file-pdf"></i> PDF disponível</small>' : ''}
      </td>
      <td>${analysis.period || 'Período não especificado'}</td>
      <td>${formatDate(analysis.createdAt)}</td>
      <td class="action-buttons-cell">
        ${analysis.pdfFile ? `
        <button class="btn-icon btn-download" onclick="downloadPDF('${analysis.pdfFile}')" title="Baixar PDF">
          <i class="fas fa-download"></i>
        </button>
        ` : ''}
        <button class="btn-icon btn-view" onclick="viewAnalysis(${analysis.id})" title="Visualizar Dados">
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

// Função para download de PDF do servidor
async function downloadPDF(filename) {
  try {
    showNotification('Baixando PDF...', 'info');
    
    const token = localStorage.getItem('ssp-token');
    const response = await fetch(`http://localhost:3000/api/analyses/download/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao baixar PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('PDF baixado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    showNotification('Erro ao baixar PDF: ' + error.message, 'error');
  }
}

// ==============================
// AUTOMATIC ANALYTICS FUNCTIONS
// ==============================

async function loadAllAnalytics() {
  try {
    // Carregar dados de todas as fontes
    const [denuncias, cameras, news] = await Promise.all([
      apiRequest('/denuncias').catch(() => []),
      apiRequest('/cameras').catch(() => []),
      apiRequest('/communications').catch(() => [])
    ]);

    // Calcular análises completas
    const analytics = calculateCompleteAnalytics(denuncias, cameras, news);

    // Atualizar cards de estatísticas
    updateDenunciasStats(analytics.denuncias);
    updateCamerasStats(analytics.cameras);
    updateNoticiasStats(news);

    // Atualizar gráficos e análises detalhadas
    updateDenunciasChart(analytics.denuncias);
    updateCamerasInfo(analytics.cameras);
    updateImpactMetrics(analytics);
    updateTrendAnalysis(analytics);

  } catch (error) {
    console.error('Erro ao carregar análises:', error);
  }
}

function calculateCompleteAnalytics(denuncias, cameras, news) {
  const now = new Date();
  
  // Análises temporais
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const semanaAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const mesAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const trimestreAtras = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const anoAtras = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  // Análise de denúncias
  const denunciasAnalysis = {
    total: denuncias.length,
    hoje: denuncias.filter(d => new Date(d.createdAt) >= hoje).length,
    semana: denuncias.filter(d => new Date(d.createdAt) >= semanaAtras).length,
    mes: denuncias.filter(d => new Date(d.createdAt) >= mesAtras).length,
    trimestre: denuncias.filter(d => new Date(d.createdAt) >= trimestreAtras).length,
    ano: denuncias.filter(d => new Date(d.createdAt) >= anoAtras).length,
    
    // Por prioridade
    alta: denuncias.filter(d => d.prioridade === 'alta').length,
    media: denuncias.filter(d => d.prioridade === 'media').length,
    baixa: denuncias.filter(d => d.prioridade === 'baixa').length,
    
    // Por status
    pendente: denuncias.filter(d => d.status === 'pendente').length,
    emAndamento: denuncias.filter(d => d.status === 'em-andamento').length,
    resolvida: denuncias.filter(d => d.status === 'resolvida').length,
    
    // Taxa de resolução
    taxaResolucao: denuncias.length > 0 ? 
      ((denuncias.filter(d => d.status === 'resolvida').length / denuncias.length) * 100).toFixed(1) : 0,
    
    // Tempo médio de resposta (simulado entre 2h-48h baseado em prioridade)
    tempoMedioResposta: calculateAverageResponseTime(denuncias),
    
    // Por período do dia
    madrugada: denuncias.filter(d => {
      const hora = new Date(d.createdAt).getHours();
      return hora >= 0 && hora < 6;
    }).length,
    manha: denuncias.filter(d => {
      const hora = new Date(d.createdAt).getHours();
      return hora >= 6 && hora < 12;
    }).length,
    tarde: denuncias.filter(d => {
      const hora = new Date(d.createdAt).getHours();
      return hora >= 12 && hora < 18;
    }).length,
    noite: denuncias.filter(d => {
      const hora = new Date(d.createdAt).getHours();
      return hora >= 18 && hora < 24;
    }).length,
    
    // Evolução mensal (últimos 6 meses)
    evolucaoMensal: calculateMonthlyEvolution(denuncias, 6)
  };
  
  // Análise de câmeras
  const camerasAnalysis = {
    total: cameras.length,
    online: cameras.filter(c => c.status === 'online').length,
    offline: cameras.filter(c => c.status === 'offline').length,
    manutencao: cameras.filter(c => c.status === 'maintenance').length,
    
    // Taxa de disponibilidade
    taxaDisponibilidade: cameras.length > 0 ?
      ((cameras.filter(c => c.status === 'online').length / cameras.length) * 100).toFixed(1) : 0,
    
    // Por tipo
    tipos: {
      PTZ: cameras.filter(c => c.type === 'PTZ').length,
      Dome: cameras.filter(c => c.type === 'Dome').length,
      Bullet: cameras.filter(c => c.type === 'Bullet').length
    },
    
    // Por resolução
    resolucoes: {
      '4K': cameras.filter(c => c.resolution === '4K').length,
      '1080p': cameras.filter(c => c.resolution === '1080p').length,
      '720p': cameras.filter(c => c.resolution === '720p').length
    },
    
    // Cobertura estimada (cada câmera cobre ~200m raio)
    areaCobertura: (cameras.filter(c => c.status === 'online').length * 0.1256).toFixed(2), // km² (área do círculo r=200m)
    
    // Instalações por mês
    instalacoesRecentes: cameras.filter(c => new Date(c.createdAt) >= mesAtras).length
  };
  
  return {
    denuncias: denunciasAnalysis,
    cameras: camerasAnalysis,
    dataGeracao: now.toISOString()
  };
}

function calculateAverageResponseTime(denuncias) {
  if (denuncias.length === 0) return '0h';
  
  // Simular tempo médio baseado em prioridade
  let totalHoras = 0;
  denuncias.forEach(d => {
    if (d.prioridade === 'alta') totalHoras += 2;
    else if (d.prioridade === 'media') totalHoras += 12;
    else totalHoras += 24;
  });
  
  const media = totalHoras / denuncias.length;
  return media < 1 ? `${Math.round(media * 60)}min` : `${Math.round(media)}h`;
}

function calculateMonthlyEvolution(denuncias, meses) {
  const evolution = [];
  const now = new Date();
  
  for (let i = meses - 1; i >= 0; i--) {
    const mesData = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mesNome = mesData.toLocaleDateString('pt-BR', { month: 'short' });
    const inicioMes = new Date(mesData.getFullYear(), mesData.getMonth(), 1);
    const fimMes = new Date(mesData.getFullYear(), mesData.getMonth() + 1, 0);
    
    const count = denuncias.filter(d => {
      const data = new Date(d.createdAt);
      return data >= inicioMes && data <= fimMes;
    }).length;
    
    evolution.push({ mes: mesNome, total: count });
  }
  
  return evolution;
}

function updateDenunciasStats(analytics) {
  document.getElementById('total-denuncias').textContent = analytics.total;
  document.getElementById('denuncias-alta').textContent = analytics.alta;
  document.getElementById('denuncias-media').textContent = analytics.media;
  document.getElementById('denuncias-baixa').textContent = analytics.baixa;
}

function updateCamerasStats(analytics) {
  document.getElementById('total-cameras').textContent = analytics.total;
  document.getElementById('cameras-online').textContent = analytics.online;
  document.getElementById('cameras-offline').textContent = analytics.offline;
  document.getElementById('cameras-maintenance').textContent = analytics.manutencao;
}

function updateNoticiasStats(news) {
  const total = news.length;
  
  // Notícias dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentes = news.filter(n => new Date(n.createdAt) > thirtyDaysAgo).length;

  document.getElementById('total-noticias').textContent = total;
  document.getElementById('noticias-mes').textContent = recentes;
}

function updateUsersStats(users) {
  const total = users.length;
  const admins = users.filter(u => u.role === 'admin').length;

  document.getElementById('total-users').textContent = total;
  document.getElementById('users-admin').textContent = admins;
}

function updateDenunciasChart(analytics) {
  const chartContainer = document.getElementById('denuncias-status-chart');
  const total = analytics.total || 1;
  
  chartContainer.innerHTML = `
    <div class="progress-bar-container">
      <div class="progress-label">
        <span><i class="fas fa-clock"></i> Pendentes</span>
        <strong>${analytics.pendente} (${((analytics.pendente/total)*100).toFixed(1)}%)</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill pendente" style="width: ${(analytics.pendente/total)*100}%">
          ${analytics.pendente > 0 ? analytics.pendente : ''}
        </div>
      </div>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-label">
        <span><i class="fas fa-spinner"></i> Em Andamento</span>
        <strong>${analytics.emAndamento} (${((analytics.emAndamento/total)*100).toFixed(1)}%)</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill em-andamento" style="width: ${(analytics.emAndamento/total)*100}%">
          ${analytics.emAndamento > 0 ? analytics.emAndamento : ''}
        </div>
      </div>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-label">
        <span><i class="fas fa-check-circle"></i> Resolvidas</span>
        <strong>${analytics.resolvida} (${((analytics.resolvida/total)*100).toFixed(1)}%)</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill resolvida" style="width: ${(analytics.resolvida/total)*100}%">
          ${analytics.resolvida > 0 ? analytics.resolvida : ''}
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid var(--border-color);">
      <div class="info-list">
        <li>
          <span><i class="fas fa-percentage"></i> Taxa de Resolução</span>
          <strong class="highlight-success">${analytics.taxaResolucao}%</strong>
        </li>
        <li>
          <span><i class="fas fa-hourglass-half"></i> Tempo Médio de Resposta</span>
          <strong>${analytics.tempoMedioResposta}</strong>
        </li>
      </div>
    </div>
  `;
}

function updateCamerasInfo(analytics) {
  const infoContainer = document.getElementById('cameras-coverage-info');
  
  infoContainer.innerHTML = `
    <ul class="info-list">
      <li>
        <span><i class="fas fa-circle" style="color: var(--accent-green); font-size: 0.6rem;"></i> Câmeras Online</span>
        <strong>${analytics.online} de ${analytics.total}</strong>
      </li>
      <li>
        <span><i class="fas fa-circle" style="color: var(--accent-red); font-size: 0.6rem;"></i> Câmeras Offline</span>
        <strong>${analytics.offline} de ${analytics.total}</strong>
      </li>
      <li>
        <span><i class="fas fa-circle" style="color: var(--accent-orange); font-size: 0.6rem;"></i> Em Manutenção</span>
        <strong>${analytics.manutencao} de ${analytics.total}</strong>
      </li>
      <li>
        <span><i class="fas fa-percentage"></i> Taxa de Disponibilidade</span>
        <strong class="highlight-success">${analytics.taxaDisponibilidade}%</strong>
      </li>
      <li>
        <span><i class="fas fa-map-marked-alt"></i> Área de Cobertura Estimada</span>
        <strong>${analytics.areaCobertura} km²</strong>
      </li>
      <li>
        <span><i class="fas fa-plus-circle"></i> Instalações Recentes (30 dias)</span>
        <strong>${analytics.instalacoesRecentes}</strong>
      </li>
    </ul>
  `;
}

function updateImpactMetrics(analytics) {
  // Adicionar seção de métricas de impacto se não existir
  const existingMetrics = document.getElementById('impact-metrics-section');
  if (existingMetrics) {
    existingMetrics.remove();
  }
  
  const analysisSection = document.querySelector('.analysis-sections');
  if (!analysisSection) return;
  
  const metricsHTML = `
    <div class="analysis-section analysis-section-full" id="impact-metrics-section">
      <h3><i class="fas fa-trophy"></i> Métricas de Impacto do Sistema</h3>
      <div class="impact-grid">
        <div class="impact-card">
          <div class="impact-icon"><i class="fas fa-chart-line"></i></div>
          <div class="impact-content">
            <h4>${analytics.denuncias.semana}</h4>
            <p>Denúncias na Última Semana</p>
            <span class="impact-trend ${analytics.denuncias.semana < analytics.denuncias.mes/4 ? 'positive' : 'neutral'}">
              ${analytics.denuncias.semana < analytics.denuncias.mes/4 ? 'Redução de ' + (100 - (analytics.denuncias.semana/(analytics.denuncias.mes/4))*100).toFixed(0) + '%' : 'Estável'}
            </span>
          </div>
        </div>
        
        <div class="impact-card">
          <div class="impact-icon"><i class="fas fa-shield-alt"></i></div>
          <div class="impact-content">
            <h4>${analytics.cameras.taxaDisponibilidade}%</h4>
            <p>Disponibilidade de Câmeras</p>
            <span class="impact-trend ${analytics.cameras.taxaDisponibilidade >= 80 ? 'positive' : 'warning'}">
              ${analytics.cameras.taxaDisponibilidade >= 80 ? 'Excelente' : 'Atenção Necessária'}
            </span>
          </div>
        </div>
        
        <div class="impact-card">
          <div class="impact-icon"><i class="fas fa-clock"></i></div>
          <div class="impact-content">
            <h4>${analytics.denuncias.tempoMedioResposta}</h4>
            <p>Tempo Médio de Resposta</p>
            <span class="impact-trend positive">Rápido</span>
          </div>
        </div>
        
        <div class="impact-card">
          <div class="impact-icon"><i class="fas fa-check-double"></i></div>
          <div class="impact-content">
            <h4>${analytics.denuncias.taxaResolucao}%</h4>
            <p>Taxa de Resolução</p>
            <span class="impact-trend ${analytics.denuncias.taxaResolucao >= 70 ? 'positive' : 'warning'}">
              ${analytics.denuncias.taxaResolucao >= 70 ? 'Alto Desempenho' : 'Melhorar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  analysisSection.insertAdjacentHTML('beforeend', metricsHTML);
}

function updateTrendAnalysis(analytics) {
  // Adicionar análise de tendências
  const existingTrends = document.getElementById('trend-analysis-section');
  if (existingTrends) {
    existingTrends.remove();
  }
  
  const analysisSection = document.querySelector('.analysis-sections');
  if (!analysisSection) return;
  
  const trendsHTML = `
    <div class="analysis-section analysis-section-full" id="trend-analysis-section">
      <h3><i class="fas fa-chart-area"></i> Análise de Tendências e Padrões</h3>
      <div class="trends-container">
        <div class="trend-item">
          <h4><i class="fas fa-sun"></i> Distribuição por Período do Dia</h4>
          <div class="period-bars">
            <div class="period-bar">
              <span class="period-label">Madrugada (00h-06h)</span>
              <div class="period-progress">
                <div class="period-fill" style="width: ${(analytics.denuncias.madrugada/(analytics.denuncias.total||1))*100}%; background: #3498db;">
                  ${analytics.denuncias.madrugada}
                </div>
              </div>
            </div>
            <div class="period-bar">
              <span class="period-label">Manhã (06h-12h)</span>
              <div class="period-progress">
                <div class="period-fill" style="width: ${(analytics.denuncias.manha/(analytics.denuncias.total||1))*100}%; background: #f39c12;">
                  ${analytics.denuncias.manha}
                </div>
              </div>
            </div>
            <div class="period-bar">
              <span class="period-label">Tarde (12h-18h)</span>
              <div class="period-progress">
                <div class="period-fill" style="width: ${(analytics.denuncias.tarde/(analytics.denuncias.total||1))*100}%; background: #e74c3c;">
                  ${analytics.denuncias.tarde}
                </div>
              </div>
            </div>
            <div class="period-bar">
              <span class="period-label">Noite (18h-24h)</span>
              <div class="period-progress">
                <div class="period-fill" style="width: ${(analytics.denuncias.noite/(analytics.denuncias.total||1))*100}%; background: #9b59b6;">
                  ${analytics.denuncias.noite}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="trend-item">
          <h4><i class="fas fa-calendar-alt"></i> Evolução Mensal (Últimos 6 Meses)</h4>
          <div class="monthly-evolution">
            ${analytics.denuncias.evolucaoMensal.map((item, index) => `
              <div class="month-bar">
                <span class="month-label">${item.mes}</span>
                <div class="month-progress">
                  <div class="month-fill" style="height: ${item.total > 0 ? (item.total/Math.max(...analytics.denuncias.evolucaoMensal.map(i => i.total)))*100 : 10}%">
                    ${item.total}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="insights-box">
        <h4><i class="fas fa-lightbulb"></i> Insights Automatizados</h4>
        <ul class="insights-list">
          <li><i class="fas fa-info-circle"></i> Maior volume de denúncias no período da ${getMostActivePeriod(analytics.denuncias)}</li>
          <li><i class="fas fa-info-circle"></i> Taxa de resolução de ${analytics.denuncias.taxaResolucao}% ${analytics.denuncias.taxaResolucao >= 70 ? 'indica bom desempenho' : 'pode ser melhorada'}</li>
          <li><i class="fas fa-info-circle"></i> Sistema de câmeras com ${analytics.cameras.taxaDisponibilidade}% de disponibilidade</li>
          <li><i class="fas fa-info-circle"></i> ${analytics.cameras.areaCobertura} km² de área monitorada por ${analytics.cameras.online} câmeras ativas</li>
        </ul>
      </div>
    </div>
  `;
  
  analysisSection.insertAdjacentHTML('beforeend', trendsHTML);
}

function getMostActivePeriod(denunciasAnalytics) {
  const periods = {
    'madrugada': denunciasAnalytics.madrugada,
    'manhã': denunciasAnalytics.manha,
    'tarde': denunciasAnalytics.tarde,
    'noite': denunciasAnalytics.noite
  };
  
  return Object.keys(periods).reduce((a, b) => periods[a] > periods[b] ? a : b);
}

async function refreshAllAnalytics() {
  showNotification('Atualizando análises...', 'info');
  await loadAllAnalytics();
  showNotification('Análises atualizadas com sucesso!', 'success');
}

async function generateAutoReport() {
  try {
    showNotification('Coletando dados para o relatório...', 'info');

    // Coletar todos os dados
    const [denuncias, cameras, news] = await Promise.all([
      apiRequest('/denuncias').catch(() => []),
      apiRequest('/cameras').catch(() => []),
      apiRequest('/communications').catch(() => [])
    ]);

    // Calcular análises completas
    const analytics = calculateCompleteAnalytics(denuncias, cameras, news);
    
    showNotification('Gerando PDF...', 'info');

    // Criar PDF usando jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const now = new Date();
    const dataFormatada = now.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Função para adicionar nova página se necessário
    const checkPageBreak = (neededSpace = 20) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };
    
    // ===== CABEÇALHO =====
    doc.setFillColor(8, 13, 63); // Cor azul escuro SSP
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SSP - CRICIÚMA', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Relatório de Análises do Sistema', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dataFormatada}`, 105, 33, { align: 'center' });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);
    
    // ===== RESUMO EXECUTIVO =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 13, 63);
    doc.text('RESUMO EXECUTIVO', margin, yPos);
    yPos += lineHeight + 3;
    
    doc.setDrawColor(8, 13, 63);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, 190, yPos);
    yPos += lineHeight;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    const resumo = [
      `Total de Denúncias: ${analytics.denuncias.total}`,
      `Taxa de Resolução: ${analytics.denuncias.taxaResolucao}%`,
      `Tempo Médio de Resposta: ${analytics.denuncias.tempoMedioResposta}`,
      `Câmeras Instaladas: ${analytics.cameras.total}`,
      `Disponibilidade de Câmeras: ${analytics.cameras.taxaDisponibilidade}%`,
      `Área de Cobertura: ${analytics.cameras.areaCobertura} km²`
    ];
    
    resumo.forEach(line => {
      doc.text(`• ${line}`, margin + 5, yPos);
      yPos += lineHeight;
    });
    
    yPos += 5;
    checkPageBreak(40);
    
    // ===== ANÁLISE DE DENÚNCIAS =====
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 13, 63);
    doc.text('ANÁLISE DE DENÚNCIAS', margin, yPos);
    yPos += lineHeight;
    
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, 190, yPos);
    yPos += lineHeight;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Por período
    doc.setFont(undefined, 'bold');
    doc.text('Por Período:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    const periodos = [
      `Hoje: ${analytics.denuncias.hoje}`,
      `Última Semana: ${analytics.denuncias.semana}`,
      `Último Mês: ${analytics.denuncias.mes}`,
      `Último Trimestre: ${analytics.denuncias.trimestre}`,
      `Último Ano: ${analytics.denuncias.ano}`
    ];
    
    periodos.forEach(line => {
      doc.text(`  • ${line}`, margin + 10, yPos);
      yPos += lineHeight;
    });
    
    yPos += 3;
    checkPageBreak(30);
    
    // Por prioridade
    doc.setFont(undefined, 'bold');
    doc.text('Por Prioridade:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    doc.setFillColor(239, 68, 68);
    doc.circle(margin + 12, yPos - 1.5, 1.5, 'F');
    doc.text(`Alta: ${analytics.denuncias.alta} (${((analytics.denuncias.alta/(analytics.denuncias.total||1))*100).toFixed(1)}%)`, margin + 17, yPos);
    yPos += lineHeight;
    
    doc.setFillColor(245, 158, 11);
    doc.circle(margin + 12, yPos - 1.5, 1.5, 'F');
    doc.text(`Média: ${analytics.denuncias.media} (${((analytics.denuncias.media/(analytics.denuncias.total||1))*100).toFixed(1)}%)`, margin + 17, yPos);
    yPos += lineHeight;
    
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 12, yPos - 1.5, 1.5, 'F');
    doc.text(`Baixa: ${analytics.denuncias.baixa} (${((analytics.denuncias.baixa/(analytics.denuncias.total||1))*100).toFixed(1)}%)`, margin + 17, yPos);
    yPos += lineHeight + 3;
    
    checkPageBreak(30);
    
    // Por status
    doc.setFont(undefined, 'bold');
    doc.text('Por Status:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    doc.setFillColor(245, 158, 11);
    doc.circle(margin + 12, yPos - 1.5, 1.5, 'F');
    doc.text(`Pendente: ${analytics.denuncias.pendente} (${((analytics.denuncias.pendente/(analytics.denuncias.total||1))*100).toFixed(1)}%)`, margin + 17, yPos);
    yPos += lineHeight;
    
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 12, yPos - 1.5, 1.5, 'F');
    doc.text(`Em Andamento: ${analytics.denuncias.emAndamento} (${((analytics.denuncias.emAndamento/(analytics.denuncias.total||1))*100).toFixed(1)}%)`, margin + 17, yPos);
    yPos += lineHeight;
    
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 12, yPos - 1.5, 1.5, 'F');
    doc.text(`Resolvida: ${analytics.denuncias.resolvida} (${((analytics.denuncias.resolvida/(analytics.denuncias.total||1))*100).toFixed(1)}%)`, margin + 17, yPos);
    yPos += lineHeight + 3;
    
    checkPageBreak(30);
    
    // Por período do dia
    doc.setFont(undefined, 'bold');
    doc.text('Por Período do Dia:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    const periodoDia = [
      `Madrugada (00h-06h): ${analytics.denuncias.madrugada}`,
      `Manhã (06h-12h): ${analytics.denuncias.manha}`,
      `Tarde (12h-18h): ${analytics.denuncias.tarde}`,
      `Noite (18h-24h): ${analytics.denuncias.noite}`
    ];
    
    periodoDia.forEach(line => {
      doc.text(`  • ${line}`, margin + 10, yPos);
      yPos += lineHeight;
    });
    
    yPos += 5;
    checkPageBreak(40);
    
    // ===== ANÁLISE DE CÂMERAS =====
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 13, 63);
    doc.text('ANÁLISE DO SISTEMA DE CÂMERAS', margin, yPos);
    yPos += lineHeight;
    
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, 190, yPos);
    yPos += lineHeight;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    const camerasInfo = [
      `Total de Câmeras: ${analytics.cameras.total}`,
      `Câmeras Online: ${analytics.cameras.online} (${analytics.cameras.taxaDisponibilidade}%)`,
      `Câmeras Offline: ${analytics.cameras.offline}`,
      `Em Manutenção: ${analytics.cameras.manutencao}`,
      `Área de Cobertura: ${analytics.cameras.areaCobertura} km²`,
      `Instalações Recentes: ${analytics.cameras.instalacoesRecentes} (últimos 30 dias)`
    ];
    
    camerasInfo.forEach(line => {
      doc.text(`• ${line}`, margin + 5, yPos);
      yPos += lineHeight;
    });
    
    yPos += 3;
    checkPageBreak(30);
    
    // Por tipo
    doc.setFont(undefined, 'bold');
    doc.text('Por Tipo de Câmera:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    Object.entries(analytics.cameras.tipos).forEach(([tipo, qtd]) => {
      doc.text(`  • ${tipo}: ${qtd}`, margin + 10, yPos);
      yPos += lineHeight;
    });
    
    yPos += 3;
    checkPageBreak(30);
    
    // Por resolução
    doc.setFont(undefined, 'bold');
    doc.text('Por Resolução:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    Object.entries(analytics.cameras.resolucoes).forEach(([res, qtd]) => {
      doc.text(`  • ${res}: ${qtd}`, margin + 10, yPos);
      yPos += lineHeight;
    });
    
    yPos += 5;
    checkPageBreak(50);
    
    // ===== INSIGHTS E RECOMENDAÇÕES =====
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 13, 63);
    doc.text('INSIGHTS E RECOMENDAÇÕES', margin, yPos);
    yPos += lineHeight;
    
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, 190, yPos);
    yPos += lineHeight;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    const insights = [
      `Período de maior atividade: ${getMostActivePeriod(analytics.denuncias)}`,
      `Desempenho do sistema: ${analytics.denuncias.taxaResolucao >= 70 ? 'Alto desempenho' : 'Oportunidades de melhoria'}`,
      `Status da infraestrutura: ${analytics.cameras.taxaDisponibilidade >= 80 ? 'Excelente estado' : 'Atenção necessária'}`,
      `Tendência de denúncias: ${analytics.denuncias.semana < analytics.denuncias.mes/4 ? 'Redução positiva' : 'Monitoramento contínuo'}`
    ];
    
    insights.forEach(line => {
      checkPageBreak(10);
      doc.text(`✓ ${line}`, margin + 5, yPos);
      yPos += lineHeight;
    });
    
    yPos += 3;
    checkPageBreak(30);
    
    doc.setFont(undefined, 'bold');
    doc.text('Recomendações:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    
    const recomendacoes = [
      analytics.denuncias.alta > 0 ? `Priorizar ${analytics.denuncias.alta} denúncia(s) de alta prioridade` : 'Manter foco em denúncias pendentes',
      `Reforçar monitoramento no período da ${getMostActivePeriod(analytics.denuncias)}`,
      analytics.cameras.offline > 0 ? `Manutenção urgente em ${analytics.cameras.offline} câmera(s) offline` : 'Sistema de câmeras operando normalmente',
      `Taxa de resolução de ${analytics.denuncias.taxaResolucao}% ${analytics.denuncias.taxaResolucao >= 70 ? 'demonstra eficácia do sistema' : 'pode ser melhorada com ações específicas'}`
    ];
    
    recomendacoes.forEach(line => {
      checkPageBreak(15);
      const lines = doc.splitTextToSize(`• ${line}`, 170);
      doc.text(lines, margin + 10, yPos);
      yPos += lines.length * lineHeight;
    });
    
    // ===== RODAPÉ =====
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${totalPages}`, 105, pageHeight - 10, { align: 'center' });
      doc.text('SSP Criciúma - Sistema de Segurança Pública', 105, pageHeight - 5, { align: 'center' });
    }
    
    // Salvar PDF
    const nomeArquivo = `Relatorio_SSP_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.pdf`;
    
    // Preparar dados do relatório
    const reportData = {
      resumo_executivo: {
        data_geracao: analytics.dataGeracao,
        total_denuncias: analytics.denuncias.total,
        taxa_resolucao: `${analytics.denuncias.taxaResolucao}%`,
        disponibilidade_cameras: `${analytics.cameras.taxaDisponibilidade}%`
      },
      analise_denuncias: analytics.denuncias,
      analise_cameras: analytics.cameras
    };
    
    const periodo = now.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Converter PDF para Blob
    const pdfBlob = doc.output('blob');
    
    // Download local do PDF
    doc.save(nomeArquivo);
    
    showNotification('PDF gerado! Salvando no servidor...', 'info');
    
    // Enviar PDF para o servidor
    const formData = new FormData();
    formData.append('pdf', pdfBlob, nomeArquivo);
    formData.append('type', 'Relatório Automático Completo');
    formData.append('period', periodo);
    formData.append('data', JSON.stringify(reportData, null, 2));
    
    try {
      const token = localStorage.getItem('ssp-token');
      const uploadResponse = await fetch('http://localhost:3000/api/analyses/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Erro do servidor:', errorText);
        throw new Error('Erro ao salvar PDF no servidor');
      }
      
      const savedReport = await uploadResponse.json();
      showNotification(`Relatório salvo com sucesso! ID: ${savedReport.id}`, 'success');
      
      setTimeout(() => loadAnalysis(false), 800);
      
    } catch (uploadError) {
      console.error('Erro ao enviar PDF:', uploadError);
      showNotification('PDF gerado, mas erro ao salvar no servidor. Salvando dados...', 'warning');
      
      // Fallback: salvar apenas os dados JSON
      try {
        const newReport = {
          type: `Relatório Automático Completo`,
          period: periodo,
          data: JSON.stringify(reportData, null, 2)
        };
        
        await apiRequest('/analyses', {
          method: 'POST',
          body: JSON.stringify(newReport)
        });
        
        showNotification('Dados do relatório salvos com sucesso!', 'success');
        setTimeout(() => loadAnalysis(false), 800);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        showNotification('Erro ao salvar relatório', 'error');
      }
    }

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    showNotification('Erro ao gerar relatório: ' + error.message, 'error');
  }
}
