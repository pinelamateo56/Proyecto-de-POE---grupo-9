const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/login', controller.login);
router.post('/register', authMiddleware, roleMiddleware('admin'), controller.register);
router.post('/register/public', controller.register);
router.get('/perfil', authMiddleware, controller.obtenerPerfil);
router.get('/', authMiddleware, roleMiddleware('admin'), controller.listar);
router.get('/inactivos', authMiddleware, roleMiddleware('admin'), controller.listarInactivos);
router.put('/:id/reactivar', authMiddleware, roleMiddleware('admin'), controller.reactivar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), controller.eliminar);

module.exports = router;
