-- Replace "Tenencia" with "Reporte REPUVE"
UPDATE requirement_items
SET code = 'reporte_repuve',
    name = 'Reporte REPUVE',
    description = 'Reporte del Registro Público Vehicular (REPUVE)',
    has_expiry = true
WHERE code = 'tenencia';
