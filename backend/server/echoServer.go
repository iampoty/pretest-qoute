package server

import (
	"fmt"
	"log"
	"pretest/qoute/configs"

	emiddleware "github.com/labstack/echo/v4/middleware"
	// "pretest/qoute/database"
	"pretest/qoute/internal/adapter/rest"
	"pretest/qoute/internal/adapter/rest/middleware"
	"pretest/qoute/internal/infrastructure/mongodb"
	"pretest/qoute/internal/usecase"

	// "localhost/cag/configs"
	"runtime"
	"time"

	"github.com/labstack/echo/v4"
)

type (
	echoV4Server struct {
		app *echo.Echo
		// db     *configs.Db
		// db     database.Database
		config *configs.Config
		// userRepo    domain.UserRepository
		// contentRepo domain.ContentRepository
		handler *rest.Handler
	}
)

func NewEchoV4Server(config *configs.Config) *echoV4Server {
	app := echo.New()

	// repo := mongo.NewUserRepository()
	// createUser := &usecase.CreateUserUseCase{Repo: repo}
	// userHandler := &rest.UserHandler{CreateUser: createUser}
	// http.HandleFunc("/users", userHandler.CreateUserHandler)
	// ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	// defer cancel()

	// mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	uri := fmt.Sprintf("mongodb://%s:%d", config.Db.Host, config.Db.Port)
	mongoClient, err := mongodb.NewMongoClient(uri)
	if err != nil {
		log.Fatal(err)
	}

	db := mongoClient.Database("pretest")

	// สร้าง indexes ตอนเริ่มระบบ
	if err := mongodb.EnsureIndexes(db); err != nil {
		log.Fatal("Failed to create indexes:", err)
	}

	userRepo := mongodb.NewMongoUserRepository(db)
	contentRepo := mongodb.NewMongoContentRepository(db)

	userUsecase := &usecase.UserUsecase{UserRepo: userRepo}
	contentUsecase := &usecase.ContentUsecase{ContentRepo: contentRepo}

	handler := &rest.Handler{
		UserUsecase:    userUsecase,
		ContentUsecase: contentUsecase,
	}

	log.Println(userRepo)
	log.Println(contentRepo)

	app.Use(emiddleware.CORSWithConfig(emiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"}, // 👈 ให้ตรงกับ origin ของ frontend
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, "x-api-key", "Authorization"},
	}))

	return &echoV4Server{
		app: app,
		// db:     db,
		config:  config,
		handler: handler,
	}
}

func (s *echoV4Server) Start() {
	s.initRoutes()
	s.app.HideBanner = true
	serv := fmt.Sprintf(":%d", s.config.Server.Port)
	s.app.Logger.Fatal(s.app.Start(serv))
}

func (s *echoV4Server) initRoutes() {
	s.app.GET("/v1/_info", s.infoHandler)
	s.app.GET("/v1/_health", s.healthHandler)
	s.app.GET("/v1/content", s.handler.ListContent, rest.APIKeyMiddleware, middleware.JWTMiddlewareAlt)

	authorized := s.app.Group("/v1")
	authorized.Use(rest.APIKeyMiddleware)

	authorized.POST("/user/register", s.handler.Register)
	authorized.POST("/user/login", s.handler.Login)
	authorized.POST("/content", s.handler.CreateContent, middleware.JWTMiddleware)
	// authorized.POST("/content/create", s.handler.CreateContent, middleware.JWTMiddleware)
	authorized.PATCH("/content/:contentid", s.handler.EditContent, middleware.JWTMiddleware)
	authorized.POST("/content/:contentid/vote", s.handler.VoteContent, middleware.JWTMiddleware)
	authorized.POST("/content/:contentid/vote2", s.handler.VoteContentV2, middleware.JWTMiddleware)
}

func (s *echoV4Server) healthHandler(ctx echo.Context) error {
	bangkok, _ := time.LoadLocation("Asia/Bangkok")
	tn := time.Now().In(bangkok)
	timex := tn.Format("2006-01-02 15:04:05")
	timez, _ := tn.Zone()
	return ctx.JSON(200, map[string]string{
		"status": "running",
		"port":   fmt.Sprintf("%d", s.config.Server.Port),
		"go":     runtime.Version(),
		// "STACK":  os.Getenv("STACK"),
		"timex": timex,
		"timez": timez,
	})
}

func (s *echoV4Server) infoHandler(ctx echo.Context) error {
	// log.Printf("infoHandler.s.db: %p", &s.db)
	info := map[string]interface{}{
		"version":   "1.0.0",
		"status":    "running",
		"framework": "EchoV4",
		"runtime":   runtime.Version(),
		// "dbInstance": s.db.GetCollection("quotes").Name(),
		"message": "Hello API is running successfully.",
	}
	return ctx.JSON(200, info)
}
