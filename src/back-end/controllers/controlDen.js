const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../utils');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'ssp-secret-key'; // Deve ser o mesmo do controlUs

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

// Aplicar middleware a todas as rotas exceto POST para criação anônima
router.use((req, res, next) => {
  // Permitir POST sem autenticação para criação de denúncias anônimas
  if (req.method === 'POST' && req.path === '/') {
    // Tentar autenticar, mas não bloquear se falhar
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
      });
    }
    return next();
  }
  // Para outras rotas, aplicar autenticação
  authenticateToken(req, res, next);
});

// GET /api/denuncias - Listar todas as denúncias
router.get('/', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');
    res.json(denuncias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler denúncias' });
  }
});

// GET /api/denuncias/:id - Obter denúncia por ID
router.get('/:id', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');
    const denuncia = denuncias.find(d => d.id == req.params.id);
    if (!denuncia) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }
    res.json(denuncia);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler denúncia' });
  }
});

// POST /api/denuncias - Criar nova denúncia
router.post('/', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');

    // DEBUG: Log para verificar autenticação
    console.log('=== DEBUG DENÚNCIA ===');
    console.log('Headers:', req.headers.authorization);
    console.log('User:', req.user);
    console.log('Body:', req.body);

    // Determinar usuário e tipo: logado (interno) ou anônimo (externo)
    let usuario = 'Anônimo';
    let tipo = 'externo';
    if (req.user && req.user.username) {
      usuario = req.user.username;
      tipo = 'interno';
    }

    // Gerar ID sequencial
    const nextId = denuncias.length > 0 
      ? Math.max(...denuncias.map(d => d.id)) + 1 
      : 1;

    // Data e hora fixa do dispositivo (não alterável)
    const dataHora = new Date().toISOString();

    // Determinar prioridade baseado no campo urgente OU no campo prioridade enviado
    let prioridade = req.body.prioridade || 'media';
    if (req.body.urgente === true) {
      prioridade = 'alta';
    }

    // Usar título enviado ou gerar um baseado no tipo de ocorrência
    const titulo = req.body.titulo || (req.body.tipo ? `Denúncia: ${req.body.tipo}` : 'Denúncia Interna');

    const newDenuncia = {
      id: nextId,
      tipo: tipo,
      createdAt: dataHora,
      status: req.body.status || 'pendente',
      prioridade: prioridade,
      usuario: usuario,
      dataHora: dataHora,
      titulo: titulo,
      // Campos do formulário admin
      tipoOcorrencia: req.body.tipo || req.body.tipoOcorrencia,
      camera: req.body.camera || 'Não especificada',
      dataOcorrencia: req.body.data,
      horaOcorrencia: req.body.hora,
      localizacao: req.body.localizacao || '',
      descricao: req.body.descricao || '',
      suspeitos: req.body.suspeitos || '',
      origem: req.body.origem || 'site',
      urgente: req.body.urgente || false,
      arquivo: null
    };

    console.log('Nova denúncia:', newDenuncia);
    console.log('======================');

    denuncias.push(newDenuncia);
    await writeJson('denuncias', denuncias);
    res.status(201).json(newDenuncia);
  } catch (error) {
    console.error('Erro ao criar denúncia:', error);
    res.status(500).json({ error: 'Erro ao criar denúncia' });
  }
});

// PUT /api/denuncias/:id - Atualizar denúncia
router.put('/:id', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');
    const index = denuncias.findIndex(d => d.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }
    denuncias[index] = { ...denuncias[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJson('denuncias', denuncias);
    res.json(denuncias[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar denúncia' });
  }
});

// PATCH /api/denuncias/:id/status - Atualizar status da denúncia
router.patch('/:id/status', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');
    const index = denuncias.findIndex(d => d.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }
    denuncias[index] = { ...denuncias[index], status: req.body.status, updatedAt: new Date().toISOString() };
    await writeJson('denuncias', denuncias);
    res.json(denuncias[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status da denúncia' });
  }
});

// DELETE /api/denuncias/:id - Deletar denúncia
router.delete('/:id', async (req, res) => {
  try {
    const denuncias = await readJson('denuncias');
    const index = denuncias.findIndex(d => d.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }
    const deletedDenuncia = denuncias.splice(index, 1)[0];
    await writeJson('denuncias', denuncias);
    res.json(deletedDenuncia);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar denúncia' });
  }
});

module.exports = router;