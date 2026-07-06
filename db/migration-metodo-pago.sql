-- Migración: Agregar columnas de método de pago a facturas
-- Fecha: 2026-07-04

-- Agregar columna metodo_pago
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facturas' AND column_name = 'metodo_pago'
    ) THEN
        ALTER TABLE facturas ADD COLUMN metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo';
        RAISE NOTICE 'Columna metodo_pago agregada a facturas';
    ELSE
        RAISE NOTICE 'Columna metodo_pago ya existe en facturas';
    END IF;
END $$;

-- Agregar columna monto_recibido
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facturas' AND column_name = 'monto_recibido'
    ) THEN
        ALTER TABLE facturas ADD COLUMN monto_recibido NUMERIC(10,2);
        RAISE NOTICE 'Columna monto_recibido agregada a facturas';
    ELSE
        RAISE NOTICE 'Columna monto_recibido ya existe en facturas';
    END IF;
END $$;

-- Agregar columna cambio
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facturas' AND column_name = 'cambio'
    ) THEN
        ALTER TABLE facturas ADD COLUMN cambio NUMERIC(10,2);
        RAISE NOTICE 'Columna cambio agregada a facturas';
    ELSE
        RAISE NOTICE 'Columna cambio ya existe en facturas';
    END IF;
END $$;
