package auth

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

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

func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.Signup(&req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err.Error() {
		case "email already exists":
			statusCode = http.StatusConflict
		case "phone already exists":
			statusCode = http.StatusConflict
		case "username already exists":
			statusCode = http.StatusConflict
		default:
			if strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "invalid") || strings.Contains(err.Error(), "must be") {
				statusCode = http.StatusBadRequest
			}
		}
		log.Printf("Signup error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "success", resp)
}

func (h *Handler) Signin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req SigninRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Call service to handle business logic
	resp, err := h.service.Signin(&req)
	if err != nil {
		statusCode := http.StatusUnauthorized
		if strings.Contains(err.Error(), "required") {
			statusCode = http.StatusBadRequest
		}
		if strings.Contains(err.Error(), "email not verified") {
			statusCode = http.StatusForbidden
		}
		log.Printf("Signin error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "success", resp)
}

func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Call service to handle business logic
	resp, err := h.service.RefreshToken(&req)
	if err != nil {
		statusCode := http.StatusUnauthorized
		if strings.Contains(err.Error(), "required") {
			statusCode = http.StatusBadRequest
		}
		log.Printf("RefreshToken error: %v", err)
		response.Error(w, statusCode, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "success", resp)
}

func (h *Handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	if token == "" {
		response.Error(w, http.StatusBadRequest, "verification token is required")
		return
	}
	// If the request looks like a browser (user opened the API link by mistake), redirect to frontend
	accept := r.Header.Get("Accept")
	if strings.Contains(accept, "text/html") {
		appURL := strings.TrimSuffix(os.Getenv("APP_URL"), "/")
		if appURL == "" {
			appURL = "http://localhost:3000"
		}
		redirectURL := appURL + "/auth/verify-email?token=" + url.QueryEscape(token)
		http.Redirect(w, r, redirectURL, http.StatusFound)
		return
	}
	resp, err := h.service.VerifyEmail(token)
	if err != nil {
		log.Printf("VerifyEmail error (token len=%d): %v", len(token), err)
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Email verified successfully", resp)
}
