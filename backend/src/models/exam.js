const { Schema, model } = require('mongoose');
const ExamSchema = new Schema({
    usuarioId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    tipoExameId: { type: Schema.Types.ObjectId, ref: 'examType', required: true },
    dataColeta: { type: Date, required: true },
    resultado: { type: String, required: true },
});

const exam = model('exam', ExamSchema);

module.exports = exam;