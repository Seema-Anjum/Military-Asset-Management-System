--  Bases Table
CREATE TABLE IF NOT EXISTS bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--  Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL 
        CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
    base_id INT REFERENCES bases(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types Table
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL 
        CHECK (category IN ('VEHICLE', 'WEAPON', 'AMMUNITION', 'GEAR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_equipment_name_category UNIQUE(name, category)
);

-- Purchases Table (Stock Inflow)
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id) ON DELETE RESTRICT,
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cross-Base Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT NOT NULL REFERENCES bases(id) ON DELETE RESTRICT,
    destination_base_id INT NOT NULL REFERENCES bases(id) ON DELETE RESTRICT,
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' 
        CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
    initiated_by INT REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_different_bases CHECK (source_base_id <> destination_base_id)
);

-- Personnel Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id) ON DELETE RESTRICT,
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    assigned_to VARCHAR(150) NOT NULL,
    assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'RETURNED')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMPTZ
);

-- Expenditures Table (Permanently Consumed Items)
CREATE TABLE IF NOT EXISTS expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id) ON DELETE RESTRICT,
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    reason TEXT,
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
    expended_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Assets Table 
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id) ON DELETE RESTRICT,
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_base_equipment UNIQUE(base_id, equipment_type_id)
);

-- Performance Indexes on Foreign Keys and Query Filters
CREATE INDEX IF NOT EXISTS idx_purchases_base_equip ON purchases(base_id, equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_transfers_src_dst ON transfers(source_base_id, destination_base_id);
CREATE INDEX IF NOT EXISTS idx_assignments_base ON assignments(base_id, status);
CREATE INDEX IF NOT EXISTS idx_expenditures_base ON expenditures(base_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_base_equip ON assets(base_id, equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_equipment_types_category ON equipment_types(category);
