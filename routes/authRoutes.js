const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const logger = require('../middleware/logger');

router.post('/register', logger, authController.register);
router.post('/login', logger, authController.login);
router.post('/recuperar-senha', logger, authController.solicitarRecuperacaoSenha);
router.post('/resetar-senha', logger, authController.redefinirSenha);

module.exports = router;

