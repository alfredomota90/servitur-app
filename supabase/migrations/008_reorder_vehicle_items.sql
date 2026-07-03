-- Reorder vehicle items so "Póliza de seguro" appears first
UPDATE requirement_items SET sort_order = 17 WHERE code = 'seguro_vehiculo';
