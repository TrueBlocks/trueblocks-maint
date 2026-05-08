package app

import (
	"context"
	"path/filepath"

	appkit "github.com/TrueBlocks/trueblocks-art/packages/appkit/v2"
	"github.com/TrueBlocks/trueblocks-maint/v2/internal/db"
	"github.com/TrueBlocks/trueblocks-maint/v2/internal/state"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx   context.Context
	state *state.Manager
	db    *db.DB
}

func NewApp() *App {
	return &App{}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.state = state.NewManager()
	dataDir := appkit.AppDirFor("maint")
	dbPath := filepath.Join(dataDir, "maint.db")
	database, err := db.New(dbPath)
	if err != nil {
		runtime.LogErrorf(ctx, "Failed to open database: %v", err)
		return
	}
	a.db = database
	initialized, err := database.IsInitialized()
	if err != nil {
		runtime.LogErrorf(ctx, "Failed to check database: %v", err)
		return
	}
	if !initialized {
		runtime.LogInfo(ctx, "Database not initialized, initializing schema...")
		if err := database.InitSchemaFromEmbedded(); err != nil {
			runtime.LogErrorf(ctx, "Failed to init embedded schema: %v", err)
			schemaPath := filepath.Join(dataDir, "schema.sql")
			if fErr := database.InitSchemaFromFile(schemaPath); fErr != nil {
				runtime.LogErrorf(ctx, "Failed to init schema from file fallback: %v", fErr)
			} else {
				runtime.LogInfo(ctx, "Successfully initialized schema from file fallback")
			}
		} else {
			runtime.LogInfo(ctx, "Successfully initialized schema from embedded")
		}
	} else {
		runtime.LogInfo(ctx, "Database already initialized")
	}
}

func (a *App) Shutdown(_ context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

// Logging methods bound to the frontend so the React app can write into the
// Wails runtime log stream.
func (a *App) LogDebug(message string) {
	runtime.LogDebug(a.ctx, message)
}

func (a *App) LogInfo(message string) {
	runtime.LogInfo(a.ctx, message)
}

func (a *App) LogWarning(message string) {
	runtime.LogWarning(a.ctx, message)
}

func (a *App) LogError(message string) {
	runtime.LogError(a.ctx, message)
}
