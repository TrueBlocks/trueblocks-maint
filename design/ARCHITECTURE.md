# Maint App - System Architecture

## Overview

Maint is a multi-property household maintenance scheduler. **Phase 1** is a desktop Wails application. The Go backend implements both:
1. **Wails IPC bindings** for the desktop app (sub-millisecond, same-process)
2. **REST API** for eventual phone app and daemon mode (localhost:5000)

Both paths converge at the same business logic and database layer — frontend/mobile clients don't know which transport is being used.

## Architecture Diagram

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│   Desktop App (Wails/React)          │     │      Phone App (Future)              │
│  - Property selector                 │     │   - REST API calls                   │
│  - Systems inventory UI              │     │   - Same data as desktop             │
│  - Service provider contacts         │     │   - iOS/Android                      │
│  - Maintenance calendar & history    │     │                                      │
│  - Notification dialogs              │     │                                      │
└────────────────┬─────────────────────┘     └────────────────┬─────────────────────┘
                 │ Wails IPC                                  │ HTTP/REST API
                 │ (sub-millisecond)                          │ (localhost:5000)
                 └────────────────┬──────────────────────────┘
                                  │
                                  ↓
        ┌──────────────────────────────────────────────────────────┐
        │         Backend Go Services (Single Source of Truth)    │
        │                                                          │
        │  ┌─────────────────────────────────────────────────┐   │
        │  │  Business Logic Layer (internal/service)        │   │
        │  │  - Property operations                          │   │
        │  │  - System operations                            │   │
        │  │  - Service provider operations                  │   │
        │  │  - Maintenance event operations & scheduling    │   │
        │  │  - Notification generation                      │   │
        │  │  - Repeat date calculations                     │   │
        │  │  - Validation & error handling                  │   │
        │  └─────────────────────────────────────────────────┘   │
        │                     ↓                                    │
        │  ┌─────────────────────────────────────────────────┐   │
        │  │  Data Access Layer (internal/db)                │   │
        │  │  - All CRUD operations                          │   │
        │  │  - Query helpers                                │   │
        │  │  - Schema management                            │   │
        │  └─────────────────────────────────────────────────┘   │
        └──────────────────────────┬───────────────────────────────┘
                                   │
                                   ↓
        ┌──────────────────────────────────────────────────────────┐
        │      SQLite Database                                     │
        │   ~/.local/share/trueblocks/maint/maint.db               │
        │  - All properties in one file                            │
        │  - All entities in one schema                            │
        │  - Indexes for performance                               │
        │  - Foreign key constraints                               │
        └──────────────────────────────────────────────────────────┘
```

## Code Architecture (3+2 Layer Pattern)

Follows standard TrueBlocks Wails pattern with additional REST API layer. Both paths call identical business logic.

### Desktop App Communication
```
React Frontend (Wails) → Wails IPC → app/ (thin bindings) → service/ (business logic) → db/
```

### Phone App Communication (Future)
```
Phone App (HTTP) → REST API Handler → service/ (same business logic) → db/
```

## Layers

### Layer 1: Wails Binding Layer (`app/` package)

**Responsibilities:**
- Thin methods that delegate to service layer
- Exposed via Wails bindings to TypeScript (desktop only)
- No business logic
- Handles only desktop-specific concerns (window geometry, UI state)

**Files:**
- `app/app.go` — App struct, Startup/Shutdown
- `app/state.go` — State persistence (Wails only, not shared with API)
- `app/properties.go` — Delegates to service.PropertiesService
- `app/systems.go` — Delegates to service.SystemsService
- `app/providers.go` — Delegates to service.ProvidersService
- `app/events.go` — Delegates to service.EventsService

**Pattern:**
```go
// app/properties.go
func (a *App) GetProperties() ([]db.Property, error) {
    return a.service.GetProperties(a.ctx)
}

func (a *App) SaveProperty(p db.Property) (db.Property, error) {
    return a.service.SaveProperty(a.ctx, p)
}
```

### Layer 2: Business Logic (`internal/service/` package)

**Responsibilities:**
- All business logic shared by desktop and REST API
- Validation (required fields, ID uniqueness)
- Calculations (repeat_type scheduling, next_due_date)
- Notification generation
- Error handling with domain-specific errors
- No transport knowledge (Wails vs HTTP)

**Files:**
- `internal/service/service.go` — Service struct, dependency injection
- `internal/service/properties.go` — Property operations
- `internal/service/systems.go` — System operations
- `internal/service/providers.go` — Service provider operations
- `internal/service/events.go` — Maintenance event operations, scheduling
- `internal/service/notifications.go` — Notification generation

**Pattern:**
```go
// internal/service/events.go
type EventsService struct {
    db *db.DB
}

func (s *EventsService) CompleteMaintenanceEvent(
    ctx context.Context, propertyID, eventID string, data CompletionData,
) (CompleteResult, error) {
    // Validate
    if propertyID == "" {
        return CompleteResult{}, ErrInvalidPropertyID
    }
    
    // Get event
    event, err := s.db.GetMaintenanceEvent(propertyID, eventID)
    if err != nil {
        return CompleteResult{}, err
    }
    
    // Record completion
    history, err := s.db.RecordCompletion(propertyID, eventID, data)
    if err != nil {
        return CompleteResult{}, err
    }
    
    // Calculate next due date
    nextDue := s.calculateNextDueDate(event, data.CompletedDate)
    
    // Update event
    event.LastCompletedDate = data.CompletedDate
    event.CompletedCount++
    event.NextDueDate = nextDue
    err = s.db.UpdateMaintenanceEvent(event)
    if err != nil {
        return CompleteResult{}, err
    }
    
    return CompleteResult{Event: event, History: history}, nil
}
```

### Layer 3: Data Access Layer (`internal/db/` package)

**Responsibilities:**
- SQLite connection management
- Raw CRUD operations (no validation, no logic)
- Query helpers
- Schema initialization
- Transaction support

**Files:**
- `internal/db/db.go` — DB struct, connection, initialization
- `internal/db/schema.sql` — Embedded schema
- `internal/db/properties.go` — Property CRUD
- `internal/db/systems.go` — System CRUD
- `internal/db/providers.go` — Service provider CRUD
- `internal/db/events.go` — Event CRUD
- `internal/db/history.go` — History queries

**Pattern:**
```go
// internal/db/events.go
func (db *DB) UpdateMaintenanceEvent(event MaintenanceEvent) error {
    _, err := db.conn.ExecContext(
        context.Background(),
        `UPDATE MaintenanceEvents SET 
            description=?, type=?, repeat_type=?,
            next_due_date=?, last_completed_date=?, completed_count=?
            WHERE property_id=? AND id=?`,
        event.Description, event.Type, event.RepeatType,
        event.NextDueDate, event.LastCompletedDate, event.CompletedCount,
        event.PropertyID, event.ID,
    )
    return err
}
```

### Layer 4: State Persistence (`internal/state/` package)

**Responsibilities (Desktop Only):**
- Window geometry (position, size)
- Sidebar width
- Last visited route
- Tab state
- Table state (sort, filters, pagination)
- NOT shared with REST API (API is stateless)

**Files:**
- `internal/state/state.go` — AppState struct, Manager with file persistence

### Layer 5: REST API (`internal/api/` package - Phase 2)

**Responsibilities:**
- HTTP server (listens on configurable port, default 5000)
- JSON request/response marshaling
- Authentication (future)
- Error to HTTP status code mapping
- Delegates all logic to service layer

**Files:**
- `internal/api/server.go` — HTTP server setup
- `internal/api/handlers.go` — HTTP request handlers
- All handlers call `h.service.*` methods (identical to Wails binding layer)

**Pattern:**
```go
// internal/api/handlers.go
func (h *Handler) CompleteEvent(w http.ResponseWriter, r *http.Request) {
    propertyID := chi.URLParam(r, "propertyID")
    eventID := chi.URLParam(r, "eventID")
    
    var data service.CompletionData
    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    // Call exact same service method as Wails binding
    result, err := h.service.CompleteMaintenanceEvent(
        r.Context(), propertyID, eventID, data,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}
```

## Communication Flows

### Desktop (Phase 1)
```
React Component
  → Wails IPC: GetProperties()
  → app.GetProperties()
  → service.GetProperties()
  → db.GetProperties()
  → SQL query
  → []Property
  → Promise<Property[]>
  → React renders list
```

### Desktop: Complete Event
```
React Component
  → Wails IPC: CompleteMaintenanceEvent(propertyID, eventID, data)
  → app.CompleteMaintenanceEvent()
  → service.CompleteMaintenanceEvent()
    • Validate inputs
    • Get event from db
    • Record completion in db (INSERT MaintenanceHistory)
    • Calculate next_due_date based on repeat_type
    • Update event in db
    • Return CompleteResult{event, history}
  → Promise<CompleteResult>
  → React updates UI with new due date
```

### Phone (Phase 2)
```
Phone App
  → HTTP POST /api/properties/prop_main/events/event_01/complete
  → Handler.CompleteEvent()
  → service.CompleteMaintenanceEvent() ← SAME METHOD
    • Validate inputs
    • Get event from db
    • Record completion in db
    • Calculate next_due_date
    • Update event in db
    • Return CompleteResult
  → JSON response {event, history}
  → Phone app updates UI
```

## Key Principles

1. **No Duplication:**
   - Business logic exists in one place (`internal/service/`)
   - Both Wails and REST handlers call it

2. **Frontend Ignorance:**
   - React doesn't know about REST API
   - Phone app doesn't know about Wails
   - Both use identical service methods

3. **Transport Agnostic Logic:**
   - Service layer never knows if called via IPC or HTTP
   - Error handling is generic (no HTTP status codes in service)
   - Validation happens in service (before db layer)

4. **Separation of Concerns:**
   - `app/` = Wails integration + desktop UI state
   - `service/` = Business logic + validation + calculations
   - `db/` = Data access only
   - `api/` = HTTP transport only (Phase 2)
   - `state/` = Desktop persistence only

### 1. Wails Binding Layer (`app/` package)

**Responsibilities:**
- Thin methods that delegate to backend layer
- Exposed via Wails bindings to TypeScript
- No business logic

**Files:**
- `app/app.go` — App struct, Startup/Shutdown
- `app/state.go` — State persistence bindings
- `app/properties.go` — Property CRUD bindings
- `app/systems.go` — System CRUD bindings
- `app/providers.go` — Service provider bindings
- `app/events.go` — Maintenance event bindings

### 2. Database Layer (`internal/db/` package)

**Responsibilities:**
- SQLite connection management
- Entity CRUD operations
- Schema initialization
- All database logic

**Files:**
- `internal/db/db.go` — DB struct, initialization
- `internal/db/schema.sql` — Embedded schema
- `internal/db/properties.go` — Property CRUD
- `internal/db/systems.go` — System CRUD
- `internal/db/providers.go` — Service provider CRUD
- `internal/db/events.go` — Maintenance event CRUD
- `internal/db/history.go` — History queries

### 3. State Persistence (`internal/state/` package)

**Responsibilities:**
- Window geometry (position, size)
- Sidebar width
- Last visited route
- Tab state (which tab was active in each view)
- Table state (sort, filters, pagination)

**Files:**
- `internal/state/state.go` — AppState struct, Manager with persistence logic

### Communication Pattern

**Frontend calls → Wails IPC → Backend method → Database layer → SQLite**

Example: User clicks "Save Property"
1. React component calls `SaveProperty(prop)` (Wails binding)
2. `app.SaveProperty()` delegates to `a.db.SaveProperty()`
3. `db.SaveProperty()` executes SQL
4. Result returned to frontend as Promise

**Why Wails IPC, not REST API?**
- Sub-millisecond latency (same process)
- No network overhead
- Built-in error handling via promises
- Automatic TypeScript bindings (via `wails generate module`)
- Sufficient for single-user desktop app

REST API can be added as a separate daemon later for multi-user/mobile support.

## Data Flow Examples

### Load Properties on Startup
1. React component mounts → calls `GetProperties()` via Wails IPC
2. `app.GetProperties()` calls `a.db.GetProperties()`
3. `db.GetProperties()` queries SQLite
4. Result returned as Promise to React
5. Component renders list

### Save a New System
1. User fills form → clicks "Add System"
2. React calls `SaveSystem(propertyID, system)` via Wails IPC
3. `app.SaveSystem()` calls `a.db.SaveSystem()`
4. `db.SaveSystem()` executes INSERT into SQLite
5. Returned system with ID to React
6. Component updates UI

### Mark Maintenance Complete
1. User clicks "Complete" on an event
2. React calls `CompleteMaintenanceEvent(eventID, completionData)` via Wails IPC
3. `app.CompleteMaintenanceEvent()` calls `a.db.CompleteMaintenanceEvent()`
4. `db.CompleteMaintenanceEvent()` does:
   - INSERT into MaintenanceHistory
   - UPDATE MaintenanceEvents (last_completed_date, next_due_date based on repeat_type)
   - Return updated event
5. React updates UI

## Notifications (Phase 1)

Startup notifications for overdue/upcoming tasks:
- When app starts, scan all events
- Show dialog for events due in next 7 days or overdue
- User can dismiss or take action

**Future Phase:** Background daemon service to send notifications even when app is closed.

## Single-User, Single-Computer Assumptions

**Phase 1:**
- One user per installation
- Desktop database only (`~/.local/share/trueblocks/maint/maint.db`)
- No network access needed
- No authentication required
- No multi-device sync

**Phase 2+ (if needed):**
- Add REST API server
- Enable daemon mode on Linux
- Support remote access
- Mobile client support

## Configuration & Persistence

**Data Location:**
- App data: `~/.local/share/trueblocks/maint/`
- Database: `~/.local/share/trueblocks/maint/maint.db`
- State: `~/.local/share/trueblocks/maint/state.json`

**State Persistence (via appkit.Store):**
- Window geometry (position, size)
- Sidebar width
- Last visited route
- Table sort/filter/pagination state
- Tab state per page

## Error Handling

**Backend (Go):**
- Return (value, error) pairs
- Wails automatically converts Go errors to rejected promises
- Log errors (user won't see panic details)
- Graceful degradation

**Frontend (React):**
- Catch promise rejections from Wails calls
- Display user-friendly error toasts
- Retry logic where appropriate
- Never show raw error messages

## Performance Considerations

**Database:**
- Index on frequently queried columns (property_id, system_id, next_due_date)
- Use PRAGMA optimizations (foreign_keys ON, journal_mode WAL)
- Batch queries where possible

**Frontend:**
- Use React memoization for expensive components
- Virtual scrolling for large tables
- Debounce search/filter
- Lazy load routes
- Cache immutable data in state

**Wails IPC:**
- Batch operations to reduce IPC calls
- Return only needed fields from backend
- Avoid large data transfers
