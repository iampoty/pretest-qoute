package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Content struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `bson:"user_id" json:"user_id"`
	Author    string             `bson:"author" json:"author"`
	VotedBy   string             `bson:"voted_by" json:"voted_by"`
	Title     string             `bson:"title" json:"title"`
	Vote      int                `bson:"vote" json:"vote"`
	CanVote   bool               `bson:"-" json:"can_vote"`
	CanEdit   bool               `bson:"-" json:"can_edit"`
	CanDelete bool               `bson:"-" json:"can_delete"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type ContentFilter struct {
	UserID    string
	ContentID string
	Title     string
	Vote      string
	VoteNum   int
	CreatedAt string
}

type ContentOption struct {
	PageNum  int
	LimitNum int
	Page     string
	Limit    string
	Sort     string
	Last     string
}
