package mongodb

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func EnsureIndexes(db *mongo.Database) error {
	userCollection := db.Collection("users")
	contentCollection := db.Collection("contents")

	// สร้าง unique index สำหรับ username
	_, err := userCollection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// สร้าง unique index สำหรับ email
	_, err = userCollection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// สร้าง index สำหรับ user_id ใน collection contents
	_, err = contentCollection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.D{{Key: "user_id", Value: 1}},
	})
	if err != nil {
		return err
	}

	log.Println("✅ MongoDB indexes created/ensured successfully")
	return nil
}
