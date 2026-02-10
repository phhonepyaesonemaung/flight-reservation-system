package middleware

import (
	"context"
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
