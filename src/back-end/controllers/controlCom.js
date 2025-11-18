const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../utils');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'ssp-secret-key'; // Deve ser o mesmo do controlUs

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../storage/uploads/news');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'news-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens PNG e JPEG são permitidas'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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

// POST /api/communications/upload-image - Upload de imagem (DEVE VIR ANTES DAS OUTRAS ROTAS)
router.post('/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    // Retornar caminho relativo para salvar no JSON
    const imagePath = `/api/communications/images/${req.file.filename}`;
    
    res.status(200).json({ 
      message: 'Imagem enviada com sucesso',
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// GET /api/communications/images/:filename - Servir imagem
router.get('/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../storage/uploads/news', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
    res.status(500).json({ error: 'Erro ao carregar imagem' });
  }
});

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
