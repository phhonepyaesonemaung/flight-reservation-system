package booking

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"aerolink_backend/package/middleware"
	"aerolink_backend/package/response"
)

type Handler struct {
	service *Service
}

func NewHandler(db *sql.DB) *Handler {
	repo := NewRepository(db)
	service := NewService(repo)
	return &Handler{service: service}
}

func (h *Handler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	if userID == 0 {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.CreateBooking(userID, &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "must be") {
			statusCode = http.StatusBadRequest
		}
		response.Error(w, statusCode, err.Error())
		return
	}
	response.Success(w, http.StatusCreated, "Booking created", resp)
}
