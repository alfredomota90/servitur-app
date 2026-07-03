-- Replace "Factura del Vehículo" with "Permiso SCT"
-- Using UPDATE to preserve the existing item UUID so current documents remain linked
UPDATE requirement_items
SET code = 'permiso_sct',
    name = 'Permiso SCT',
    description = 'Permiso de la Secretaría de Comunicaciones y Transportes',
    has_expiry = true
WHERE code = 'factura_vehiculo';
