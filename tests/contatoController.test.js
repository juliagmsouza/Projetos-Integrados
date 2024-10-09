// __tests__/contatoController.test.js
const { adicionarContato, listarContatos, detalharContato, atualizarContato, excluirContato } = require('../controllers/contatoController');
const { Contato, Endereco } = require('../models');

jest.mock('../models', () => ({
    Contato: {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn()
    },
    Endereco: {
      create: jest.fn(),
      findOne: jest.fn()
    }
  }));
  

describe('Contato Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            userId: 1
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
    });

    describe('adicionarContato', () => {
        it('should add a contact and return its id', async () => {
            req.body = { nome: 'John Doe', telefone: '123456789', email: 'john@example.com', favorito: true, rua: 'Street', cidade: 'City', estado: 'State', cep: '12345' };
            Contato.create.mockResolvedValue({ id: 1 });
            Endereco.create.mockResolvedValue({});

            await adicionarContato(req, res);

            expect(Contato.create).toHaveBeenCalledWith({ nome: 'John Doe', telefone: '123456789', email: 'john@example.com', usuarioId: 1, favorito: true });
            // expect(Endereco.create).toHaveBeenCalledWith({ rua: 'Street', cidade: 'City', estado: 'State', cep: '12345', contatoId: 1 });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should handle errors', async () => {
            Contato.create.mockRejectedValue(new Error('Erro ao adicionar o contato'));

            await adicionarContato(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao adicionar o contato' });
        });
    });

    describe('listarContatos', () => {
        it('should list contacts', async () => {
            Contato.findAll.mockResolvedValue([{ id: 1, nome: 'John Doe' }]);

            await listarContatos(req, res);

            expect(Contato.findAll).toHaveBeenCalledWith({ where: { usuarioId: 1 } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1, nome: 'John Doe' }]);
        });

        it('should handle errors', async () => {
            Contato.findAll.mockRejectedValue(new Error('Erro ao listar contatos'));

            await listarContatos(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar contatos' });
        });
    });

    describe('detalharContato', () => {
        it('should detail a contact', async () => {
            req.params.id = 1;
            Contato.findOne.mockResolvedValue({
                id: 1,
                nome: 'John Doe',
                telefone: '123456789',
                email: 'john@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
                Endereco: {
                    rua: 'Street',
                    cidade: 'City',
                    estado: 'State',
                    cep: '12345'
                }
            });

            await detalharContato(req, res);

            expect(Contato.findOne).toHaveBeenCalledWith({
                where: { usuarioId: 1, id: 1 },
                attributes: ['id', 'nome', 'telefone', 'email', 'createdAt', 'updatedAt'],
                include: [{
                    model: Endereco,
                    attributes: ['rua', 'cidade', 'estado', 'cep']
                }]
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 1,
                nome: 'John Doe',
                telefone: '123456789',
                email: 'john@example.com',
                Endereco: expect.objectContaining({
                    rua: 'Street',
                    cidade: 'City',
                    estado: 'State',
                    cep: '12345'
                })
            }));
        });

        it('should handle contact not found', async () => {
            req.params.id = 1;
            Contato.findOne.mockResolvedValue(null);

            await detalharContato(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Contato não encontrado' });
        });

        it('should handle errors', async () => {
            Contato.findOne.mockRejectedValue(new Error('Erro ao detalhar contato'));

            await detalharContato(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao detalhar contato' });
        });
    });

    describe('atualizarContato', () => {
        it('should update a contact', async () => {
            req.params.id = 1;
            req.body = { nome: 'John Doe', telefone: '123456789', email: 'john@example.com', rua: 'Street', cidade: 'City', estado: 'State', cep: '12345' };
            Contato.findByPk.mockResolvedValue({
                id: 1,
                update: jest.fn().mockResolvedValue({})
            });
            Endereco.findOne.mockResolvedValue({
                update: jest.fn().mockResolvedValue({})
            });

            await atualizarContato(req, res);

            expect(Contato.findByPk).toHaveBeenCalledWith(1);
            expect(Endereco.findOne).toHaveBeenCalledWith({ where: { contatoId: 1 } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should handle contact not found', async () => {
            req.params.id = 1;
            Contato.findByPk.mockResolvedValue(null);

            await atualizarContato(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Contato não encontrado' });
        });

        it('should handle errors', async () => {
            Contato.findByPk.mockRejectedValue(new Error('Erro ao atualizar o contato'));

            await atualizarContato(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao atualizar o contato' });
        });
    });

    describe('excluirContato', () => {
        it('should delete a contact', async () => {
            req.params.id = 1;
            Contato.findByPk.mockResolvedValue({
                id: 1,
                destroy: jest.fn().mockResolvedValue({})
            });

            await excluirContato(req, res);

            expect(Contato.findByPk).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should handle contact not found', async () => {
            req.params.id = 1;
            Contato.findByPk.mockResolvedValue(null);

            await excluirContato(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Contato não encontrado' });
        });

        it('should handle errors', async () => {
            Contato.findByPk.mockRejectedValue(new Error('Erro ao excluir o contato'));

            await excluirContato(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao excluir o contato' });
        });
    });
});
