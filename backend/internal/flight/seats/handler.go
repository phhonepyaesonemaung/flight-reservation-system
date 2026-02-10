package seats

import (
	"aerolink_backend/package/response"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type Handler struct {
	service *Service
}

func NewHandler(db *sql.DB) *Handler {
	repo := NewRepository(db)
	service := NewService(repo)
	return &Handler{service: service}
}

func (h *Handler) CreateSeat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req CreateSeatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.CreateSeat(&req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err.Error() {
		default:
			if strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "invalid") || strings.Contains(err.Error(), "must be") {
				statusCode = http.StatusBadRequest
			}
		}
		log.Printf("Create seat error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "success", resp)
}

func (h *Handler) GetAllSeats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get optional query parameter
	aircraftIDStr := r.URL.Query().Get("aircraft_id")
	var aircraftID *int

	if aircraftIDStr != "" {
		// Parse to integer
		id, err := strconv.Atoi(aircraftIDStr)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid aircraft_id: must be a number")
			return
		}
		aircraftID = &id
	}

	seats, err := h.service.GetAllSeats(aircraftID)
	if err != nil {
		log.Printf("Get all seats error: %v", err)
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "success", seats)
}

func (h *Handler) CreateFlightSeats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	result, err := h.service.CreateFlightSeatsForAll()
	if err != nil {
		log.Printf("Create flight seats error: %v", err)
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "success", result)
}
