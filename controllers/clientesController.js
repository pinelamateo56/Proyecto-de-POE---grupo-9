const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id_cliente');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buscarPorCedula = async (req, res) => {
  const { cedula } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE cedula = $1',
      [cedula]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  const { cedula, nombre, telefono, correo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clientes (cedula, nombre, telefono, correo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cedula, nombre, telefono || '', correo || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un cliente con esa cédula' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { cedula, nombre, telefono, correo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clientes
       SET cedula = $1, nombre = $2, telefono = $3, correo = $4
       WHERE id_cliente = $5 RETURNING *`,
      [cedula, nombre, telefono || '', correo || '', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un cliente con esa cédula' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM clientes WHERE id_cliente = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
