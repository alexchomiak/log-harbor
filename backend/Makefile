all: clean docs compile

dev: clean docs run

clean:
	rm -rf ./docs

docs:
	go install github.com/swaggo/swag/cmd/swag@latest
	echo "Generating docs..."
	swag init --parseDependency --parseInternal
	
run:
	go run main.go

compile:
	go build -ldflags "-s -w" -o log-harbor


