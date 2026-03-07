package program

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

func (h *Handler) ListTiers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	tiers, err := h.service.ListTiers()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "success", tiers)
}

func (h *Handler) GetMyMembership(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	if userID == 0 {
		response.Success(w, http.StatusOK, "success", nil)
		return
	}
	membership, err := h.service.GetActiveMembership(userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "success", membership)
}

func (h *Handler) Purchase(w http.ResponseWriter, r *http.Request) {
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
		Tier string `json:"tier"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	req.Tier = strings.TrimSpace(strings.ToLower(req.Tier))
	if req.Tier == "" {
		response.Error(w, http.StatusBadRequest, "tier is required (silver, gold, or diamond)")
		return
	}
	membership, err := h.service.Purchase(userID, req.Tier)
	if err != nil {
		if strings.Contains(err.Error(), "tier must be") || strings.Contains(err.Error(), "tier not found") {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(w, http.StatusCreated, "Program purchased successfully", membership)
}
