-- Migración: Baja lógica de usuarios
-- Agrega columna activo para desactivar usuarios sin eliminarlos

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
