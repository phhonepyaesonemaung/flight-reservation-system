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
   # Email verification (magic link on signup)
   export SMTP_HOST=smtp.example.com
   export SMTP_PORT=587
   export SMTP_USER=your-smtp-user
   export SMTP_PASS=your-smtp-password
   export FROM_EMAIL=noreply@example.com
   export APP_URL=http://localhost:3000
   ```

4. **Run the application**
   ```bash
   go run cmd/app/main.go
   ```

## 📥 Data import and "duplicate key" fix

If you **import data** (e.g. from an export) with explicit IDs, PostgreSQL’s sequences are not updated. The next create (flight, airport, etc.) can then try to use id `1` again and fail with a duplicate key error.

**After importing data**, reset sequences once:

```bash
curl -X POST http://localhost:8080/api/data/reset-sequences
```

Then creating new records via the API will use the next available IDs.

## 📧 Email verification (signup)

New signups receive a **magic link** by email to verify their account. Until they verify, they cannot sign in.

- Set `SMTP_HOST`, `SMTP_PORT`, `FROM_EMAIL` (and optionally `SMTP_USER`, `SMTP_PASS`) to send mail.
- `APP_URL` is the frontend base URL used in the verification link (e.g. `http://localhost:3000`).
- Existing users (before this feature) are treated as already verified so they can still sign in.