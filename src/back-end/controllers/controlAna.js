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

// Aplicar middleware a todas as rotas
router.use(authenticateToken);

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
    await writeJson('analyses', analyses);
    res.json(deletedAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar análise' });
  }
});

module.exports = router;
