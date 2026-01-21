package aircrafts

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

func (r *Repository) CreateAircraft(model string, totalSeats int) (*Aircraft, error) {
	var aircraft Aircraft
	now := time.Now()
	err := r.db.QueryRow(
		`INSERT INTO aircraft (model, total_seats, created_at, updated_at)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, model, total_seats, created_at, updated_at`,
		model, totalSeats, now, now,
	).Scan(&aircraft.ID, &aircraft.Model, &aircraft.TotalSeats, &aircraft.CreatedAt, &aircraft.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &aircraft, nil
}

func (r *Repository) GetAllAircrafts() ([]Aircraft, error) {
	rows, err := r.db.Query(`
		SELECT id, model, total_seats, created_at, updated_at
		FROM aircraft
		ORDER BY id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	aircrafts := make([]Aircraft, 0)
	for rows.Next() {
		var a Aircraft
		if err := rows.Scan(&a.ID, &a.Model, &a.TotalSeats, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		aircrafts = append(aircrafts, a)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return aircrafts, nil
}
