package server

import (
	"fmt"
	"pretest/qoute/configs"
	"runtime"
	"time"

	"github.com/kataras/iris/v12"
)

type (
	irisServer struct {
		// app *echo.Echo
		app *iris.Application
		// db     *configs.Db
		config *configs.Config
	}
)

func NewIrisServer(config *configs.Config) *irisServer {
	app := iris.New()

	return &irisServer{
		app:    app,
		config: config,
	}
}

func (s *irisServer) Start() {
	// s.app.Logger().Infof("Starting server on %s", s.config.Server.Address)
	s.initRoutes()
	serv := fmt.Sprintf(":%d", s.config.Server.Port)
	s.app.Listen(serv)
}

func (s *irisServer) initRoutes() {
	s.app.Get("/v1/_info", s.infoHandler)
	s.app.Get("/v1/_health", s.healthHandler)
}

func (s *irisServer) healthHandler(ctx iris.Context) {
	bangkok, _ := time.LoadLocation("Asia/Bangkok")
	tn := time.Now().In(bangkok)
	timex := tn.Format("2006-01-02 15:04:05")
	timez, _ := tn.Zone()
	ctx.JSON(map[string]string{
		"status": "running",
		"port":   fmt.Sprintf("%d", s.config.Server.Port),
		"go":     runtime.Version(),
		// "STACK":  os.Getenv("STACK"),
		"timex": timex,
		"timez": timez,
	})
}

func (s *irisServer) infoHandler(ctx iris.Context) {
	info := map[string]interface{}{
		"version":   "1.0.0",
		"status":    "running",
		"framework": "Iris",
		"runtime":   runtime.Version(),
		"message":   "Hello API is running successfully.",
	}
	ctx.JSON(info)
}
