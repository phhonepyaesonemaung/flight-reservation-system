package response

import (
	"encoding/json"
	"log"
	"net/http"
)

type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func JSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}

func Success(w http.ResponseWriter, statusCode int, message string, data interface{}) {
	response := SuccessResponse{
		Message: message,
		Data:    data,
	}
	JSON(w, statusCode, response)
}

func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, map[string]string{"error": message})
}
