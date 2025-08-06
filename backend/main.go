package main

import (
	"pretest/qoute/configs"
	"pretest/qoute/server"
)

func main() {

	config := configs.GetConfig() // Load configuration if needed
	// mongoDB := database.NewMongoDatabase(config)
	// fmt.Println(mongoDB)
	// log.Printf("main.mongoDB: %p", &mongoDB)
	// collection := mongoClient.Database("qoute").Collection("quotes")
	// repo := repository.NewMongoQuoteRepository(collection)

	// Start the server using the Echo implementation
	app := server.NewEchoV4Server(config)
	app.Start()

	// Start the server using the iris implementation
	// app := server.NewIrisServer(config)
	// app.Start()

}
