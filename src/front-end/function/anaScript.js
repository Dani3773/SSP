// ==============================
// ANALYTICS PAGE - MAIN SCRIPT
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  initializeHeader();
  initializeFilters();
  initializeCharts();
  initializeTableSearch();
  initializeExportButton();
  // animateCards(); // Removido para melhor performance
  // animateNumbers(); // Removido para melhor performance
});

// ==============================
// Header - Efeito de Scroll
// ==============================
function initializeHeader() {
  const header = document.querySelector('header');
  const accessButton = document.querySelector('.menu-cta');

  const handleHeaderScroll = () => {
    if (!header) return;
    const isPastThreshold = window.scrollY > 50;
    header.classList.toggle('scrolled', isPastThreshold);
  };

  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();

  // Botão de acesso ao comitê
  if (accessButton) {
    accessButton.addEventListener('click', () => {
      // Placeholder para funcionalidade futura
      showNotification('Acesso ao comitê em desenvolvimento.', 'info');
    });
  }
}

// ==============================
// Filtros Interativos
// ==============================
function initializeFilters() {
  const periodoSelect = document.getElementById('periodo-select');
  const tipoSelect = document.getElementById('tipo-select');
  const bairroSelect = document.getElementById('bairro-select');

  // Event listeners para os filtros
  [periodoSelect, tipoSelect, bairroSelect].forEach(select => {
    if (select) {
      select.addEventListener('change', (e) => {
        handleFilterChange(e.target.id, e.target.value);
      });
    }
  });
}

function handleFilterChange(filterId, value) {
  console.log(`Filtro ${filterId} alterado para: ${value}`);
  
  // Adiciona animação de loading
  showLoadingAnimation();
  
  // Simula carregamento de dados (substituir por chamada real ao backend)
  setTimeout(() => {
    hideLoadingAnimation();
    updateDashboardData(filterId, value);
    showNotification('Dados atualizados com sucesso!', 'success');
  }, 800);
}

function updateDashboardData(filterId, value) {
  // Placeholder para atualização de dados
  // Aqui será implementada a integração com o backend
  console.log('Atualizando dashboard com novos filtros...');
  
  // Recarrega os gráficos com novos dados
  updateCharts();
}

// ==============================
// Gráficos com Chart.js
// ==============================
let ocorrenciasChart, tiposChart, comparativoChart;

function initializeCharts() {
  createOcorrenciasChart();
  createTiposChart();
  createComparativoChart();
  setupChartControls();
}

// Gráfico de Ocorrências Mensais
function createOcorrenciasChart() {
  const ctx = document.getElementById('ocorrenciasChart');
  if (!ctx) return;

  const data = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [{
      label: 'Ocorrências 2025',
      data: [120, 115, 130, 125, 140, 135, 145, 138, 142, 150, 148, 145],
      borderColor: '#1e90ff',
      backgroundColor: 'rgba(30, 144, 255, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#1e90ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 13, weight: '600' },
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: { size: 12 }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 12 }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  };

  ocorrenciasChart = new Chart(ctx, config);
}

// Gráfico de Distribuição por Tipo
function createTiposChart() {
  const ctx = document.getElementById('tiposChart');
  if (!ctx) return;

  const data = {
    labels: ['Furto', 'Roubo', 'Tráfico', 'Vandalismo', 'Outros'],
    datasets: [{
      label: 'Ocorrências por Tipo',
      data: [320, 180, 95, 140, 210],
      backgroundColor: [
        'rgba(30, 144, 255, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ],
      borderColor: [
        '#1e90ff',
        '#ef4444',
        '#f59e0b',
        '#8b5cf6',
        '#10b981'
      ],
      borderWidth: 2
    }]
  };

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12, weight: '600' },
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  };

  tiposChart = new Chart(ctx, config);
}

// Gráfico Comparativo Anual
function createComparativoChart() {
  const ctx = document.getElementById('comparativoChart');
  if (!ctx) return;

  const data = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: '2024',
        data: [140, 135, 150, 145, 160, 155, 165, 158, 162, 170, 168, 165],
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: '#94a3b8',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: '2025',
        data: [120, 115, 130, 125, 140, 135, 145, 138, 142, 150, 148, 145],
        backgroundColor: 'rgba(30, 144, 255, 0.2)',
        borderColor: '#1e90ff',
        borderWidth: 3,
        tension: 0.4
      }
    ]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 13, weight: '600' },
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: { size: 12 }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 12 }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  };

  comparativoChart = new Chart(ctx, config);
}

// Controles dos gráficos (alternar entre tipos)
function setupChartControls() {
  const chartButtons = document.querySelectorAll('.chart-btn');
  
  chartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chartType = e.currentTarget.dataset.chart;
      const buttonsGroup = e.currentTarget.parentElement;
      
      // Remove active de todos os botões
      buttonsGroup.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
      
      // Adiciona active ao botão clicado
      e.currentTarget.classList.add('active');
      
      // Atualiza o tipo do gráfico
      if (ocorrenciasChart && chartType) {
        ocorrenciasChart.config.type = chartType;
        ocorrenciasChart.update();
      }
    });
  });
}

function updateCharts() {
  // Simula atualização dos gráficos com novos dados
  if (ocorrenciasChart) {
    const newData = generateRandomData(12, 100, 160);
    ocorrenciasChart.data.datasets[0].data = newData;
    ocorrenciasChart.update('active');
  }
  
  if (tiposChart) {
    const newData = generateRandomData(5, 80, 350);
    tiposChart.data.datasets[0].data = newData;
    tiposChart.update('active');
  }
  
  if (comparativoChart) {
    comparativoChart.update('active');
  }
}

function generateRandomData(count, min, max) {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

// ==============================
// Busca na Tabela
// ==============================
function initializeTableSearch() {
  const searchInput = document.getElementById('search-bairro');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterTable(searchTerm);
    });
  }
}

function filterTable(searchTerm) {
  const tableRows = document.querySelectorAll('.data-table tbody tr');
  
  tableRows.forEach(row => {
    const bairroName = row.querySelector('td:first-child strong')?.textContent.toLowerCase() || '';
    
    if (bairroName.includes(searchTerm)) {
      row.style.display = '';
      row.style.animation = 'fadeIn 0.3s ease';
    } else {
      row.style.display = 'none';
    }
  });
}

// ==============================
// Exportar Dados
// ==============================
function initializeExportButton() {
  const exportBtn = document.querySelector('.btn-export');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportData();
    });
  }
}

function exportData() {
  showNotification('Preparando exportação de dados...', 'info');
  
  // Simula exportação (substituir por exportação real)
  setTimeout(() => {
    // Cria dados de exemplo para exportação
    const data = [
      ['Bairro', 'Ocorrências', 'Patrulhas', 'Taxa de Resolução'],
      ['Centro', '120', '85', '92%'],
      ['Pinheirinho', '95', '68', '88%'],
      ['Santa Luzia', '80', '52', '75%'],
      ['Operária Nova', '50', '35', '90%'],
      ['Próspera', '45', '32', '85%'],
      ['São Luiz', '40', '28', '82%']
    ];
    
    // Converte para CSV
    const csv = data.map(row => row.join(',')).join('\n');
    
    // Cria download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `analises_ssp_${getCurrentDate()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Dados exportados com sucesso!', 'success');
  }, 1000);
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// ==============================
// Animações
// ==============================
function animateCards() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observa todos os cards e elementos animáveis
  const animatableElements = document.querySelectorAll(
    '.stat-card, .chart-card, .table-card, .heatmap-card, .indicator-card, .heat-item'
  );
  
  animatableElements.forEach(el => observer.observe(el));
}

function animateNumbers() {
  const numberElements = document.querySelectorAll('.stat-number, .indicator-value');
  
  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateValue(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  numberElements.forEach(el => observer.observe(el));
}

function animateValue(element) {
  const text = element.textContent;
  const hasPercent = text.includes('%');
  const number = parseFloat(text.replace(/[^\d.]/g, ''));
  
  if (isNaN(number)) return;
  
  const duration = 1500;
  const steps = 60;
  const stepValue = number / steps;
  const stepDuration = duration / steps;
  
  let current = 0;
  
  const timer = setInterval(() => {
    current += stepValue;
    
    if (current >= number) {
      current = number;
      clearInterval(timer);
    }
    
    if (hasPercent) {
      element.textContent = current.toFixed(1) + '%';
    } else if (number >= 1000) {
      element.textContent = Math.floor(current).toLocaleString('pt-BR');
    } else {
      element.textContent = Math.floor(current);
    }
  }, stepDuration);
}

// ==============================
// Notificações
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
  
  // Adiciona estilos inline (caso não estejam no CSS)
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

// ==============================
// Loading Animation
// ==============================
function showLoadingAnimation() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = '<div class="spinner"></div>';
  
  Object.assign(loader.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999'
  });
  
  const spinner = loader.querySelector('.spinner');
  Object.assign(spinner.style, {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  });
  
  document.body.appendChild(loader);
  
  // Adiciona animação de spin se não existir
  if (!document.querySelector('#spin-animation')) {
    const style = document.createElement('style');
    style.id = 'spin-animation';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
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
}

function hideLoadingAnimation() {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    loader.remove();
  }
}

// ==============================
// Utility Functions
// ==============================
console.log('Analytics Dashboard initialized successfully! 📊');
