package db

import "fmt"

type System struct {
	ID         string `json:"id"`
	PropertyID string `json:"propertyID"`
	Name       string `json:"name"`
	Type       string `json:"type"`
	Model      string `json:"model"`
	Serial     string `json:"serial"`
	AgeYears   int    `json:"age"`
	Notes      string `json:"notes"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

func (db *DB) GetSystems(propertyID string) ([]System, error) {
	rows, err := db.conn.Query("SELECT id, property_id, name, type, model, serial, age_years, notes, created_at, updated_at FROM Systems WHERE property_id = ? ORDER BY name", propertyID)
	if err != nil {
		return nil, fmt.Errorf("query systems: %w", err)
	}
	defer rows.Close()
	var items []System
	for rows.Next() {
		var item System
		if err := rows.Scan(&item.ID, &item.PropertyID, &item.Name, &item.Type, &item.Model, &item.Serial, &item.AgeYears, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan system: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (db *DB) GetSystem(id string) (System, error) {
	var item System
	err := db.conn.QueryRow("SELECT id, property_id, name, type, model, serial, age_years, notes, created_at, updated_at FROM Systems WHERE id = ?", id).Scan(&item.ID, &item.PropertyID, &item.Name, &item.Type, &item.Model, &item.Serial, &item.AgeYears, &item.Notes, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return item, fmt.Errorf("get system %s: %w", id, err)
	}
	return item, nil
}

func (db *DB) SaveSystem(item System) (System, error) {
	if item.ID == "" {
		return item, fmt.Errorf("system id cannot be empty")
	}
	_, err := db.conn.Exec("INSERT OR REPLACE INTO Systems (id, property_id, name, type, model, serial, age_years, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", item.ID, item.PropertyID, item.Name, item.Type, item.Model, item.Serial, item.AgeYears, item.Notes)
	if err != nil {
		return item, fmt.Errorf("save system: %w", err)
	}
	return db.GetSystem(item.ID)
}

func (db *DB) DeleteSystem(id string) error {
	_, err := db.conn.Exec("DELETE FROM Systems WHERE id = ?", id)
	return err
}
