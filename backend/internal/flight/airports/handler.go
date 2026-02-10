package airports

import (
	"aerolink_backend/package/response"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
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

func (h *Handler) CreateAirport(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req CreateAirportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.CreateAirport(&req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err.Error() {
		case "code already exists":
			statusCode = http.StatusConflict
		default:
			if strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "invalid") || strings.Contains(err.Error(), "must be") {
				statusCode = http.StatusBadRequest
			}
		}
		log.Printf("Create airport error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "success", resp)
}

func (h *Handler) GetAllAirports(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	airports, err := h.service.GetAllAirports()
	if err != nil {
		log.Printf("Get all airports error: %v", err)
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "success", airports)
}
