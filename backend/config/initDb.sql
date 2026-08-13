--  CLEANUP
TRUNCATE TABLE transfers, purchases, assets, equipment_types, users, bases RESTART IDENTITY CASCADE;

--  SEED BASES
INSERT INTO bases (id, name, location) VALUES
(1, 'Fort Alpha', 'Sector 4 - Northern District'),
(2, 'Outpost Bravo', 'Sector 9 - Eastern Perimeter')
ON CONFLICT (id) DO NOTHING;

--  SEED EQUIPMENT TYPES
INSERT INTO equipment_types (id, name, category) VALUES
(1, 'M4 Carbine', 'WEAPON'),
(2, 'Armored Humvee', 'VEHICLE'),
(3, '5.56mm Ammunition', 'AMMUNITION')
ON CONFLICT (id) DO NOTHING;

--  SEED USERS (Password: AdminPass123!)
INSERT INTO users (username, password_hash, role, base_id) VALUES
('admin_user', '$2b$10$2Ckvo7T3Gx1ocR5mB5lyjuP6Kk4E3yJ6IybA2CsLaPi3whIx3PU8y', 'ADMIN', NULL),
('commander_alpha', '$2b$10$2Ckvo7T3Gx1ocR5mB5lyjuP6Kk4E3yJ6IybA2CsLaPi3whIx3PU8y', 'BASE_COMMANDER', 1)
ON CONFLICT (username) DO NOTHING;

--  SEED INVENTORY
INSERT INTO assets (base_id, equipment_type_id, quantity) VALUES
(1, 1, 250),
(1, 2, 45),
(2, 1, 120)
ON CONFLICT (base_id, equipment_type_id) DO UPDATE SET quantity = EXCLUDED.quantity;