-- Add back seguro_vehiculo as "Póliza de seguro" (per-vehicle)
INSERT INTO requirement_items (code, name, description, applies_to, entity_type, has_expiry, has_file, sort_order)
VALUES (
  'seguro_vehiculo',
  'Póliza de seguro',
  'Póliza de seguro vehicular vigente',
  'vehicle',
  'ambas',
  true,
  true,
  26
);
