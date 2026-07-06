require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function crearUsuariosPrueba() {
  const usuarios = [
    { username: 'bodeguero', password: 'bodeguero123', rol: 'bodeguero' },
    { username: 'cajero', password: 'cajero123', rol: 'cajero' }
  ];

  try {
    for (const usuario of usuarios) {
      const existingUser = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE username = $1',
        [usuario.username]
      );

      if (existingUser.rows.length > 0) {
        console.log(`El usuario ${usuario.username} ya existe`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(usuario.password, salt);

      await pool.query(
        'INSERT INTO usuarios (username, password_hash, rol) VALUES ($1, $2, $3)',
        [usuario.username, password_hash, usuario.rol]
      );

      console.log(`Usuario ${usuario.username} creado exitosamente`);
    }

    console.log('\n--- Usuarios de Prueba ---');
    console.log('admin / admin123 (admin)');
    console.log('bodeguero / bodeguero123 (bodeguero)');
    console.log('cajero / cajero123 (cajero)');

    process.exit(0);
  } catch (err) {
    console.error('Error al crear usuarios:', err.message);
    process.exit(1);
  }
}

crearUsuariosPrueba();
