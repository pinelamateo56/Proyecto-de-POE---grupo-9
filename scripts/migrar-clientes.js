require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'db', 'migration-clientes.sql'),
      'utf8'
    );
    await pool.query(sql);
    console.log('Migración de clientes ejecutada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('Error en la migración:', err.message);
    process.exit(1);
  }
}

runMigration();
