CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cajero',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    codigo_barra VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    stock_actual INTEGER NOT NULL,
    stock_minimo INTEGER NOT NULL
);

CREATE TABLE facturas (
    id_factura SERIAL PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    cliente_identificacion VARCHAR(15),
    total_pagar NUMERIC(10,2) NOT NULL
);

CREATE TABLE detalles_factura (
    id_detalle SERIAL PRIMARY KEY,
    id_factura INTEGER NOT NULL REFERENCES facturas(id_factura) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);
