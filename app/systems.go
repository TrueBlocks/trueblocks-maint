package app

import "github.com/TrueBlocks/trueblocks-maint/v2/internal/db"

func (a *App) GetSystems(propertyID string) ([]db.System, error) {
	return a.db.GetSystems(propertyID)
}

func (a *App) GetSystem(id string) (db.System, error) {
	return a.db.GetSystem(id)
}

func (a *App) SaveSystem(item db.System) (db.System, error) {
	return a.db.SaveSystem(item)
}

func (a *App) DeleteSystem(id string) error {
	return a.db.DeleteSystem(id)
}
