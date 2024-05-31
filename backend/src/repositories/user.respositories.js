const user = require('../models/user');

const findByEmailUserRepository = (email) => user.findOne({ email: email });

module.exports = { findByEmailUserRepository };