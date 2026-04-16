# Maint App - REST API Specification

**Phase:** 2+  
**Status:** Planned (for phone app and daemon mode)  
**Transport:** HTTP JSON (localhost:5000 by default, configurable)

---

## Overview

The REST API allows clients (phone app, daemon process, external tools) to interact with maint. It's completely hidden behind Go code for the desktop app (which uses Wails IPC instead).

The API calls the exact same business logic (`internal/service/`) as the Wails bindings, ensuring identical behavior across all clients.

---

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production/Remote:** `https://maint.example.com/api`

## Authentication (Future)

Phase 2+ (not implemented in Phase 1):
- Token-based (JWT or similar)
- Header: `Authorization: Bearer <token>`
- Per-property or per-user permissions

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Property not found"
  }
}
```

---

## Properties Endpoints

### GET /api/properties
Returns all properties.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_main",
      "name": "Main House",
      "address": "123 Main St",
      "type": "house",
      "description": "Primary residence",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**HTTP Status:** 200

---

### GET /api/properties/:id
Get a single property by ID.

**Path Parameters:**
- `id`: Property ID

**Response:** Single property object or 404.

**HTTP Status:** 200 or 404

---

### POST /api/properties
Create a new property.

**Request Body:**
```json
{
  "id": "prop_cabin",
  "name": "Mountain Cabin",
  "address": "456 Mountain Rd",
  "type": "cabin",
  "description": "Seasonal retreat"
}
```

**Response:** Created property object with timestamps.

**HTTP Status:** 201 (Created)

---

### PUT /api/properties/:id
Update a property.

**Path Parameters:**
- `id`: Property ID

**Request Body:** Same fields as POST (only include fields to update).

**Response:** Updated property object.

**HTTP Status:** 200

---

### DELETE /api/properties/:id
Delete a property and all related data.

**Path Parameters:**
- `id`: Property ID

**Response:** Success message.

**HTTP Status:** 204 (No Content) or 200

---

## Systems Endpoints

### GET /api/properties/:propertyId/systems
List all systems for a property.

**Path Parameters:**
- `propertyId`: Property ID

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "heating", "cooling")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sys_furnace_01",
      "property_id": "prop_main",
      "name": "Main Furnace",
      "category": "heating",
      "make": "Carrier",
      "model": "25HNH636A001",
      "year_installed": 2018,
      "location": "Basement",
      "notes": "Serial #ABC123456",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**HTTP Status:** 200

---

### GET /api/properties/:propertyId/systems/:systemId
Get a single system with its associated service providers.

**Response:**
```json
{
  "success": true,
  "data": {
    "system": { ... },
    "service_providers": [
      {
        "id": "prov_abc_hvac",
        "company_name": "ABC HVAC",
        "phone": "555-0101",
        "notes": "Primary maintenance provider"
      }
    ]
  }
}
```

**HTTP Status:** 200 or 404

---

### POST /api/properties/:propertyId/systems
Create a new system for a property.

**Request Body:**
```json
{
  "id": "sys_ac_01",
  "name": "AC Unit",
  "category": "cooling",
  "make": "Trane",
  "model": "XR13",
  "year_installed": 2015,
  "location": "Attic",
  "notes": "Freon type: R410A"
}
```

**Response:** Created system object.

**HTTP Status:** 201

---

### PUT /api/properties/:propertyId/systems/:systemId
Update a system.

**Request Body:** Same fields as POST.

**Response:** Updated system object.

**HTTP Status:** 200

---

### DELETE /api/properties/:propertyId/systems/:systemId
Delete a system.

**HTTP Status:** 204

---

## Service Providers Endpoints

### GET /api/properties/:propertyId/service-providers
List all service providers for a property.

**Query Parameters:**
- `service_type` (optional): Filter by type (e.g., "HVAC", "Plumbing")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prov_abc",
      "property_id": "prop_main",
      "company_name": "ABC HVAC",
      "contact_name": "John Smith",
      "phone": "555-0101",
      "email": "john@abchvac.com",
      "address": "789 Service Blvd",
      "website": "https://abchvac.com",
      "service_type": "HVAC",
      "notes": "Bi-annual contract $500",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**HTTP Status:** 200

---

### POST /api/properties/:propertyId/service-providers
Create a new service provider.

**Request Body:**
```json
{
  "id": "prov_xyz",
  "company_name": "XYZ Plumbing",
  "contact_name": "Jane Doe",
  "phone": "555-0202",
  "email": "jane@xyzplumbing.com",
  "service_type": "Plumbing"
}
```

**Response:** Created provider object.

**HTTP Status:** 201

---

### PUT /api/properties/:propertyId/service-providers/:providerId
Update a service provider.

**HTTP Status:** 200

---

### DELETE /api/properties/:propertyId/service-providers/:providerId
Delete a service provider.

**HTTP Status:** 204

---

### POST /api/properties/:propertyId/systems/:systemId/service-providers/:providerId
Link a service provider to a system.

**Request Body:**
```json
{
  "notes": "Primary maintenance provider"
}
```

**HTTP Status:** 201

---

### DELETE /api/properties/:propertyId/systems/:systemId/service-providers/:providerId
Unlink a service provider from a system.

**HTTP Status:** 204

---

## Maintenance Events Endpoints

### GET /api/properties/:propertyId/maintenance-events
List all maintenance events for a property with optional filtering.

**Query Parameters:**
- `system_id` (optional): Filter by system
- `status` (optional): "overdue", "upcoming", "due-today", "scheduled"
- `due_after` (optional): ISO date (e.g., 2026-01-01)
- `due_before` (optional): ISO date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "maint_hvac_filter",
      "property_id": "prop_main",
      "system_id": "sys_furnace_01",
      "description": "Replace furnace filter",
      "type": "preventive",
      "repeat_type": "monthly",
      "first_due_date": "2026-02-01",
      "next_due_date": "2026-04-15",
      "is_overdue": false,
      "notify_days_before": 7,
      "last_completed_date": "2026-03-15",
      "completed_count": 13,
      "estimated_cost": 25.00,
      "assigned_provider_id": null,
      "notes": "Check MERV rating"
    }
  ]
}
```

**HTTP Status:** 200

---

### GET /api/properties/:propertyId/maintenance-events/:eventId
Get a single maintenance event with history.

**HTTP Status:** 200 or 404

---

### POST /api/properties/:propertyId/maintenance-events
Create a new maintenance event.

**HTTP Status:** 201

---

### PUT /api/properties/:propertyId/maintenance-events/:eventId
Update a maintenance event.

**HTTP Status:** 200

---

### DELETE /api/properties/:propertyId/maintenance-events/:eventId
Delete a maintenance event and its history.

**HTTP Status:** 204

---

### POST /api/properties/:propertyId/maintenance-events/:eventId/complete
Mark a maintenance event as completed, record history, and calculate next due date.

**Request Body:**
```json
{
  "completed_date": "2026-04-15",
  "completed_by": "John",
  "notes": "Filter replaced, system running smoothly",
  "cost_actual": 25.00,
  "provider_id": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": { ... updated event with new next_due_date ... },
    "history_record": { ... created history record ... }
  }
}
```

**HTTP Status:** 200

---

## Error Handling

All errors return appropriate HTTP status codes and JSON error response:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Property ID is required"
  }
}
```

**Common Status Codes:**
- `400` — Bad request (validation error)
- `404` — Not found
- `409` — Conflict (duplicate ID)
- `500` — Internal server error

---

## Implementation Note

**The REST API is 100% hidden behind Go code for the desktop Wails app.** The frontend never makes HTTP requests — it uses Wails IPC instead. The REST API exists purely for:
1. Future phone app support
2. Daemon mode (running on Linux server)
3. External tools

The same business logic (`internal/service/`) serves both Wails IPC and REST API, ensuring identical behavior across all clients.
