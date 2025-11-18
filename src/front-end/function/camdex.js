// ==============================
// CÂMERAS PAGE - MAIN SCRIPT
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  initializeHeader();
  initializeLogout();
  loadCameras();
});

// ==============================
// Header - Efeito de Scroll
// ==============================
function initializeHeader() {
  const header = document.querySelector('header');

  const handleHeaderScroll = () => {
    if (!header) return;
    const isPastThreshold = window.scrollY > 50;
    header.classList.toggle('scrolled', isPastThreshold);
  };

  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();
}

// ==============================
// Logout Function
// ==============================
function initializeLogout() {
  const logoutBtn = document.querySelector('.btn-logout');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Deseja realmente sair do painel administrativo?')) {
        // Remove a autenticação
        localStorage.removeItem('ssp-token');
        localStorage.removeItem('ssp-user');

        // Redireciona para a página inicial
        window.location.href = '../index.html';
      }
    });
  }
}

// ==============================
// API Helper
// ==============================
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('ssp-token');
  if (!token) {
    throw new Error('Token não encontrado');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(`/api${endpoint}`, { ...defaultOptions, ...options });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro na requisição' }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

// ==============================
// Load Cameras
// ==============================
async function loadCameras() {
  const container = document.getElementById('cameras-container');

  try {
    const cameras = await apiRequest('/cameras');

    updateStats(cameras);
    renderCameras(cameras);

  } catch (error) {
    console.error('Erro ao carregar câmeras:', error);
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erro ao carregar câmeras</h3>
        <p>${error.message}</p>
        <button class="btn-retry" onclick="loadCameras()">
          <i class="fas fa-redo"></i> Tentar Novamente
        </button>
      </div>
    `;
  }
}

// ==============================
// Update Statistics
// ==============================
function updateStats(cameras) {
  const total = cameras.length;
  const online = cameras.filter(c => c.status === 'online').length;
  const offline = cameras.filter(c => c.status === 'offline').length;

  document.getElementById('total-cameras').textContent = total;
  document.getElementById('online-cameras').textContent = online;
  document.getElementById('offline-cameras').textContent = offline;
}

// ==============================
// Render Cameras Grid
// ==============================
function renderCameras(cameras) {
  const container = document.getElementById('cameras-container');

  if (!cameras || cameras.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-video-slash"></i>
        <h3>Nenhuma câmera cadastrada</h3>
        <p>Cadastre câmeras no painel do comitê</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cameras.map(camera => `
    <div class="camera-card ${camera.status}" onclick="openCameraModal(${camera.id})">
      <div class="camera-header">
        <div class="camera-status ${camera.status}">
          <i class="fas fa-circle"></i>
          <span>${getStatusText(camera.status)}</span>
        </div>
        <div class="camera-actions">
          <button class="btn-test" onclick="event.stopPropagation(); testCameraConnection(${camera.id})" title="Testar conexão">
            <i class="fas fa-plug"></i>
          </button>
        </div>
      </div>

      <div class="camera-content">
        <div class="camera-thumbnail">
          <i class="fas fa-video"></i>
          <div class="camera-overlay">
            <span>Clique para visualizar</span>
          </div>
        </div>

        <div class="camera-info">
          <h3>${camera.name}</h3>
          <p><i class="fas fa-map-marker-alt"></i> ${camera.location}</p>
          <div class="camera-meta">
            <small>
              <i class="fas fa-clock"></i>
              ${camera.updatedAt ? formatDate(camera.createdAt) : 'Nunca atualizado'}
            </small>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ==============================
// Filter Cameras
// ==============================
function filterCameras() {
  const statusFilter = document.getElementById('status-filter').value;
  const searchFilter = document.getElementById('search-filter').value.toLowerCase();

  const cards = document.querySelectorAll('.camera-card');

  cards.forEach(card => {
    const status = card.classList.contains(statusFilter) || statusFilter === 'all';
    const name = card.querySelector('h3').textContent.toLowerCase();
    const location = card.querySelector('p').textContent.toLowerCase();
    const search = name.includes(searchFilter) || location.includes(searchFilter) || searchFilter === '';

    if (status && search) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==============================
// Camera Modal
// ==============================
let currentCamera = null;

function openCameraModal(cameraId) {
  // Buscar dados da câmera (simulado - em produção buscar da API)
  apiRequest(`/cameras/${cameraId}`).then(camera => {
    currentCamera = camera;

    document.getElementById('modal-camera-title').textContent = camera.name;
    document.getElementById('modal-camera-location').textContent = camera.location;
    document.getElementById('modal-camera-status').textContent = getStatusText(camera.status);
    document.getElementById('modal-camera-updated').textContent =
      camera.updatedAt ? formatDate(camera.updatedAt) : 'Nunca';
    document.getElementById('modal-camera-coords').textContent =
      camera.latitude && camera.longitude ?
      `${camera.latitude.toFixed(6)}, ${camera.longitude.toFixed(6)}` : 'Não informado';

    // Simular stream (em produção seria o stream real)
    const streamContainer = document.getElementById('camera-stream');
    if (camera.status === 'online') {
      streamContainer.innerHTML = `
        <div class="live-stream">
          <div class="stream-header">
            <span class="live-indicator">
              <i class="fas fa-circle"></i> AO VIVO
            </span>
          </div>
          <div class="stream-content">
            <i class="fas fa-video"></i>
            <p>Stream RTSP: ${camera.stream_url}</p>
            <small>Sem filtros de privacidade - Visualização do Comitê</small>
          </div>
        </div>
      `;
    } else {
      streamContainer.innerHTML = `
        <i class="fas fa-video-slash"></i>
        <p>Câmera offline</p>
        <small>Status: ${getStatusText(camera.status)}</small>
      `;
    }

    document.getElementById('camera-modal').style.display = 'flex';
  }).catch(error => {
    showNotification('Erro ao carregar câmera: ' + error.message, 'error');
  });
}

function closeCameraModal() {
  document.getElementById('camera-modal').style.display = 'none';
  currentCamera = null;
}

// ==============================
// Camera Actions
// ==============================
function testCameraConnection(cameraId = null) {
  const id = cameraId || (currentCamera ? currentCamera.id : null);
  if (!id) return;

  showNotification('Testando conexão da câmera...', 'info');

  // Simular teste de conexão
  setTimeout(() => {
    showNotification('Câmera respondendo normalmente', 'success');
  }, 2000);
}

function viewOnMap() {
  if (!currentCamera || !currentCamera.latitude || !currentCamera.longitude) {
    showNotification('Coordenadas não disponíveis', 'warning');
    return;
  }

  // Abrir mapa com a câmera (simulado)
  showNotification('Abrindo mapa...', 'info');
  // window.open(`mapdex.html?lat=${currentCamera.latitude}&lng=${currentCamera.longitude}`, '_blank');
}

// ==============================
// Utility Functions
// ==============================
function getStatusText(status) {
  const statusMap = {
    'online': 'Online',
    'offline': 'Offline',
    'manutencao': 'Manutenção'
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}

// ==============================
// Notifications
// ==============================
function showNotification(message, type = 'info') {
  // Remove notificação existente
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Adiciona estilos inline
  Object.assign(notification.style, {
    position: 'fixed',
    top: '100px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '12px',
    backgroundColor: getNotificationColor(type),
    color: 'white',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '10000',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideInRight 0.3s ease',
    maxWidth: '400px'
  });

  // Remove após 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function getNotificationIcon(type) {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#1e90ff'
  };
  return colors[type] || '#1e90ff';
}

// Adiciona animações
if (!document.querySelector('#animations-style')) {
  const style = document.createElement('style');
  style.id = 'animations-style';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

console.log('Câmeras Dashboard initialized successfully! 📹');