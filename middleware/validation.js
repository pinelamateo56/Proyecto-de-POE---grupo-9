const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const validarProducto = [
  body('codigo_barra')
    .trim()
    .notEmpty().withMessage('El código de barras es requerido')
    .isLength({ max: 50 }).withMessage('El código de barras no puede exceder 50 caracteres'),
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('precio_venta')
    .isFloat({ min: 0.01 }).withMessage('El precio de venta debe ser un número positivo'),
  body('stock_actual')
    .isInt({ min: 0 }).withMessage('El stock actual debe ser un entero no negativo'),
  body('stock_minimo')
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un entero no negativo'),
  handleValidationErrors
];

const validarFactura = [
  body('numero_factura')
    .optional()
    .trim(),
  body('detalles')
    .isArray({ min: 1 }).withMessage('La factura debe contener al menos un detalle'),
  body('detalles.*.id_producto')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('detalles.*.cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero positivo'),
  body('detalles.*.precio_unitario')
    .isFloat({ min: 0.01 }).withMessage('El precio unitario debe ser un número positivo'),
  handleValidationErrors
];

const validarCliente = [
  body('cedula')
    .trim()
    .notEmpty().withMessage('La cédula es requerida')
    .isLength({ max: 15 }).withMessage('La cédula no puede exceder 15 caracteres'),
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('telefono')
    .optional()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('correo')
    .optional()
    .isEmail().withMessage('Formato de correo electrónico inválido'),
  handleValidationErrors
];

const validarProductoStock = [
  body('stock_actual')
    .isInt({ min: 0 }).withMessage('El stock actual debe ser un entero no negativo'),
  handleValidationErrors
];

const validarProductoAdmin = [
  body('precio_venta')
    .isFloat({ min: 0.01 }).withMessage('El precio de venta debe ser un número positivo'),
  body('stock_minimo')
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un entero no negativo'),
  handleValidationErrors
];

module.exports = { validarProducto, validarFactura, validarCliente, validarProductoStock, validarProductoAdmin };
