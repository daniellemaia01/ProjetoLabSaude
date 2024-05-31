const { Schema, model } = require('mongoose');

const ExamTypeSchema = new Schema({
    nomeExame: { type: String, required: true }, 
    valorReferencia: { type: String, required: true },
});

const examType = model('examType', ExamTypeSchema);

module.exports = examType;