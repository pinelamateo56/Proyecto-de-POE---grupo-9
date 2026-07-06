require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function crearTabla() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL DEFAULT 'cajero',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla usuarios creada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('Error al crear tabla:', err.message);
    process.exit(1);
  }
}

crearTabla();
