package usecase

import (
	"errors"
	"pretest/qoute/internal/domain"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MockContentRepo implements domain.ContentRepository for testing
type MockContentRepo struct {
	contents []*domain.Content
}

func NewMockContentRepo() *MockContentRepo {
	return &MockContentRepo{contents: make([]*domain.Content, 0)}
}

func (m *MockContentRepo) Create(content *domain.Content) error {
	m.contents = append(m.contents, content)
	return nil

}

func (m *MockContentRepo) Update(content *domain.Content) error {

	for idx, c := range m.contents {
		if c.ID.Hex() == content.ID.Hex() {
			m.contents[idx].Title = content.Title
			m.contents[idx].UpdatedAt = content.UpdatedAt
			return nil
		}
	}
	return errors.New("content not found")
}

func (m *MockContentRepo) UpdateVote(content *domain.Content) error {

	for idx, c := range m.contents {
		if c.ID.Hex() == content.ID.Hex() {
			m.contents[idx].Vote += 1
			return nil
		}
	}
	return errors.New("content not found")
}

func (m *MockContentRepo) FindAll(filter *domain.ContentFilter, option *domain.ContentOption) ([]*domain.Content, string, int, error) {
	contents := m.contents
	// for _, c := range m.contents {
	// 	if c.ID.Hex() == id {
	// 		return c, nil
	// 	}
	// }
	return contents, "", len(contents), errors.New("content not found")
}

func (m *MockContentRepo) FindByID(id string) (*domain.Content, error) {
	for _, c := range m.contents {
		if c.ID.Hex() == id {
			return c, nil
		}
	}
	return nil, errors.New("content not found")
}

func (m *MockContentRepo) FindByUserID(userID string) ([]*domain.Content, error) {
	var contents []*domain.Content
	for _, c := range m.contents {
		if c.UserID == userID {
			contents = append(contents, c)
		}
	}
	if len(contents) == 0 {
		return nil, errors.New("no contents found for user")
	}
	return contents, nil
}

func (m *MockContentRepo) FindByVotedUser(userID string) ([]*domain.Content, error) {
	var contents []*domain.Content
	for _, c := range m.contents {
		if c.VotedBy == userID {
			contents = append(contents, c)
		}
	}
	if len(contents) == 0 {
		return nil, errors.New("no contents found for user")
	}
	return contents, nil
}

/*
ไม่ต้องชอบอะไรเหมือนเราก็ได้ แค่ชอบเราก็พอ
ถ้าที่ตรงนั้น ไม่ใช่ที่ของเรา เราจะไม่มีโฉนด
เขามันทรงดี  ส่วนเราทรงตัวได้ก็บุญแล้ว
เวรกรรมของเธอ ที่ได้เจอคนน่ารักแบบเรา
เหงานิดหน่อย แต่กินข้าวอร่อยเหมือนเดิม
เป็นคนตลกแต่ไม่ตลอด เป็นคนน่ากอดอันนี้ไม่ตลก
วันนี้ไม่เห็นค่า วันหน้าก็ได้ เราว่างทุกวันแหละ
ถึงอะไรจะไม่ดี แต่ปากดีที่หนึ่งนะ
ปีหน้าต้องดีกว่านี้ หมายถึงปาก
พร้อมจะหยุดเสมอ ถ้าเจอไฟแดง

ที่เจอบ่อยๆ นี่ โลกกลมหรือเวรกรรม
เป็นคนไม่ค่อยฝัน เพราะว่าฉันไม่ค่อยนอน
เวลาไม่ช่วยให้ลืม... เงินที่ยืมจะคืนเมื่อไหร่
ยามใดที่เราทุกข์... ชาไข่มุกคือพลัง
จะไม่มีคำว่าสาย ถ้าเราตื่นบ่าย

คนที่ทำให้เราหลง คือคนที่ส่งโลเคชั่นผิด

*/

func TestContentUsecase_Create(t *testing.T) {
	mockRepo := NewMockContentRepo()
	uc := &ContentUsecase{ContentRepo: mockRepo}
	author := "John"

	t.Run("should create content successfully", func(t *testing.T) {
		userID := primitive.NewObjectID().Hex()
		title := "Test Title"

		content, err := uc.CreateContent(userID, title, author, 0)
		assert.NoError(t, err)
		assert.Equal(t, userID, content.UserID)
		assert.Equal(t, title, content.Title)
	})

	t.Run("should fail if title is empty", func(t *testing.T) {
		userID := primitive.NewObjectID().Hex()
		title := ""

		content, err := uc.CreateContent(userID, title, author, 0)
		assert.Error(t, err)
		assert.Nil(t, content)
		assert.Equal(t, "title is required", err.Error())
	})

	t.Run("should fail if userID is empty", func(t *testing.T) {
		userID := ""
		title := "Test Title"

		content, err := uc.CreateContent(userID, title, author, 0)
		assert.Error(t, err)
		assert.Nil(t, content)
		assert.Equal(t, "userid is required", err.Error())
	})

	t.Run("should fail if userID is invalid", func(t *testing.T) {
		userID := "12345"
		title := "Test Title"

		content, err := uc.CreateContent(userID, title, author, 0)
		assert.Error(t, err)
		assert.Nil(t, content)
		assert.Equal(t, "invalid user ID format", err.Error())
	})
}

func TestContentUsecase_Update(t *testing.T) {
	mockRepo := NewMockContentRepo()
	uc := &ContentUsecase{ContentRepo: mockRepo}
	author := "John"
	userID := primitive.NewObjectID().Hex()
	title := "Test Title"
	editTitle := "Test Edit Title"
	content, err := uc.CreateContent(userID, title, author, 0)
	assert.NoError(t, err)
	contentID := content.ID.Hex()

	t.Run("should update content successfully", func(t *testing.T) {
		content, err := uc.UpdateContent(contentID, userID, editTitle)
		assert.NoError(t, err)
		assert.Equal(t, editTitle, content.Title)
	})

	t.Run("should update content fail if title is empty", func(t *testing.T) {
		content, err := uc.UpdateContent(contentID, userID, "")
		assert.Error(t, err)
		assert.Nil(t, content)
	})

	t.Run("should update content fail if contentid is empty", func(t *testing.T) {
		content, err := uc.UpdateContent("", userID, editTitle)
		assert.Error(t, err)
		assert.Nil(t, content)
	})

	t.Run("should update content fail if contentid is invalid", func(t *testing.T) {
		content, err := uc.UpdateContent("12345", userID, editTitle)
		assert.Error(t, err)
		assert.Nil(t, content)
	})

	t.Run("should update content fail if userid is empty", func(t *testing.T) {
		content, err := uc.UpdateContent(contentID, "", editTitle)
		assert.Error(t, err)
		assert.Nil(t, content)
	})

	t.Run("should update content fail if userid is invalid", func(t *testing.T) {
		content, err := uc.UpdateContent(contentID, "12345", editTitle)
		assert.Error(t, err)
		assert.Nil(t, content)
	})
}

func TestContentUsecase_VoteV1(t *testing.T) {
	mockRepo := NewMockContentRepo()
	uc := &ContentUsecase{ContentRepo: mockRepo}

	userID := primitive.NewObjectID().Hex()
	author := "John"
	title := "Test Title"
	content, err := uc.CreateContent(userID, title, author, 0)
	assert.NoError(t, err)
	contentID := content.ID.Hex()

	t.Run("should update vote successfully", func(t *testing.T) {
		err := uc.ContentVoteV1(userID, contentID)
		assert.NoError(t, err)
		content, err := mockRepo.FindByID(contentID)
		assert.NoError(t, err)
		// log.Printf("content.VotedBy: %#v", content.VotedBy)
		// log.Printf("content.Vote: %#v", content.Vote)
		assert.Equal(t, content.Vote, 1)
	})

	t.Run("should update vote fail if content already voted", func(t *testing.T) {
		err := uc.ContentVoteV1(userID, contentID)
		assert.Error(t, err)
		content, err := mockRepo.FindByID(contentID)
		assert.NoError(t, err)
		// log.Printf("content.VotedBy: %#v", content.VotedBy)
		// log.Printf("content.Vote: %#v", content.Vote)
		assert.Equal(t, content.Vote, 1)
	})

	// userID2 := primitive.NewObjectID().Hex()
	// title := "Test Title"
	content2, err := uc.CreateContent(userID, title, author, 0)
	assert.NoError(t, err)
	contentID2 := content2.ID.Hex()
	t.Run("should update vote fail if user already voted another content", func(t *testing.T) {
		err := uc.ContentVoteV1(userID, contentID2)
		assert.Error(t, err)
		content, err := mockRepo.FindByID(contentID)
		assert.NoError(t, err)
		// log.Printf("content.VotedBy: %#v", content.VotedBy)
		// log.Printf("content.Vote: %#v", content.Vote)
		assert.Equal(t, content.Vote, 1)
	})

	t.Run("should update vote fail if userid is empty", func(t *testing.T) {
		err := uc.ContentVoteV1("", contentID2)
		assert.Error(t, err)
		content, err := mockRepo.FindByID(contentID)
		assert.NoError(t, err)
		// log.Printf("content.VotedBy: %#v", content.VotedBy)
		// log.Printf("content.Vote: %#v", content.Vote)
		assert.Equal(t, content.Vote, 1)
	})

	t.Run("should update vote fail if id is empty", func(t *testing.T) {
		err := uc.ContentVoteV1(userID, "")
		assert.Error(t, err)
		content, err := mockRepo.FindByID(contentID)
		assert.NoError(t, err)
		// log.Printf("content.VotedBy: %#v", content.VotedBy)
		// log.Printf("content.Vote: %#v", content.Vote)
		assert.Equal(t, content.Vote, 1)
	})

}
