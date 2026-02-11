package main

import (
	"aerolink_backend/internal/auth"
	"aerolink_backend/internal/booking"
	"aerolink_backend/internal/flight/aircrafts"
	"aerolink_backend/internal/flight/airports"
	"aerolink_backend/internal/flight/flights"
	"aerolink_backend/internal/flight/seats"
	"aerolink_backend/internal/user"
	"aerolink_backend/package/database"
	"aerolink_backend/package/jwt"
	"aerolink_backend/package/middleware"
	"aerolink_backend/package/response"
	"log"
	"net/http"
	"os"
)

func main() {
	jwt.InitJWT()

	dbHost := getEnv("DB_HOST", "postgres")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "aerolink_db")

	if err := database.InitDB(dbHost, dbPort, dbUser, dbPassword, dbName); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	// Auth routes
	authHandler := auth.NewHandler(database.DB)
	userHandler := user.NewHandler(database.DB)
	airportHandler := airports.NewHandler(database.DB)
	aircraftHandler := aircrafts.NewHandler(database.DB)
	flightHandler := flights.NewHandler(database.DB)
	seatHandler := seats.NewHandler(database.DB)
	bookingHandler := booking.NewHandler(database.DB)

	http.HandleFunc("/api/auth/signup", authHandler.Signup)
	http.HandleFunc("/api/auth/signin", authHandler.Signin)
	http.HandleFunc("/api/auth/refresh", authHandler.RefreshToken)
	http.HandleFunc("/api/auth/verify-email", authHandler.VerifyEmail)

	// User routes (protected)
	http.HandleFunc("/api/user/get", middleware.AuthMiddleware(userHandler.GetUser))

	// Flight routes (protected)
	http.HandleFunc("/api/flight/create-airport", airportHandler.CreateAirport)
	http.HandleFunc("/api/flight/get-all-airports", airportHandler.GetAllAirports)
	http.HandleFunc("/api/flight/create-aircraft", aircraftHandler.CreateAircraft)
	http.HandleFunc("/api/flight/get-all-aircrafts", aircraftHandler.GetAllAircrafts)
	http.HandleFunc("/api/flight/create-flight", flightHandler.CreateFlight)
	http.HandleFunc("/api/flight/get-all-flights", flightHandler.GetAllFlights)
	http.HandleFunc("/api/flight/backfill-flight-cabin-inventory", flightHandler.BackfillFlightCabinInventory)
	http.HandleFunc("/api/flight/search", flightHandler.SearchFlights)
	http.HandleFunc("/api/flight/create-seat", seatHandler.CreateSeat)
	http.HandleFunc("/api/flight/get-all-seats", seatHandler.GetAllSeats)
	http.HandleFunc("/api/flight/create-flight-seats", seatHandler.CreateFlightSeats)

	// Booking (protected)
	http.HandleFunc("/api/booking/create", middleware.AuthMiddleware(bookingHandler.CreateBooking))

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		response.Success(w, http.StatusOK, "success", map[string]string{"status": "ok"})
	})

	// Reset sequences after importing data with explicit IDs (avoids "duplicate key id" on create)
	http.HandleFunc("/api/data/reset-sequences", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		if err := database.ResetSequences(); err != nil {
			log.Printf("Reset sequences error: %v", err)
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		response.Success(w, http.StatusOK, "Sequences reset successfully; new creates will get the next ids.", nil)
	})

	// Start server with CORS middleware
	port := getEnv("PORT", "8080")
	allowedOrigin := getEnv("CORS_ORIGIN", "http://localhost:3000")
	corsHandler := corsMiddleware(allowedOrigin, http.DefaultServeMux)
	log.Printf("Server starting on port %s", port)

	if err := http.ListenAndServe(":"+port, corsHandler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// corsMiddleware wraps a handler to add CORS headers and handle OPTIONS preflight.
func corsMiddleware(allowOrigin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
