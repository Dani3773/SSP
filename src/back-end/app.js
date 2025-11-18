const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, '../front-end')));

// Rotas da API
const usersRouter = require('./controllers/controlUs');
const communicationsRouter = require('./controllers/controlCom');
const analysesRouter = require('./controllers/controlAna');
const camerasRouter = require('./controllers/controlCam');
const denunciasRouter = require('./controllers/controlDen');
app.use('/api/users', usersRouter);
app.use('/api/communications', communicationsRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/cameras', camerasRouter);
app.use('/api/denuncias', denunciasRouter);

// Rotas básicas
app.get('/api', (req, res) => {
  res.send('SSP Back-end está rodando!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;