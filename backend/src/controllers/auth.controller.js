const bcrypt = require('bcrypt');
const { loginService, generateToken } = require('../services/auth.service');

const login = async (req, res) => {
    const { email, senha } = req.body;
    
    try{
        const user = await loginService(email)

        if(!user){
            return res.status(401).send({ message: 'E-mail ou senha inválidos.'});
        }
        const senhaIsValid = bcrypt.compareSync(senha, user.senha);

        if(!senhaIsValid){
            return res.status(401).send({ message: 'E-mail ou senha inválidos.'});
        }

        const token = generateToken(user.id);

        res.send({token: token, userId: user.id, userAdmin: user.admin})    
    } catch (error) {
        res.status(500).send('Erro interno no login. Tente novamente mais tarde.');
        console.error(error);
    }
}

module.exports =  login 