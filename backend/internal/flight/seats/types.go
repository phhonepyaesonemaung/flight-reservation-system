package seats

import "time"

type Seat struct {
	ID         int       `json:"id"`
	AircraftID int       `json:"aircraft_id"`
	SeatNumber string    `json:"seat_number"`
	Class      string    `json:"class"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
