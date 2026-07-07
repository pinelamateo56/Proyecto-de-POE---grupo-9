-- =====================================================
-- MIGRACIÓN COMPLETA PARA RAILWAY
-- Ejecutar todas las consultas en orden en la consola SQL de Railway
-- =====================================================

-- 1. Agregar columna estado a productos (borrado lógico)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS estado BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Crear tabla factura_cabecera (reemplaza tabla facturas)
CREATE TABLE IF NOT EXISTS factura_cabecera (
    id_factura SERIAL PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    cliente_identificacion VARCHAR(15),
    cliente_nombre VARCHAR(100),
    id_cajero INTEGER REFERENCES usuarios(id_usuario),
    subtotal NUMERIC(10,2) NOT NULL,
    iva NUMERIC(10,2) DEFAULT 0,
    total_pagar NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo',
    monto_recibido NUMERIC(10,2),
    cambio NUMERIC(10,2)
);

-- 3. Crear tabla factura_detalle (reemplaza tabla detalles_factura)
CREATE TABLE IF NOT EXISTS factura_detalle (
    id_detalle SERIAL PRIMARY KEY,
    id_factura INTEGER NOT NULL REFERENCES factura_cabecera(id_factura) ON DELETE CASCADE,
    id_producto INTEGER,
    nombre_producto VARCHAR(100) NOT NULL,
    codigo_barra VARCHAR(50),
    cantidad INTEGER NOT NULL,
    precio_unitario_historico NUMERIC(10,2) NOT NULL,
    subtotal_item NUMERIC(10,2) NOT NULL
);

-- 4. Migrar datos de facturas antiguas a factura_cabecera
INSERT INTO factura_cabecera (numero_factura, fecha_emision, id_cliente, cliente_identificacion, cliente_nombre, subtotal, total_pagar, metodo_pago, monto_recibido, cambio)
SELECT 
    f.numero_factura,
    f.fecha_emision,
    f.id_cliente,
    f.cliente_identificacion,
    COALESCE(c.nombre, 'Consumidor Final'),
    f.total_pagar,
    f.total_pagar,
    COALESCE(f.metodo_pago, 'efectivo'),
    f.monto_recibido,
    f.cambio
FROM facturas f
LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
ON CONFLICT (numero_factura) DO NOTHING;

-- 5. Migrar datos de detalles_factura antiguos a factura_detalle
INSERT INTO factura_detalle (id_factura, id_producto, nombre_producto, codigo_barra, cantidad, precio_unitario_historico, subtotal_item)
SELECT 
    fc.id_factura,
    df.id_producto,
    p.nombre,
    p.codigo_barra,
    df.cantidad,
    CASE WHEN df.cantidad > 0 THEN df.subtotal / df.cantidad ELSE 0 END,
    df.subtotal
FROM detalles_factura df
JOIN facturas f ON df.id_factura = f.id_factura
JOIN factura_cabecera fc ON fc.numero_factura = f.numero_factura
JOIN productos p ON df.id_producto = p.id_producto;
