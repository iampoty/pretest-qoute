package mongodb

import (
	"context"
	"pretest/qoute/internal/domain"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoContentRepository struct {
	collection *mongo.Collection
}

func NewMongoContentRepository(db *mongo.Database) domain.ContentRepository {
	return &MongoContentRepository{
		collection: db.Collection("contents"),
	}
}

func (r *MongoContentRepository) Create(content *domain.Content) error {
	_, err := r.collection.InsertOne(context.Background(), content)
	return err
}

func (r *MongoContentRepository) Update(content *domain.Content) error {
	updateDoc := bson.M{
		"title":      content.Title,
		"updated_at": content.UpdatedAt,
	}
	_, err := r.collection.UpdateOne(context.Background(), bson.M{"_id": content.ID}, bson.M{"$set": updateDoc})
	return err
}

func (r *MongoContentRepository) UpdateVote(content *domain.Content) error {
	updateDoc := bson.M{
		"voted_by": content.VotedBy,
	}

	_, err := r.collection.UpdateOne(context.Background(), bson.M{"_id": content.ID}, bson.M{"$set": updateDoc, "$inc": bson.M{"vote": 1}})
	return err
}

func (r *MongoContentRepository) FindAll(filter *domain.ContentFilter, option *domain.ContentOption) (contents []*domain.Content, lastid string, total int, err error) {
	// var contents []*domain.Content
	total = 0
	contents = []*domain.Content{}

	bsonFilter := bson.M{}

	if filter.UserID != "" {
		bsonFilter["user_id"] = filter.UserID
	}
	if filter.ContentID != "" {
		bsonFilter["_id"], _ = primitive.ObjectIDFromHex(filter.ContentID)
	}
	if filter.Title != "" {
		bsonFilter["title"] = bson.M{"$regex": filter.Title, "$options": "i"}
	}
	if filter.Vote != "" {
		voteNum, err := strconv.Atoi(filter.Vote)
		if err == nil {
			bsonFilter["vote"] = voteNum
		}
	}

	if filter.CreatedAt != "" {
		createdAt, err := time.Parse("2006-01-02", filter.CreatedAt)
		if err == nil {
			// bsonFilter["created_at"] = createdAt
			bsonFilter["$and"] = []bson.M{
				{"created_at": bson.M{"$gte": createdAt}},
				{"created_at": bson.M{"$lt": createdAt.Add(24 * time.Hour)}},
			}
		}
	}

	findOptions := options.Find()

	switch option.Sort {
	case "vote":
		// findOptions.SetSort(bson.M{"vote": -1, "created_at": -1})
		findOptions.SetSort(bson.D{
			{Key: "vote", Value: -1},
			{Key: "created_at", Value: -1},
		})
	case "oldest":
		findOptions.SetSort(bson.M{"created_at": 1})
	case "latest":
	default:
		findOptions.SetSort(bson.M{"created_at": -1})
	}

	// log.Printf("mongodb.FindAll.bsonfilter: %#v", bsonFilter)
	// log.Printf("mongodb.FindAll.findOptions: %#v", findOptions)

	limit := 10
	if option.Limit != "" {
		limit, _ = strconv.Atoi(option.Limit)
		if limit <= 0 {
			limit = 10 // Default to 10 if limit is not specified or invalid
		}
	}

	// if option.Last != "" {
	// 	lastID, err := primitive.ObjectIDFromHex(option.Last)
	// 	if err == nil {
	// 		if option.Sort == "oldest" {
	// 			bsonFilter["_id"] = bson.M{"$gte": lastID} // Find contents with ID greater than last ID
	// 		} else {
	// 			bsonFilter["_id"] = bson.M{"$lte": lastID} // Find contents with ID greater than last ID
	// 		}
	// 	}
	// }
	page := 1
	if option.Page != "" {
		page, _ = strconv.Atoi(option.Page)
	}
	if page < 1 {
		page = 1
	}

	findOptions.SetLimit(int64(limit + 1))
	findOptions.SetSkip(int64((page - 1) * limit))

	// log.Printf("option.Page %s", option.Page)
	// log.Printf("option.Limit %s", option.Limit)
	// log.Printf("page %d", page)
	// log.Printf("limit: %d", limit)
	// log.Printf("SetSkip %d", ((page - 1) * limit))
	// log.Printf("SetLimit %d", (limit + 1))

	cursor, err := r.collection.Find(context.Background(), bsonFilter, findOptions)
	if err != nil {
		return nil, "", total, err
	}
	defer cursor.Close(context.Background())

	count := 1
	for cursor.Next(context.Background()) {
		var c domain.Content
		if err := cursor.Decode(&c); err != nil {
			return nil, "", total, err
		}
		// log.Printf("count: %d", count)
		if count > limit {
			// log.Printf("count: %d > limit: %d > lastid: %s", count, limit, c.ID.Hex())
			lastid = c.ID.Hex()
		} else {
			contents = append(contents, &c)
		}
		count++
	}

	// if len(contents) > 0 {
	// lastid = contents[len(contents)-1].ID.Hex() // Get the last ID from the results
	// } else {
	//contents = []*domain.Content{}
	// }
	if option.Last != "" {
		delete(bsonFilter, "_id")
	}
	total64, _ := r.collection.CountDocuments(context.Background(), bsonFilter)
	total = int(total64)
	return contents, lastid, total, nil
}

func (r *MongoContentRepository) FindByID(id string) (*domain.Content, error) {
	objid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	result := r.collection.FindOne(context.Background(), bson.M{"_id": objid})
	if result.Err() != nil {
		return nil, result.Err()
	}

	var content domain.Content
	if err := result.Decode(&content); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No content found
		}
		return nil, err
	}
	return &content, nil
	// defer cursor.Close(context.Background())

	// var contents []*domain.Content
	// for cursor.Next(context.Background()) {
	// 	var c domain.Content
	// 	if err := cursor.Decode(&c); err != nil {
	// 		return nil, err
	// 	}
	// 	contents = append(contents, &c)
	// }
	// return contents, nil
}

func (r *MongoContentRepository) FindByUserID(userID string) ([]*domain.Content, error) {
	cursor, err := r.collection.Find(context.Background(), bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var contents []*domain.Content
	for cursor.Next(context.Background()) {
		var c domain.Content
		if err := cursor.Decode(&c); err != nil {
			return nil, err
		}
		contents = append(contents, &c)
	}
	return contents, nil
}

func (r *MongoContentRepository) FindByVotedUser(userID string) ([]*domain.Content, error) {
	cursor, err := r.collection.Find(context.Background(), bson.M{"voted_by": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var contents []*domain.Content
	for cursor.Next(context.Background()) {
		var c domain.Content
		if err := cursor.Decode(&c); err != nil {
			return nil, err
		}
		contents = append(contents, &c)
	}
	return contents, nil
}
