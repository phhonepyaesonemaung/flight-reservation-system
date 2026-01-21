package aircrafts

import "time"

type Aircraft struct {
	ID         int       `json:"id"`
	Model      string    `json:"model"`
	TotalSeats int       `json:"total_seats"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
