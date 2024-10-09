const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const usuario = await Usuario.create({ nome, email, senha });
    res.status(201).json({id: usuario.id});
  } catch (error) {
    res.status(400).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    try {
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  };