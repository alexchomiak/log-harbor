package main

import (
	"alexchomiak/go-docker-api/handlers/container"
	"alexchomiak/go-docker-api/handlers/ws"
	"log"
	"os"

	"github.com/gofiber/contrib/websocket"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Initialize Fiber app
	app := fiber.New()

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
