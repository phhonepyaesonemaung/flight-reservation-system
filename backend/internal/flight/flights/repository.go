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

	if err := r.insertFlightCabinInventoryTx(tx, flight.ID, aircraftID); err != nil {
		return nil, err
	}
	if err := r.insertFlightSeatsTx(tx, flight.ID, aircraftID); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &flight, nil
}

// insertFlightCabinInventoryTx inserts flight_cabin_inventory rows from the aircraft's seats (grouped by class). All seats start available.
func (r *Repository) insertFlightCabinInventoryTx(tx *sql.Tx, flightID, aircraftID int) error {
	rows, err := tx.Query(
		`SELECT class, COUNT(*) FROM seats WHERE aircraft_id = $1 GROUP BY class`,
		aircraftID,
	)
	if err != nil {
		return err
	}
	var classes []struct {
		class string
		count int
	}
	for rows.Next() {
		var c string
		var n int
		if err := rows.Scan(&c, &n); err != nil {
			rows.Close()
			return err
		}
		classes = append(classes, struct {
			class string
			count int
		}{c, n})
	}
	if err := rows.Close(); err != nil {
		return err
	}
	if err := rows.Err(); err != nil {
		return err
	}
	for _, cc := range classes {
		_, err := tx.Exec(
			`INSERT INTO flight_cabin_inventory (flight_id, cabin_class, total_seats, available_seats)
			 VALUES ($1, $2, $3, $4)
			 ON CONFLICT (flight_id, cabin_class) DO UPDATE SET total_seats = EXCLUDED.total_seats, available_seats = EXCLUDED.available_seats`,
			flightID, cc.class, cc.count, cc.count,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// insertFlightSeatsTx inserts one flight_seats row per seat of the aircraft, all available (is_occupied = false).
func (r *Repository) insertFlightSeatsTx(tx *sql.Tx, flightID, aircraftID int) error {
	_, err := tx.Exec(
		`INSERT INTO flight_seats (flight_id, seat_id, is_occupied)
		 SELECT $1, id, false FROM seats WHERE aircraft_id = $2
		 ON CONFLICT (flight_id, seat_id) DO NOTHING`,
		flightID, aircraftID,
	)
	return err
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

// BackfillFlightCabinInventory inserts or updates flight_cabin_inventory for every flight from each flight's aircraft seats. Idempotent.
func (r *Repository) BackfillFlightCabinInventory() (flightsProcessed int, err error) {
	flights, err := r.GetAllFlights(nil)
	if err != nil {
		return 0, err
	}
	for _, f := range flights {
		rows, qerr := r.db.Query(
			`SELECT class, COUNT(*) FROM seats WHERE aircraft_id = $1 GROUP BY class`,
			f.AircraftID,
		)
		if qerr != nil {
			continue
		}
		for rows.Next() {
			var class string
			var count int
			if qerr := rows.Scan(&class, &count); qerr != nil {
				rows.Close()
				continue
			}
			_, _ = r.db.Exec(
				`INSERT INTO flight_cabin_inventory (flight_id, cabin_class, total_seats, available_seats)
				 VALUES ($1, $2, $3, $4)
				 ON CONFLICT (flight_id, cabin_class) DO UPDATE SET total_seats = EXCLUDED.total_seats, available_seats = EXCLUDED.available_seats`,
				f.ID, class, count, count,
			)
		}
		rows.Close()
		flightsProcessed++
	}
	return flightsProcessed, nil
}

// SearchFlightRow is a single row returned by flight search (with airport codes and cabin availability).
type SearchFlightRow struct {
	ID                   int       `json:"id"`
	FlightNumber         string    `json:"flight_number"`
	DepartureAirportCode string    `json:"departure_airport_code"`
	ArrivalAirportCode   string    `json:"arrival_airport_code"`
	DepartureTime        time.Time `json:"departure_time"`
	ArrivalTime          time.Time `json:"arrival_time"`
	BasePrice            float64   `json:"base_price"`
	AvailableSeats       int       `json:"available_seats"`
	CabinClass           string    `json:"cabin_class"`
}

// SearchFlights returns flights from→to on the given date with available seats in the requested cabin class.
func (r *Repository) SearchFlights(fromAirportID, toAirportID int, date string, cabinClass string) ([]SearchFlightRow, error) {
	rows, err := r.db.Query(`
		SELECT f.id, f.flight_number,
		       dep.code AS departure_airport_code, arr.code AS arrival_airport_code,
		       f.departure_time, f.arrival_time, f.base_price,
		       fci.available_seats, fci.cabin_class
		FROM flights f
		JOIN airports dep ON dep.id = f.departure_airport_id
		JOIN airports arr ON arr.id = f.arrival_airport_id
		JOIN flight_cabin_inventory fci ON fci.flight_id = f.id AND fci.cabin_class = $4 AND fci.available_seats > 0
		WHERE f.departure_airport_id = $1 AND f.arrival_airport_id = $2
		  AND f.status = 'scheduled'
		  AND DATE(f.departure_time) = $3
		ORDER BY f.departure_time`,
		fromAirportID, toAirportID, date, cabinClass,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []SearchFlightRow
	for rows.Next() {
		var row SearchFlightRow
		if err := rows.Scan(&row.ID, &row.FlightNumber, &row.DepartureAirportCode, &row.ArrivalAirportCode,
			&row.DepartureTime, &row.ArrivalTime, &row.BasePrice, &row.AvailableSeats, &row.CabinClass); err != nil {
			return nil, err
		}
		list = append(list, row)
	}
	return list, rows.Err()
}
