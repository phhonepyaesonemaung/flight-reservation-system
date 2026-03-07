package main

import (
	"aerolink_backend/internal/admin"
	"aerolink_backend/internal/auth"
	"aerolink_backend/internal/booking"
	"aerolink_backend/internal/flight/aircrafts"
	"aerolink_backend/internal/program"
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
	"strings"
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

	// Keep SERIAL sequences in sync with existing rows (avoids "duplicate key" on create after seed/import)
	if err := database.ResetSequences(); err != nil {
		log.Printf("Warning: reset sequences failed (create may fail if data was imported with explicit IDs): %v", err)
	}

	// Auth routes
	authHandler := auth.NewHandler(database.DB)
	userHandler := user.NewHandler(database.DB)
	airportHandler := airports.NewHandler(database.DB)
	aircraftHandler := aircrafts.NewHandler(database.DB)
	flightHandler := flights.NewHandler(database.DB)
	seatHandler := seats.NewHandler(database.DB)
	programHandler := program.NewHandler(database.DB)
	bookingHandler := booking.NewHandler(database.DB, program.NewService(program.NewRepository(database.DB)))
	adminHandler := admin.NewHandler(database.DB)

	http.HandleFunc("/api/auth/signup", authHandler.Signup)
	http.HandleFunc("/api/auth/signin", authHandler.Signin)
	http.HandleFunc("/api/auth/refresh", authHandler.RefreshToken)
	http.HandleFunc("/api/auth/verify-email", authHandler.VerifyEmail)
	http.HandleFunc("/api/auth/admin/signin", authHandler.AdminSignin)
	http.HandleFunc("/api/auth/admin/seed", authHandler.AdminSeed)

	// User routes (protected)
	http.HandleFunc("/api/user/get", middleware.AuthMiddleware(userHandler.GetUser))

	// Flight routes (public read; admin-only create/update)
	http.HandleFunc("/api/flight/create-airport", middleware.AdminMiddleware(database.DB, airportHandler.CreateAirport))
	http.HandleFunc("/api/flight/get-all-airports", airportHandler.GetAllAirports)
	http.HandleFunc("/api/flight/create-aircraft", middleware.AdminMiddleware(database.DB, aircraftHandler.CreateAircraft))
	http.HandleFunc("/api/flight/get-all-aircrafts", aircraftHandler.GetAllAircrafts)
	http.HandleFunc("/api/flight/create-flight", middleware.AdminMiddleware(database.DB, flightHandler.CreateFlight))
	http.HandleFunc("/api/flight/update-flight", middleware.AdminMiddleware(database.DB, flightHandler.UpdateFlight))
	http.HandleFunc("/api/flight/get-all-flights", flightHandler.GetAllFlights)
	http.HandleFunc("/api/flight/backfill-flight-cabin-inventory", middleware.AdminMiddleware(database.DB, flightHandler.BackfillFlightCabinInventory))
	http.HandleFunc("/api/flight/search", flightHandler.SearchFlights)
	http.HandleFunc("/api/flight/status", flightHandler.GetFlightStatus)
	http.HandleFunc("/api/flight/create-seat", middleware.AdminMiddleware(database.DB, seatHandler.CreateSeat))
	http.HandleFunc("/api/flight/get-all-seats", seatHandler.GetAllSeats)
	http.HandleFunc("/api/flight/create-flight-seats", middleware.AdminMiddleware(database.DB, seatHandler.CreateFlightSeats))

	// Admin-only (require admin JWT from admin signin)
	http.HandleFunc("/api/admin/stats", middleware.AdminMiddleware(database.DB, adminHandler.GetStats))
	http.HandleFunc("/api/admin/bookings", middleware.AdminMiddleware(database.DB, bookingHandler.ListAllBookings))
	http.HandleFunc("/api/admin/users", middleware.AdminMiddleware(database.DB, userHandler.ListAllUsers))

	// Program (tiers public; purchase and my-membership protected)
	http.HandleFunc("/api/program/tiers", programHandler.ListTiers)
	http.HandleFunc("/api/program/my-membership", middleware.AuthMiddleware(programHandler.GetMyMembership))
	http.HandleFunc("/api/program/purchase", middleware.AuthMiddleware(programHandler.Purchase))

	// Booking (protected)
	http.HandleFunc("/api/booking/create", middleware.AuthMiddleware(bookingHandler.CreateBooking))
	http.HandleFunc("/api/booking/my-bookings", middleware.AuthMiddleware(bookingHandler.GetUserBookings))
	http.HandleFunc("/api/booking/receipt", middleware.AuthMiddleware(bookingHandler.GetBookingReceipt))
	http.HandleFunc("/api/booking/check-in", middleware.AuthMiddleware(bookingHandler.CheckIn))

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

	// Start server with CORS middleware (allow 3000 and 3001 for user and admin sites)
	port := getEnv("PORT", "8080")
	corsOrigins := getEnv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
	corsHandler := corsMiddleware(corsOrigins, http.DefaultServeMux)
	log.Printf("Server starting on port %s", port)

	if err := http.ListenAndServe(":"+port, corsHandler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// corsMiddleware wraps a handler to add CORS headers and handle OPTIONS preflight.
// allowOrigins is a comma-separated list (e.g. "http://localhost:3000,http://localhost:3001").
func corsMiddleware(allowOrigins string, next http.Handler) http.Handler {
	origins := strings.Split(allowOrigins, ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			for _, o := range origins {
				if strings.TrimSpace(o) == origin {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
		} else if len(origins) > 0 && strings.TrimSpace(origins[0]) != "" {
			w.Header().Set("Access-Control-Allow-Origin", strings.TrimSpace(origins[0]))
		}
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
