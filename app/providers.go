package app

import "github.com/TrueBlocks/trueblocks-maint/v2/internal/db"

func (a *App) GetServiceProviders(propertyID string) ([]db.ServiceProvider, error) {
	return a.db.GetServiceProviders(propertyID)
}

func (a *App) GetServiceProvider(id string) (db.ServiceProvider, error) {
	return a.db.GetServiceProvider(id)
}

func (a *App) SaveServiceProvider(item db.ServiceProvider) (db.ServiceProvider, error) {
	return a.db.SaveServiceProvider(item)
}

func (a *App) DeleteServiceProvider(id string) error {
	return a.db.DeleteServiceProvider(id)
}
