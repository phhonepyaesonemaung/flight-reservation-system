package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"strings"

	"aerolink_backend/package/jwt"
	"aerolink_backend/package/response"
)

// ContextKey is a type for context keys
type ContextKey string

const (
	// UserIDKey is the key for user ID in context
	UserIDKey ContextKey = "user_id"
)

// AuthMiddleware validates JWT token from Authorization header
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			response.Error(w, http.StatusUnauthorized, "Authorization header is required")
			return
		}

		// Check if it starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			response.Error(w, http.StatusUnauthorized, "Authorization header must start with 'Bearer '")
			return
		}

		// Extract token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Validate token
		claims, err := jwt.ValidateAccessToken(tokenString)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		r = r.WithContext(ctx)

		// Call the next handler
		next(w, r)
	}
}

// GetUserID extracts user ID from request context
func GetUserID(r *http.Request) int {
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		return 0
	}
	return userID
}

// AdminMiddleware validates JWT and ensures the user is an admin (exists in admin_users).
// Use for admin-only routes. Pass the database connection.
func AdminMiddleware(db *sql.DB, next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r)
		if userID == 0 {
			response.Error(w, http.StatusUnauthorized, "Unauthorized")
			return
		}
		var id int
		err := db.QueryRow("SELECT id FROM admin_users WHERE id = $1", userID).Scan(&id)
		if err != nil || id == 0 {
			response.Error(w, http.StatusForbidden, "Admin access required")
			return
		}
		next(w, r)
	})
}
