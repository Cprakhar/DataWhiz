FROM golang:1.24-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the Go modules manifests
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download && go mod verify

# Copy the source code
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o ./bin/server ./cmd/server.go

# Expose the port the app runs on
EXPOSE 8080

# Command to run the executable
CMD ["./bin/server"]