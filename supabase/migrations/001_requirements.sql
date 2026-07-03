-- Migration: Add requirements/papelería module
-- 1. Add requires_papeleria + entity_type to clients
-- 2. Create requirement_items, requirement_subitems, client_vehicles, client_drivers, client_documents
-- 3. Create client_item_overrides for manual N/A flags

-- 1. Add columns to clients
ALTER TABLE clients ADD COLUMN requires_papeleria boolean NOT NULL DEFAULT false;
ALTER TABLE clients ADD COLUMN entity_type text NOT NULL DEFAULT 'moral';

-- 2. requirement_items: master checklist catalog
CREATE TYPE applies_to_enum AS ENUM ('client', 'vehicle', 'driver');
CREATE TYPE entity_type_enum AS ENUM ('moral', 'fisica', 'ambas');

CREATE TABLE requirement_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  applies_to applies_to_enum NOT NULL,
  entity_type entity_type_enum NOT NULL DEFAULT 'ambas',
  has_expiry boolean NOT NULL DEFAULT true,
  has_file boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. requirement_subitems: sub-items (e.g. 4 photos for item 25)
CREATE TABLE requirement_subitems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES requirement_items(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(item_id, code)
);

-- 4. client_vehicles: vehicles per client
CREATE TABLE client_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  year integer,
  plate text,
  policy_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. client_drivers: drivers per client
CREATE TABLE client_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  license_number text,
  license_expiry date,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. client_documents: uploaded documents (each renewal = new row)
CREATE TABLE client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES requirement_items(id) ON DELETE CASCADE,
  subitem_id uuid REFERENCES requirement_subitems(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES client_vehicles(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES client_drivers(id) ON DELETE SET NULL,
  file_url text,
  notes text,
  expiry_date date,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- 7. client_item_overrides: per-client overrides (e.g. mark item as N/A)
CREATE TABLE client_item_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES requirement_items(id) ON DELETE CASCADE,
  is_na boolean NOT NULL DEFAULT false,
  UNIQUE(client_id, item_id)
);

-- Indexes
CREATE INDEX idx_requirement_items_sort ON requirement_items(sort_order);
CREATE INDEX idx_requirement_subitems_item ON requirement_subitems(item_id, sort_order);
CREATE INDEX idx_client_vehicles_client ON client_vehicles(client_id);
CREATE INDEX idx_client_drivers_client ON client_drivers(client_id);
CREATE INDEX idx_client_documents_client ON client_documents(client_id);
CREATE INDEX idx_client_documents_item ON client_documents(item_id);
CREATE INDEX idx_client_documents_vehicle ON client_documents(vehicle_id);
CREATE INDEX idx_client_documents_driver ON client_documents(driver_id);
CREATE INDEX idx_client_item_overrides_client ON client_item_overrides(client_id);
CREATE INDEX idx_client_item_overrides_item ON client_item_overrides(item_id);

-- Seed: 25 requirement items
INSERT INTO requirement_items (code, name, description, applies_to, entity_type, has_expiry, has_file, sort_order) VALUES
-- Items 1-17: Client-level generic documents
('acta_constitutiva', 'Acta Constitutiva', 'Documento legal de constitución', 'client', 'moral', false, true, 1),
('poder_legal', 'Poder Legal', 'Poder notarial del representante legal', 'client', 'moral', true, true, 2),
('identificacion_representante', 'Identificación del Representante Legal', 'INE o pasaporte', 'client', 'moral', true, true, 3),
('comprobante_domicilio', 'Comprobante de Domicilio', 'CFE, agua, teléfono (no mayor a 3 meses)', 'client', 'ambas', true, true, 4),
('cedula_fiscal', 'Cédula Fiscal', 'Cédula de identificación fiscal (RFC)', 'client', 'ambas', false, true, 5),
('opinion_cumplimiento', 'Opinión de Cumplimiento', 'Opinión positiva del SAT', 'client', 'ambas', true, true, 6),
('constancia_situacion_fiscal', 'Constancia de Situación Fiscal', 'Constancia actualizada del SAT', 'client', 'ambas', true, true, 7),
('registro_contribuyentes', 'Registro de Contribuyentes', 'Registro ante la Secretaría de Economía', 'client', 'moral', true, true, 8),
('geolocalizacion', 'Geolocalización', 'Ubicación del domicilio fiscal/operaciones', 'client', 'ambas', false, false, 9),
('referencias', 'Referencias', 'Referencias comerciales y bancarias', 'client', 'ambas', false, false, 10),
('identificacion_chofer', 'Identificación del Chofer', 'INE o pasaporte del chofer', 'client', 'ambas', true, true, 11),
('licencia_chofer', 'Licencia del Chofer', 'Licencia de conducir vigente', 'client', 'ambas', true, true, 12),
('seguro_responsabilidad_civil', 'Seguro de Responsabilidad Civil', 'Póliza de seguro vigente', 'client', 'ambas', true, true, 13),
('carta_porte', 'Carta Porte', 'Documento de transporte', 'client', 'ambas', true, true, 14),
('contrato_servicios', 'Contrato de Servicios', 'Contrato firmado de prestación de servicios', 'client', 'ambas', true, true, 15),
('alta_imss', 'Alta IMSS', 'Registro patronal IMSS', 'client', 'ambas', true, true, 16),
('registro_patronal', 'Registro Patronal', 'Registro patronal ante el IMSS', 'client', 'ambas', true, true, 17),
-- Items 18-20: Per-vehicle documents
('tarjeta_circulacion', 'Tarjeta de Circulación', 'Tarjeta de circulación vigente', 'vehicle', 'ambas', false, true, 18),
('seguro_vehiculo', 'Seguro del Vehículo', 'Póliza de seguro vehicular', 'vehicle', 'ambas', true, true, 19),
('verificacion', 'Verificación', 'Comprobante de verificación vehicular', 'vehicle', 'ambas', true, true, 20),
-- Items 21-22: Per-driver documents
('licencia_conductor', 'Licencia del Conductor', 'Licencia de conducir vigente del conductor asignado', 'driver', 'ambas', true, true, 21),
('identificacion_conductor', 'Identificación del Conductor', 'INE o pasaporte del conductor asignado', 'driver', 'ambas', true, true, 22),
-- Items 23-25: Per-vehicle documents (continued)
('foto_4_frentes', 'Fotografía 4 Frentes', 'Fotografía del vehículo: frontal, trasera, lateral izq, lateral der', 'vehicle', 'ambas', false, true, 23),
('factura_vehiculo', 'Factura del Vehículo', 'Factura de compra del vehículo', 'vehicle', 'ambas', false, true, 24),
('tenencia', 'Tenencia', 'Comprobante de pago de tenencia', 'vehicle', 'ambas', true, true, 25);

-- Seed: sub-items for item 23 (foto_4_frentes)
INSERT INTO requirement_subitems (item_id, code, name, sort_order)
SELECT id, 'foto_frontal', 'Fotografía Frontal (1)', 1 FROM requirement_items WHERE code = 'foto_4_frentes'
UNION ALL
SELECT id, 'foto_trasera', 'Fotografía Trasera (2)', 2 FROM requirement_items WHERE code = 'foto_4_frentes'
UNION ALL
SELECT id, 'foto_lateral_izq', 'Fotografía Lateral Izq (3)', 3 FROM requirement_items WHERE code = 'foto_4_frentes'
UNION ALL
SELECT id, 'foto_lateral_der', 'Fotografía Lateral Der (4)', 4 FROM requirement_items WHERE code = 'foto_4_frentes';
