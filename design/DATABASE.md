# Maint App - Database Schema

## Overview

Single SQLite database file contains all properties, systems, events, and history for a user's household maintenance data.

**Database file location:** `~/.local/share/trueblocks/maint/maint.db`

All data (properties, systems, service providers, events, history) stored in one file with foreign key constraints enforcing referential integrity.

## Schema

### 1. Properties Table

```sql
CREATE TABLE IF NOT EXISTS Properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    type TEXT,  -- 'house', 'apartment', 'condo', etc.
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store basic property information.

**Fields:**
- `id`: Unique property ID (UUID format, user-friendly like 'prop_main_house')
- `name`: Property name (e.g., "Main House", "Cabin")
- `address`: Full address
- `type`: Property type for future categorization
- `description`: Notes about the property
- `created_at`, `updated_at`: Timestamps

---

### 2. Systems Table

```sql
CREATE TABLE IF NOT EXISTS Systems (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    name TEXT NOT NULL,           -- e.g., "Furnace", "AC Unit"
    category TEXT,                -- e.g., "heating", "cooling", "plumbing", "electrical"
    make TEXT,                    -- e.g., "Carrier"
    model TEXT,                   -- e.g., "25HNH636A001"
    year_installed INTEGER,
    location TEXT,                -- e.g., "Basement", "Attic"
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id)
);
```

**Purpose:** Store household systems inventory (heater, AC, water heater, etc.)

**Fields:**
- `id`: Unique system ID (e.g., 'sys_furnace_01')
- `property_id`: Links to property (for filtering)
- `name`: Display name
- `category`: For grouping/filtering
- `make`: Manufacturer
- `model`: Model number
- `year_installed`: Year installed
- `location`: Where in the property
- `notes`: Service records, serial numbers, etc.

---

### 3. ServiceProviders Table

```sql
CREATE TABLE IF NOT EXISTS ServiceProviders (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    service_type TEXT,            -- e.g., "HVAC", "Plumbing", "Electrical"
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id)
);
```

**Purpose:** Store service provider contact information.

**Fields:**
- `id`: Unique provider ID
- `property_id`: Links to property
- `company_name`: Business name
- `contact_name`: Person to contact
- `phone`: Phone number
- `email`: Email address
- `address`: Business address
- `website`: Website URL
- `service_type`: Type of service provided
- `notes`: Special instructions, discount codes, etc.

---

### 4. SystemServiceProviders (Junction Table)

```sql
CREATE TABLE IF NOT EXISTS SystemServiceProviders (
    id TEXT PRIMARY KEY,
    system_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES Systems(id),
    FOREIGN KEY (provider_id) REFERENCES ServiceProviders(id),
    UNIQUE(system_id, provider_id)
);
```

**Purpose:** Link systems to their service providers (many-to-many).

**Example:** 
- HVAC System "Furnace" → Provider "ABC HVAC"
- HVAC System "Furnace" → Provider "Emergency HVAC"

---

### 5. MaintenanceEvents Table

```sql
CREATE TABLE IF NOT EXISTS MaintenanceEvents (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    system_id TEXT NOT NULL,
    description TEXT NOT NULL,     -- e.g., "Winterize pipes"
    type TEXT,                     -- e.g., "preventive", "seasonal", "urgent" (for future use)
    
    -- Schedule fields
    repeat_type TEXT NOT NULL,     -- 'once', 'monthly', 'quarterly', 'semi-annual', 'annual', 'custom'
    repeat_interval INTEGER,       -- For 'custom' type: number of days/months/years
    repeat_unit TEXT,              -- For 'custom' type: 'days', 'months', 'years'
    
    -- Dates
    created_date DATE NOT NULL,
    first_due_date DATE NOT NULL,  -- When this event should first be done
    next_due_date DATE,            -- Calculated next due date (null if 'once' and completed)
    
    -- Status
    is_overdue BOOLEAN DEFAULT 0,  -- Calculated field (can be computed on read)
    
    -- Notification
    notify_days_before INTEGER DEFAULT 7,  -- Send notification N days before due date
    last_notified_date DATE,
    
    -- Completion tracking
    last_completed_date DATE,
    completed_count INTEGER DEFAULT 0,
    
    -- Custom fields
    estimated_cost DECIMAL(10,2),
    assigned_provider_id TEXT,     -- Optional link to preferred provider
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES Properties(id),
    FOREIGN KEY (system_id) REFERENCES Systems(id),
    FOREIGN KEY (assigned_provider_id) REFERENCES ServiceProviders(id)
);
```

**Purpose:** Define maintenance events with scheduling.

**Key Fields:**
- `repeat_type`: Determines recurrence pattern
- `next_due_date`: Calculated based on repeat_type and last_completed_date
- `is_overdue`: Computed as (next_due_date < TODAY)
- `notify_days_before`: When to trigger notification

**Examples:**
- Monthly HVAC filter check: repeat_type='monthly'
- Annual AC maintenance: repeat_type='annual', first_due_date='2026-05-01'
- Winterize pipes: repeat_type='annual', first_due_date='2026-10-01'

---

### 6. MaintenanceHistory Table

```sql
CREATE TABLE IF NOT EXISTS MaintenanceHistory (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    property_id TEXT NOT NULL,
    completed_date DATE NOT NULL,
    completed_by TEXT,             -- Optional: who did it
    notes TEXT,                    -- e.g., "Filter changed, system running smoothly"
    cost_actual DECIMAL(10,2),     -- Actual cost if different from estimate
    provider_id TEXT,              -- Which provider did the work
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES MaintenanceEvents(id),
    FOREIGN KEY (property_id) REFERENCES Properties(id),
    FOREIGN KEY (provider_id) REFERENCES ServiceProviders(id)
);
```

**Purpose:** Historical record of completed maintenance tasks.

**Use Cases:**
- Show user "Last AC maintenance was on 2026-03-15"
- Track trends (is HVAC needing more frequent service?)
- Billing/warranty tracking

---

### 7. Notifications Table

```sql
CREATE TABLE IF NOT EXISTS Notifications (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    type TEXT,                     -- 'upcoming', 'overdue', 'due-today', 'completed'
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,              -- When user acknowledged the notification
    dismissed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(id),
    FOREIGN KEY (event_id) REFERENCES MaintenanceEvents(id)
);
```

**Purpose:** Track notifications sent to users (for deduplication and history).

---

### 8. Settings Table (Future)

```sql
CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store property-specific settings.

**Examples:**
- `notification_enabled`: true/false
- `theme`: 'light'/'dark'
- `language`: 'en'

---

## Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_systems_property ON Systems(property_id);
CREATE INDEX IF NOT EXISTS idx_providers_property ON ServiceProviders(property_id);
CREATE INDEX IF NOT EXISTS idx_events_property ON MaintenanceEvents(property_id);
CREATE INDEX IF NOT EXISTS idx_events_system ON MaintenanceEvents(system_id);
CREATE INDEX IF NOT EXISTS idx_events_next_due ON MaintenanceEvents(next_due_date);
CREATE INDEX IF NOT EXISTS idx_events_overdue ON MaintenanceEvents(is_overdue);
CREATE INDEX IF NOT EXISTS idx_history_event ON MaintenanceHistory(event_id);
CREATE INDEX IF NOT EXISTS idx_history_completed ON MaintenanceHistory(completed_date);
CREATE INDEX IF NOT EXISTS idx_notifications_property ON Notifications(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON Notifications(sent_at);
```

---

## Data Integrity Rules

1. **Cascade deletes:**
   - Deleting a property cascades to all systems, events, and history
   - Deleting a system cascades to related maintenance events

2. **Unique constraints:**
   - Each property has a unique ID
   - Each system has a unique ID within its property
   - ServiceProviders should be unique per property (no duplicates)

3. **Audit fields:**
   - All tables have `created_at` and `updated_at` timestamps
   - Updated_at automatically updates on modification

---

## Calculated Fields

These fields are computed at query time (not stored):

1. **MaintenanceEvents.is_overdue:**
   - `is_overdue = (next_due_date < CURRENT_DATE AND next_due_date IS NOT NULL)`

2. **MaintenanceEvents.days_until_due:**
   - `days_until_due = julianday(next_due_date) - julianday(CURRENT_DATE)`

3. **MaintenanceEvents.status:**
   - 'overdue' if is_overdue
   - 'due-today' if next_due_date = TODAY
   - 'upcoming' if next_due_date in next 7 days
   - 'completed' if last_completed_date is recent
   - 'scheduled' otherwise

---

## Initialization Script

See `schema.sql` in the backend for the complete DDL to create all tables and indexes.
