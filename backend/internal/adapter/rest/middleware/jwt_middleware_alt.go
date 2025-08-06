package middleware

import (
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// const jwtSecret = "your-secret-key" // ควรดึงจาก ENV จริง ๆ

func JWTMiddlewareAlt(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")

		// ถ้าไม่มี Authorization เลย ก็ปล่อยผ่าน
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return next(c)
		}

		// ถ้ามี Authorization ก็พยายาม decode token
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, echo.NewHTTPError(401, "Unexpected signing method")
			}
			return []byte(jwtSecret), nil
		})

		// ถ้า token ผิดก็ปล่อยผ่าน (แต่ไม่ set context)
		if err != nil || !token.Valid {
			return next(c)
		}

		// ถ้า token ถูกต้อง ใส่ user_id ลง context
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if uid, ok := claims["user_id"]; ok {
				c.Set("user_id", uid)
			}
		}

		return next(c)
	}
}
