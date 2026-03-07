package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB(host, port, user, password, dbname string) error {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to open database connection: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL database")

	// Create users table if it doesn't exist
	if err := createUsersTable(); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}
	// Add email verification schema (column + tokens table)
	if err := ensureEmailVerificationSchema(); err != nil {
		return fmt.Errorf("failed to ensure email verification schema: %w", err)
	}
	// Create admin_users table if it doesn't exist
	if err := createAdminUsersTable(); err != nil {
		return fmt.Errorf("failed to create admin_users table: %w", err)
	}

	// Create flight tables if it doesn't exist
	if err := createFlightTables(); err != nil {
		return fmt.Errorf("failed to create flight tables: %w", err)
	}

	// Create booking tables if it doesn't exist
	if err := createBookingTables(); err != nil {
		return fmt.Errorf("failed to create booking tables: %w", err)
	}
	if err := ensureCheckInSchema(); err != nil {
		return fmt.Errorf("failed to ensure check-in schema: %w", err)
	}
	if err := createProgramTables(); err != nil {
		return fmt.Errorf("failed to create program tables: %w", err)
	}
	if err := seedProgramTiers(); err != nil {
		return fmt.Errorf("failed to seed program tiers: %w", err)
	}

	return nil
}

func createUsersTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		first_name VARCHAR(100) NOT NULL,
		last_name VARCHAR(100) NOT NULL,
		username VARCHAR(100) UNIQUE NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		phone VARCHAR(100) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
	`

	_, err := DB.Exec(query)
	if err != nil {
		return err
	}

	log.Println("Users table initialized successfully")
	return nil
}

func ensureEmailVerificationSchema() error {
	// Add email_verified_at if not present (e.g. existing DBs)
	// Add column for existing DBs (PostgreSQL 9.5+; for older use: DO $$ BEGIN ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$;)
	_, _ = DB.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL`)
	// Treat existing users as already verified so they can still sign in
	_, _ = DB.Exec(`UPDATE users SET email_verified_at = COALESCE(updated_at, created_at) WHERE email_verified_at IS NULL`)
	query := `
	CREATE TABLE IF NOT EXISTS email_verification_tokens (
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		token VARCHAR(255) UNIQUE NOT NULL,
		expires_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
	CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires ON email_verification_tokens(expires_at);
	`
	_, err := DB.Exec(query)
	if err != nil {
		return err
	}
	log.Println("Email verification schema ready")
	return nil
}

func createAdminUsersTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS admin_users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(100) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
	`
	_, err := DB.Exec(query)
	if err != nil {
		return err
	}
	log.Println("Admin users table initialized successfully")
	return nil
}

func createFlightTables() error {
	query := `
	-- Airports table
	CREATE TABLE IF NOT EXISTS airports (
		id SERIAL PRIMARY KEY,
		code VARCHAR(10) UNIQUE NOT NULL,
		name VARCHAR(150) NOT NULL,
		city VARCHAR(100) NOT NULL,
		country VARCHAR(100) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Aircraft table
	CREATE TABLE IF NOT EXISTS aircraft (
		id SERIAL PRIMARY KEY,
		model VARCHAR(100) NOT NULL,
		total_seats INT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Flights table
	CREATE TABLE IF NOT EXISTS flights (
		id SERIAL PRIMARY KEY,
		flight_number VARCHAR(20) NOT NULL,

		departure_airport_id INT NOT NULL
			REFERENCES airports(id) ON DELETE CASCADE,

		arrival_airport_id INT NOT NULL
			REFERENCES airports(id) ON DELETE CASCADE,

		departure_time TIMESTAMP NOT NULL,
		arrival_time TIMESTAMP NOT NULL,

		aircraft_id INT NOT NULL
			REFERENCES aircraft(id) ON DELETE RESTRICT,

		base_price DECIMAL(10,2) NOT NULL,

		status VARCHAR(20)
			CHECK (status IN ('scheduled', 'delayed', 'cancelled'))
			DEFAULT 'scheduled',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Seat table
	CREATE TABLE IF NOT EXISTS seats (
		id SERIAL PRIMARY KEY,

		aircraft_id INT NOT NULL
			REFERENCES aircraft(id) ON DELETE RESTRICT,

		seat_number VARCHAR(5) NOT NULL,

		class VARCHAR(20)
			CHECK (class IN ('economy', 'business', 'first'))
			DEFAULT 'economy',

		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

		UNIQUE (aircraft_id, seat_number)
	);

	-- Flight Seats table
	CREATE TABLE IF NOT EXISTS flight_seats (
		id SERIAL PRIMARY KEY,

		flight_id INT NOT NULL
			REFERENCES flights(id) ON DELETE CASCADE,

		seat_id INT NOT NULL
			REFERENCES seats(id) ON DELETE RESTRICT,

		is_occupied BOOLEAN NOT NULL DEFAULT false,

		booking_id INT NULL,

		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

		UNIQUE (flight_id, seat_id)
	);

	-- Flight Cabin Inventory table
	CREATE TABLE IF NOT EXISTS flight_cabin_inventory (
		id SERIAL PRIMARY KEY,

		flight_id INT NOT NULL
			REFERENCES flights(id) ON DELETE CASCADE,

		cabin_class VARCHAR(20) NOT NULL
			CHECK (cabin_class IN ('economy', 'business', 'first')),

		total_seats INT NOT NULL,

		available_seats INT NOT NULL,

		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

		UNIQUE (flight_id, cabin_class)
	);

	-- Indexes
	CREATE INDEX IF NOT EXISTS idx_aircraft_model ON aircraft(model);

	CREATE INDEX IF NOT EXISTS idx_flights_search
	ON flights (departure_airport_id, arrival_airport_id, departure_time);

	CREATE INDEX IF NOT EXISTS idx_flights_aircraft_id ON flights(aircraft_id);

	CREATE INDEX IF NOT EXISTS idx_seats_aircraft_id ON seats(aircraft_id);
	CREATE INDEX IF NOT EXISTS idx_flight_seats_flight ON flight_seats(flight_id);
	CREATE INDEX IF NOT EXISTS idx_flight_seats_available ON flight_seats(flight_id, is_occupied);
	CREATE INDEX IF NOT EXISTS idx_fci_flight ON flight_cabin_inventory(flight_id);
	CREATE INDEX IF NOT EXISTS idx_fci_search ON flight_cabin_inventory(flight_id, cabin_class, available_seats);
	CREATE INDEX IF NOT EXISTS idx_seats_class ON seats (class);
	`

	// If flight_cabin_inventory was created as a view previously, drop it so we can use the table
	_, _ = DB.Exec(`DROP VIEW IF EXISTS flight_cabin_inventory`)

	_, err := DB.Exec(query)
	if err != nil {
		return err
	}

	log.Println("Flight tables initialized successfully")
	return nil
}

func createBookingTables() error {
	query := `
	-- Bookings table
	CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    booking_reference VARCHAR(10) UNIQUE NOT NULL, -- PNR

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),

    total_amount NUMERIC(10,2) NOT NULL,

    checked_in_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

	-- Booking Flights table
	CREATE TABLE IF NOT EXISTS booking_flights (
    booking_id INT NOT NULL
        REFERENCES bookings(id) ON DELETE CASCADE,

    flight_id INT NOT NULL
        REFERENCES flights(id) ON DELETE RESTRICT,

    cabin_class VARCHAR(20) NOT NULL
        CHECK (cabin_class IN ('economy', 'business', 'first')),

    price NUMERIC(10,2) NOT NULL,

    PRIMARY KEY (booking_id, flight_id)
	);

	-- Booking Passengers table (passenger details per booking)
	CREATE TABLE IF NOT EXISTS booking_passengers (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL
        REFERENCES bookings(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    passport_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id ON booking_passengers(booking_id);
	`

	_, err := DB.Exec(query)
	if err != nil {
		return err
	}

	log.Println("Booking tables initialized successfully")
	return nil
}

func ensureCheckInSchema() error {
	_, _ = DB.Exec(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP NULL`)
	return nil
}

func createProgramTables() error {
	query := `
	-- Program tiers (Silver, Gold, Diamond)
	CREATE TABLE IF NOT EXISTS program_tiers (
		id SERIAL PRIMARY KEY,
		name VARCHAR(20) UNIQUE NOT NULL,
		display_name VARCHAR(50) NOT NULL,
		discount_percent INT NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
		duration_months INT NOT NULL,
		price NUMERIC(10,2) NOT NULL,
		benefits_text TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_program_tiers_name ON program_tiers(name);

	-- User program purchases (active membership = most recent purchase where expires_at > now())
	CREATE TABLE IF NOT EXISTS user_program_purchases (
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		tier_id INT NOT NULL REFERENCES program_tiers(id) ON DELETE RESTRICT,
		purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		expires_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_user_program_purchases_user ON user_program_purchases(user_id);
	CREATE INDEX IF NOT EXISTS idx_user_program_purchases_expires ON user_program_purchases(user_id, expires_at);
	`
	_, err := DB.Exec(query)
	if err != nil {
		return err
	}
	log.Println("Program tables initialized successfully")
	return nil
}

func seedProgramTiers() error {
	_, err := DB.Exec(`
		INSERT INTO program_tiers (name, display_name, discount_percent, duration_months, price, benefits_text, updated_at)
		VALUES
			('silver', 'Silver', 5, 5, 49.99, '5% off all flights • Priority boarding • Extra baggage allowance • Dedicated customer support • Member-only promotions', NOW()),
			('gold', 'Gold', 10, 10, 99.99, '10% off all flights • Lounge access • Free seat selection • Priority check-in • Bonus miles • Exclusive Gold promotions', NOW()),
			('diamond', 'Diamond', 20, 24, 199.99, '20% off all flights for 2 years • First-class upgrade eligibility • Concierge service • Highest priority boarding • Complimentary lounge • Diamond-only offers', NOW())
		ON CONFLICT (name) DO UPDATE SET
			display_name = EXCLUDED.display_name,
			discount_percent = EXCLUDED.discount_percent,
			duration_months = EXCLUDED.duration_months,
			price = EXCLUDED.price,
			benefits_text = EXCLUDED.benefits_text,
			updated_at = EXCLUDED.updated_at
	`)
	if err != nil {
		return err
	}
	return nil
}

// ResetSequences sets all SERIAL sequences to the current MAX(id) for each table.
// Call this after importing data with explicit IDs so the next INSERT gets a new id.
// Without this, imported rows (e.g. id=1,2,3) leave the sequence at 1 and the next
// create hits "duplicate key value violates unique constraint" on id.
func ResetSequences() error {
	tables := []string{
		"users", "airports", "aircraft", "flights", "seats",
		"flight_seats", "flight_cabin_inventory", "bookings",
		"booking_passengers", "email_verification_tokens",
		"program_tiers", "user_program_purchases",
	}
	for _, table := range tables {
		// setval(seq, max_id) so next nextval() returns max_id+1
		q := `SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE((SELECT MAX(id) FROM ` + table + `), 1))`
		if _, err := DB.Exec(q, table); err != nil {
			return fmt.Errorf("reset sequence for %s: %w", table, err)
		}
		log.Printf("Reset sequence for table %s", table)
	}
	return nil
}

func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
