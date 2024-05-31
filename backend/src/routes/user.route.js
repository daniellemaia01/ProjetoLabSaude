const { Router } = require('express');
const userController = require('../controllers/user.controller.js');
const  authMiddleware  = require('../middleware/auth.middleware.js');
const  adminMiddleware  = require('../middleware/admin.middleware.js');

const router = Router();

const { validID, validUser } = require('../middleware/global.middleware.js');

router.post('/', userController.createUser);
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, adminMiddleware, validID, validUser, userController.getUserById);
router.put('/', authMiddleware, userController.updateUser);
router.put('/:id', authMiddleware, adminMiddleware, validID, validUser, userController.updateUserById);
router.delete('/:id', authMiddleware, adminMiddleware, validID, validUser, userController.deleteUser);

module.exports = router;