package user

import (
	"aerolink_backend/package/response"
	"database/sql"
	"log"
	"net/http"
	"strconv"
)

type Handler struct {
	service *Service
}

func NewHandler(db *sql.DB) *Handler {
	repo := NewRepository(db)
	service := NewService(repo)
	return &Handler{service: service}
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	userIDStr := r.URL.Query().Get("id")
	if userIDStr == "" {
		response.Error(w, http.StatusBadRequest, "User ID is required")
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.service.GetUser(userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get user")
		log.Printf("GetUser error: %v", err)
		return
	}

	response.Success(w, http.StatusOK, "success", user)
}
