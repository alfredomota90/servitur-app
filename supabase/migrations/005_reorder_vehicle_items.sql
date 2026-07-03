-- Reorder vehicle items: photos last
-- Current sort_order: 18 tarjeta, 19 seguro, 20 verificacion, 23 fotos, 24 permiso_sct, 25 reporte_repuve
-- Desired order:    tarjeta(18), seguro(19), verificacion(20), permiso_sct(21), reporte_repuve(22), fotos(23)

UPDATE requirement_items SET sort_order = 21 WHERE code = 'permiso_sct';
UPDATE requirement_items SET sort_order = 22 WHERE code = 'reporte_repuve';
UPDATE requirement_items SET sort_order = 23 WHERE code = 'foto_4_frentes';
