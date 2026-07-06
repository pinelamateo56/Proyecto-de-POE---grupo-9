const { Router } = require('express');
const router = Router();
const controller = require('../controllers/clientesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validarCliente } = require('../middleware/validation');

router.get('/', authMiddleware, controller.listar);
router.get('/buscar/:cedula', authMiddleware, controller.buscarPorCedula);
router.post('/', authMiddleware, roleMiddleware('admin', 'bodeguero', 'cajero'), validarCliente, controller.crear);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'bodeguero'), validarCliente, controller.actualizar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), controller.eliminar);

module.exports = router;
