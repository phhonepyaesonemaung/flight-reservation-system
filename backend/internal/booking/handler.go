package booking

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"aerolink_backend/internal/program"
	"aerolink_backend/package/middleware"
	"aerolink_backend/package/response"
)

type Handler struct {
	service        *Service
	programService *program.Service
}

func NewHandler(db *sql.DB, programService *program.Service) *Handler {
	repo := NewRepository(db)
	service := NewService(repo)
	return &Handler{service: service, programService: programService}
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

	// Apply program discount if user has active membership (backend is source of truth)
	if h.programService != nil {
		if membership, _ := h.programService.GetActiveMembership(userID); membership != nil && membership.DiscountPercent > 0 {
			req.TotalAmount = req.TotalAmount * (1 - float64(membership.DiscountPercent)/100)
		}
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

func (h *Handler) GetUserBookings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	if userID == 0 {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	list, err := h.service.GetUserBookings(userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "success", list)
}

func (h *Handler) GetBookingReceipt(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	if userID == 0 {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		response.Error(w, http.StatusBadRequest, "id is required")
		return
	}
	bookingID, err := strconv.Atoi(idStr)
	if err != nil || bookingID <= 0 {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	receipt, err := h.service.GetBookingReceipt(bookingID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			response.Error(w, http.StatusNotFound, "booking not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "success", receipt)
}

func (h *Handler) CheckIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	if userID == 0 {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	var req struct {
		BookingID int `json:"booking_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.BookingID <= 0 {
		response.Error(w, http.StatusBadRequest, "booking_id is required")
		return
	}
	if err := h.service.CheckIn(req.BookingID, userID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		if strings.Contains(err.Error(), "24 hours") || strings.Contains(err.Error(), "45 minutes") || strings.Contains(err.Error(), "already departed") {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "You are checked in. Have a great flight!", nil)
}

func (h *Handler) ListAllBookings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	list, err := h.service.GetAllBookingsForAdmin()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "success", list)
}
