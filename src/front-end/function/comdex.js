// ==============================
// COMITÊ PAGE - MAIN SCRIPT
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  initializeHeader();
  initializeLogout();
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
        const KEY = 'ssp.comite.auth';
        sessionStorage.removeItem(KEY);
        
        // Redireciona para a página inicial
        window.location.href = 'index.html';
      }
    });
  }
}

// ==============================
// Section Navigation (Toggle)
// ==============================
function toggleSection(sectionName) {
  const section = document.getElementById(`section-${sectionName}`);
  const allCards = document.querySelectorAll('.quick-card');
  const clickedCard = event.currentTarget;
  
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
    
    // Scroll suave até a seção
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

// ==============================
// Modal Functions
// ==============================
function openModal(type) {
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
    case 'add-analise':
      modalTitle.textContent = 'Adicionar Nova Análise';
      modalBody.innerHTML = getAnalysisForm();
      break;
    case 'add-camera':
      modalTitle.textContent = 'Adicionar Nova Câmera';
      modalBody.innerHTML = getCameraForm();
      break;
    case 'add-usuario':
      modalTitle.textContent = 'Adicionar Novo Usuário';
      modalBody.innerHTML = getUserForm();
      break;
    default:
      modalBody.innerHTML = '<p>Formulário não encontrado</p>';
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal-container');
  
  overlay.classList.remove('active');
  modal.classList.remove('active');
}

// ==============================
// Form Templates
// ==============================
function getNewsForm() {
  return `
    <form onsubmit="saveNews(event)" class="admin-form">
      <div class="form-group">
        <label for="news-title">Título da Notícia</label>
        <input type="text" id="news-title" required class="form-input">
      </div>
      <div class="form-group">
        <label for="news-content">Conteúdo</label>
        <textarea id="news-content" rows="6" required class="form-input"></textarea>
      </div>
      <div class="form-group">
        <label for="news-image">URL da Imagem</label>
        <input type="url" id="news-image" class="form-input">
      </div>
      <div class="form-group">
        <label for="news-status">Status</label>
        <select id="news-status" class="form-input">
          <option value="published">Publicada</option>
          <option value="draft">Rascunho</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getAnalysisForm() {
  return `
    <form onsubmit="saveAnalysis(event)" class="admin-form">
      <div class="form-group">
        <label for="analysis-type">Tipo de Análise</label>
        <input type="text" id="analysis-type" required class="form-input">
      </div>
      <div class="form-group">
        <label for="analysis-period">Período</label>
        <input type="text" id="analysis-period" required class="form-input">
      </div>
      <div class="form-group">
        <label for="analysis-data">Dados (JSON)</label>
        <textarea id="analysis-data" rows="8" required class="form-input"></textarea>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getCameraForm() {
  return `
    <form onsubmit="saveCamera(event)" class="admin-form">
      <div class="form-group">
        <label for="camera-name">Nome da Câmera</label>
        <input type="text" id="camera-name" required class="form-input">
      </div>
      <div class="form-group">
        <label for="camera-location">Localização</label>
        <input type="text" id="camera-location" required class="form-input">
      </div>
      <div class="form-group">
        <label for="camera-stream">URL do Stream</label>
        <input type="url" id="camera-stream" required class="form-input" placeholder="rtsp://...">
      </div>
      <div class="form-group">
        <label for="camera-lat">Latitude</label>
        <input type="number" id="camera-lat" step="0.000001" class="form-input" placeholder="-23.550520">
      </div>
      <div class="form-group">
        <label for="camera-lng">Longitude</label>
        <input type="number" id="camera-lng" step="0.000001" class="form-input" placeholder="-46.633308">
      </div>
      <div class="form-group">
        <label for="camera-status">Status</label>
        <select id="camera-status" class="form-input">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="manutencao">Manutenção</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

function getUserForm() {
  return `
    <form onsubmit="saveUser(event)" class="admin-form">
      <div class="form-group">
        <label for="user-name">Nome Completo</label>
        <input type="text" id="user-name" required class="form-input">
      </div>
      <div class="form-group">
        <label for="user-email">Email</label>
        <input type="email" id="user-email" required class="form-input">
      </div>
      <div class="form-group">
        <label for="user-password">Senha</label>
        <input type="password" id="user-password" required class="form-input">
      </div>
      <div class="form-group">
        <label for="user-role">Cargo</label>
        <select id="user-role" class="form-input">
          <option value="admin">Administrador</option>
          <option value="operator">Operador</option>
          <option value="viewer">Visualizador</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-primary">Salvar</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `;
}

// ==============================
// CRUD Operations - News
// ==============================
function saveNews(event) {
  event.preventDefault();
  // Aqui será implementada a integração com o backend
  console.log('Salvando notícia...');
  showNotification('Notícia salva com sucesso!', 'success');
  closeModal();
}

function editNews(id) {
  console.log('Editando notícia:', id);
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function deleteNews(id) {
  if (confirm('Deseja realmente excluir esta notícia?')) {
    console.log('Excluindo notícia:', id);
    showNotification('Notícia excluída com sucesso!', 'success');
  }
}

function refreshNews() {
  console.log('Atualizando lista de notícias...');
  showNotification('Lista atualizada!', 'success');
}

// ==============================
// CRUD Operations - Analysis
// ==============================
function saveAnalysis(event) {
  event.preventDefault();
  console.log('Salvando análise...');
  showNotification('Análise salva com sucesso!', 'success');
  closeModal();
}

function viewAnalysis(id) {
  console.log('Visualizando análise:', id);
  showNotification('Abrindo análise...', 'info');
}

function editAnalysis(id) {
  console.log('Editando análise:', id);
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function deleteAnalysis(id) {
  if (confirm('Deseja realmente excluir esta análise?')) {
    console.log('Excluindo análise:', id);
    showNotification('Análise excluída com sucesso!', 'success');
  }
}

function refreshAnalysis() {
  console.log('Atualizando dados de análises...');
  showNotification('Dados atualizados!', 'success');
}

// ==============================
// CRUD Operations - Cameras
// ==============================
function saveCamera(event) {
  event.preventDefault();
  console.log('Salvando câmera...');
  showNotification('Câmera salva com sucesso!', 'success');
  closeModal();
}

function editCamera(id) {
  console.log('Editando câmera:', id);
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function deleteCamera(id) {
  if (confirm('Deseja realmente excluir esta câmera?')) {
    console.log('Excluindo câmera:', id);
    showNotification('Câmera excluída com sucesso!', 'success');
  }
}

function refreshCameras() {
  console.log('Atualizando lista de câmeras...');
  showNotification('Lista atualizada!', 'success');
}

function testCamera(id) {
  console.log('Testando conexão da câmera:', id);
  showNotification('Testando câmera...', 'info');
  setTimeout(() => {
    showNotification('Câmera respondendo normalmente', 'success');
  }, 2000);
}

// ==============================
// CRUD Operations - Users
// ==============================
function saveUser(event) {
  event.preventDefault();
  console.log('Salvando usuário...');
  showNotification('Usuário salvo com sucesso!', 'success');
  closeModal();
}

function editUser(id) {
  console.log('Editando usuário:', id);
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function deleteUser(id) {
  if (confirm('Deseja realmente desativar este usuário?')) {
    console.log('Desativando usuário:', id);
    showNotification('Usuário desativado com sucesso!', 'success');
  }
}

function refreshUsers() {
  console.log('Atualizando lista de usuários...');
  showNotification('Lista atualizada!', 'success');
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
    .admin-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-weight: 600;
      color: var(--text-dark);
    }
    .form-input {
      padding: 12px 16px;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
    }
    .form-buttons {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }
    .form-buttons button {
      flex: 1;
    }
  `;
  document.head.appendChild(style);
}

console.log('Comitê Dashboard initialized successfully! 🔐');
