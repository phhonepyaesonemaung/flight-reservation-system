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
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var seat Seat
	now := time.Now()
	err = tx.QueryRow(
		`INSERT INTO seats (aircraft_id, seat_number, class, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, aircraft_id, seat_number, class, created_at, updated_at`,
		aircraftId, seatNumber, class, now, now,
	).Scan(&seat.ID, &seat.AircraftID, &seat.SeatNumber, &seat.Class, &seat.CreatedAt, &seat.UpdatedAt)
	if err != nil {
		return nil, err
	}

	rows, err := tx.Query(`SELECT id FROM flights WHERE aircraft_id = $1`, aircraftId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var flightID int
		if err := rows.Scan(&flightID); err != nil {
			return nil, err
		}
		_, err := tx.Exec(
			`INSERT INTO flight_seats (flight_id, seat_id, is_occupied) VALUES ($1, $2, false)`,
			flightID, seat.ID,
		)
		if err != nil {
			return nil, err
		}
		// flight_cabin_inventory is a VIEW derived from flight_seats; no update needed
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
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
