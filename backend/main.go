package main

import (
	"alexchomiak/go-docker-api/handlers/container"
	"alexchomiak/go-docker-api/handlers/ws"
	"log"
	"os"

	"github.com/gofiber/contrib/swagger"

	"github.com/gofiber/contrib/websocket"

	"github.com/gofiber/fiber/v2"
)

// @title Log Harbor API
// @version 1.0
// @description API Backend for Log Harbor Application
// @host localhost:3000
// @BasePath /
func main() {
	// Initialize Fiber app
	app := fiber.New()

	cfg := swagger.Config{
		BasePath: "/",
		FilePath: "./docs/swagger.json",
		Path:     "/",
		Title:    "Log Harbor API Docs",
	}

	app.Use(swagger.New(cfg))

	// * Container APIS
	app.Get("/api/container/list", container.ListRunningContainers)

	// * WebSocket Handlers
	// Middleware to upgrade to WebSocket
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/logs/:id", websocket.New(ws.LogStreamHandler))

	app.Static("/", "./public")

	// Determine port (default: 3000)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Start server
	log.Printf("Server running on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
