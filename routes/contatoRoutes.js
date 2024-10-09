const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/contatoController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, contatoController.adicionarContato);
router.get('/', authenticate, contatoController.listarContatos);
router.get('/:id', authenticate, contatoController.detalharContato);
router.put('/:id', authenticate, contatoController.atualizarContato);
router.delete('/:id', authenticate, contatoController.excluirContato);

module.exports = router;