const user = require('../models/user');
const jwt = require('jsonwebtoken');

const loginService = async (email) => user.findOne({email: email}).select('+senha');

const generateToken = (id) => jwt.sign({id: id}, process.env.SECRET_JWT, {expiresIn: 86400});

module.exports = { loginService, generateToken };