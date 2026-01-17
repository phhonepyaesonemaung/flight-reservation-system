# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod files first
COPY go.mod ./

# Download dependencies (this will generate go.sum if it doesn't exist)
RUN go mod download

# Copy source code
COPY . .

# Build the application from cmd/app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/app

# Final stage
FROM alpine:latest

WORKDIR /root/

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]