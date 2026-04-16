package state

import (
	"path/filepath"

	appkit "github.com/TrueBlocks/trueblocks-art/packages/appkit/v2"
)

type TableState = appkit.TableState
type WindowState = appkit.WindowState

type AppState struct {
	SidebarWidth int                          `json:"sidebarWidth,omitempty"`
	LastTab      string                       `json:"lastTab,omitempty"`
	LastRoute    string                       `json:"lastRoute,omitempty"`
	Window       appkit.WindowState           `json:"window,omitempty"`
	Tables       map[string]appkit.TableState `json:"tables,omitempty"`
	Tabs         map[string]string            `json:"tabs,omitempty"`
	TabRoutes    map[string]string            `json:"tabRoutes,omitempty"`
}

type Manager struct {
	store *appkit.Store[AppState]
}

func NewManager() *Manager {
	statePath := filepath.Join(appkit.AppDirFor("maint"), "state.json")
	store := appkit.NewStore(statePath, AppState{})
	_ = store.Load()
	return &Manager{store: store}
}

func (m *Manager) GetWindowGeometry() (x, y, width, height int) {
	s := m.store.Get()
	return s.Window.X, s.Window.Y, s.Window.Width, s.Window.Height
}

func (m *Manager) SetWindowGeometry(x, y, width, height int) {
	_ = m.store.Update(func(s *AppState) {
		s.Window = appkit.WindowState{X: x, Y: y, Width: width, Height: height}
	})
}

func (m *Manager) GetSidebarWidth() int {
	return m.store.Get().SidebarWidth
}

func (m *Manager) SetSidebarWidth(width int) {
	_ = m.store.Update(func(s *AppState) {
		s.SidebarWidth = width
	})
}

func (m *Manager) GetTableState(tableName string) TableState {
	return appkit.GetFromMap(m.store.Get().Tables, tableName)
}

func (m *Manager) SetTableState(tableName string, tableState TableState) {
	_ = m.store.Update(func(s *AppState) {
		s.Tables = appkit.SetInMap(s.Tables, tableName, tableState)
	})
}

func (m *Manager) GetTab(pageName string) string {
	return appkit.GetFromMap(m.store.Get().Tabs, pageName)
}

func (m *Manager) SetTab(pageName string, tab string) {
	_ = m.store.Update(func(s *AppState) {
		s.Tabs = appkit.SetInMap(s.Tabs, pageName, tab)
	})
}

func (m *Manager) GetTabRoute(key string) string {
	return appkit.GetFromMap(m.store.Get().TabRoutes, key)
}

func (m *Manager) SetTabRoute(key, route string) {
	_ = m.store.Update(func(s *AppState) {
		s.TabRoutes = appkit.SetInMap(s.TabRoutes, key, route)
	})
}

func (m *Manager) GetLastRoute() string {
	return m.store.Get().LastRoute
}

func (m *Manager) SetLastRoute(route string) {
	_ = m.store.Update(func(s *AppState) {
		s.LastRoute = route
	})
}
