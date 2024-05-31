const  { createExamTypeService, getExamTypeService, updateExamTypeService, deleteExamTypeService } = require('../services/examType.service.js');

const createExamType = async (req, res) => {
    try {
        const { nomeExame, valorReferencia } = req.body;
        const examType = await createExamTypeService({ nomeExame, valorReferencia });
        res.status(201).json(examType);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar tipo de exame.' });
    }
};

const getExamType = async (req, res) => {
    try {
        const examType = await getExamTypeService();
        res.status(200).json(examType);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar tipos de exame.' });
    }
}

const updateExamType = async (req, res) => {
    try {
        const { id } = req.params;

        const { nomeExame, valorReferencia } = req.body;
        if (!nomeExame && !valorReferencia) {
            return res.status(400).json({ message: 'Envie pelo menos um campo para atualização.' });
        }

        const examType = await updateExamTypeService(id, { nomeExame, valorReferencia });
        res.status(200).json(examType);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar tipo de exame.' });
    }
}

const deleteExamType = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteExamTypeService(id);
        res.status(200).json({ message: 'Tipo de exame removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover tipo de exame.' });
    }
}

module.exports = { createExamType, getExamType, updateExamType, deleteExamType };