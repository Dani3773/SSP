// Chave de sessão
const COMITE_SESSION_KEY = 'ssp.comite.auth';
const isComiteAuthenticated = () => sessionStorage.getItem(COMITE_SESSION_KEY) === '1';
const setComiteAuth = (on) => on
  ? sessionStorage.setItem(COMITE_SESSION_KEY, '1')
  : sessionStorage.removeItem(COMITE_SESSION_KEY);

// Credenciais DEMO
const DEMO_USER = 'admin';
const DEMO_PASS = 'admin';

// Mock de validação
async function validateComiteCredentials(user, pass) {
  await new Promise(r => setTimeout(r, 120)); // micro delay UX
  const ok = (user === DEMO_USER && pass === DEMO_PASS);
  return { ok, message: ok ? '' : 'Usuário ou senha inválidos.' };
}

// Util: liga/desliga “loading” no botão Acessar
function setLoginLoading(isLoading) {
  const btn = document.getElementById('comite-acess');
  if (!btn) return;
  btn.disabled = !!isLoading;
  const icon = btn.querySelector('i[data-lucide]');
  if (icon) {
    icon.setAttribute('data-lucide', isLoading ? 'loader-2' : 'log-in');
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }
}

// Inicializa bindings quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Seletores locais deste arquivo
  const overlay     = document.getElementById('overlay-comite');
  const modal       = document.getElementById('login');
  const btnTrigger  = document.querySelector('.menu-cta');
  const userInput   = document.getElementById('comite-user');
  const passInput   = document.getElementById('comite-pass');
  const errorEl     = document.getElementById('comite-error');
  const btnAcessar  = document.getElementById('comite-acess');

  // Abertura/fechamento do modal:
  // Preferimos as funções expostas pelo script geral, mas temos fallback.
  const openComiteModal = (window.__SSP__ && window.__SSP__.openComiteModal) || function () {
    if (!overlay || !modal) return;
    overlay.classList.add('show');
    modal.hidden = false;
    document.body.classList.add('comite-modal-open');
    if (errorEl) errorEl.textContent = '';
    (userInput || modal).focus();
  };

  const closeComiteModal = (window.__SSP__ && window.__SSP__.closeComiteModal) || function () {
    if (!overlay || !modal) return;
    overlay.classList.remove('show');
    modal.hidden = true;
    document.body.classList.remove('comite-modal-open');
    btnTrigger?.focus();
  };

  // Clique no botão do header
  btnTrigger?.addEventListener('click', () => {
    if (isComiteAuthenticated()) {
      window.location.href = 'comdex.html';
    } else {
      openComiteModal();
    }
  });

  // Enter no campo senha dispara login
  passInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAcessar?.click();
  });

  // Ação "Acessar"
  btnAcessar?.addEventListener('click', async () => {
    const user = (userInput?.value || '').trim();
    const pass = (passInput?.value || '').trim();

    if (!user || !pass) {
      if (errorEl) errorEl.textContent = 'Preencha usuário e senha.';
      return;
    }

    setLoginLoading(true);
    try {
      const { ok, message } = await validateComiteCredentials(user, pass);
      if (!ok) {
        if (errorEl) errorEl.textContent = message || 'Falha na autenticação.';
        return;
      }

      setComiteAuth(true);
      closeComiteModal();
      window.location.href = 'comdex.html';
    } finally {
      setLoginLoading(false);
    }
  });

  // Se vier por hash, abre modal (somente se não autenticado)
  if (location.hash === '#openComite' && !isComiteAuthenticated()) {
    openComiteModal();
  }
});
