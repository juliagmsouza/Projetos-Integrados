require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const contatoRoutes = require('./routes/contatoRoutes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/contatos', contatoRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
});