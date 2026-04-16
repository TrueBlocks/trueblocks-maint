package app

import (
	"fmt"

	"github.com/TrueBlocks/trueblocks-maint/v2/internal/db"
)

func (a *App) GetProperties() ([]db.Property, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetProperties()
}

func (a *App) GetProperty(id string) (db.Property, error) {
	if a.db == nil {
		return db.Property{}, fmt.Errorf("database not initialized")
	}
	return a.db.GetProperty(id)
}

func (a *App) SaveProperty(item db.Property) (db.Property, error) {
	if a.db == nil {
		return db.Property{}, fmt.Errorf("database not initialized")
	}
	return a.db.SaveProperty(item)
}

func (a *App) DeleteProperty(id string) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.DeleteProperty(id)
}
