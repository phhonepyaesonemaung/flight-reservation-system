package flights

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

func (h *Handler) CreateFlight(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req CreateFlightRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.CreateFlight(&req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err.Error() {
		default:
			if strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "invalid") || strings.Contains(err.Error(), "must be") {
				statusCode = http.StatusBadRequest
			}
		}
		log.Printf("Create flight error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "success", resp)
}

func (h *Handler) GetAllFlights(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get optional query parameter
	departureAirportIDStr := r.URL.Query().Get("departure_airport_id")
	var departureAirportID *int

	if departureAirportIDStr != "" {
		// Parse to integer
		id, err := strconv.Atoi(departureAirportIDStr)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid departure_airport_id: must be a number")
			return
		}
		departureAirportID = &id
	}

	flights, err := h.service.GetAllFlights(departureAirportID)
	if err != nil {
		log.Printf("Get all flights error: %v", err)
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "success", flights)
}
