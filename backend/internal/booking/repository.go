package booking

import (
	"crypto/rand"
	"database/sql"
	"math/big"
	"time"
)

type Repository struct {
	db *sql.DB
}

type FlightReceiptInfo struct {
	FlightNumber         string
	DepartureAirportCode string
	ArrivalAirportCode   string
	DepartureTime        time.Time
	ArrivalTime          time.Time
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// GetFlightBasePrice returns the base_price for the flight (used for booking).
func (r *Repository) GetFlightBasePrice(flightID int) (float64, error) {
	var price float64
	err := r.db.QueryRow("SELECT base_price FROM flights WHERE id = $1", flightID).Scan(&price)
	return price, err
}

func (r *Repository) GetUserEmail(userID int) (string, error) {
	var email string
	err := r.db.QueryRow("SELECT email FROM users WHERE id = $1", userID).Scan(&email)
	return email, err
}

func (r *Repository) GetFlightReceiptInfo(flightID int) (*FlightReceiptInfo, error) {
	var info FlightReceiptInfo
	err := r.db.QueryRow(`
		SELECT f.flight_number,
		       dep.code AS departure_airport_code,
		       arr.code AS arrival_airport_code,
		       f.departure_time,
		       f.arrival_time
		FROM flights f
		JOIN airports dep ON dep.id = f.departure_airport_id
		JOIN airports arr ON arr.id = f.arrival_airport_id
		WHERE f.id = $1`,
		flightID,
	).Scan(&info.FlightNumber, &info.DepartureAirportCode, &info.ArrivalAirportCode, &info.DepartureTime, &info.ArrivalTime)
	if err != nil {
		return nil, err
	}
	return &info, nil
}

// CreateBooking creates a new booking with booking_flights and booking_passengers. Returns booking ID and reference.
func (r *Repository) CreateBooking(userID, flightID int, cabinClass string, totalAmount float64, passengers []PassengerInput) (bookingID int, bookingRef string, err error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, "", err
	}
	defer tx.Rollback()

	bookingRef, err = generatePNR(tx)
	if err != nil {
		return 0, "", err
	}

	now := time.Now()
	err = tx.QueryRow(
		`INSERT INTO bookings (user_id, booking_reference, status, total_amount, created_at, updated_at)
		 VALUES ($1, $2, 'confirmed', $3, $4, $4) RETURNING id`,
		userID, bookingRef, totalAmount, now,
	).Scan(&bookingID)
	if err != nil {
		return 0, "", err
	}

	flightPrice, err := getFlightPriceTx(tx, flightID)
	if err != nil {
		return 0, "", err
	}
	_, err = tx.Exec(
		`INSERT INTO booking_flights (booking_id, flight_id, cabin_class, price) VALUES ($1, $2, $3, $4)`,
		bookingID, flightID, cabinClass, flightPrice,
	)
	if err != nil {
		return 0, "", err
	}

	for _, p := range passengers {
		var dob interface{}
		if p.DateOfBirth != "" {
			t, _ := time.Parse("2006-01-02", p.DateOfBirth)
			dob = t
		}
		_, err = tx.Exec(
			`INSERT INTO booking_passengers (booking_id, first_name, last_name, email, phone, date_of_birth, passport_number)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			bookingID, p.FirstName, p.LastName, p.Email, p.Phone, dob, nullStr(p.PassportNumber),
		)
		if err != nil {
			return 0, "", err
		}
	}

	// Decrement available seats for this flight and cabin, and reserve seats in flight_seats
	passengerCount := len(passengers)
	if passengerCount > 0 {
		res, err := tx.Exec(
			`UPDATE flight_cabin_inventory SET available_seats = available_seats - $1
			 WHERE flight_id = $2 AND cabin_class = $3 AND available_seats >= $1`,
			passengerCount, flightID, cabinClass,
		)
		if err != nil {
			return 0, "", err
		}
		affected, _ := res.RowsAffected()
		if affected == 0 {
			return 0, "", sql.ErrNoRows // signal "not enough seats" to caller
		}
		// Reserve N seats: pick unoccupied seats of this cabin class and mark them for this booking
		rows, err := tx.Query(
			`SELECT fs.id FROM flight_seats fs
			 JOIN seats s ON s.id = fs.seat_id
			 WHERE fs.flight_id = $1 AND fs.is_occupied = false AND s.class = $2
			 ORDER BY fs.id
			 LIMIT $3
			 FOR UPDATE OF fs SKIP LOCKED`,
			flightID, cabinClass, passengerCount,
		)
		if err != nil {
			return 0, "", err
		}
		var seatIDs []int
		for rows.Next() {
			var id int
			if err := rows.Scan(&id); err != nil {
				rows.Close()
				return 0, "", err
			}
			seatIDs = append(seatIDs, id)
		}
		rows.Close()
		if err := rows.Err(); err != nil {
			return 0, "", err
		}
		if len(seatIDs) < passengerCount {
			return 0, "", sql.ErrNoRows // inconsistent: inventory said enough, but not enough free seats
		}
		for _, sid := range seatIDs {
			_, err = tx.Exec(
				`UPDATE flight_seats SET is_occupied = true, booking_id = $1 WHERE id = $2`,
				bookingID, sid,
			)
			if err != nil {
				return 0, "", err
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, "", err
	}
	return bookingID, bookingRef, nil
}

func getFlightPriceTx(tx *sql.Tx, flightID int) (float64, error) {
	var price float64
	err := tx.QueryRow("SELECT base_price FROM flights WHERE id = $1", flightID).Scan(&price)
	return price, err
}

func nullStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

// GetUserBookings returns all bookings for the user (one row per booking, earliest flight). Ordered by departure desc.
func (r *Repository) GetUserBookings(userID int) ([]UserBookingItem, error) {
	rows, err := r.db.Query(`
		SELECT DISTINCT ON (b.id) b.id, b.booking_reference, b.status, b.total_amount, b.checked_in_at,
		       f.flight_number, dep.code AS dep_code, arr.code AS arr_code,
		       f.departure_time, f.arrival_time, bf.cabin_class,
		       (SELECT COUNT(*) FROM booking_passengers bp WHERE bp.booking_id = b.id) AS passenger_count
		FROM bookings b
		JOIN booking_flights bf ON bf.booking_id = b.id
		JOIN flights f ON f.id = bf.flight_id
		JOIN airports dep ON dep.id = f.departure_airport_id
		JOIN airports arr ON arr.id = f.arrival_airport_id
		WHERE b.user_id = $1
		ORDER BY b.id, f.departure_time ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []UserBookingItem
	for rows.Next() {
		var item UserBookingItem
		var checkedInAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.BookingReference, &item.Status, &item.TotalAmount, &checkedInAt,
			&item.FlightNumber, &item.DepartureAirportCode, &item.ArrivalAirportCode,
			&item.DepartureTime, &item.ArrivalTime, &item.CabinClass, &item.PassengerCount); err != nil {
			return nil, err
		}
		if checkedInAt.Valid {
			item.CheckedInAt = &checkedInAt.Time
		}
		list = append(list, item)
	}
	// Re-sort by departure desc for display
	for i, j := 0, len(list)-1; i < j; i, j = i+1, j-1 {
		list[i], list[j] = list[j], list[i]
	}
	return list, rows.Err()
}

// GetBookingReceipt loads a single booking by ID and user; returns receipt for first flight.
func (r *Repository) GetBookingReceipt(bookingID, userID int) (*Receipt, error) {
	var rec Receipt
	var depTime, arrTime time.Time
	var checkedInAt sql.NullTime
	err := r.db.QueryRow(`
		SELECT b.id, b.booking_reference, b.total_amount, b.checked_in_at,
		       f.flight_number, dep.code, arr.code, f.departure_time, f.arrival_time, bf.cabin_class
		FROM bookings b
		JOIN booking_flights bf ON bf.booking_id = b.id
		JOIN flights f ON f.id = bf.flight_id
		JOIN airports dep ON dep.id = f.departure_airport_id
		JOIN airports arr ON arr.id = f.arrival_airport_id
		WHERE b.id = $1 AND b.user_id = $2
		ORDER BY f.departure_time ASC
		LIMIT 1`,
		bookingID, userID,
	).Scan(&rec.BookingID, &rec.BookingReference, &rec.TotalAmount, &checkedInAt,
		&rec.FlightNumber, &rec.DepartureAirportCode, &rec.ArrivalAirportCode,
		&depTime, &arrTime, &rec.CabinClass)
	if err != nil {
		return nil, err
	}
	rec.DepartureTime = depTime
	rec.ArrivalTime = arrTime
	if checkedInAt.Valid {
		rec.CheckedInAt = &checkedInAt.Time
	}
	rows, err := r.db.Query(
		`SELECT first_name, last_name, email FROM booking_passengers WHERE booking_id = $1`,
		bookingID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var p ReceiptPassenger
		if err := rows.Scan(&p.FirstName, &p.LastName, &p.Email); err != nil {
			return nil, err
		}
		rec.Passengers = append(rec.Passengers, p)
	}
	rec.PassengerCount = len(rec.Passengers)
	rec.IssuedAt = time.Now()
	return &rec, rows.Err()
}

// CheckIn sets checked_in_at for the booking. Returns true if updated, false if not found or already checked in.
func (r *Repository) CheckIn(bookingID, userID int) (updated bool, err error) {
	res, err := r.db.Exec(`
		UPDATE bookings SET checked_in_at = $1, updated_at = $1
		WHERE id = $2 AND user_id = $3 AND status = 'confirmed' AND checked_in_at IS NULL`,
		time.Now(), bookingID, userID,
	)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n == 1, nil
}

// GetAllBookingsForAdmin returns all bookings (one row per booking, first flight) for admin list.
func (r *Repository) GetAllBookingsForAdmin() ([]AdminBookingRow, error) {
	rows, err := r.db.Query(`
		SELECT DISTINCT ON (b.id) b.id, b.booking_reference, u.email, f.flight_number,
		       dep.code || ' → ' || arr.code AS route,
		       f.departure_time, b.total_amount, b.status,
		       (SELECT first_name || ' ' || last_name FROM booking_passengers WHERE booking_id = b.id LIMIT 1) AS passenger_name
		FROM bookings b
		JOIN users u ON u.id = b.user_id
		JOIN booking_flights bf ON bf.booking_id = b.id
		JOIN flights f ON f.id = bf.flight_id
		JOIN airports dep ON dep.id = f.departure_airport_id
		JOIN airports arr ON arr.id = f.arrival_airport_id
		ORDER BY b.id DESC, f.departure_time ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []AdminBookingRow
	for rows.Next() {
		var row AdminBookingRow
		var depTime time.Time
		if err := rows.Scan(&row.ID, &row.BookingReference, &row.UserEmail, &row.FlightNumber, &row.Route, &depTime, &row.TotalAmount, &row.Status, &row.PassengerName); err != nil {
			return nil, err
		}
		row.DepartureTime = depTime.Format("2006-01-02 15:04")
		list = append(list, row)
	}
	return list, rows.Err()
}

// GetBookingDepartureTime returns the earliest departure time for the booking (for check-in window validation).
func (r *Repository) GetBookingDepartureTime(bookingID, userID int) (departure time.Time, found bool, err error) {
	err = r.db.QueryRow(`
		SELECT MIN(f.departure_time) FROM bookings b
		JOIN booking_flights bf ON bf.booking_id = b.id
		JOIN flights f ON f.id = bf.flight_id
		WHERE b.id = $1 AND b.user_id = $2`,
		bookingID, userID,
	).Scan(&departure)
	if err == sql.ErrNoRows {
		return time.Time{}, false, nil
	}
	if err != nil {
		return time.Time{}, false, err
	}
	return departure, true, nil
}

func generatePNR(tx *sql.Tx) (string, error) {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	max := big.NewInt(int64(len(chars)))
	for i := 0; i < 100; i++ {
		b := make([]byte, 6)
		for j := range b {
			n, err := rand.Int(rand.Reader, max)
			if err != nil {
				return "", err
			}
			b[j] = chars[n.Int64()]
		}
		ref := string(b)
		var exists int
		err := tx.QueryRow("SELECT 1 FROM bookings WHERE booking_reference = $1", ref).Scan(&exists)
		if err == sql.ErrNoRows {
			return ref, nil
		}
		if err != nil {
			return "", err
		}
	}
	return "", sql.ErrNoRows
}
