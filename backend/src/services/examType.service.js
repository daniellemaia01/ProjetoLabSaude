const examType = require('../models/examType');

const createExamTypeService = async ({ nomeExame, valorReferencia }) => {
    const exType = new examType({ nomeExame, valorReferencia });
    await exType.save();
    return exType;
};

const getExamTypeService = async () => {
    return await examType.find();
}

const getExamTypeByIdService = async (id) => {
    return await examType.findById(id);
}

const updateExamTypeService = async (id, { nomeExame, valorReferencia }) => {
    return await examType.findByIdAndUpdate(id, { nomeExame, valorReferencia }, { new: true });
}

const deleteExamTypeService = async (id) => {
    return await examType.findByIdAndDelete(id);
}

module.exports = { createExamTypeService, getExamTypeService, getExamTypeByIdService, updateExamTypeService, deleteExamTypeService };