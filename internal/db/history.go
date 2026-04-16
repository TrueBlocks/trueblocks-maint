package db

import "fmt"

type MaintenanceHistoryRec struct {
	ID            string  `json:"id"`
	PropertyID    string  `json:"propertyId"`
	EventID       string  `json:"eventId"`
	CompletedDate string  `json:"completedDate"`
	CompletedBy   string  `json:"completedBy"`
	Notes         string  `json:"notes"`
	CostActual    float64 `json:"costActual"`
	ProviderID    string  `json:"providerId"`
	CreatedAt     string  `json:"createdAt"`
}

func (db *DB) GetEventHistory(eventID string) ([]MaintenanceHistoryRec, error) {
	rows, err := db.conn.Query("SELECT id, property_id, event_id, completed_date, completed_by, notes, cost_actual, provider_id, created_at FROM MaintenanceHistory WHERE event_id = ? ORDER BY completed_date DESC", eventID)
	if err != nil {
		return nil, fmt.Errorf("query history: %w", err)
	}
	defer rows.Close()
	var items []MaintenanceHistoryRec
	for rows.Next() {
		var item MaintenanceHistoryRec
		if err := rows.Scan(&item.ID, &item.PropertyID, &item.EventID, &item.CompletedDate, &item.CompletedBy, &item.Notes, &item.CostActual, &item.ProviderID, &item.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan history: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
