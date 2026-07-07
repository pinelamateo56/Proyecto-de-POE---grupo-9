const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register/public', controller.register);

router.post('/login', controller.login);
router.post('/register', authMiddleware, roleMiddleware('admin'), controller.register);
router.get('/perfil', authMiddleware, controller.obtenerPerfil);
router.get('/', authMiddleware, roleMiddleware('admin'), controller.listar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), controller.eliminar);

module.exports = router;
