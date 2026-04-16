# Maint App - Screen & Layout Design

## Overall Application Layout

```
┌─────────────────────────────────────────────────────────┐
│ Maint - House Maintenance Manager                   ⊡ ⊖ ✕│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ☰ │ Dashboard  [>] Sidebar  Content Area              │
│ ─ │ Properties       (260px,  (auto-expand)           │
│   │ Systems          resizable)                        │
│   │ Providers                                          │
│   │ Maintenance                                        │
│   │ ─ ─ ─ ─ ─ ─ ─                                      │
│   │ Settings                                           │
│   │                                                    │
│   │                                                    │
│   │                                                    │
│   │                                                    │
└─────────────────────────────────────────────────────────┘
```

### Global Navigation

**Sidebar items with hotkeys:**
- `Cmd+1` → **Dashboard** (home)
- `Cmd+2` → **Properties** (list/detail)
- `Cmd+3` → **Maintenance** (list/detail)
- `Cmd+4` → **Providers** (list/detail)
- `Cmd+5` → **Settings**

**Tab cycling:** Press hotkey twice to cycle between List and Detail tabs within a view.

---

## 1. Dashboard (Home)

**Route:** `/`  
**Purpose:** At-a-glance overview of all properties and upcoming maintenance.

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Dashboard                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Property Summary                                   │
│  ├─ Total Properties: 3                             │
│  ├─ Total Systems: 12                               │
│  └─ Properties Needing Attention: 1                 │
│                                                     │
│  Quick Stats (Cards)                                │
│  ┌──────────────┬──────────────┬──────────────┐    │
│  │ Overdue      │ Due This     │ Upcoming     │    │
│  │ Events       │ Month        │ This Month   │    │
│  │              │              │              │    │
│  │ 2 events     │ 5 events     │ 8 events     │    │
│  └──────────────┴──────────────┴──────────────┘    │
│                                                     │
│  Recent Activity                                    │
│  ├─ [Today] Completed: Furnace filter replaced     │
│  ├─ [3 days ago] Completed: AC unit serviced       │
│  └─ [1 week ago] Completed: Water heater flush     │
│                                                     │
│  Overdue Maintenance (all properties)               │
│  ┌──────────────┬──────────────┬──────────────┐    │
│  │ Property     │ System       │ Task         │    │
│  ├──────────────┼──────────────┼──────────────┤    │
│  │ Main House   │ Furnace      │ Filter (7d)  │    │
│  │ Guest House  │ Roof         │ Inspect (14d)│    │
│  └──────────────┴──────────────┴──────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Interactions

- Click property name → Navigate to Properties > [property detail]
- Click "overdue event" → Navigate to Maintenance > [event detail]
- Cards are clickable → Filter other views or drill-down

---

## 2. Properties View

**Routes:**
- `/properties` — List tab
- `/properties/:propertyId` — Detail tab

### 2.1 Properties List

```
┌─────────────────────────────────────────────────────┐
│ Properties                     [List] [Detail]      │
├─────────────────────────────────────────────────────┤
│ Search: ________________  Filter: [All ▼]          │
│                                                     │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ Property     │ Systems      │ Next Event   │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ Main House   │ 8 systems    │ 2026-04-20   │    │
│ │ Guest House  │ 3 systems    │ 2026-04-25   │    │
│ │ Lake Cabin   │ 2 systems    │ 2026-05-15   │    │
│ └──────────────┴──────────────┴──────────────┘    │
│                                                     │
│ [+] Add Property                                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Table Columns:** Property, Systems, Next Event, Last Updated  
**Sort by:** Property, Next Event, Last Updated  
**Filters:** All / Active / Archived  
**Actions:** Click row → Open Detail tab  

### 2.2 Property Detail

```
┌─────────────────────────────────────────────────────┐
│ Properties                     [List] [Detail]      │
├─────────────────────────────────────────────────────┤
│ [◀ Main House ▶]                           [✕]    │
│                                                     │
│ Property Information                                │
│ ├─ Name:        [Main House         ✎]            │
│ ├─ Address:     [123 Oak St         ✎]            │
│ ├─ City, State: [Philadelphia, PA   ✎]            │
│ ├─ Zip:         [19103              ✎]            │
│ └─ Notes:       [Built 1920        ✎]            │
│                                                     │
│ Systems in this Property (8)                        │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ System       │ Type         │ Next Event   │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ Furnace      │ HVAC         │ 2026-04-15   │    │
│ │ Air Cond.    │ HVAC         │ 2026-05-01   │    │
│ │ Water Heater │ Plumbing     │ 2026-06-01   │    │
│ │ Roof         │ Structural   │ 2026-09-01   │    │
│ │ ...          │ ...          │ ...          │    │
│ └──────────────┴──────────────┴──────────────┘    │
│ [+] Add System                                      │
│                                                     │
│ Maintenance Schedule (8 upcoming)                   │
│ ├─ [2026-04-15] Furnace filter - OVERDUE          │
│ ├─ [2026-04-20] Gutter cleaning                    │
│ ├─ [2026-05-01] AC service                         │
│ └─ ...                                              │
│                                                     │
│ [Edit] [Delete]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Editable Fields:** Name, Address, City, State, Zip, Notes  
**Embedded List:** Systems (clickable → opens Systems view for this property)  
**Embedded List:** Next 10 upcoming events  
**Prev/Next Navigation:** [◀ Property Name ▶]  
**Actions:** Edit (in-place), Delete, View Systems, View Events

---

## 3. Systems View (Within Property Context)

**Routes:**
- `/properties/:propertyId/systems` — List tab
- `/properties/:propertyId/systems/:systemId` — Detail tab

### 3.1 Systems List (in Property Detail)

```
Within Property Detail (above), clicking a system opens:

┌─────────────────────────────────────────────────────┐
│ [Main House] → Systems             [List] [Detail]  │
├─────────────────────────────────────────────────────┤
│ Search: ________________  Filter: [All ▼]          │
│                                                     │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ System       │ Type         │ Next Event   │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ Furnace      │ HVAC         │ 2026-04-15   │    │
│ │ Air Cond.    │ HVAC         │ 2026-05-01   │    │
│ │ Water Heater │ Plumbing     │ 2026-06-01   │    │
│ └──────────────┴──────────────┴──────────────┘    │
│                                                     │
│ [+] Add System                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 System Detail

```
┌─────────────────────────────────────────────────────┐
│ [Main House] → Systems             [List] [Detail]  │
├─────────────────────────────────────────────────────┤
│ [◀ Furnace ▶]                              [✕]    │
│                                                     │
│ System Information                                  │
│ ├─ Name:       [Furnace             ✎]            │
│ ├─ Type:       [HVAC ▼              ✎]            │
│ ├─ Model:      [Carrier 90k BTU     ✎]            │
│ ├─ Serial:     [ABC123XYZ           ✎]            │
│ ├─ Age:        [8 years             ✎]            │
│ └─ Notes:      [Replaced 2018      ✎]            │
│                                                     │
│ Service Providers for this System (2)               │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ Provider     │ Specialty    │ Last Visit   │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ Cool Comfort │ HVAC Service │ 2026-03-15   │    │
│ │ Bob's HVAC   │ HVAC Repair  │ 2025-11-20   │    │
│ └──────────────┴──────────────┴──────────────┘    │
│ [+] Link Provider                                   │
│                                                     │
│ Maintenance Events (12 total)                       │
│ ├─ [Monthly] Replace filter - OVERDUE              │
│ ├─ [Annual] Full inspection                        │
│ └─ ...                                              │
│                                                     │
│ [Edit] [Delete]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Editable Fields:** Name, Type, Model, Serial, Age, Notes  
**Embedded List:** Service providers for this system  
**Embedded List:** Maintenance events for this system  
**Prev/Next Navigation:** [◀ System Name ▶]  
**Actions:** Edit, Delete, Link/Unlink Providers, View Events

---

## 4. Maintenance Events View

**Routes:**
- `/maintenance` — List tab
- `/maintenance/:eventId` — Detail tab

### 4.1 Maintenance List (All Events)

```
┌─────────────────────────────────────────────────────┐
│ Maintenance                    [List] [Detail]      │
├─────────────────────────────────────────────────────┤
│ Search: ________________  Filter: [All ▼]          │
│                                   [View: List ▼]    │
│                                                     │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ Event        │ Property     │ Next Due     │    │
│ │ (with status)│ / System     │ (overdue !)  │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ ⚠ Filter     │ Main/Furnace │ 2026-04-15   │    │
│ │   AC Service │ Main/AC      │ 2026-05-01   │    │
│ │   Roof Insp  │ Main/Roof    │ 2026-09-01   │    │
│ │ ⚠ Gutter     │ Guest/Gutter │ 2026-04-30   │    │
│ └──────────────┴──────────────┴──────────────┘    │
│                                                     │
│ Filter options:                                     │
│ [All] [Overdue] [Due Today] [Upcoming] [Completed] │
│                                                     │
│ View options:                                       │
│ [List] [Calendar]                                   │
│                                                     │
│ [+] Add Maintenance Event                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Table Columns:** Event (with status icon), Property/System, Next Due, Type, Repeat, Completed Count  
**Sort by:** Next Due, Property, Type, Completed Count  
**Filters:**
- Status: All / Overdue / Due Today / Upcoming / Scheduled / Completed
- Property: [All ▼]
- Type: [All ▼]

**View Options:**
- List view (table)
- Calendar view (month/week view showing event due dates)

**Status Icons:**
- ⚠️ Overdue (red)
- 🔔 Due Today (orange)
- 📅 Upcoming (blue)
- ✓ Completed (gray)

### 4.2 Maintenance Detail

```
┌─────────────────────────────────────────────────────┐
│ Maintenance                    [List] [Detail]      │
├─────────────────────────────────────────────────────┤
│ [◀ Furnace Filter ▶]                       [✕]    │
│                                                     │
│ Event Information                                   │
│ ├─ Description: [Replace furnace filter   ✎]      │
│ ├─ Property:    [Main House        ▼ ✎]           │
│ ├─ System:      [Furnace            ▼ ✎]           │
│ ├─ Type:        [Preventive         ▼ ✎]           │
│ └─ Notes:       [Check MERV rating  ✎]            │
│                                                     │
│ Schedule                                            │
│ ├─ Repeat:      [Monthly            ▼]            │
│ ├─ First Due:   [2026-02-01         ✎]            │
│ └─ Next Due:    [2026-04-15] ⚠ OVERDUE            │
│                                                     │
│ Notifications                                       │
│ ├─ Notify:      [7 days before      ▼]            │
│ └─ Last Notif:  [2026-04-08]                       │
│                                                     │
│ Service Provider (optional)                         │
│ ├─ Assigned:    [None                ▼]            │
│ └─ Cost Est:    [$25.00              ✎]            │
│                                                     │
│ Completion History (13 completions)                 │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ Date         │ Completed By │ Cost Actual  │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ 2026-03-15   │ John         │ $25.00       │    │
│ │ 2026-02-15   │ Jane         │ $25.00       │    │
│ │ 2026-01-15   │ John         │ $25.00       │    │
│ │ ...          │ ...          │ ...          │    │
│ └──────────────┴──────────────┴──────────────┘    │
│                                                     │
│ Status: Overdue by 1 day                            │
│ [Mark as Complete] [Edit] [Delete]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Editable Fields:** Description, Property, System, Type, Repeat, First Due, Notify Days, Assigned Provider, Estimated Cost, Notes  
**Read-only Fields:** Next Due (calculated), Is Overdue, Days Until Due, Status  
**Embedded List:** Completion history (last 5, expandable)  
**Action Buttons:** Mark as Complete, Edit, Delete  
**Prev/Next Navigation:** [◀ Event Name ▶]

### 4.3 Mark as Complete Modal

```
┌──────────────────────────────────────┐
│ Mark as Complete: Furnace Filter     │
├──────────────────────────────────────┤
│                                      │
│ Completed Date:  [2026-04-16]  ✎     │
│ Completed By:    [John       ]  ✎     │
│ Cost Actual:     [$25.00    ]  ✎     │
│ Notes:           [Filter was very ✎   │
│                   dirty, check    │
│                   ductwork]        │
│                                      │
│ Provider ID:     [None        ▼]    │
│                                      │
│ Calculated Next Due: 2026-05-16      │
│ (based on monthly repeat)            │
│                                      │
│         [Cancel] [Complete]          │
│                                      │
└──────────────────────────────────────┘
```

---

## 5. Service Providers View

**Routes:**
- `/providers` — List tab
- `/providers/:providerId` — Detail tab

### 5.1 Providers List

```
┌─────────────────────────────────────────────────────┐
│ Service Providers              [List] [Detail]      │
├─────────────────────────────────────────────────────┤
│ Search: ________________  Filter: [All ▼]          │
│                                                     │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ Provider     │ Specialty    │ Systems Used │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ Cool Comfort │ HVAC Service │ 2 systems    │    │
│ │ Bob's HVAC   │ HVAC Repair  │ 1 system     │    │
│ │ Plumb Masters│ Plumbing     │ 3 systems    │    │
│ │ Roof Co.     │ Roofing      │ 2 systems    │    │
│ └──────────────┴──────────────┴──────────────┘    │
│                                                     │
│ [+] Add Service Provider                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Table Columns:** Provider, Specialty, Systems Used, Last Used, Phone, Email  
**Sort by:** Provider, Specialty, Last Used  
**Filters:** All, By Specialty, By Property

### 5.2 Provider Detail

```
┌─────────────────────────────────────────────────────┐
│ Service Providers              [List] [Detail]      │
├─────────────────────────────────────────────────────┤
│ [◀ Cool Comfort ▶]                         [✕]    │
│                                                     │
│ Provider Information                                │
│ ├─ Name:        [Cool Comfort           ✎]        │
│ ├─ Specialty:   [HVAC Service       ▼ ✎]         │
│ ├─ Phone:       [(215) 555-1234     ✎]            │
│ ├─ Email:       [info@coolcomfort   ✎]            │
│ ├─ Website:     [www.coolcomfort.com ✎]           │
│ └─ Notes:       [Very reliable      ✎]            │
│                                                     │
│ Systems Served (2)                                  │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │ System       │ Property     │ Last Visited │    │
│ ├──────────────┼──────────────┼──────────────┤    │
│ │ Furnace      │ Main House   │ 2026-03-15   │    │
│ │ Air Cond.    │ Main House   │ 2025-10-20   │    │
│ └──────────────┴──────────────┴──────────────┘    │
│ [+] Link to System                                  │
│ [✕] Unlink System                                  │
│                                                     │
│ Service History (3 visits)                          │
│ ├─ [2026-03-15] Furnace service - $150             │
│ ├─ [2025-10-20] AC service - $175                  │
│ └─ [2025-05-12] Furnace service - $150             │
│                                                     │
│ [Edit] [Delete]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Editable Fields:** Name, Specialty, Phone, Email, Website, Notes  
**Embedded List:** Systems served (with link/unlink actions)  
**Embedded List:** Service history (last 10 visits)  
**Prev/Next Navigation:** [◀ Provider Name ▶]  
**Actions:** Edit, Delete, Link/Unlink Systems

---

## 6. Settings

**Route:** `/settings`  
**Purpose:** Application preferences and configuration.

### Settings Panel

```
┌─────────────────────────────────────────────────────┐
│ Settings                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ General                                             │
│ ├─ Default Property: [Main House       ▼]          │
│ ├─ Notification Sounds: [Enabled  ✓]               │
│ └─ Theme: [Light ▼]                                │
│                                                     │
│ Notifications                                       │
│ ├─ Email Alerts: [Enabled  ✓]                      │
│ ├─ Days Before Due: [7 days         ✎]             │
│ └─ Email Address: [john@example.com ✎]             │
│                                                     │
│ Data & Storage                                      │
│ ├─ Database Location: ~/.local/share/.../maint.db  │
│ ├─ Database Size: 2.3 MB                           │
│ ├─ Last Backup: 2026-04-15 10:30 AM                │
│ └─ [Backup Now] [Restore...]                       │
│                                                     │
│ Advanced                                            │
│ ├─ Clear State: [Clear Window/Tab State]            │
│ ├─ Reset to Defaults: [Reset All Settings]          │
│ └─ About: Maint v1.0.0                              │
│                                                     │
│                              [Save] [Reset] [Close] │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Settings Categories:**
1. **General:** Default property, sound, theme
2. **Notifications:** Email alerts, days before due, email address
3. **Data & Storage:** DB location, size, backup/restore
4. **Advanced:** Clear state, reset defaults, version info

---

## 7. Navigation & State Persistence

### Routing Structure

```
/                           ← Dashboard (home)
/properties                 ← Properties list
/properties/:id             ← Properties detail
/properties/:id/systems     ← Systems list (in property)
/properties/:id/systems/:sysId  ← System detail
/maintenance                ← Maintenance list
/maintenance/:id            ← Maintenance detail
/providers                  ← Providers list
/providers/:id              ← Provider detail
/settings                   ← Settings
```

### State Persistence

**Persisted Across Sessions:**

1. **Window Geometry:** Position, size
2. **Sidebar Width:** Resizable, persists to next session
3. **Last Route:** Returns to the last visited page on startup
4. **Active Tab:** Per view (list vs detail)
5. **Tab Route:** Full route per tab (e.g., `/properties/123` for detail tab)
6. **Table State:** Sort, column visibility, page size

**Example:** If user closes while viewing "Furnace Filter" maintenance event:
- On startup, app restores `/maintenance/furnace-filter-id` directly
- Window appears in same position/size as before
- Sidebar width is same as before
- Maintenance view is active with Detail tab showing

---

## 8. Common UI Patterns

### Detail Header (with prev/next)

```
[◀ Item Name ▶]  [Status Badge if applicable]  [✕]

Used in all entity detail pages (Properties, Systems, Providers, Events)
```

### Editable Fields

```
Field Label: [Value  ✎]

Click to edit in-place. Click away to save.
Icons: ✎ = edit, ✕ = delete
```

### Data Tables

```
┌─────────────────┬─────────────┬──────────────┐
│ Column Header   │ Column Hdr  │ Column Hdr   │
│ (sortable, ▲▼) │ (sortable)  │ (sortable)   │
├─────────────────┼─────────────┼──────────────┤
│ Row 1 Data      │ Row 1 Data  │ Row 1 Data   │
│ Row 2 Data      │ Row 2 Data  │ Row 2 Data   │
└─────────────────┴─────────────┴──────────────┘

Features:
- Sort by any column
- Search/filter
- Pagination or scroll
- Row click to navigate detail
```

### Status Badges

```
⚠️ Overdue      (red)
🔔 Due Today    (orange)
📅 Upcoming     (blue)
✓ Completed     (gray)
```

### Modals

```
┌────────────────────────────────┐
│ Modal Title                    │
├────────────────────────────────┤
│                                │
│ Form fields or content...      │
│                                │
│      [Cancel] [Action Button]  │
│                                │
└────────────────────────────────┘

Modals used for:
- Mark as Complete
- Delete confirmation
- Add/Edit dialogs
```

---

## 9. Color & Status Scheme

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Overdue | ⚠️ | Red | Past due date |
| Due Today | 🔔 | Orange | Due on current date |
| Upcoming | 📅 | Blue | Within 30 days |
| Scheduled | 📌 | Gray | More than 30 days |
| Completed | ✓ | Green | Task completed |

---

## 10. Search & Filter

### Search

- **Global search** in list views (full-text search across relevant fields)
- **Property:** Search by name, address
- **System:** Search by name, type, model
- **Provider:** Search by name, specialty, phone
- **Event:** Search by description, property, system

### Filters

**Properties List:**
- Filter: All / Active / Archived

**Maintenance List:**
- Status: All / Overdue / Due Today / Upcoming / Scheduled / Completed
- Property: [All ▼]
- Type: [All ▼]
- Repeat: [All ▼]

**Providers List:**
- Specialty: [All ▼]
- Property: [All ▼]

---

## 11. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+1` | Go to Dashboard |
| `Cmd+2` | Go to Properties (or cycle List/Detail) |
| `Cmd+3` | Go to Maintenance (or cycle List/Detail) |
| `Cmd+4` | Go to Providers (or cycle List/Detail) |
| `Cmd+5` | Go to Settings |
| `Cmd+F` | Focus search box (in list views) |
| `Cmd+N` | New item (context-dependent) |
| `Escape` | Close detail, back to list |

---

## 12. Responsive Behavior (Future)

**Desktop (primary):**
- Full sidebar navigation
- Multi-column layouts
- All tabs visible

**Tablet (Phase 2):**
- Collapsible sidebar
- Adaptive table columns
- Single-column detail views

**Mobile (Phase 3):**
- Hamburger menu
- Full-screen views
- Bottom tab bar instead of sidebar
