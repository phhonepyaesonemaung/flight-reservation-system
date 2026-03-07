package admin

import (
	"database/sql"
	"net/http"

	"aerolink_backend/package/response"
)

type Handler struct {
	db *sql.DB
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{db: db}
}

type StatsResponse struct {
	TotalFlights   int     `json:"total_flights"`
	TotalBookings  int     `json:"total_bookings"`
	TotalRevenue   float64 `json:"total_revenue"`
	TotalUsers     int     `json:"total_users"`
}

func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var stats StatsResponse
	_ = h.db.QueryRow("SELECT COUNT(*) FROM flights").Scan(&stats.TotalFlights)
	_ = h.db.QueryRow("SELECT COUNT(*) FROM bookings").Scan(&stats.TotalBookings)
	_ = h.db.QueryRow("SELECT COALESCE(SUM(total_amount), 0) FROM bookings").Scan(&stats.TotalRevenue)
	_ = h.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	response.Success(w, http.StatusOK, "success", stats)
}
