const { Router } = require('express');
const examTypeController = require('../controllers/examType.controller.js');
const  authMiddleware  = require('../middleware/auth.middleware.js');
const  adminMiddleware  = require('../middleware/admin.middleware.js');
const { validID } = require('../middleware/global.middleware.js');

const router = Router();

router.post('/', authMiddleware, adminMiddleware, examTypeController.createExamType);
router.get('/', authMiddleware, examTypeController.getExamType);
router.put('/:id', authMiddleware, adminMiddleware, validID, examTypeController.updateExamType);
router.delete('/:id', authMiddleware, adminMiddleware, validID, examTypeController.deleteExamType);

module.exports = router;