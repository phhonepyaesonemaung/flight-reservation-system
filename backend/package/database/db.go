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

	// Create flight tables if it doesn't exist
	if err := createFlightTables(); err != nil {
		return fmt.Errorf("failed to create flight tables: %w", err)
	}

	// Create booking tables if it doesn't exist
	if err := createBookingTables(); err != nil {
		return fmt.Errorf("failed to create booking tables: %w", err)
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

	-- Indexes
	CREATE INDEX IF NOT EXISTS idx_aircraft_model ON aircraft(model);

	CREATE INDEX IF NOT EXISTS idx_flights_search
	ON flights (departure_airport_id, arrival_airport_id, departure_time);

	CREATE INDEX IF NOT EXISTS idx_flights_aircraft_id ON flights(aircraft_id);

	CREATE INDEX IF NOT EXISTS idx_seats_aircraft_id ON seats(aircraft_id);
	CREATE INDEX IF NOT EXISTS idx_seats_class ON seats(class);

	CREATE INDEX IF NOT EXISTS idx_flight_seats_flight
	ON flight_seats(flight_id);

	CREATE INDEX IF NOT EXISTS idx_flight_seats_available
	ON flight_seats(flight_id, is_occupied);
	`

	_, err := DB.Exec(query)
	if err != nil {
		return err
	}

	// flight_cabin_inventory: VIEW derived from flight_seats + seats (single source of truth)
	_, _ = DB.Exec(`DROP TABLE IF EXISTS flight_cabin_inventory CASCADE`)
	_, _ = DB.Exec(`DROP VIEW IF EXISTS flight_cabin_inventory`)
	viewQuery := `
	CREATE VIEW flight_cabin_inventory AS
	SELECT
		fs.flight_id,
		s.class AS cabin_class,
		COUNT(*)::int AS total_seats,
		COUNT(*) FILTER (WHERE NOT fs.is_occupied)::int AS available_seats
	FROM flight_seats fs
	JOIN seats s ON s.id = fs.seat_id
	GROUP BY fs.flight_id, s.class;
	`
	_, err = DB.Exec(viewQuery)
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
	`

	_, err := DB.Exec(query)
	if err != nil {
		return err
	}

	log.Println("Booking tables initialized successfully")
	return nil
}

func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
