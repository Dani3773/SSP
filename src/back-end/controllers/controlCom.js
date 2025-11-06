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

// Aplicar middleware a todas as rotas (removido temporariamente para teste)
// router.use(authenticateToken);

// GET /api/communications - Listar todas as comunicações
router.get('/', async (req, res) => {
  try {
    const communications = await readJson('news');
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler comunicações' });
  }
});

// GET /api/communications/:id - Obter comunicação por ID
router.get('/:id', async (req, res) => {
  try {
    const communications = await readJson('news');
    const communication = communications.find(c => c.id == req.params.id);
    if (!communication) {
      return res.status(404).json({ error: 'Comunicação não encontrada' });
    }
    res.json(communication);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler comunicação' });
  }
});

// POST /api/communications - Criar nova comunicação
router.post('/', async (req, res) => {
  try {
    const communications = await readJson('news');
    // Gerar ID sequencial (maior ID + 1)
    const ids = communications.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newCommunication = {
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    communications.push(newCommunication);
    await writeJson('news', communications);
    res.status(201).json(newCommunication);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar comunicação' });
  }
});

// PUT /api/communications/:id - Atualizar comunicação
router.put('/:id', async (req, res) => {
  try {
    const communications = await readJson('news');
    const index = communications.findIndex(c => c.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Comunicação não encontrada' });
    }
    communications[index] = { ...communications[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJson('news', communications);
    res.json(communications[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar comunicação' });
  }
});

// DELETE /api/communications/:id - Deletar comunicação
router.delete('/:id', async (req, res) => {
  try {
    const communications = await readJson('news');
    const index = communications.findIndex(c => c.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Comunicação não encontrada' });
    }
    const deletedCommunication = communications.splice(index, 1)[0];
    await writeJson('news', communications);
    res.json(deletedCommunication);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar comunicação' });
  }
});

module.exports = router;
