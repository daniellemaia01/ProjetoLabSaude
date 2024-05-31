const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    nome: { type: String, required: true },
    dataNascimento: { type: Date, required: true},
    cpf: { type: String, required: true},
    email: { type: String, required: true, unique: true, lowercase: true},
    senha: { type: String, required: true, select: false},
    admin: { type: Boolean, required: true, default: false},
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();
    this.senha = await bcrypt.hash(this.senha, 10);
    return next();
});

const user = model('user', UserSchema);

module.exports = user;