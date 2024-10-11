const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/contatoController');
const authenticate = require('../middleware/authenticate');
const logger = require('../middleware/logger');

router.post('/', logger, authenticate, contatoController.adicionarContato);
router.get('/', logger, authenticate, contatoController.listarContatos);
router.get('/:id', logger, authenticate, contatoController.detalharContato);
router.put('/:id', logger, authenticate, contatoController.atualizarContato);
router.delete('/:id', logger, authenticate, contatoController.excluirContato);

module.exports = router;