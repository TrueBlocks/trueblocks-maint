package app

import "github.com/TrueBlocks/trueblocks-maint/v2/internal/db"

func (a *App) GetProperties() ([]db.Property, error) {
	return a.db.GetProperties()
}

func (a *App) GetProperty(id string) (db.Property, error) {
	return a.db.GetProperty(id)
}

func (a *App) SaveProperty(item db.Property) (db.Property, error) {
	return a.db.SaveProperty(item)
}

func (a *App) DeleteProperty(id string) error {
	return a.db.DeleteProperty(id)
}
