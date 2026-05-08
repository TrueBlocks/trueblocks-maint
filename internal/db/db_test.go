package db

import (
	"path/filepath"
	"testing"
)

func newTestDB(t *testing.T) *DB {
	t.Helper()
	path := filepath.Join(t.TempDir(), "test.db")
	d, err := New(path)
	if err != nil {
		t.Fatalf("new db: %v", err)
	}
	t.Cleanup(func() { _ = d.Close() })
	if err := d.InitSchemaFromEmbedded(); err != nil {
		t.Fatalf("init schema: %v", err)
	}
	return d
}

func TestPropertyCRUD(t *testing.T) {
	d := newTestDB(t)

	p, err := d.SaveProperty(Property{ID: "p1", Name: "Home", City: "Phila"})
	if err != nil {
		t.Fatalf("save: %v", err)
	}
	if p.Name != "Home" || p.City != "Phila" {
		t.Fatalf("unexpected saved property: %+v", p)
	}

	got, err := d.GetProperty("p1")
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.ID != "p1" || got.Name != "Home" {
		t.Fatalf("unexpected get: %+v", got)
	}

	list, err := d.GetProperties()
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 property, got %d", len(list))
	}

	if _, err := d.SaveProperty(Property{ID: "p1", Name: "Home Updated", City: "Phila"}); err != nil {
		t.Fatalf("update: %v", err)
	}
	got, _ = d.GetProperty("p1")
	if got.Name != "Home Updated" {
		t.Fatalf("update did not persist: %+v", got)
	}

	if err := d.DeleteProperty("p1"); err != nil {
		t.Fatalf("delete: %v", err)
	}
	if _, err := d.GetProperty("p1"); err == nil {
		t.Fatalf("expected error after delete")
	}
}

func TestSystemCRUD(t *testing.T) {
	d := newTestDB(t)
	if _, err := d.SaveProperty(Property{ID: "p1", Name: "Home"}); err != nil {
		t.Fatalf("seed property: %v", err)
	}

	s, err := d.SaveSystem(System{ID: "s1", PropertyID: "p1", Name: "HVAC", Type: "hvac"})
	if err != nil {
		t.Fatalf("save: %v", err)
	}
	if s.Name != "HVAC" {
		t.Fatalf("unexpected saved system: %+v", s)
	}

	got, err := d.GetSystem("s1")
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.PropertyID != "p1" {
		t.Fatalf("unexpected get: %+v", got)
	}

	list, err := d.GetSystems("p1")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 system, got %d", len(list))
	}

	if err := d.DeleteSystem("s1"); err != nil {
		t.Fatalf("delete: %v", err)
	}
	if _, err := d.GetSystem("s1"); err == nil {
		t.Fatalf("expected error after delete")
	}
}

func TestServiceProviderCRUD(t *testing.T) {
	d := newTestDB(t)
	if _, err := d.SaveProperty(Property{ID: "p1", Name: "Home"}); err != nil {
		t.Fatalf("seed property: %v", err)
	}

	pr, err := d.SaveServiceProvider(ServiceProvider{ID: "sp1", PropertyID: "p1", Name: "Acme HVAC", Specialty: "hvac"})
	if err != nil {
		t.Fatalf("save: %v", err)
	}
	if pr.Name != "Acme HVAC" {
		t.Fatalf("unexpected saved provider: %+v", pr)
	}

	got, err := d.GetServiceProvider("sp1")
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.Specialty != "hvac" {
		t.Fatalf("unexpected get: %+v", got)
	}

	list, err := d.GetServiceProviders("p1")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 provider, got %d", len(list))
	}

	if err := d.DeleteServiceProvider("sp1"); err != nil {
		t.Fatalf("delete: %v", err)
	}
	if _, err := d.GetServiceProvider("sp1"); err == nil {
		t.Fatalf("expected error after delete")
	}
}

func TestMaintenanceEventCRUD(t *testing.T) {
	d := newTestDB(t)
	if _, err := d.SaveProperty(Property{ID: "p1", Name: "Home"}); err != nil {
		t.Fatalf("seed property: %v", err)
	}
	if _, err := d.SaveSystem(System{ID: "s1", PropertyID: "p1", Name: "HVAC", Type: "hvac"}); err != nil {
		t.Fatalf("seed system: %v", err)
	}

	ev, err := d.SaveMaintenanceEvent(MaintenanceEvent{
		ID:           "e1",
		PropertyID:   "p1",
		SystemID:     "s1",
		Description:  "Replace filter",
		Type:         "filter",
		RepeatType:   "monthly",
		FirstDueDate: "2026-01-01",
		NextDueDate:  "2026-01-01",
	})
	if err != nil {
		t.Fatalf("save: %v", err)
	}
	if ev.Description != "Replace filter" {
		t.Fatalf("unexpected saved event: %+v", ev)
	}

	got, err := d.GetMaintenanceEvent("e1")
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.RepeatType != "monthly" {
		t.Fatalf("unexpected get: %+v", got)
	}

	list, err := d.GetMaintenanceEvents("p1")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 event, got %d", len(list))
	}

	if err := d.DeleteMaintenanceEvent("e1"); err != nil {
		t.Fatalf("delete: %v", err)
	}
	if _, err := d.GetMaintenanceEvent("e1"); err == nil {
		t.Fatalf("expected error after delete")
	}
}

func TestMaintenanceEventRejectsBadForeignKeys(t *testing.T) {
	d := newTestDB(t)

	if _, err := d.SaveMaintenanceEvent(MaintenanceEvent{
		ID:         "e1",
		PropertyID: "missing",
		SystemID:   "missing",
		RepeatType: "once",
	}); err == nil {
		t.Fatalf("expected error for missing property")
	}

	if _, err := d.SaveProperty(Property{ID: "p1", Name: "Home"}); err != nil {
		t.Fatalf("seed: %v", err)
	}
	if _, err := d.SaveMaintenanceEvent(MaintenanceEvent{
		ID:         "e1",
		PropertyID: "p1",
		SystemID:   "missing",
		RepeatType: "once",
	}); err == nil {
		t.Fatalf("expected error for missing system")
	}
}
