package flights

import "time"

type Flight struct {
	ID                 int       `json:"id"`
	FlightNumber       string    `json:"flight_number"`
	DepartureAirportID int       `json:"departure_airport_id"`
	ArrivalAirportID   int       `json:"arrival_airport_id"`
	DepartureTime      time.Time `json:"departure_time"`
	ArrivalTime        time.Time `json:"arrival_time"`
	AircraftID         int       `json:"aircraft_id"`
	BasePrice          float64   `json:"base_price"`
	Status             string    `json:"status"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}
