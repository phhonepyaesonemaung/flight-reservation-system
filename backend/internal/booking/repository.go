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

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// GetFlightBasePrice returns the base_price for the flight (used for booking).
func (r *Repository) GetFlightBasePrice(flightID int) (float64, error) {
	var price float64
	err := r.db.QueryRow("SELECT base_price FROM flights WHERE id = $1", flightID).Scan(&price)
	return price, err
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
