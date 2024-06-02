const userService = require('../services/user.service.js');
const userRepositories = require('../repositories/user.respositories.js');
const examService = require('../services/exam.service');

const createUser = async (req, res) => {
    const { nome, email, senha, dataNascimento, cpf, admin} = req.body;

    if (!nome || !email || !senha || !dataNascimento || !cpf || admin === undefined) {
        return res.status(400).json({ message: 'Preencha todos os campos do usuário.' });
    }

    try {
        const foundUser = await userRepositories.findByEmailUserRepository(email);
        
        if (foundUser) {
            return res.status(409).json({ message: 'Já existe usuário com o e-mail informado.' });
        }

        const user = await userService.createUserService(req.body);

        if (!user) {
            return res.status(400).json({ message: 'Erro interno no acesso ao banco de dados. Tente novamente mais tarde.' });
        }

        const { senha, ...userWithoutPassword } = user.toObject();

        res.status(201).json({ message: 'Usuário criado com sucesso!', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let {limit, offset} = req.query;

        if (!limit) limit = 10;

        if (!offset) offset = 0;

        limit = parseInt(limit);
        offset = parseInt(offset);

        const users = await userService.getAllUsersService(offset, limit);
        const totalUsers = await userService.countUsersService();
        const currentUrl = req.baseUrl;

        const next = offset + limit;
        const nextUrl = next >= totalUsers ? null : `${currentUrl}?offset=${next}&limit=${limit}`

        const previous = offset - limit;
        const previousUrl = previous < 0 ? null : `${currentUrl}?offset=${previous}&limit=${limit}`

        if (users.length === 0 || !users){
            return res.status(404).json({ message: 'Nenhum usuário encontrado.' });
        }

        res.status(200).json({ users, totalUsers, limit, offset, nextUrl, previousUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    const { nome, email, senha, dataNascimento, cpf, admin } = req.body;

    if (!nome && !email && !senha && !dataNascimento && !cpf && admin === undefined) {
        return res.status(400).json({ message: 'Envie pelo menos um campo para atualização.' });
    }
    
    try {

        const foundUser = await userRepositories.findByEmailUserRepository(email);
        
        if (foundUser) {
            return res.status(409).json({ message: 'Já existe usuário com o e-mail informado.' });
        }
        
        const updatedUser = await userService.updateUserService(req.userId, nome, email, senha, dataNascimento, cpf, admin);
        res.status(200).json({ message: 'Usuário atualizado com sucesso', user: updatedUser});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserById = async (req, res) => {
    const { nome, email, senha, dataNascimento, cpf, admin } = req.body;

    if (!nome && !email && !senha && !dataNascimento && !cpf && admin === undefined) {
        return res.status(400).json({ message: 'Envie pelo menos um campo para atualização.' });
    }
    
    try {

        const foundUser = await userRepositories.findByEmailUserRepository(email);
        
        if (foundUser && foundUser._id != req.params.id) {
            return res.status(409).json({ message: 'Já existe usuário com o e-mail informado.' });
        }
        
        const updatedUser = await userService.updateUserService(req.params.id, nome, email, senha, dataNascimento, cpf, admin);
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        // Verificando se usuario tem resultados de exames
        const exams = await examService.getExamsByUserIdService(req.params.id);

        // So remove se nao tiver resultados de exames
        if (exams.length == 0) {
            await userService.deleteUserService(id);
            res.status(200).json({ message: 'Usuário removido com sucesso.' });
        } else {
            return res.status(409).json({ message: 'Usuário possui resultados de exames. Exclua os resultados primeiro. ' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createUser, getAllUsers, getUserById, updateUser, updateUserById, deleteUser };