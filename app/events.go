package app

import "github.com/TrueBlocks/trueblocks-maint/v2/internal/db"

func (a *App) GetMaintenanceEvents(propertyID string) ([]db.MaintenanceEvent, error) {
	return a.db.GetMaintenanceEvents(propertyID)
}

func (a *App) GetMaintenanceEvent(id string) (db.MaintenanceEvent, error) {
	return a.db.GetMaintenanceEvent(id)
}

func (a *App) SaveMaintenanceEvent(item db.MaintenanceEvent) (db.MaintenanceEvent, error) {
	return a.db.SaveMaintenanceEvent(item)
}

func (a *App) DeleteMaintenanceEvent(id string) error {
	return a.db.DeleteMaintenanceEvent(id)
}

func (a *App) CompleteMaintenanceEvent(propertyID, eventID, completedDate, completedBy, notes string, costActual float64, providerID string) (db.CompletionResult, error) {
	return a.db.CompleteMaintenanceEvent(propertyID, eventID, completedDate, completedBy, notes, costActual, providerID)
}

func (a *App) GetEventHistory(eventID string) ([]db.MaintenanceHistoryRec, error) {
	return a.db.GetEventHistory(eventID)
}
