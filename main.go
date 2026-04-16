package main

import (
	"embed"
	"fmt"

	appkit "github.com/TrueBlocks/trueblocks-art/packages/appkit/v2"
	"github.com/TrueBlocks/trueblocks-maint/v2/app"
	"github.com/TrueBlocks/trueblocks-maint/v2/internal/state"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	application := app.NewApp()
	stateManager := state.NewManager()

	err := appkit.Run(appkit.AppConfig{
		Title:             "Maint - House Maintenance Manager",
		Assets:            assets,
		Width:             1200,
		Height:            800,
		GetWindowGeometry: stateManager.GetWindowGeometry,
		OnStartup:         application.Startup,
		OnShutdown:        application.Shutdown,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "com.trueblocks.maint.4f2a9e8d-7c3b-11ec-81d5-0242ac130003",
			OnSecondInstanceLaunch: func(data options.SecondInstanceData) {
				fmt.Println("Cannot start a second instance")
			},
		},
		Bind: []interface{}{
			application,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
