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

// GET /api/cameras - Listar todas as câmeras
router.get('/', async (req, res) => {
  try {
    const cameras = await readJson('cameras');
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler câmeras' });
  }
});

// GET /api/cameras/:id - Obter câmera por ID
router.get('/:id', async (req, res) => {
  try {
    const cameras = await readJson('cameras');
    const camera = cameras.find(c => c.id == req.params.id);
    if (!camera) {
      return res.status(404).json({ error: 'Câmera não encontrada' });
    }
    res.json(camera);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler câmera' });
  }
});

// POST /api/cameras - Criar nova câmera
router.post('/', async (req, res) => {
  try {
    const cameras = await readJson('cameras');
    // Gerar ID sequencial (maior ID + 1)
    const ids = cameras.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newCamera = {
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    cameras.push(newCamera);
    await writeJson('cameras', cameras);
    res.status(201).json(newCamera);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar câmera' });
  }
});

// PUT /api/cameras/:id - Atualizar câmera
router.put('/:id', async (req, res) => {
  try {
    const cameras = await readJson('cameras');
    const index = cameras.findIndex(c => c.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Câmera não encontrada' });
    }
    cameras[index] = { ...cameras[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJson('cameras', cameras);
    res.json(cameras[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar câmera' });
  }
});

// DELETE /api/cameras/:id - Deletar câmera
router.delete('/:id', async (req, res) => {
  try {
    const cameras = await readJson('cameras');
    const index = cameras.findIndex(c => c.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Câmera não encontrada' });
    }
    const deletedCamera = cameras.splice(index, 1)[0];
    await writeJson('cameras', cameras);
    res.json(deletedCamera);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar câmera' });
  }
});

module.exports = router;