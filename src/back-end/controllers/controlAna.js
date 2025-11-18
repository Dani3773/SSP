const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../utils');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'ssp-secret-key'; // Deve ser o mesmo do controlUs

// Configurar multer para upload de PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../storage/reports');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'relatorio-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// GET /api/analyses/stats - Obter estatísticas calculadas automaticamente (SEM AUTENTICAÇÃO)
router.get('/stats', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');
    const cameras = await readJson('cameras');

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Calcular estatísticas temporais
    const stats = {
      // Análise de Denúncias
      denuncias: {
        total: denuncias.length,
        hoje: denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          return data.toDateString() === hoje.toDateString();
        }).length,
        semana: denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          const seteDias = new Date();
          seteDias.setDate(hoje.getDate() - 7);
          return data >= seteDias;
        }).length,
        mes: denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        }).length,
        trimestre: denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          const noventaDias = new Date();
          noventaDias.setDate(hoje.getDate() - 90);
          return data >= noventaDias;
        }).length,
        ano: denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          return data.getFullYear() === anoAtual;
        }).length,
      },

      // Por Prioridade
      porPrioridade: {
        alta: denuncias.filter(d => d.prioridade === 'alta' || d.urgente).length,
        media: denuncias.filter(d => d.prioridade === 'media' || d.prioridade === 'média').length,
        baixa: denuncias.filter(d => d.prioridade === 'baixa').length,
      },

      // Por Status
      porStatus: {
        pendente: denuncias.filter(d => !d.status || d.status === 'pendente').length,
        emAndamento: denuncias.filter(d => d.status === 'em andamento' || d.status === 'emAndamento').length,
        resolvida: denuncias.filter(d => d.status === 'resolvida' || d.status === 'resolvido' || d.status === 'concluído').length,
      },

      // Taxa de Resolução (número)
      taxaResolucao: denuncias.length > 0 
        ? Math.round((denuncias.filter(d => d.status === 'resolvida' || d.status === 'resolvido' || d.status === 'concluído').length / denuncias.length) * 100)
        : 0,

      // Variação Mensal
      variacaoMensal: (() => {
        const mesAtualCount = denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        }).length;
        
        const mesAnterior = (mesAtual - 1 + 12) % 12;
        const mesAnteriorCount = denuncias.filter(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          return data.getMonth() === mesAnterior;
        }).length;
        
        if (mesAnteriorCount === 0) return 0;
        return Math.round(((mesAtualCount - mesAnteriorCount) / mesAnteriorCount) * 100);
      })(),

      // Tempo Médio de Resposta (simulado)
      tempoMedioResposta: denuncias.filter(d => d.urgente || d.prioridade === 'alta').length > 5 ? '3min' : '6min',

      // Evolução Mensal (últimos 12 meses)
      evolucaoMensal: (() => {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labels = [];
        const valores = [];
        
        for (let i = 0; i < 12; i++) {
          const mesIndex = (mesAtual - (11 - i) + 12) % 12;
          const count = denuncias.filter(d => {
            const data = new Date(d.createdAt || d.dataOcorrencia);
            return data.getMonth() === mesIndex && data.getFullYear() === anoAtual;
          }).length;
          
          labels.push(meses[mesIndex]);
          valores.push(count);
        }
        
        return { labels, valores };
      })(),

      // Por Tipo de Ocorrência
      porTipo: (() => {
        const tipos = {};
        denuncias.forEach(d => {
          const tipo = d.tipoOcorrencia || 'Outro';
          tipos[tipo] = (tipos[tipo] || 0) + 1;
        });
        return tipos;
      })(),

      // Por Horário
      porHorario: {
        madrugada: denuncias.filter(d => {
          const hora = parseInt((d.horaOcorrencia || '00:00').split(':')[0]);
          return hora >= 0 && hora < 6;
        }).length,
        manha: denuncias.filter(d => {
          const hora = parseInt((d.horaOcorrencia || '00:00').split(':')[0]);
          return hora >= 6 && hora < 12;
        }).length,
        tarde: denuncias.filter(d => {
          const hora = parseInt((d.horaOcorrencia || '00:00').split(':')[0]);
          return hora >= 12 && hora < 18;
        }).length,
        noite: denuncias.filter(d => {
          const hora = parseInt((d.horaOcorrencia || '00:00').split(':')[0]);
          return hora >= 18 && hora < 24;
        }).length,
      },

      // Análise de Câmeras
      cameras: {
        total: cameras.length,
        online: cameras.filter(c => c.status === 'online').length,
        offline: cameras.filter(c => c.status === 'offline').length,
        manutencao: cameras.filter(c => c.status === 'maintenance' || c.status === 'manutencao').length,
        
        porStatus: {
          online: cameras.filter(c => c.status === 'online').length,
          offline: cameras.filter(c => c.status === 'offline').length,
          maintenance: cameras.filter(c => c.status === 'maintenance' || c.status === 'manutencao').length,
        },
        
        taxaDisponibilidade: cameras.length > 0 
          ? Math.round((cameras.filter(c => c.status === 'online').length / cameras.length) * 100)
          : 0,
        porTipo: (() => {
          const tipos = {};
          cameras.forEach(c => {
            const tipo = c.type || 'Desconhecido';
            tipos[tipo] = (tipos[tipo] || 0) + 1;
          });
          return tipos;
        })(),
        porResolucao: (() => {
          const resolucoes = {};
          cameras.forEach(c => {
            const res = c.resolution || 'Desconhecida';
            resolucoes[res] = (resolucoes[res] || 0) + 1;
          });
          return resolucoes;
        })(),
      },

      // Comparativo Anual
      comparativoAnual: (() => {
        const anoAnterior = anoAtual - 1;
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const dadosAnoAtual = new Array(12).fill(0);
        const dadosAnoAnterior = new Array(12).fill(0);
        
        denuncias.forEach(d => {
          const data = new Date(d.createdAt || d.dataOcorrencia);
          const ano = data.getFullYear();
          const mes = data.getMonth();
          
          if (ano === anoAtual) {
            dadosAnoAtual[mes]++;
          } else if (ano === anoAnterior) {
            dadosAnoAnterior[mes]++;
          }
        });
        
        return {
          labels: meses,
          anoAtual: { ano: anoAtual, dados: dadosAnoAtual },
          anoAnterior: { ano: anoAnterior, dados: dadosAnoAnterior }
        };
      })(),

      // Data da última atualização
      ultimaAtualizacao: new Date().toISOString(),

      // Arrays completos para uso no frontend
      listaDenuncias: denuncias,
      listaCameras: cameras
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});

// Aplicar middleware de autenticação APENAS nas rotas abaixo
router.use(authenticateToken);

// POST /api/analyses/upload - Upload de PDF (DEVE VIR ANTES DE /:id)
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo PDF enviado' });
    }

    const analyses = await readJson('analyses');
    
    // Gerar ID sequencial
    const nextId = analyses.length > 0 
      ? Math.max(...analyses.map(a => a.id)) + 1 
      : 1;
    
    // Criar registro da análise com o PDF
    const newAnalysis = {
      id: nextId,
      type: req.body.type || 'Relatório em PDF',
      period: req.body.period || new Date().toLocaleDateString('pt-BR'),
      data: req.body.data || '{}',
      pdfFile: req.file.filename,
      pdfPath: `/api/analyses/download/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };
    
    analyses.push(newAnalysis);
    await writeJson('analyses', analyses);
    
    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do PDF' });
  }
});

// GET /api/analyses/download/:filename - Download de PDF (DEVE VIR ANTES DE /:id)
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../storage/reports', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    res.status(500).json({ error: 'Erro ao baixar PDF' });
  }
});

// GET /api/analyses - Listar todas as análises
router.get('/', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler análises' });
  }
});

// GET /api/analyses/:id - Obter análise por ID
router.get('/:id', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const analysis = analyses.find(a => a.id == req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler análise' });
  }
});

// POST /api/analyses - Criar nova análise
router.post('/', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    
    // Gerar ID sequencial
    const nextId = analyses.length > 0 
      ? Math.max(...analyses.map(a => a.id)) + 1 
      : 1;
    
    const newAnalysis = {
      id: nextId,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    analyses.push(newAnalysis);
    await writeJson('analyses', analyses);
    res.status(201).json(newAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar análise' });
  }
});

// PUT /api/analyses/:id - Atualizar análise
router.put('/:id', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const index = analyses.findIndex(a => a.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    analyses[index] = { ...analyses[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJson('analyses', analyses);
    res.json(analyses[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar análise' });
  }
});

// DELETE /api/analyses/:id - Deletar análise
router.delete('/:id', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const index = analyses.findIndex(a => a.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    const deletedAnalysis = analyses.splice(index, 1)[0];
    
    // Deletar arquivo PDF se existir
    if (deletedAnalysis.pdfFile) {
      const filePath = path.join(__dirname, '../storage/reports', deletedAnalysis.pdfFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await writeJson('analyses', analyses);
    res.json(deletedAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar análise' });
  }
});

module.exports = router;

// GET /api/analyses/download/:filename - Download de PDF (DEVE VIR ANTES DE /:id)
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../storage/reports', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    res.status(500).json({ error: 'Erro ao baixar PDF' });
  }
});

// GET /api/analyses - Listar todas as análises
router.get('/', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler análises' });
  }
});

// GET /api/analyses/:id - Obter análise por ID
router.get('/:id', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const analysis = analyses.find(a => a.id == req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler análise' });
  }
});

// POST /api/analyses - Criar nova análise
router.post('/', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const newAnalysis = {
      id: Date.now(), // ID simples baseado em timestamp
      createdAt: new Date().toISOString(),
      ...req.body
    };
    analyses.push(newAnalysis);
    await writeJson('analyses', analyses);
    res.status(201).json(newAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar análise' });
  }
});

// PUT /api/analyses/:id - Atualizar análise
router.put('/:id', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const index = analyses.findIndex(a => a.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    analyses[index] = { ...analyses[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJson('analyses', analyses);
    res.json(analyses[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar análise' });
  }
});

// DELETE /api/analyses/:id - Deletar análise
router.delete('/:id', async (req, res) => {
  try {
    const analyses = await readJson('analyses');
    const index = analyses.findIndex(a => a.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    const deletedAnalysis = analyses.splice(index, 1)[0];
    
    // Deletar arquivo PDF se existir
    if (deletedAnalysis.pdfFile) {
      const filePath = path.join(__dirname, '../storage/reports', deletedAnalysis.pdfFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await writeJson('analyses', analyses);
    res.json(deletedAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar análise' });
  }
});

// POST /api/analyses/upload - Upload de PDF (DEVE VIR ANTES DE /:id)
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo PDF enviado' });
    }

    const analyses = await readJson('analyses');
    
    // Criar registro da análise com o PDF
    const newAnalysis = {
      id: Date.now(),
      type: req.body.type || 'Relatório em PDF',
      period: req.body.period || new Date().toLocaleDateString('pt-BR'),
      data: req.body.data || '{}',
      pdfFile: req.file.filename,
      pdfPath: `/api/analyses/download/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };
    
    analyses.push(newAnalysis);
    await writeJson('analyses', analyses);
    
    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do PDF' });
  }
});

// GET /api/analyses/download/:filename - Download de PDF (DEVE VIR ANTES DE /:id)
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../storage/reports', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    res.status(500).json({ error: 'Erro ao baixar PDF' });
  }
});

module.exports = router;
