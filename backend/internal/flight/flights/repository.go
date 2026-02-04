package flights

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

func (r *Repository) CreateFlight(flightNumber string, departureAirportID, arrivalAirportID, aircraftID int, departureTime, arrivalTime time.Time, basePrice float64, status string) (*Flight, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var flight Flight
	now := time.Now()
	err = tx.QueryRow(
		`INSERT INTO flights (flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, aircraft_id, base_price, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		 RETURNING id, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, aircraft_id, base_price, status, created_at, updated_at`,
		flightNumber, departureAirportID, arrivalAirportID, departureTime, arrivalTime, aircraftID, basePrice, status, now, now,
	).Scan(&flight.ID, &flight.FlightNumber, &flight.DepartureAirportID, &flight.ArrivalAirportID, &flight.DepartureTime, &flight.ArrivalTime, &flight.AircraftID, &flight.BasePrice, &flight.Status, &flight.CreatedAt, &flight.UpdatedAt)
	if err != nil {
		return nil, err
	}

	seatRows, err := tx.Query(`SELECT id FROM seats WHERE aircraft_id = $1`, aircraftID)
	if err != nil {
		return nil, err
	}
	defer seatRows.Close()
	for seatRows.Next() {
		var seatID int
		if err := seatRows.Scan(&seatID); err != nil {
			return nil, err
		}
		_, err := tx.Exec(
			`INSERT INTO flight_seats (flight_id, seat_id, is_occupied) VALUES ($1, $2, false)`,
			flight.ID, seatID,
		)
		if err != nil {
			return nil, err
		}
	}
	if err := seatRows.Err(); err != nil {
		return nil, err
	}

	// flight_cabin_inventory is a VIEW derived from flight_seats; no insert needed

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &flight, nil
}

func (r *Repository) GetAllFlights(departureAirportID *int) ([]Flight, error) {
	var rows *sql.Rows
	var err error

	if departureAirportID != nil {
		rows, err = r.db.Query(`
			SELECT id, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, aircraft_id, base_price, status, created_at, updated_at
			FROM flights
			WHERE departure_airport_id = $1
			ORDER BY id ASC
		`, *departureAirportID)
	} else {
		rows, err = r.db.Query(`
			SELECT id, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, aircraft_id, base_price, status, created_at, updated_at
			FROM flights
			ORDER BY id ASC
		`)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	flights := make([]Flight, 0)
	for rows.Next() {
		var f Flight
		if err := rows.Scan(&f.ID, &f.FlightNumber, &f.DepartureAirportID, &f.ArrivalAirportID, &f.DepartureTime, &f.ArrivalTime, &f.AircraftID, &f.BasePrice, &f.Status, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, err
		}
		flights = append(flights, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return flights, nil
}
