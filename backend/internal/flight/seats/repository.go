package seats

import (
	"database/sql"
	"time"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateSeat(aircraftId int, seatNumber, class string) (*Seat, error) {
	var seat Seat
	now := time.Now()
	err := r.db.QueryRow(
		`INSERT INTO seats (aircraft_id, seat_number, class, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, aircraft_id, seat_number, class, created_at, updated_at`,
		aircraftId, seatNumber, class, now, now,
	).Scan(&seat.ID, &seat.AircraftID, &seat.SeatNumber, &seat.Class, &seat.CreatedAt, &seat.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &seat, nil
}

func (r *Repository) GetAllSeats(aircraftID *int) ([]Seat, error) {
	var rows *sql.Rows
	var err error

	rows, err = r.db.Query(`
			SELECT id, aircraft_id, seat_number, class, created_at, updated_at
			FROM seats
			WHERE aircraft_id = $1
			ORDER BY id ASC
		`, *aircraftID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	seats := make([]Seat, 0)
	for rows.Next() {
		var s Seat
		if err := rows.Scan(&s.ID, &s.AircraftID, &s.SeatNumber, &s.Class, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		seats = append(seats, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return seats, nil
}
