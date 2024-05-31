const user = require('../models/user.js');

const createUserService = (body) => user.create(body);

const getAllUsersService = async (offset, limit) => {
    return await user.find().skip(offset).limit(limit);
}

const getUserByIdService = async (id) => {
    return await user.findById(id);
}

const updateUserService = async (id, nome, email, senha, dataNascimento, cpf, admin) => {
    return user.findOneAndUpdate(
        {_id: id}, {
            nome,
            email,
            senha,
            dataNascimento,
            cpf,
            admin
        }, {new: true}
    );
}

const deleteUserService = async (id) => {
    return user.findByIdAndDelete(id);
}


const countUsersService = async () => {
    try {
        const totalUsers = await user.countDocuments();
        return totalUsers;
    } catch (error) {
        throw error;
    }
};

module.exports = { createUserService, getAllUsersService, getUserByIdService, updateUserService, deleteUserService, countUsersService };