-- Migración: Tabla de Clientes
-- Fecha: 2026-07-03

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar cliente de prueba (Consumidor Final)
INSERT INTO clientes (cedula, nombre, telefono, correo)
VALUES ('0000000000', 'Consumidor Final', '', '')
ON CONFLICT (cedula) DO NOTHING;

-- Insertar clientes de prueba
INSERT INTO clientes (cedula, nombre, telefono, correo)
VALUES
    ('123456789', 'Juan Pérez', '8888-1234', 'juan.perez@email.com'),
    ('987654321', 'María López', '8888-5678', 'maria.lopez@email.com'),
    ('456789123', 'Carlos Rodríguez', '8888-9012', 'carlos.rodriguez@email.com')
ON CONFLICT (cedula) DO NOTHING;
