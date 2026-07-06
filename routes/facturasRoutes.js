const { Router } = require('express');
const router = Router();
const controller = require('../controllers/facturasController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validarFactura } = require('../middleware/validation');

router.post('/', authMiddleware, validarFactura, controller.crear);
router.get('/', authMiddleware, controller.listar);
router.get('/estadisticas', authMiddleware, roleMiddleware('admin'), controller.estadisticas);
router.get('/:id', authMiddleware, controller.obtenerPorId);

module.exports = router;
