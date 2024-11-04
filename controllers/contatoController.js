// controllers/contatoController.js
const { Contato } = require('../models/index');
const { Endereco } = require('../models/index');

exports.adicionarContato = async (req, res) => {
  const logger = req.logger;
  logger.info('Cadastro de novo contato');
  const { nome, telefone, email, favorito, rua, cidade, estado, cep } = req.body;
  const usuarioId = req.userId;
  try {
    const contato = await Contato.create({ nome, telefone, email, usuarioId, favorito });

    await Endereco.create({
      rua,
      cidade,
      estado,
      cep,
      contatoId: contato.id
    });

    res.status(201).json({ id: contato.id });
  } catch (error) {
    logger.error('Erro ao adicionar novo contato', { err: error });
    res.status(500).json({ error: 'Erro ao adicionar o contato' });
  }
};

exports.listarContatos = async (req, res) => {
  const logger = req.logger;
  logger.info('Listagem de contatos');
  try {
    const options = {
      where: { usuarioId: req.userId }
    };

    if (req.query.favorito) {
      options.where.favorito = true;
    }
    const contatos = await Contato.findAll(options);
    res.status(200).json(contatos.map(contato => ({ id: contato.id, nome: contato.nome })));
  } catch (error) {
    logger.error('Erro ao listar contatos', { err: error });
    res.status(500).json({ error: 'Erro ao listar contatos' });
  }
};

exports.detalharContato = async (req, res) => {
  const logger = req.logger;
  logger.info('Detalhamento de contato');
  try {
    const { id } = req.params;

    const contato = await Contato.findOne({
      where: { usuarioId: req.userId, id },
      attributes: ['id', 'nome', 'telefone', 'email', 'createdAt', 'updatedAt'],
      include: [{
        model: Endereco,
        attributes: ['rua', 'cidade', 'estado', 'cep']
      }]
    });

    if (!contato) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    res.status(200).json(contato);
  } catch (error) {
    logger.error('Erro ao detalhar contato', { err: error });
    res.status(500).json({ error: 'Erro ao detalhar contato' });
  }
};

exports.atualizarContato = async (req, res) => {
  const logger = req.logger;
  logger.info('Atualização de contato');
  const { nome, telefone, email, rua, cidade, estado, cep } = req.body;
  const { id } = req.params;

  try {
    const contato = await Contato.findByPk(id);
    if (!contato) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    await contato.update({ nome, telefone, email });

    const endereco = await Endereco.findOne({ where: { contatoId: id } });
    if (endereco) {
      await endereco.update({ rua, cidade, estado, cep });
    }

    res.status(200).json({ id: contato.id });
  } catch (error) {
    logger.error('Erro ao atualizar contato', { err: error });
    res.status(500).json({ error: 'Erro ao atualizar o contato' });
  }
};

exports.excluirContato = async (req, res) => {
  const logger = req.logger;
  logger.info('Remoção de contato');
  const { id } = req.params;

  try {
    const contato = await Contato.findByPk(id);
    if (!contato) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    await contato.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error('Erro ao excluir contato', { err: error });
    res.status(500).json({ error: 'Erro ao excluir o contato' });
  }
};
