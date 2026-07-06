-- Migración: Agregar columna id_cliente a facturas
-- Fecha: 2026-07-03

-- Verificar si la columna id_cliente existe en facturas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facturas' AND column_name = 'id_cliente'
    ) THEN
        ALTER TABLE facturas ADD COLUMN id_cliente INTEGER REFERENCES clientes(id_cliente);
        RAISE NOTICE 'Columna id_cliente agregada a facturas';
    ELSE
        RAISE NOTICE 'Columna id_cliente ya existe en facturas';
    END IF;
END $$;
