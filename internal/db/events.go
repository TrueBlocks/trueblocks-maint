package db

import (
	"fmt"
	"time"
)

type MaintenanceEvent struct {
	ID                 string   `json:"id"`
	PropertyID         string   `json:"property_id"`
	SystemID           string   `json:"system_id"`
	Description        string   `json:"description"`
	Type               string   `json:"type"`
	RepeatType         string   `json:"repeat_type"`
	RepeatIntervalDays int      `json:"repeat_interval_days"`
	FirstDueDate       string   `json:"first_due_date"`
	NextDueDate        string   `json:"next_due_date"`
	LastCompletedDate  *string  `json:"last_completed_date"`
	CompletedCount     int      `json:"completed_count"`
	NotifyDaysBefore   int      `json:"notify_days_before"`
	AssignedProviderID *string  `json:"assigned_provider_id"`
	EstimatedCost      float64  `json:"estimated_cost"`
	Notes              string   `json:"notes"`
	CreatedAt          string   `json:"created_at"`
	UpdatedAt          string   `json:"updated_at"`
}

func (db *DB) GetMaintenanceEvents(propertyID string) ([]MaintenanceEvent, error) {
	rows, err := db.conn.Query("SELECT id, property_id, system_id, description, type, repeat_type, repeat_interval_days, first_due_date, next_due_date, last_completed_date, completed_count, notify_days_before, assigned_provider_id, estimated_cost, notes, created_at, updated_at FROM MaintenanceEvents WHERE property_id = ? ORDER BY next_due_date", propertyID)
	if err != nil {
		return nil, fmt.Errorf("query events: %w", err)
	}
	defer rows.Close()
	var items []MaintenanceEvent
	for rows.Next() {
		var item MaintenanceEvent
		if err := rows.Scan(&item.ID, &item.PropertyID, &item.SystemID, &item.Description, &item.Type, &item.RepeatType, &item.RepeatIntervalDays, &item.FirstDueDate, &item.NextDueDate, &item.LastCompletedDate, &item.CompletedCount, &item.NotifyDaysBefore, &item.AssignedProviderID, &item.EstimatedCost, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (db *DB) GetMaintenanceEvent(id string) (MaintenanceEvent, error) {
	var item MaintenanceEvent
	err := db.conn.QueryRow("SELECT id, property_id, system_id, description, type, repeat_type, repeat_interval_days, first_due_date, next_due_date, last_completed_date, completed_count, notify_days_before, assigned_provider_id, estimated_cost, notes, created_at, updated_at FROM MaintenanceEvents WHERE id = ?", id).Scan(&item.ID, &item.PropertyID, &item.SystemID, &item.Description, &item.Type, &item.RepeatType, &item.RepeatIntervalDays, &item.FirstDueDate, &item.NextDueDate, &item.LastCompletedDate, &item.CompletedCount, &item.NotifyDaysBefore, &item.AssignedProviderID, &item.EstimatedCost, &item.Notes, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return item, fmt.Errorf("get event %s: %w", id, err)
	}
	return item, nil
}

func (db *DB) SaveMaintenanceEvent(item MaintenanceEvent) (MaintenanceEvent, error) {
	if item.ID == "" {
		return item, fmt.Errorf("event id cannot be empty")
	}

	// Validate foreign keys before attempting save
	// Check property exists
	var propCount int
	if err := db.conn.QueryRow("SELECT COUNT(*) FROM Properties WHERE id = ?", item.PropertyID).Scan(&propCount); err != nil || propCount == 0 {
		return item, fmt.Errorf("property %q does not exist", item.PropertyID)
	}

	// Check system exists and belongs to this property
	var sysCount int
	if err := db.conn.QueryRow("SELECT COUNT(*) FROM Systems WHERE id = ? AND property_id = ?", item.SystemID, item.PropertyID).Scan(&sysCount); err != nil || sysCount == 0 {
		return item, fmt.Errorf("system %q does not exist or does not belong to property %q", item.SystemID, item.PropertyID)
	}

	// Check provider exists (if specified)
	var providerID interface{} = nil
	if item.AssignedProviderID != nil && *item.AssignedProviderID != "" {
		var provCount int
		if err := db.conn.QueryRow("SELECT COUNT(*) FROM ServiceProviders WHERE id = ?", *item.AssignedProviderID).Scan(&provCount); err != nil || provCount == 0 {
			return item, fmt.Errorf("service provider %q does not exist", *item.AssignedProviderID)
		}
		providerID = *item.AssignedProviderID
	}

	_, err := db.conn.Exec("INSERT OR REPLACE INTO MaintenanceEvents (id, property_id, system_id, description, type, repeat_type, repeat_interval_days, first_due_date, next_due_date, last_completed_date, completed_count, notify_days_before, assigned_provider_id, estimated_cost, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", item.ID, item.PropertyID, item.SystemID, item.Description, item.Type, item.RepeatType, item.RepeatIntervalDays, item.FirstDueDate, item.NextDueDate, item.LastCompletedDate, item.CompletedCount, item.NotifyDaysBefore, providerID, item.EstimatedCost, item.Notes)
	if err != nil {
		return item, fmt.Errorf("save event: %w", err)
	}
	return db.GetMaintenanceEvent(item.ID)
}

func (db *DB) DeleteMaintenanceEvent(id string) error {
	_, err := db.conn.Exec("DELETE FROM MaintenanceEvents WHERE id = ?", id)
	return err
}

func calcNextDueDate(completedDate string, repeatType string, intervalDays int) (string, error) {
	t, err := time.Parse("2006-01-02", completedDate)
	if err != nil {
		return "", err
	}
	var nextDate time.Time
	switch repeatType {
	case "once":
		return "", nil
		nextDate = t.AddDate(0, 1, 0)
	case "quarterly":
		nextDate = t.AddDate(0, 3, 0)
	case "semi-annual":
		nextDate = t.AddDate(0, 6, 0)
	case "annual":
		nextDate = t.AddDate(1, 0, 0)
	case "custom":
		nextDate = t.AddDate(0, 0, intervalDays)
	default:
		return "", fmt.Errorf("unknown repeat type: %s", repeatType)
	}
	return nextDate.Format("2006-01-02"), nil
}

type CompletionResult struct {
	Event  MaintenanceEvent      `json:"event"`
	Record MaintenanceHistoryRec `json:"record"`
}

func (db *DB) CompleteMaintenanceEvent(propertyID, eventID, completedDate, completedBy, notes string, costActual float64, providerID string) (CompletionResult, error) {
	var result CompletionResult
	event, err := db.GetMaintenanceEvent(eventID)
	if err != nil {
		return result, err
	}
	nextDueDate, err := calcNextDueDate(completedDate, event.RepeatType, event.RepeatIntervalDays)
	if err != nil {
		return result, fmt.Errorf("calculate next due date: %w", err)
	}
	event.LastCompletedDate = &completedDate
	event.CompletedCount++
	event.NextDueDate = nextDueDate
	_, err = db.conn.Exec("UPDATE MaintenanceEvents SET last_completed_date = ?, completed_count = ?, next_due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", completedDate, event.CompletedCount, nextDueDate, eventID)
	if err != nil {
		return result, fmt.Errorf("update event: %w", err)
	}
	histID := fmt.Sprintf("hist_%s_%d", eventID, event.CompletedCount)
	_, err = db.conn.Exec("INSERT INTO MaintenanceHistory (id, property_id, event_id, completed_date, completed_by, notes, cost_actual, provider_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", histID, propertyID, eventID, completedDate, completedBy, notes, costActual, providerID)
	if err != nil {
		return result, fmt.Errorf("record completion: %w", err)
	}
	result.Event, _ = db.GetMaintenanceEvent(eventID)
	result.Record = MaintenanceHistoryRec{ID: histID, PropertyID: propertyID, EventID: eventID, CompletedDate: completedDate, CompletedBy: completedBy, Notes: notes, CostActual: costActual, ProviderID: providerID}
	return result, nil
}
