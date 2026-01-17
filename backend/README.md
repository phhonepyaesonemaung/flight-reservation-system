## 📋 Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally without Docker)

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone or navigate to the project directory**
   ```bash
   cd op_backend
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start a PostgreSQL container
   - Build and start the Go application
   - Automatically create the database tables

3. **The API will be available at:**
   - Server: `http://localhost:8080`
   - Health check: `http://localhost:8080/health`

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   go mod download
   ```

2. **Set up PostgreSQL**
   - Install PostgreSQL locally
   - Create a database named `ecom_db`
   - Or update the connection string in `main.go`

3. **Set environment variables (optional)**
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   export DB_NAME=op_db
   export PORT=8080
   export JWT_ACCESS_SECRET=your-secret-key-here
   export JWT_REFRESH_SECRET=your-refresh-secret-key-here
   ```

4. **Run the application**
   ```bash
   go run cmd/app/main.go
   ```