package usecase

import (
	"errors"
	"pretest/qoute/internal/domain"
	"testing"
)

// MockUserRepo implements domain.UserRepository for testing
type MockUserRepo struct {
	users map[string]*domain.User
}

func NewMockUserRepo() *MockUserRepo {
	return &MockUserRepo{users: make(map[string]*domain.User)}
}

func (m *MockUserRepo) Create(user *domain.User) error {
	if _, exists := m.users[user.Username]; exists {
		return errors.New("duplicate username")
	}
	m.users[user.Username] = user
	return nil
}

func (m *MockUserRepo) FindByUsername(username string) (*domain.User, error) {
	user, exists := m.users[username]
	if !exists {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *MockUserRepo) FindByEmail(email string) (*domain.User, error) {
	for _, u := range m.users {
		if u.Username == email {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func TestUserUsecase_Register(t *testing.T) {
	mockRepo := NewMockUserRepo()
	uc := &UserUsecase{UserRepo: mockRepo}

	username := "johndoe"
	name := "johndoe"
	email := "john@example.com"
	password := "secret123"

	user, err := uc.Register(username, email, name, password)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if user.Username != username || user.Email != email {
		t.Errorf("user data mismatch")
	}

	// ทดสอบกรณี username ซ้ำ
	_, err = uc.Register(username, "other@example.com", "other", "pass")
	if err == nil {
		t.Errorf("expected error for duplicate username")
	}

	// username ว่าง
	_, err = uc.Register("", "other@example.com", "other", "pass")
	if err == nil {
		t.Errorf("expected error for username is required")
	}
	// name ว่าง
	_, err = uc.Register("user01", "other@example.com", "", "pass")
	if err == nil {
		t.Errorf("expected error for name is required")
	}
	// // email ว่าง
	// _, err = uc.Register("user01", "", "other", "pass")
	// if err != nil {
	// 	t.Errorf("expected error for email is required")
	// }
	// password ว่าง
	_, err = uc.Register("user01", "other@example.com", "other", "")
	if err == nil {
		t.Errorf("expected error for password is required")
	}
}

func TestUserUsecase_Login(t *testing.T) {
	mockRepo := NewMockUserRepo()
	uc := &UserUsecase{UserRepo: mockRepo}

	// สร้าง user ล่วงหน้า (ใช้ Register)
	username := "janedoe"
	name := "janedoe"
	email := "jane@example.com"
	password := "mypassword"

	_, err := uc.Register(username, email, name, password)
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	// กรณี login ถูกต้อง
	user, err := uc.Login(username, password)
	if err != nil {
		t.Errorf("expected successful login, got error: %v", err)
	}
	if user.Username != username {
		t.Errorf("login returned wrong user")
	}

	// กรณี username ผิด
	_, err = uc.Login("wronguser", password)
	if err == nil {
		t.Errorf("expected error for wrong username")
	}

	// กรณี password ผิด
	_, err = uc.Login(username, "wrongpass")
	if err == nil {
		t.Errorf("expected error for wrong password")
	}

	// username ว่าง
	_, err = uc.Login("", password)
	// log.Printf("username ว่าง %s", err)
	if err == nil {
		t.Errorf("expected error for username is required")
	}

	// password ว่าง
	_, err = uc.Login(username, "")
	// log.Printf("password ว่าง %s", err)
	if err == nil {
		t.Errorf("expected error for password is required")
	}
}
