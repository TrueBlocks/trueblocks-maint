package app

import (
	"context"
	"fmt"
	"path/filepath"

	appkit "github.com/TrueBlocks/trueblocks-art/packages/appkit/v2"
	"github.com/TrueBlocks/trueblocks-maint/v2/internal/db"
	"github.com/TrueBlocks/trueblocks-maint/v2/internal/state"
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
		fmt.Printf("Failed to open database: %v\n", err)
		return
	}
	a.db = database
	initialized, err := database.IsInitialized()
	if err != nil {
		fmt.Printf("Failed to check database: %v\n", err)
		return
	}
	if !initialized {
		fmt.Printf("Database not initialized, initializing schema...\n")
		schemaPath := filepath.Join(dataDir, "schema.sql")
		if err := database.InitSchemaFromFile(schemaPath); err != nil {
			fmt.Printf("Failed to init from file, trying embedded schema: %v\n", err)
			if embErr := database.InitSchemaFromEmbedded(); embErr != nil {
				fmt.Printf("Failed to init embedded schema: %v\n", embErr)
			} else {
				fmt.Printf("Successfully initialized schema from embedded\n")
			}
		} else {
			fmt.Printf("Successfully initialized schema from file\n")
		}
	} else {
		fmt.Printf("Database already initialized\n")
	}
}

func (a *App) Shutdown(_ context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}
