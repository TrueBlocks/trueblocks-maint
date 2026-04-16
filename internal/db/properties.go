package db

import "fmt"

type Property struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Address   string `json:"address"`
	City      string `json:"city"`
	State     string `json:"state"`
	Zip       string `json:"zip"`
	Notes     string `json:"notes"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func (db *DB) GetProperties() ([]Property, error) {
	rows, err := db.conn.Query("SELECT id, name, address, city, state, zip, notes, created_at, updated_at FROM Properties ORDER BY name")
	if err != nil {
		return nil, fmt.Errorf("query properties: %w", err)
	}
	defer rows.Close()
	var items []Property
	for rows.Next() {
		var item Property
		if err := rows.Scan(&item.ID, &item.Name, &item.Address, &item.City, &item.State, &item.Zip, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan property: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (db *DB) GetProperty(id string) (Property, error) {
	var item Property
	err := db.conn.QueryRow("SELECT id, name, address, city, state, zip, notes, created_at, updated_at FROM Properties WHERE id = ?", id).Scan(&item.ID, &item.Name, &item.Address, &item.City, &item.State, &item.Zip, &item.Notes, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return item, fmt.Errorf("get property %s: %w", id, err)
	}
	return item, nil
}

func (db *DB) SaveProperty(item Property) (Property, error) {
	if item.ID == "" {
		return item, fmt.Errorf("property id cannot be empty")
	}
	_, err := db.conn.Exec("INSERT OR REPLACE INTO Properties (id, name, address, city, state, zip, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", item.ID, item.Name, item.Address, item.City, item.State, item.Zip, item.Notes)
	if err != nil {
		return item, fmt.Errorf("save property: %w", err)
	}
	return db.GetProperty(item.ID)
}

func (db *DB) DeleteProperty(id string) error {
	_, err := db.conn.Exec("DELETE FROM Properties WHERE id = ?", id)
	return err
}
