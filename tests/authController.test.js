const authController = require('../controllers/authController');
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');  // Mudar para bcryptjs
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('../models/usuario');
jest.mock('jsonwebtoken');
jest.mock('@sendgrid/mail');

process.env = {
    PORT: 3000,
    'JWT_SECRET': 'chave-local',
    'SENDGRID_API_KEY': 'key'
};

describe('Auth Controller - Register', () => {
    it('Deve registrar um novo usuário', async () => {
        const req = {
            body: { nome: 'Teste', email: 'teste@example.com', senha: 'senha123' },
            logger: {
                info: jest.fn(),
                error: jest.fn()
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        Usuario.create.mockResolvedValue({
            id: 1,
            ...req.body
        });

        await authController.register(req, res);

        expect(Usuario.create).toHaveBeenCalledWith({
            nome: 'Teste',
            email: 'teste@example.com',
            senha: 'senha123'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: 1
        });
    });
});



describe('Auth Controller - Login', () => {
    it('Deve fazer login com credenciais corretas e retornar um token JWT', async () => {
        const req = {
            body: { email: 'teste@example.com', senha: 'senha123' },
            logger: {
                info: jest.fn(),
                error: jest.fn()
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockUser = { id: 1, email: 'teste@example.com', senha: 'senhaHash123' };
        bcrypt.compare.mockResolvedValue(true);
        Usuario.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('fake-token');

        await authController.login(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith({ where: { email: 'teste@example.com' } });
        expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
        expect(res.json).toHaveBeenCalledWith({ token: 'fake-token' });
    });

    it('Deve retornar 401 se as credenciais estiverem erradas', async () => {
        const req = {
            body: { email: 'teste@example.com', senha: 'senhaErrada' },
            logger: {
                info: jest.fn(),
                error: jest.fn()
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        bcrypt.compare.mockResolvedValue(false);
        const mockUser = { id: 1, email: 'teste@example.com', senha: 'senhaHash123' };

        Usuario.findOne.mockResolvedValue(mockUser);

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    });
});

describe('Auth Controller - Recuperar senha', () => {
    it('Deve enviar email de recuperação de senha', async () => {
        const req = {
            body: { email: 'teste@example.com' },
            logger: {
                info: jest.fn(),
                error: jest.fn()
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        Usuario.findOne.mockResolvedValue({
            id: 1,
        });

        await authController.solicitarRecuperacaoSenha(req, res);



        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
            to: 'teste@example.com',
            from: 'juliagmsouza12@gmail.com',
            subject: 'Recuperação de Senha',
        }));
        expect(res.json).toHaveBeenCalledWith({ message: 'E-mail de recuperação de senha enviado com sucesso' });
    });
});

describe('Auth Controller - Redefinir senha', () => {
    it('Deve redefinir senha', async () => {
        const req = {
            body: { token: 'jwt', novaSenha: 'novaSenha' },
            logger: {
                info: jest.fn(),
                error: jest.fn()
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        jwt.verify.mockReturnValue({userId: 1})

        Usuario.findByPk.mockResolvedValue({
            id: 1,
            save: jest.fn()
        });

        await authController.redefinirSenha(req, res);



        expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha', 10);
        expect(res.json).toHaveBeenCalledWith({ message: 'Senha alterada com sucesso' });
    });
});
