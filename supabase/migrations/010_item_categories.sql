-- Add category grouping for client-level requirement items
ALTER TABLE requirement_items ADD COLUMN category text;

-- Documentación SAT
UPDATE requirement_items SET category = 'sat' WHERE code IN ('opinion_cumplimiento', 'constancia_situacion_fiscal');

-- IMSS e INFONAVIT
UPDATE requirement_items SET category = 'imss_infonavit' WHERE code IN ('opinion_cumplimiento_imss', 'opinion_cumplimiento_infonavit', 'pago_imss_infonavit', 'cedula_cuotas_imss_infonavit');

-- Documentación Persona Moral
UPDATE requirement_items SET category = 'persona_moral' WHERE code IN ('acta_constitutiva', 'poder_legal', 'identificacion_representante');

-- Documentación personal
UPDATE requirement_items SET category = 'personal' WHERE code IN ('comprobante_domicilio', 'caratula_estado_cuenta', 'foto_exterior_domicilio', 'referencias', 'geolocalizacion', 'seguro_responsabilidad_civil');

-- Formatos del cliente
UPDATE requirement_items SET category = 'formatos_cliente' WHERE code IN ('codigo_etica');

-- REPSE
UPDATE requirement_items SET category = 'repse' WHERE code IN ('registro_repse');
