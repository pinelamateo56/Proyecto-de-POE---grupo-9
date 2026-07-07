-- Migración: Borrado lógico de clientes
-- Agrega columna estado para desactivar clientes sin eliminarlos

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estado BOOLEAN NOT NULL DEFAULT TRUE;
