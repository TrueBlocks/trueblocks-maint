CREATE TABLE IF NOT EXISTS Properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Systems (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    model TEXT,
    serial TEXT,
    age_years INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    UNIQUE(property_id, name)
);

CREATE TABLE IF NOT EXISTS ServiceProviders (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    UNIQUE(property_id, name)
);

CREATE TABLE IF NOT EXISTS SystemServiceProviders (
    id TEXT PRIMARY KEY,
    system_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES Systems(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES ServiceProviders(id) ON DELETE CASCADE,
    UNIQUE(system_id, provider_id)
);

CREATE TABLE IF NOT EXISTS MaintenanceEvents (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    system_id TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    repeat_type TEXT NOT NULL,
    repeat_interval_days INTEGER,
    first_due_date TEXT NOT NULL,
    next_due_date TEXT NOT NULL,
    last_completed_date TEXT,
    completed_count INTEGER DEFAULT 0,
    notify_days_before INTEGER DEFAULT 7,
    assigned_provider_id TEXT,
    estimated_cost REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    FOREIGN KEY (system_id) REFERENCES Systems(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_provider_id) REFERENCES ServiceProviders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS MaintenanceHistory (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    completed_date TEXT NOT NULL,
    completed_by TEXT,
    notes TEXT,
    cost_actual REAL,
    provider_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES MaintenanceEvents(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES ServiceProviders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Notifications (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    type TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    read_at TEXT,
    dismissed_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES MaintenanceEvents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_systems_property_id ON Systems(property_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_property_id ON ServiceProviders(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_events_property_id ON MaintenanceEvents(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_events_system_id ON MaintenanceEvents(system_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_events_next_due ON MaintenanceEvents(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_event_id ON MaintenanceHistory(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_property_id ON Notifications(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON Notifications(event_id);
