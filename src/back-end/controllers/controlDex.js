/*   ============================== -->
<!--             Acesso             -->
<!-- ==============================  */

const COMITE_SESSION_KEY = 'ssp.comite.auth';
const isComiteAuthenticated = () => sessionStorage.getItem(COMITE_SESSION_KEY) === '1';
const setComiteAuth = (on) => on
  ? sessionStorage.setItem(COMITE_SESSION_KEY, '1')
  : sessionStorage.removeItem(COMITE_SESSION_KEY);

// Credenciais de DEMO para o trabalho (troque se quiser)
const DEMO_USER = 'admin';
const DEMO_PASS = 'admin';

// Validação mock: compara com as credenciais de demo
async function validateComiteCredentials(user, pass) {
  // micro delay pra UX (sensação de processamento)
  await new Promise(r => setTimeout(r, 120));
  const ok = (user === DEMO_USER && pass === DEMO_PASS);
  return { ok, message: ok ? '' : 'Usuário ou senha inválidos.' };
}

// Clique no botão do header: se já autenticado, vai direto pra comdex.html; senão, abre modal
btnTrigger?.addEventListener('click', () => {
  if (isComiteAuthenticated()) {
    window.location.href = 'comdex.html';
  } else {
    openComiteModal();
  }
});

// Ação "Acessar"
document.getElementById('comite-acess')?.addEventListener('click', async () => {
  const user = (userInput?.value || '').trim();
  const pass = (passInput?.value || '').trim();

  if (!user || !pass) {
    errorEl.textContent = 'Preencha usuário e senha.';
    return;
  }

  const { ok, message } = await validateComiteCredentials(user, pass);
  if (!ok) {
    errorEl.textContent = message;
    return;
  }

  setComiteAuth(true);
  closeComiteModal();      // fecha modal
  window.location.href = 'comdex.html'; // segue para a página do comitê
});
