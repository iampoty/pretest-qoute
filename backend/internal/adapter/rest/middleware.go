package rest

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

const APIKey = "my-secret-api-key" // หรือดึงจาก ENV ก็ได้

func APIKeyMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// auth := c.Request().Header.Get("Authorization")
		auth := c.Request().Header.Get("X-API-Key")
		//log.Printf("APIKeyMiddleware: auth header: %s", auth)
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing or invalid API Key")
		}

		token := strings.TrimPrefix(auth, "Bearer ")
		if token != APIKey {
			return echo.NewHTTPError(http.StatusForbidden, "Invalid API Key")
		}

		return next(c)
	}
}
