require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function crearAdmin() {
  const username = 'admin';
  const password = 'admin123';
  const rol = 'admin';

  try {
    const existingUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log('El usuario admin ya existe');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO usuarios (username, password_hash, rol) VALUES ($1, $2, $3)',
      [username, password_hash, rol]
    );

    console.log('Usuario admin creado exitosamente');
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
    process.exit(0);
  } catch (err) {
    console.error('Error al crear usuario admin:', err.message);
    process.exit(1);
  }
}

crearAdmin();
