package rest

import "pretest/qoute/internal/usecase"

const jwtSecret = "your-secret-key"

type Handler struct {
	UserUsecase    *usecase.UserUsecase
	ContentUsecase *usecase.ContentUsecase
}
