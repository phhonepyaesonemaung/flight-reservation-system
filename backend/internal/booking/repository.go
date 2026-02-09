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
		 VALUES ($1, $2, 'pending', $3, $4, $4) RETURNING id`,
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
