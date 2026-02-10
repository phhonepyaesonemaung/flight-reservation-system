package aircrafts

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

func (h *Handler) CreateAircraft(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req CreateAircraftRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.CreateAircraft(&req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err.Error() {
		default:
			if strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "invalid") || strings.Contains(err.Error(), "must be") {
				statusCode = http.StatusBadRequest
			}
		}
		log.Printf("Create aircraft error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "success", resp)
}

func (h *Handler) GetAllAircrafts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	aircrafts, err := h.service.GetAllAircrafts()
	if err != nil {
		log.Printf("Get all aircrafts error: %v", err)
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "success", aircrafts)
}
