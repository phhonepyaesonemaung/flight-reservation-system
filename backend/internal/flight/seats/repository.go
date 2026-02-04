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

// GetFlightAircraftID returns the aircraft_id for the given flight.
func (r *Repository) GetFlightAircraftID(flightID int) (int, error) {
	var aircraftID int
	err := r.db.QueryRow(
		`SELECT aircraft_id FROM flights WHERE id = $1`,
		flightID,
	).Scan(&aircraftID)
	return aircraftID, err
}

// FlightInfo holds flight id and its aircraft id for bulk processing.
type FlightInfo struct {
	FlightID   int
	AircraftID int
}

// GetAllFlights returns all flights with their aircraft_id.
func (r *Repository) GetAllFlights() ([]FlightInfo, error) {
	rows, err := r.db.Query(`SELECT id, aircraft_id FROM flights ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []FlightInfo
	for rows.Next() {
		var f FlightInfo
		if err := rows.Scan(&f.FlightID, &f.AircraftID); err != nil {
			return nil, err
		}
		list = append(list, f)
	}
	return list, rows.Err()
}

// CreateFlightSeats inserts flight_seats rows for the given flight and seat IDs. Ignores duplicates (ON CONFLICT DO NOTHING).
// Returns the number of rows actually inserted.
func (r *Repository) CreateFlightSeats(flightID int, seatIDs []int) (created int64, err error) {
	if len(seatIDs) == 0 {
		return 0, nil
	}
	var total int64
	for _, seatID := range seatIDs {
		res, err := r.db.Exec(
			`INSERT INTO flight_seats (flight_id, seat_id, is_occupied) VALUES ($1, $2, false)
			 ON CONFLICT (flight_id, seat_id) DO NOTHING`,
			flightID, seatID,
		)
		if err != nil {
			return 0, err
		}
		n, _ := res.RowsAffected()
		total += n
	}
	return total, nil
}
