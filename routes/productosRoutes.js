const { Router } = require('express');
const router = Router();
const controller = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validarProducto, validarProductoStock, validarProductoAdmin } = require('../middleware/validation');

router.get('/', authMiddleware, controller.listar);
router.get('/estadisticas', authMiddleware, roleMiddleware('admin'), controller.estadisticas);
router.post('/', authMiddleware, roleMiddleware('admin', 'bodeguero'), validarProducto, controller.crear);
router.put('/:id', authMiddleware, roleMiddleware('admin'), validarProducto, controller.actualizar);
router.put('/:id/stock', authMiddleware, roleMiddleware('admin', 'bodeguero'), validarProductoStock, controller.actualizarStock);
router.put('/:id/parametros', authMiddleware, roleMiddleware('admin'), validarProductoAdmin, controller.actualizarParametros);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), controller.eliminar);
router.get('/buscar/:codigo_barra', authMiddleware, controller.buscarPorCodigo);

module.exports = router;
