const exam = require('../models/exam');

const createExamService = ( usuarioId, tipoExameId, dataColeta, resultado ) => 
    exam.create({ usuarioId, tipoExameId, dataColeta, resultado });

const getExamService = () => exam.find().populate('usuarioId').populate('tipoExameId');

const getExamByIdService = (id) => exam.findById(id).populate('usuarioId').populate('tipoExameId');

const getExamsByUserIdService = (userId) => exam.find({usuarioId: userId}).populate('tipoExameId');

const updateExamService = (id, updateData) => exam.findByIdAndUpdate(id, updateData, { new: true });

const deleteExamService = (id) => exam.findByIdAndDelete(id);

module.exports = {createExamService, getExamService, getExamByIdService, getExamsByUserIdService, updateExamService, deleteExamService};