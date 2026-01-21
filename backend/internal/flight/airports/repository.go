package airports

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

func (r *Repository) CreateAirport(code, name, city, country string) (*Airport, error) {
	var airport Airport
	now := time.Now()
	err := r.db.QueryRow(
		`INSERT INTO airports (code, name, city, country, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, code, name, city, country, created_at, updated_at`,
		code, name, city, country, now, now,
	).Scan(&airport.ID, &airport.Code, &airport.Name, &airport.City, &airport.Country, &airport.CreatedAt, &airport.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &airport, nil
}

func (r *Repository) CodeExists(code string) (bool, error) {
	var id int
	err := r.db.QueryRow("SELECT id FROM airports WHERE code = $1", code).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *Repository) GetAllAirports() ([]Airport, error) {
	rows, err := r.db.Query(`
		SELECT id, code, name, city, country, created_at, updated_at
		FROM airports
		ORDER BY id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	airports := make([]Airport, 0)
	for rows.Next() {
		var a Airport
		if err := rows.Scan(&a.ID, &a.Code, &a.Name, &a.City, &a.Country, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		airports = append(airports, a)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return airports, nil
}
