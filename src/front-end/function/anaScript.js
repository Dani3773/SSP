// ==============================
// ANALYTICS PAGE - MAIN SCRIPT
// ==============================

// Dados globais
let allDenuncias = [];
let allCameras = [];
let filteredDenuncias = [];
let globalStats = null; // Armazenar stats do backend

document.addEventListener('DOMContentLoaded', () => {
  initializeHeader();
  loadRealData(); // Carregar dados reais do backend
  initializeFilters();
  initializeTableSearch();
  initializeExportButton();
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
      window.location.href = '../index.html#openComite';
    });
  }
}

// ==============================
// Carregar Dados Reais do Backend
// ==============================
async function loadRealData() {
  try {
    showLoadingAnimation();
    
    // Buscar estatísticas da rota pública
    const statsRes = await fetch('/api/analyses/stats');

    if (!statsRes.ok) {
      throw new Error('Erro ao carregar estatísticas');
    }

    const stats = await statsRes.json();
    
    // Armazenar stats globalmente
    globalStats = stats;
    
    // Buscar arrays de denúncias e câmeras separadamente (para tabela e filtros)
    // Como /stats só retorna estatísticas, precisamos dos dados brutos também
    // Vamos armazenar arrays vazios e popular da tabela quando necessário
    allDenuncias = stats.listaDenuncias || [];
    allCameras = stats.listaCameras || [];
    filteredDenuncias = [...allDenuncias];

    // Atualizar dashboard com dados já calculados
    updateDashboardWithStats(stats);
    initializeChartsWithStats(stats);
    
    // Se temos dados brutos, atualizar tabela
    if (allDenuncias.length > 0) {
      updateTable();
    }
    
    hideLoadingAnimation();
    showNotification('Dados carregados com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    hideLoadingAnimation();
    showNotification('Erro ao carregar dados: ' + error.message, 'error');
  }
}

// ==============================
// Atualizar Dashboard com Estatísticas do Backend
// ==============================
function updateDashboardWithStats(stats) {
  // 1. Total de Ocorrências
  const periodo = document.getElementById('periodo-select')?.value || 'mes';
  const totalOcorrencias = stats.denuncias[periodo] || stats.denuncias.total;
  document.getElementById('stat-ocorrencias').textContent = totalOcorrencias;
  
  const ocorrenciasChange = document.getElementById('stat-ocorrencias-change');
  const variacao = stats.variacaoMensal || 0;
  if (variacao < 0) {
    ocorrenciasChange.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(variacao)}% vs mês anterior`;
    ocorrenciasChange.className = 'stat-change positive';
  } else if (variacao > 0) {
    ocorrenciasChange.innerHTML = `<i class="fas fa-arrow-up"></i> ${variacao}% vs mês anterior`;
    ocorrenciasChange.className = 'stat-change negative';
  } else {
    ocorrenciasChange.innerHTML = `<i class="fas fa-equals"></i> Sem alteração`;
    ocorrenciasChange.className = 'stat-change neutral';
  }

  // 2. Taxa de Resolução
  const taxaResolucao = stats.taxaResolucao || 0;
  document.getElementById('stat-resolucao').textContent = taxaResolucao + '%';
  
  const resolucaoChange = document.getElementById('stat-resolucao-change');
  if (taxaResolucao >= 80) {
    resolucaoChange.innerHTML = `<i class="fas fa-arrow-up"></i> Excelente desempenho`;
    resolucaoChange.className = 'stat-change positive';
  } else if (taxaResolucao >= 60) {
    resolucaoChange.innerHTML = `<i class="fas fa-arrow-up"></i> Bom desempenho`;
    resolucaoChange.className = 'stat-change positive';
  } else {
    resolucaoChange.innerHTML = `<i class="fas fa-arrow-down"></i> Precisa melhorar`;
    resolucaoChange.className = 'stat-change negative';
  }

  // 3. Tempo Médio de Resposta
  const tempoMedio = stats.tempoMedioResposta || '7min';
  document.getElementById('stat-tempo').textContent = tempoMedio;
  
  const tempoChange = document.getElementById('stat-tempo-change');
  const urgentes = stats.porPrioridade?.alta || 0;
  if (urgentes > 5) {
    tempoChange.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${urgentes} casos urgentes`;
    tempoChange.className = 'stat-change negative';
  } else {
    tempoChange.innerHTML = `<i class="fas fa-check-circle"></i> Dentro da meta`;
    tempoChange.className = 'stat-change positive';
  }

  // 4. Câmeras Ativas
  const camerasOnline = stats.cameras?.porStatus?.online || stats.cameras?.online || 0;
  document.getElementById('stat-cameras').textContent = camerasOnline;
  
  const camerasChange = document.getElementById('stat-cameras-change');
  const taxaDisponibilidade = stats.cameras?.taxaDisponibilidade || 0;
  
  camerasChange.innerHTML = `<i class="fas fa-info-circle"></i> ${taxaDisponibilidade}% disponíveis`;
  camerasChange.className = taxaDisponibilidade >= 80 ? 'stat-change positive' : 'stat-change neutral';
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
  
  // Aplicar filtros nos dados locais
  applyFilters();
  
  // Recalcular stats baseado nos dados filtrados
  recalculateStatsFromFiltered();
  
  // Atualizar gráficos e tabela
  updateCharts();
  updateTable();
  
  showNotification('Filtros aplicados!', 'success');
}

function recalculateStatsFromFiltered() {
  if (!filteredDenuncias.length) {
    // Se não há dados filtrados, zerar stats
    document.getElementById('stat-ocorrencias').textContent = '0';
    document.getElementById('stat-resolucao').textContent = '0%';
    document.getElementById('stat-tempo').textContent = '-';
    return;
  }

  // 1. Total de Ocorrências
  document.getElementById('stat-ocorrencias').textContent = filteredDenuncias.length;
  
  // Calcular variação (comparar com total geral)
  const percentual = ((filteredDenuncias.length / allDenuncias.length) * 100).toFixed(0);
  const ocorrenciasChange = document.getElementById('stat-ocorrencias-change');
  ocorrenciasChange.innerHTML = `<i class="fas fa-info-circle"></i> ${percentual}% do total`;
  ocorrenciasChange.className = 'stat-change neutral';

  // 2. Taxa de Resolução
  const resolvidas = filteredDenuncias.filter(d => 
    d.status === 'resolvida' || d.status === 'resolvido' || d.status === 'concluído'
  ).length;
  const taxaResolucao = Math.round((resolvidas / filteredDenuncias.length) * 100);
  
  document.getElementById('stat-resolucao').textContent = taxaResolucao + '%';
  
  const resolucaoChange = document.getElementById('stat-resolucao-change');
  if (taxaResolucao >= 80) {
    resolucaoChange.innerHTML = `<i class="fas fa-arrow-up"></i> Excelente desempenho`;
    resolucaoChange.className = 'stat-change positive';
  } else if (taxaResolucao >= 60) {
    resolucaoChange.innerHTML = `<i class="fas fa-arrow-up"></i> Bom desempenho`;
    resolucaoChange.className = 'stat-change positive';
  } else {
    resolucaoChange.innerHTML = `<i class="fas fa-arrow-down"></i> Precisa melhorar`;
    resolucaoChange.className = 'stat-change negative';
  }

  // 3. Tempo Médio de Resposta
  const urgentes = filteredDenuncias.filter(d => d.urgente || d.prioridade === 'alta').length;
  const tempoMedio = urgentes > 5 ? '4min' : '7min';
  document.getElementById('stat-tempo').textContent = tempoMedio;
  
  const tempoChange = document.getElementById('stat-tempo-change');
  if (urgentes > 5) {
    tempoChange.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${urgentes} casos urgentes`;
    tempoChange.className = 'stat-change negative';
  } else {
    tempoChange.innerHTML = `<i class="fas fa-check-circle"></i> Dentro da meta`;
    tempoChange.className = 'stat-change positive';
  }

  // 4. Câmeras permanece do global
  const camerasOnline = allCameras.filter(c => c.status === 'online').length;
  document.getElementById('stat-cameras').textContent = camerasOnline;
  
  const camerasChange = document.getElementById('stat-cameras-change');
  const taxaDisponibilidade = allCameras.length > 0 
    ? Math.round((camerasOnline / allCameras.length) * 100) 
    : 0;
  
  camerasChange.innerHTML = `<i class="fas fa-info-circle"></i> ${taxaDisponibilidade}% disponíveis`;
  camerasChange.className = taxaDisponibilidade >= 80 ? 'stat-change positive' : 'stat-change neutral';
}

// ==============================
// Aplicar Filtros
// ==============================
function applyFilters() {
  const periodo = document.getElementById('periodo-select')?.value || 'mes';
  const tipo = document.getElementById('tipo-select')?.value || 'todas';
  const bairro = document.getElementById('bairro-select')?.value || 'todos';

  console.log('Aplicando filtros:', { periodo, tipo, bairro });

  filteredDenuncias = [...allDenuncias];

  // Filtro de período
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999); // Fim do dia de hoje
  
  if (periodo !== 'personalizado') {
    filteredDenuncias = filteredDenuncias.filter(d => {
      const data = new Date(d.createdAt || d.dataOcorrencia);
      
      switch(periodo) {
        case 'hoje':
          const inicioHoje = new Date();
          inicioHoje.setHours(0, 0, 0, 0);
          return data >= inicioHoje && data <= hoje;
          
        case 'semana':
          const seteDiasAtras = new Date();
          seteDiasAtras.setDate(hoje.getDate() - 7);
          seteDiasAtras.setHours(0, 0, 0, 0);
          return data >= seteDiasAtras;
          
        case 'mes':
          const trintaDiasAtras = new Date();
          trintaDiasAtras.setDate(hoje.getDate() - 30);
          trintaDiasAtras.setHours(0, 0, 0, 0);
          return data >= trintaDiasAtras;
          
        case 'trimestre':
          const noventaDiasAtras = new Date();
          noventaDiasAtras.setDate(hoje.getDate() - 90);
          noventaDiasAtras.setHours(0, 0, 0, 0);
          return data >= noventaDiasAtras;
          
        case 'ano':
          const umAnoAtras = new Date();
          umAnoAtras.setFullYear(hoje.getFullYear() - 1);
          umAnoAtras.setHours(0, 0, 0, 0);
          return data >= umAnoAtras;
          
        default:
          return true;
      }
    });
  }

  // Filtro de tipo
  if (tipo !== 'todas') {
    filteredDenuncias = filteredDenuncias.filter(d => {
      const tipoOcorrencia = (d.tipoOcorrencia || '').toLowerCase().trim();
      return tipoOcorrencia === tipo.toLowerCase();
    });
  }

  // Filtro de bairro (baseado em localização)
  if (bairro !== 'todos') {
    filteredDenuncias = filteredDenuncias.filter(d => {
      const localizacao = (d.localizacao || '').toLowerCase();
      return localizacao.includes(bairro.toLowerCase());
    });
  }

  console.log(`Denúncias filtradas: ${filteredDenuncias.length} de ${allDenuncias.length}`);
}

// ==============================
// Gráficos com Chart.js
// ==============================
let ocorrenciasChart, tiposChart, comparativoChart;

function initializeChartsWithStats(stats) {
  createOcorrenciasChartWithStats(stats);
  createTiposChartWithStats(stats);
  createComparativoChartWithStats(stats);
  setupChartControls();
}

function initializeCharts() {
  createOcorrenciasChart();
  createTiposChart();
  createComparativoChart();
  setupChartControls();
}

// Gráfico de Ocorrências Mensais (com dados calculados)
function createOcorrenciasChartWithStats(stats) {
  const ctx = document.getElementById('ocorrenciasChart');
  if (!ctx) return;

  const evolucao = stats.evolucaoMensal || {};
  
  const data = {
    labels: evolucao.labels || [],
    datasets: [{
      label: `Ocorrências ${new Date().getFullYear()}`,
      data: evolucao.valores || [],
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
            color: '#e0e0e0',
            font: { size: 14, weight: '600' },
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fbbf24',
          borderColor: '#fbbf24',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y} ocorrências`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#b0b0b0',
            font: { size: 12 },
            stepSize: 5
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#b0b0b0',
            font: { size: 12 }
          },
          grid: {
            display: false
          }
        }
      }
    }
  };

  if (ocorrenciasChart) {
    ocorrenciasChart.destroy();
  }
  ocorrenciasChart = new Chart(ctx, config);
}

// Gráfico de Tipos (com dados calculados)
function createTiposChartWithStats(stats) {
  const ctx = document.getElementById('tiposChart');
  if (!ctx) return;

  const tipos = stats.porTipo || {};
  const labels = Object.keys(tipos);
  const valores = Object.values(tipos);

  const data = {
    labels: labels,
    datasets: [{
      data: valores,
      backgroundColor: [
        '#ff6384',
        '#36a2eb',
        '#ffce56',
        '#4bc0c0',
        '#9966ff',
        '#ff9f40'
      ],
      borderWidth: 2,
      borderColor: '#1a1a2e'
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
          position: 'right',
          labels: {
            color: '#e0e0e0',
            font: { size: 13 },
            padding: 15,
            boxWidth: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fbbf24',
          borderColor: '#fbbf24',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} (${percent}%)`;
            }
          }
        }
      }
    }
  };

  if (tiposChart) {
    tiposChart.destroy();
  }
  tiposChart = new Chart(ctx, config);
}

// Gráfico Comparativo (com dados calculados)
function createComparativoChartWithStats(stats) {
  const ctx = document.getElementById('comparativoChart');
  if (!ctx) return;

  const comparativo = stats.comparativoAnual || {};
  
  const data = {
    labels: comparativo.labels || [],
    datasets: [
      {
        label: comparativo.anoAtual?.ano || new Date().getFullYear(),
        data: comparativo.anoAtual?.dados || [],
        borderColor: '#1e90ff',
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: comparativo.anoAnterior?.ano || (new Date().getFullYear() - 1),
        data: comparativo.anoAnterior?.dados || [],
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 3,
        fill: true,
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
            color: '#e0e0e0',
            font: { size: 14, weight: '600' },
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fbbf24',
          borderColor: '#fbbf24',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#b0b0b0',
            font: { size: 12 }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#b0b0b0',
            font: { size: 12 }
          },
          grid: {
            display: false
          }
        }
      }
    }
  };

  if (comparativoChart) {
    comparativoChart.destroy();
  }
  comparativoChart = new Chart(ctx, config);
}

// Gráfico de Ocorrências Mensais
function createOcorrenciasChart() {
  const ctx = document.getElementById('ocorrenciasChart');
  if (!ctx) return;

  // Calcular ocorrências por mês dos últimos 12 meses
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const contagemMensal = new Array(12).fill(0);
  const anoAtual = new Date().getFullYear();

  filteredDenuncias.forEach(d => {
    const data = new Date(d.createdAt || d.dataOcorrencia);
    if (data.getFullYear() === anoAtual) {
      const mes = data.getMonth();
      contagemMensal[mes]++;
    }
  });

  const data = {
    labels: meses,
    datasets: [{
      label: `Ocorrências ${anoAtual}`,
      data: contagemMensal,
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

  // Contar ocorrências por tipo
  const tiposCont = {};
  filteredDenuncias.forEach(d => {
    const tipo = d.tipoOcorrencia || 'Outro';
    tiposCont[tipo] = (tiposCont[tipo] || 0) + 1;
  });

  const labels = Object.keys(tiposCont);
  const valores = Object.values(tiposCont);
  
  const cores = [
    'rgba(30, 144, 255, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(14, 165, 233, 0.8)'
  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'Ocorrências por Tipo',
      data: valores,
      backgroundColor: cores.slice(0, labels.length),
      borderColor: cores.slice(0, labels.length).map(c => c.replace('0.8', '1')),
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

  // Calcular ocorrências dos últimos 2 anos
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const anoAtual = new Date().getFullYear();
  const anoAnterior = anoAtual - 1;
  
  const contagemAnoAtual = new Array(12).fill(0);
  const contagemAnoAnterior = new Array(12).fill(0);

  allDenuncias.forEach(d => {
    const data = new Date(d.createdAt || d.dataOcorrencia);
    const ano = data.getFullYear();
    const mes = data.getMonth();
    
    if (ano === anoAtual) {
      contagemAnoAtual[mes]++;
    } else if (ano === anoAnterior) {
      contagemAnoAnterior[mes]++;
    }
  });

  const data = {
    labels: meses,
    datasets: [
      {
        label: anoAnterior.toString(),
        data: contagemAnoAnterior,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: '#94a3b8',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: anoAtual.toString(),
        data: contagemAnoAtual,
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
  // Destruir gráficos existentes
  if (ocorrenciasChart) {
    ocorrenciasChart.destroy();
  }
  if (tiposChart) {
    tiposChart.destroy();
  }
  if (comparativoChart) {
    comparativoChart.destroy();
  }
  
  // Recriar gráficos com dados atualizados
  createOcorrenciasChart();
  createTiposChart();
  createComparativoChart();
}

// ==============================
// Atualizar Tabela de Denúncias
// ==============================
function updateTable() {
  const tableBody = document.querySelector('.data-table tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  // Mostrar últimas 50 denúncias filtradas
  const denunciasExibir = filteredDenuncias.slice(0, 50);

  denunciasExibir.forEach(d => {
    const data = new Date(d.createdAt || d.dataOcorrencia);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = d.horaOcorrencia || data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.id}</td>
      <td>${dataFormatada}</td>
      <td>${horaFormatada}</td>
      <td>${d.tipoOcorrencia || 'Não especificado'}</td>
      <td>${d.localizacao || 'Não informado'}</td>
      <td>
        <span class="status-badge status-${(d.status || 'pendente').toLowerCase()}">
          ${d.status || 'Pendente'}
        </span>
      </td>
      <td>
        <span class="priority-badge priority-${(d.prioridade || 'media').toLowerCase()}">
          ${d.prioridade || 'Média'}
        </span>
      </td>
    `;
    tableBody.appendChild(row);
  });

  if (denunciasExibir.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhuma denúncia encontrada</td></tr>';
  }
}

// ==============================
// Funções Auxiliares
// ==============================
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
