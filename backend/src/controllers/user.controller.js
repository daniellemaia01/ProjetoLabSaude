const userService = require('../services/user.service.js');
const userRepositories = require('../repositories/user.respositories.js');

const createUser = async (req, res) => {
    const { nome, email, senha, dataNascimento, cpf, admin} = req.body;

    if (!nome || !email || !senha || !dataNascimento || !cpf || admin === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const foundUser = await userRepositories.findByEmailUserRepository(email);
        
        if (foundUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await userService.createUserService(req.body);

        if (!user) {
            return res.status(400).json({ message: 'User not created' });
        }

        const { senha, ...userWithoutPassword } = user.toObject();

        res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
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
            return res.status(404).json({ message: 'No users found' });
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
        return res.status(400).json({ message: 'Submit at least one field for update' });
    }
    
    try {

        const foundUser = await userRepositories.findByEmailUserRepository(email);
        
        if (foundUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        const updatedUser = await userService.updateUserService(req.userId, nome, email, senha, dataNascimento, cpf, admin);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserById = async (req, res) => {
    const { nome, email, senha, dataNascimento, cpf, admin } = req.body;

    if (!nome && !email && !senha && !dataNascimento && !cpf && admin === undefined) {
        return res.status(400).json({ message: 'Submit at least one field for update' });
    }
    
    try {

        const foundUser = await userRepositories.findByEmailUserRepository(email);
        
        if (foundUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        const updatedUser = await userService.updateUserService(req.params.id, nome, email, senha, dataNascimento, cpf, admin);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await userService.deleteUserService(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createUser, getAllUsers, getUserById, updateUser, updateUserById, deleteUser };