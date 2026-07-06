const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE estado = TRUE ORDER BY id_producto');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  const { codigo_barra, nombre, precio_venta, stock_actual, stock_minimo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO productos (codigo_barra, nombre, precio_venta, stock_actual, stock_minimo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [codigo_barra, nombre, precio_venta, stock_actual, stock_minimo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código de barras' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { codigo_barra, nombre, precio_venta, stock_actual, stock_minimo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos
       SET codigo_barra = $1, nombre = $2, precio_venta = $3, stock_actual = $4, stock_minimo = $5
       WHERE id_producto = $6 AND estado = TRUE RETURNING *`,
      [codigo_barra, nombre, precio_venta, stock_actual, stock_minimo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código de barras' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.actualizarStock = async (req, res) => {
  const { id } = req.params;
  const { stock_actual } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos SET stock_actual = $1 WHERE id_producto = $2 AND estado = TRUE RETURNING *`,
      [stock_actual, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizarParametros = async (req, res) => {
  const { id } = req.params;
  const { precio_venta, stock_minimo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos SET precio_venta = $1, stock_minimo = $2 WHERE id_producto = $3 AND estado = TRUE RETURNING *`,
      [precio_venta, stock_minimo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buscarPorCodigo = async (req, res) => {
  const { codigo_barra } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE codigo_barra = $1 AND estado = TRUE',
      [codigo_barra]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE productos SET estado = FALSE WHERE id_producto = $1 AND estado = TRUE RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.estadisticas = async (req, res) => {
  try {
    const totalProductos = await pool.query('SELECT COUNT(*) FROM productos WHERE estado = TRUE');
    const stockBajo = await pool.query(
      'SELECT COUNT(*) FROM productos WHERE estado = TRUE AND stock_actual > 0 AND stock_actual <= stock_minimo'
    );
    const sinStock = await pool.query(
      'SELECT COUNT(*) FROM productos WHERE estado = TRUE AND stock_actual = 0'
    );
    const totalFacturas = await pool.query('SELECT COUNT(*) FROM factura_cabecera');
    const recaudacionTotal = await pool.query('SELECT COALESCE(SUM(total_pagar), 0) AS total FROM factura_cabecera');

    res.json({
      total_productos: parseInt(totalProductos.rows[0].count),
      stock_bajo: parseInt(stockBajo.rows[0].count),
      sin_stock: parseInt(sinStock.rows[0].count),
      total_facturas: parseInt(totalFacturas.rows[0].count),
      recaudacion_total: parseFloat(recaudacionTotal.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
