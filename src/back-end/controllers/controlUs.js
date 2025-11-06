const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { readJson, writeJson } = require('../utils');

const JWT_SECRET = 'ssp-secret-key'; // Em produção, use variável de ambiente

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

// POST /api/users/login - Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
    }

    const users = await readJson('users');
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha (assumindo que está hasheada)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

// Aplicar middleware de autenticação às rotas protegidas
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Rotas protegidas
authRouter.get('/', async (req, res) => {
  try {
    const users = await readJson('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler usuários' });
  }
});

authRouter.get('/:id', async (req, res) => {
  try {
    const users = await readJson('users');
    const user = users.find(u => u.id == req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler usuário' });
  }
});

authRouter.post('/', async (req, res) => {
  try {
    const users = await readJson('users');
    const { username, password, role, ...otherData } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    // Verificar permissões: apenas admin pode criar admin
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar usuários administradores' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gerar ID sequencial
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;

    const newUser = {
      id: maxId + 1,
      username,
      password: hashedPassword,
      role: role || 'supervisor', // Padrão supervisor se não especificado
      ...otherData
    };
    users.push(newUser);
    await writeJson('users', users);
    res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

authRouter.put('/:id', async (req, res) => {
  try {
    const users = await readJson('users');
    const index = users.findIndex(u => u.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, role, ...updateData } = req.body;
    
    // Verificar permissões: apenas admin pode alterar para admin
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem alterar usuários para administradores' });
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (role) {
      updateData.role = role;
    }

    users[index] = { ...users[index], ...updateData, updatedAt: new Date().toISOString() };
    await writeJson('users', users);
    res.json({ id: users[index].id, username: users[index].username, role: users[index].role });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

authRouter.delete('/:id', async (req, res) => {
  try {
    // Verificar permissões: apenas admin pode deletar usuários
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem desativar usuários' });
    }

    const users = await readJson('users');
    const index = users.findIndex(u => u.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const deletedUser = users.splice(index, 1)[0];
    await writeJson('users', users);
    res.json({ id: deletedUser.id, username: deletedUser.username });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Montar rotas
router.use('/', authRouter);

module.exports = router;