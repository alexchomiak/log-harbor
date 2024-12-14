package container

import (
	"context"
	"log"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gofiber/fiber/v2"
)

// List Running Containers godoc
//
//	@Summary		Lists Running Containers on Host
//	@Description	This API endpoint lists all running containers leveraging the Docker SDK.
//	@Tags			containers
//	@Accept			json
//	@Produce		json
//	@Success		200	{array}		types.ContainerJSON "List of Running Containers"
//	@Failure		500	{object}	error
//	@Router			/api/container/list [get]
func ListRunningContainers(c *fiber.Ctx) error {
	// Create a Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create Docker client: "+err.Error())
	}
	defer cli.Close()

	// Get a list of all running containers
	containers, err := cli.ContainerList(c.Context(), container.ListOptions{All: false})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to list containers: "+err.Error())
	}

	// Fetch detailed metadata for each container
	var containerDetails []types.ContainerJSON
	for _, container := range containers {
		// Inspect each container to get full metadata
		containerJSON, err := cli.ContainerInspect(context.Background(), container.ID)
		if err != nil {
			log.Printf("Error inspecting container %s: %v", container.ID, err)
			continue
		}
		containerDetails = append(containerDetails, containerJSON)
	}

	// Return the details as JSON
	return c.JSON(containerDetails)
}
