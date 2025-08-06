package rest

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
)

func (h *Handler) Register(c echo.Context) error {
	req := new(struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	})
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	user, err := h.UserUsecase.Register(req.Username, req.Email, req.Password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusCreated, user)
}

func (h *Handler) Login(c echo.Context) error {
	req := new(struct {
		Username string `json:"username"`
		Password string `json:"password"`
	})
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	user, err := h.UserUsecase.Login(req.Username, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, err.Error())
	}

	// generate JWT token here
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),                         // หรือ user.ID.String() แล้วแต่โครงสร้าง
		"exp":     time.Now().Add(24 * time.Hour).Unix(), // หมดอายุใน 24 ชม.
		// "exp": time.Now().Add(5 * time.Minute).Unix(), // หมดอายุใน 5 นาที.
	})
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to generate token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}
