package domain

type UserRepository interface {
	Create(user *User) error
	FindByUsername(username string) (*User, error)
	FindByEmail(email string) (*User, error)
}

type ContentRepository interface {
	Create(content *Content) error
	Update(content *Content) error
	UpdateVote(content *Content) error
	FindAll(filter *ContentFilter, option *ContentOption) ([]*Content, string, int, error)
	FindByUserID(userID string) ([]*Content, error)
	FindByID(id string) (*Content, error)
	FindByVotedUser(userID string) ([]*Content, error)
}
