package db

import "fmt"

type ServiceProvider struct {
	ID         string `json:"id"`
	PropertyID string `json:"propertyID"`
	Name       string `json:"name"`
	Specialty  string `json:"specialty"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	Website    string `json:"website"`
	Notes      string `json:"notes"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

func (db *DB) GetServiceProviders(propertyID string) ([]ServiceProvider, error) {
	rows, err := db.conn.Query("SELECT id, property_id, name, specialty, phone, email, website, notes, created_at, updated_at FROM ServiceProviders WHERE property_id = ? ORDER BY name", propertyID)
	if err != nil {
		return nil, fmt.Errorf("query service providers: %w", err)
	}
	defer rows.Close()
	var items []ServiceProvider
	for rows.Next() {
		var item ServiceProvider
		if err := rows.Scan(&item.ID, &item.PropertyID, &item.Name, &item.Specialty, &item.Phone, &item.Email, &item.Website, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan provider: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (db *DB) GetServiceProvider(id string) (ServiceProvider, error) {
	var item ServiceProvider
	err := db.conn.QueryRow("SELECT id, property_id, name, specialty, phone, email, website, notes, created_at, updated_at FROM ServiceProviders WHERE id = ?", id).Scan(&item.ID, &item.PropertyID, &item.Name, &item.Specialty, &item.Phone, &item.Email, &item.Website, &item.Notes, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return item, fmt.Errorf("get provider %s: %w", id, err)
	}
	return item, nil
}

func (db *DB) SaveServiceProvider(item ServiceProvider) (ServiceProvider, error) {
	if item.ID == "" {
		return item, fmt.Errorf("provider id cannot be empty")
	}
	_, err := db.conn.Exec("INSERT OR REPLACE INTO ServiceProviders (id, property_id, name, specialty, phone, email, website, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", item.ID, item.PropertyID, item.Name, item.Specialty, item.Phone, item.Email, item.Website, item.Notes)
	if err != nil {
		return item, fmt.Errorf("save provider: %w", err)
	}
	return db.GetServiceProvider(item.ID)
}

func (db *DB) DeleteServiceProvider(id string) error {
	_, err := db.conn.Exec("DELETE FROM ServiceProviders WHERE id = ?", id)
	return err
}
