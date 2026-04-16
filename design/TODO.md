# Maint App - Implementation Plan

## Phase 1: Core Backend (Database & Wails Bindings)

### 1.1 Backend Project Structure
- [ ] Create `main.go` following appkit.Run() pattern
- [ ] Create `app/app.go` with App struct and Startup/Shutdown
- [ ] Create `internal/db/db.go` with DB struct initialization
- [ ] Create `internal/state/state.go` with AppState and Manager
- [ ] Verify all Go files compile: `go build ./...`

### 1.2 Database Schema & Initialization
- [ ] Create `internal/db/schema.sql` with all tables:
  - Properties
  - Systems
  - ServiceProviders
  - SystemServiceProviders (junction)
  - MaintenanceEvents
  - MaintenanceHistory
  - Notifications
  - Settings
- [ ] Implement `db.IsInitialized()` (check for Properties table)
- [ ] Implement `db.InitSchemaFromFile()` (load from `~/.local/share/trueblocks/maint/schema.sql`)
- [ ] Implement `db.InitSchemaFromEmbedded()` (fallback to embedded schema)
- [ ] Embed schema.sql in binary using `//go:embed`

### 1.3 Property CRUD Layer
- [ ] Create `internal/db/properties.go`:
  - `GetProperties()` → []Property
  - `GetProperty(id)` → Property
  - `SaveProperty(p)` → Property (INSERT or UPDATE)
  - `DeleteProperty(id)` → error
- [ ] Create `app/properties.go` (thin bindings)
- [ ] Test: `go test ./internal/db` for property operations

### 1.4 System CRUD Layer
- [ ] Create `internal/db/systems.go`:
  - `GetSystems(propertyID)` → []System
  - `GetSystem(propertyID, systemID)` → System
  - `SaveSystem(propertyID, s)` → System
  - `DeleteSystem(propertyID, systemID)` → error
- [ ] Create `app/systems.go` (thin bindings)
- [ ] Test system CRUD

### 1.5 Service Provider CRUD Layer
- [ ] Create `internal/db/providers.go`:
  - `GetServiceProviders(propertyID)` → []ServiceProvider
  - `SaveServiceProvider(propertyID, p)` → ServiceProvider
  - `DeleteServiceProvider(propertyID, providerID)` → error
- [ ] Create `internal/db/system_providers.go` (junction table):
  - `LinkSystemToProvider(propertyID, systemID, providerID, notes)` → error
  - `UnlinkSystemFromProvider(...)` → error
  - `GetSystemProviders(propertyID, systemID)` → []ServiceProvider
- [ ] Create `app/providers.go` (thin bindings)

### 1.6 Maintenance Event CRUD Layer
- [ ] Create `internal/db/events.go`:
  - `GetMaintenanceEvents(propertyID, filter)` → []MaintenanceEvent
  - `GetMaintenanceEvent(propertyID, eventID)` → MaintenanceEvent
  - `SaveMaintenanceEvent(propertyID, e)` → MaintenanceEvent
  - `DeleteMaintenanceEvent(propertyID, eventID)` → error
- [ ] Implement repeat_type calculation in GetMaintenanceEvent:
  - Compute `next_due_date` from `first_due_date`, `last_completed_date`, and `repeat_type`
  - Compute `is_overdue` as `next_due_date < TODAY`
  - Compute `days_until_due`
  - Compute `status` (overdue/upcoming/due-today/scheduled)
- [ ] Create `internal/db/history.go`:
  - `RecordCompletion(propertyID, eventID, completionData)` → MaintenanceHistory
  - `GetEventHistory(propertyID, eventID)` → []MaintenanceHistory
  - `UpdateEventNextDueDate(event)` → based on repeat_type
- [ ] Create `app/events.go` with:
  - `GetMaintenanceEvents()`, `GetMaintenanceEvent()`, `SaveMaintenanceEvent()`, `DeleteMaintenanceEvent()`
  - `CompleteMaintenanceEvent(propertyID, eventID, data)` → CompletionResult

### 1.7 State Persistence Layer
- [ ] Implement `internal/state/state.go` with full AppState manager
- [ ] Implement all persistence methods (see wails-backend-architecture skill)
- [ ] Create `app/state.go` with thin bindings
- [ ] Test: state saves and restores across app restarts

### 1.8 Wails Bindings Generation
- [ ] Run `wails generate module` from maint root
- [ ] Verify `frontend/wailsjs/go/app/App.ts` is generated correctly
- [ ] Verify all method signatures match TypeScript expectations

### 1.9 Backend Testing
- [ ] Unit tests for all CRUD operations
- [ ] Test repeat_type calculations
- [ ] Test state persistence
- [ ] Test edge cases (missing properties, invalid inputs)
- [ ] `yarn test` should pass

---

## Phase 2: Frontend UI (Wails + React)

### 2.1 Frontend Project Structure
- [ ] Verify vite.config.ts has all aliases (@app, @components, @utils, etc.)
- [ ] Verify tsconfig.json has all path aliases
- [ ] Create `src/utils/index.ts` with Log/LogErr helpers
- [ ] Create `src/components/DataTable.tsx` wrapper for table persistence
- [ ] Create routing constants and NAV_TO_ROUTE mapping

### 2.2 App Layout & Navigation
- [ ] Create `src/App.tsx` with:
  - BrowserRouter + Routes setup
  - Window geometry restoration
  - Last route restoration
  - Hotkey navigation with tab cycling
  - Sidebar with nav items (Properties, Systems, Providers, Events)
- [ ] Create `src/pages/HomePage.tsx` (dashboard/overview)
- [ ] Implement AppLayout from @trueblocks/ui
- [ ] Test: Window closes and reopens at same position/size
- [ ] Test: Last route is restored on startup

### 2.3 Properties Page (List/Detail Pattern)
- [ ] Create `src/pages/PropertiesPage.tsx` (wrapper)
- [ ] Create `src/pages/PropertiesListPage.tsx`:
  - DataTable with properties
  - Columns: name, address, type, actions
  - "Add" button
  - Double-click or button to view detail
- [ ] Create `src/pages/PropertiesDetailPage.tsx`:
  - EditableField for each property attribute
  - "Save" and "Delete" buttons
  - Show systems count and events count
  - Link to systems and events for this property
- [ ] Wire up tab state (remember last tab)
- [ ] Wire up table state (sort, filters)
- [ ] Test: Create, read, update, delete properties

### 2.4 Systems Page (List/Detail Pattern)
- [ ] Create `src/pages/SystemsPage.tsx` (wrapper, property selector)
- [ ] Create `src/pages/SystemsListPage.tsx`:
  - Filter by property dropdown
  - DataTable with systems
  - Columns: name, category, make, model, year, location, actions
  - "Add" button
- [ ] Create `src/pages/SystemsDetailPage.tsx`:
  - EditableField for name, category, make, model, year, location, notes
  - Show linked service providers
  - "Link provider" button
  - "Save" and "Delete" buttons
- [ ] Test: CRUD systems

### 2.5 Service Providers Page (List/Detail Pattern)
- [ ] Create `src/pages/ProvidersPage.tsx` (wrapper, property selector)
- [ ] Create `src/pages/ProvidersListPage.tsx`:
  - Filter by property
  - DataTable: company_name, contact_name, phone, service_type, actions
  - "Add" button
- [ ] Create `src/pages/ProvidersDetailPage.tsx`:
  - EditableField for all provider fields
  - Show linked systems (if any)
  - "Save" and "Delete" buttons
- [ ] Test: CRUD providers

### 2.6 Maintenance Events Page (List/Detail Pattern)
- [ ] Create `src/pages/EventsPage.tsx` (wrapper, property selector)
- [ ] Create `src/pages/EventsListPage.tsx`:
  - Filter by property, system, status (overdue/upcoming/due-today/scheduled)
  - DataTable: description, system, due_date, status, last_completed, actions
  - "Add" button
  - Color coding for status (red=overdue, yellow=due-today, green=upcoming)
- [ ] Create `src/pages/EventsDetailPage.tsx`:
  - EditableField for all event fields
  - Calendar visualization of repeat_type
  - Show maintenance history (list of completed dates)
  - "Mark Complete" button
  - "Save" and "Delete" buttons
- [ ] Test: Create, read, update, complete events

### 2.7 Notifications on Startup
- [ ] On app startup (in App.tsx):
  - Query all properties
  - For each property, get overdue/upcoming (next 7 days) events
  - If any found, show modal with:
    - List of tasks
    - "Mark Complete", "Dismiss", "Close" buttons
- [ ] Dismiss should prevent notification from showing again (store in state)
- [ ] Complete should record completion and refresh list

### 2.8 Frontend Testing
- [ ] Test all pages load
- [ ] Test CRUD flows for each entity
- [ ] Test tab persistence
- [ ] Test table state persistence
- [ ] Test navigation hotkeys
- [ ] Test error handling (catch promise rejections)
- [ ] `yarn test` should pass
- [ ] `yarn lint --fix && yarn type-check` should pass

---

## Phase 3: Polish & Testing

### 3.1 Error Handling
- [ ] All Wails calls wrapped in try/catch
- [ ] Error toasts displayed to user (use @mantine/notifications)
- [ ] No error details exposed to user (sanitized messages)
- [ ] Console logs for debugging only

### 3.2 Validation
- [ ] Property: name required, ID unique
- [ ] System: name and property_id required
- [ ] ServiceProvider: company_name and property_id required
- [ ] MaintenanceEvent: description, system_id, repeat_type required
- [ ] Dates in ISO format
- [ ] Cost values > 0
- [ ] Show validation errors in form fields

### 3.3 Performance
- [ ] Load first page within 1 second
- [ ] Table sorting/filtering < 500ms
- [ ] No N+1 queries (batch load related data)
- [ ] Memoize expensive components
- [ ] Lazy load pages with React.lazy

### 3.4 Offline (Future)
- [ ] Note: Phase 1 requires network to backend
- [ ] Future: Add localStorage caching

### 3.5 Build & Distribution
- [ ] `yarn build` creates production bundle
- [ ] `make build` creates Wails app for desktop (macOS/Windows)
- [ ] Verify `~/.local/share/trueblocks/maint/maint.db` is created on first run
- [ ] Verify state.json is created for window/UI state

### 3.6 Documentation
- [ ] README.md with setup instructions
- [ ] Comments in complex functions
- [ ] API binding reference (auto-generated, review for correctness)

---

## Phase 4: Future Enhancements

### 4.1 REST API & Daemon Mode
- [ ] Separate HTTP server (not Wails)
- [ ] Expose same CRUD operations as endpoints
- [ ] Support multiple concurrent clients
- [ ] Authentication/authorization

### 4.2 Mobile Client
- [ ] React Native or Flutter app
- [ ] Calls REST API from Phase 4.1

### 4.3 Background Notifications
- [ ] Daemon process (separate from desktop app)
- [ ] Runs scheduled checks
- [ ] System notifications (macOS/Linux/Windows)
- [ ] Email/SMS notifications

### 4.4 Multi-User Sync
- [ ] Cloud database (e.g., Firebase, AWS)
- [ ] Real-time sync across devices
- [ ] Conflict resolution

### 4.5 Advanced Features
- [ ] Recurring task groups (e.g., spring/fall maintenance)
- [ ] Photo attachments for systems
- [ ] Service history with costs
- [ ] Reminders (email, SMS, push)
- [ ] Reports (annual costs, by category)

---

## Checklist Format for Execution

Use the following for daily work tracking:

```
## Current Session Tasks

### [Phase X.Y] [Status]
- [x] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3
```

Status options: **READY**, **IN-PROGRESS**, **BLOCKED**, **COMPLETE**
