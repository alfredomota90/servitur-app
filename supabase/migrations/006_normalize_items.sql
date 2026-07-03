-- Normalize requirement items to match client's canonical list
-- 1. Add seats to client_vehicles
-- 2. Delete items not in the new list
-- 3. Reuse existing items (rename / change applies_to)
-- 4. Insert new items
-- 5. Reassign sort_orders

-- 1. Add seats to vehicles
ALTER TABLE client_vehicles ADD COLUMN seats integer;

-- 2. Delete items not in the new list
DELETE FROM requirement_items WHERE code IN (
  'cedula_fiscal',
  'registro_contribuyentes',
  'carta_porte',
  'contrato_servicios',
  'alta_imss',
  'registro_patronal',
  'seguro_vehiculo',
  'identificacion_conductor',
  'licencia_conductor'
);

-- 3. Reuse existing items
UPDATE requirement_items SET
  name = 'Identificación oficial del chofer',
  description = 'INE o pasaporte vigente del chofer',
  applies_to = 'driver',
  sort_order = 21
WHERE code = 'identificacion_chofer';

UPDATE requirement_items SET
  name = 'Licencia de conducir vigente de cada chofer',
  description = 'Licencia de conducir vigente del chofer asignado al servicio',
  applies_to = 'driver',
  sort_order = 23
WHERE code = 'licencia_chofer';

UPDATE requirement_items SET
  name = 'Póliza de seguro de responsabilidad civil vigente(4)',
  description = 'Póliza de seguro de responsabilidad civil vigente'
WHERE code = 'seguro_responsabilidad_civil';

UPDATE requirement_items SET
  name = 'Opinión de cumplimiento del SAT',
  description = 'Opinión positiva del SAT'
WHERE code = 'opinion_cumplimiento';

UPDATE requirement_items SET
  name = 'Comprobante de domicilio fiscal actualizado (no mayor a 1 mes)',
  description = 'CFE, agua, teléfono (no mayor a 1 mes)'
WHERE code = 'comprobante_domicilio';

-- 4. Update sort_orders for remaining existing items
UPDATE requirement_items SET sort_order = 5  WHERE code = 'opinion_cumplimiento';
UPDATE requirement_items SET sort_order = 6  WHERE code = 'constancia_situacion_fiscal';
UPDATE requirement_items SET sort_order = 16 WHERE code = 'seguro_responsabilidad_civil';
UPDATE requirement_items SET sort_order = 18 WHERE code = 'verificacion';
UPDATE requirement_items SET sort_order = 19 WHERE code = 'tarjeta_circulacion';
UPDATE requirement_items SET sort_order = 20 WHERE code = 'permiso_sct';
UPDATE requirement_items SET sort_order = 24 WHERE code = 'reporte_repuve';
UPDATE requirement_items SET sort_order = 25 WHERE code = 'foto_4_frentes';

-- 5. Insert new items
INSERT INTO requirement_items (code, name, description, applies_to, entity_type, has_expiry, has_file, sort_order) VALUES
('caratula_estado_cuenta', 'Carátula del estado de cuenta bancaria', 'Obligatoriamente con nombre del titular', 'client', 'ambas', false, true, 7),
('foto_exterior_domicilio', 'Fotografía a color del exterior del domicilio fiscal y/o comercial', 'Fotografía a color del exterior del domicilio', 'client', 'ambas', false, true, 8),
('codigo_etica', 'Carta firmada de aceptación al código de ética', 'Carta firmada de aceptación al código de ética', 'client', 'ambas', false, true, 11),
('opinion_cumplimiento_imss', 'Opinión de cumplimiento del IMSS', 'Opinión de cumplimiento del IMSS', 'client', 'ambas', true, true, 12),
('opinion_cumplimiento_infonavit', 'Opinión de cumplimiento del INFONAVIT', 'Opinión de cumplimiento del INFONAVIT', 'client', 'ambas', true, true, 13),
('pago_imss_infonavit', 'Pago de IMSS e Infonavit', 'Comprobante de pago del IMSS e Infonavit', 'client', 'ambas', true, true, 14),
('cedula_cuotas_imss_infonavit', 'Cédula de determinación de Cuotas de IMSS e Infonavit', 'Cédula de determinación de cuotas del IMSS e Infonavit', 'client', 'ambas', true, true, 15),
('registro_repse', 'Registro en el REPSE vigente', 'Registro en el Registro Público de Seguridad y Equipamiento', 'client', 'ambas', true, true, 17),
('carta_antecedentes_penales', 'Carta de no antecedentes penales', 'Carta de no antecedentes penales del chofer', 'driver', 'ambas', true, true, 22);
