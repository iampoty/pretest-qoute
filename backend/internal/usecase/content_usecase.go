package usecase

import (
	"errors"
	"log"
	"pretest/qoute/internal/domain"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ContentUsecase struct {
	ContentRepo domain.ContentRepository
}

func (uc *ContentUsecase) ListContent(currentUser string, filter *domain.ContentFilter, option *domain.ContentOption) ([]*domain.Content, string, int, error) {

	contents, lastid, total, err := uc.ContentRepo.FindAll(filter, option)
	if err != nil {
		log.Printf("usecase.ListContent.err : %s", err.Error())
		return nil, "", 0, errors.New("failed to list contents")
	}

	// ตรวจสอบว่า user เคย vote quote ไหนแล้วหรือยัง
	alreadyVoted := false
	if currentUser != "" {
		votedContent, err := uc.ContentRepo.FindByVotedUser(currentUser)
		if err == nil && votedContent != nil {
			alreadyVoted = true
		}
	}

	for i, v := range contents {
		if v.UserID == currentUser {
			contents[i].CanEdit = true
			contents[i].CanDelete = true
		}
		if v.Vote == 0 && !alreadyVoted {
			contents[i].CanVote = true
		}
	}

	// for i := 0; i < len(contents); i++ {
	// 	content := contents[i]
	// 	if content.UserID == currentUser {
	// 		contents[i].CanEdit = true
	// 		contents[i].CanDelete = true
	// 	}

	// 	if content.Vote == 0 {
	// 		contents[i].CanVote = true
	// 	}
	// }

	return contents, lastid, total, nil
}

func (uc *ContentUsecase) UpdateContent(contentID, userID, title string) (*domain.Content, error) {
	if strings.TrimSpace(contentID) == "" {
		return nil, errors.New("content ID is required")
	}

	if strings.TrimSpace(userID) == "" {
		return nil, errors.New("user ID is required")
	}

	if strings.TrimSpace(title) == "" {
		return nil, errors.New("title is required")
	}

	id, err := primitive.ObjectIDFromHex(contentID)
	if err != nil {
		return nil, errors.New("invalid content ID format")
	}
	// ตรวจสอบว่ามี content ที่ตรงกับ ID นี้อยู่หรือไม่
	contentO, err := uc.ContentRepo.FindByID(contentID)
	if err != nil {
		return nil, err
	}

	if contentO == nil {
		return nil, errors.New("content not found")
	}

	if contentO.UserID != userID {
		return nil, errors.New("not have permission")
	}

	content := &domain.Content{
		ID:        id,
		UserID:    userID,
		Title:     title,
		UpdatedAt: time.Now(),
	}

	err = uc.ContentRepo.Update(content)

	return content, err
}

func (uc *ContentUsecase) CreateContent(userID, title, author string, vote int) (*domain.Content, error) {
	if strings.TrimSpace(userID) == "" {
		return nil, errors.New("userid is required")
	}

	if _, err := primitive.ObjectIDFromHex(userID); err != nil {
		return nil, errors.New("invalid user ID format")
	}

	if strings.TrimSpace(title) == "" {
		return nil, errors.New("title is required")
	}

	objid := primitive.NewObjectID()
	content := &domain.Content{
		ID:        objid,
		UserID:    userID,
		Title:     title,
		Vote:      vote,
		Author:    author,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := uc.ContentRepo.Create(content)
	return content, err
}

// Vote ปกติ
// Vote ได้ 1 ครั้งต่อ 1 content
func (uc *ContentUsecase) ContentVoteV2(userID, contentID string) error {
	return nil
}

// Quote แต่ละอันจะมีผู้ใช้ คนเดียวเท่านั้นที่ vote ได้
// และเมื่อมี 1 vote แล้ว จะ vote เพิ่มไม่ได้อีกเลย
func (uc *ContentUsecase) ContentVoteV1(userID, contentID string) error {
	if strings.TrimSpace(userID) == "" {
		return errors.New("userid is required")
	}

	if strings.TrimSpace(contentID) == "" {
		return errors.New("id is required")
	}

	quote, err := uc.ContentRepo.FindByID(contentID)
	if err != nil {
		return err
	}

	if quote.VotedBy != "" {
		return errors.New("quote already voted")
	}

	// ตรวจสอบว่า user เคย vote quote ไหนแล้วหรือยัง
	votedContent, err := uc.ContentRepo.FindByVotedUser(userID)
	if err == nil && votedContent != nil {
		return errors.New("you already voted another quote")
	}

	// ทำการ vote
	quote.VotedBy = userID
	return uc.ContentRepo.UpdateVote(quote)
	// return nil
}
