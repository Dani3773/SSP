

// Script para interatividade na página de análises
document.addEventListener('DOMContentLoaded', () => {
  const accessButton = document.querySelector('.menu-cta');

  if (accessButton) {
    accessButton.addEventListener('click', () => {
      alert('Acesso ao comitê em desenvolvimento.');
    });
  }

  const relatorios = document.querySelectorAll('.relatorio');

  relatorios.forEach(relatorio => {
    relatorio.addEventListener('mouseenter', () => {
      relatorio.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
    });

    relatorio.addEventListener('mouseleave', () => {
      relatorio.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
    });
  });
});

// ==============================
// Header (fixo) - efeito de scroll
// ==============================
const handleHeaderScroll = () => {
  const header = document.querySelector('header');
  if (!header) return;
  const isPastThreshold = window.scrollY > 50;
  header.classList.toggle('scrolled', isPastThreshold);
};
window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

