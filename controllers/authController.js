const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dutc-secret-key-2024';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const result = await pool.query(
      'SELECT id_usuario, username, password_hash, rol FROM usuarios WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    const validPassword = await bcrypt.compare(password, usuario.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, username: usuario.username, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        rol: usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, rol } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, rol) VALUES ($1, $2, $3) RETURNING id_usuario, username, rol',
      [username, password_hash, rol || 'cajero']
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

exports.obtenerPerfil = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario, username, rol, fecha_creacion FROM usuarios WHERE id_usuario = $1',
      [req.user.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario, username, rol, fecha_creacion FROM usuarios ORDER BY id_usuario'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
