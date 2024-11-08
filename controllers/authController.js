const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.register = async (req, res) => {
  const logger = req.logger;
  const { nome, email, senha } = req.body;
  logger.info('Cadastro de novo usuário');
  try {
    const usuario = await Usuario.create({ nome, email, senha });
    res.status(201).json({ id: usuario.id });
  } catch (error) {
    logger.error('Erro ao cadastrar novo usuário', { err: error })
    res.status(400).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const logger = req.logger;
  const { email, senha } = req.body;
  logger.info('Login iniciado')
  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, name: usuario.nome });
  } catch (error) {
    logger.error('Erro ao efetuar login', { err: error })
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

exports.solicitarRecuperacaoSenha = async (req, res) => {
  const logger = req.logger;
  logger.info('Recuperação de senha iniciada.');
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET, { expiresIn: process.env.PASSWORD_RESET_EXPIRATION || '1h' });

    const linkRecuperacao = `${process.env.CLIENT_URL}/#/password-recovery?token=${token}`;

    const msg = {
      to: email,
      from: 'juliagmsouza12@gmail.com',
      subject: 'Recuperação de Senha',
      html: `
  <p>Você solicitou a recuperação de senha.</p>
  <p>Clique no link abaixo para redefinir sua senha:</p>
  <p><a href="${linkRecuperacao}" target="_blank" style="color: #1a73e8; text-decoration: none;">Redefinir Senha</a></p>
  <p>O link expira em 1 hora.</p>
`,
    };

    await sgMail.send(msg);

    res.json({ message: 'E-mail de recuperação de senha enviado com sucesso' });
  } catch (error) {
    logger.error('Falhar ao enviar link de recuperação de senha', { err: error })

    res.status(500).json({ error: 'Erro ao solicitar recuperação de senha' });
  }
};


exports.redefinirSenha = async (req, res) => {
  const logger = req.logger;
  logger.info('Redefinição de senha iniciada.');
  const { token, novaSenha } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senhaHashed = await bcrypt.hash(novaSenha, 10);
    usuario.senha = senhaHashed;
    await usuario.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Falhar ao redefinir senha', { err: error })
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'O token de recuperação expirou' });
    }
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
};