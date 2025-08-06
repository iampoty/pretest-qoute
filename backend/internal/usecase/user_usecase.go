package usecase

import (
	"errors"
	"pretest/qoute/internal/domain"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserUsecase struct {
	UserRepo domain.UserRepository
}

func (uc *UserUsecase) Register(username, email, password string) (*domain.User, error) {
	// ตรวจสอบ input
	if strings.TrimSpace(username) == "" {
		return nil, errors.New("username is required")
	}
	if strings.TrimSpace(email) == "" {
		return nil, errors.New("email is required")
	}
	if strings.TrimSpace(password) == "" {
		return nil, errors.New("password is required")
	}

	existing, _ := uc.UserRepo.FindByUsername(username)
	if existing != nil {
		return nil, errors.New("username already taken")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Username: username,
		Email:    email,
		Password: string(hash),
		Created:  time.Now(),
	}

	// log.Print("Registering user:", user.Username, " with email:", user.Email, " password:", password)
	err = uc.UserRepo.Create(user)
	return user, err
}

func (uc *UserUsecase) Login(username, password string) (*domain.User, error) {
	user, err := uc.UserRepo.FindByUsername(username)
	if err != nil || user == nil {
		return nil, errors.New("invalid username or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	return user, nil
}
