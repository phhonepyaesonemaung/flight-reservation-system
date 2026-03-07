package program

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

type Tier struct {
	ID              int     `json:"id"`
	Name            string  `json:"name"`
	DisplayName     string  `json:"display_name"`
	DiscountPercent int     `json:"discount_percent"`
	DurationMonths  int     `json:"duration_months"`
	Price           float64 `json:"price"`
	BenefitsText    string  `json:"benefits_text"`
}

type ActiveMembership struct {
	TierName        string    `json:"tier_name"`
	DisplayName     string    `json:"display_name"`
	DiscountPercent int       `json:"discount_percent"`
	ExpiresAt       time.Time `json:"expires_at"`
}

func (r *Repository) ListTiers() ([]Tier, error) {
	rows, err := r.db.Query(`
		SELECT id, name, display_name, discount_percent, duration_months, price, COALESCE(benefits_text, '')
		FROM program_tiers ORDER BY discount_percent ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []Tier
	for rows.Next() {
		var t Tier
		if err := rows.Scan(&t.ID, &t.Name, &t.DisplayName, &t.DiscountPercent, &t.DurationMonths, &t.Price, &t.BenefitsText); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, rows.Err()
}

func (r *Repository) GetTierByName(name string) (*Tier, error) {
	var t Tier
	err := r.db.QueryRow(`
		SELECT id, name, display_name, discount_percent, duration_months, price, COALESCE(benefits_text, '')
		FROM program_tiers WHERE name = $1`, name,
	).Scan(&t.ID, &t.Name, &t.DisplayName, &t.DiscountPercent, &t.DurationMonths, &t.Price, &t.BenefitsText)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *Repository) GetActiveMembership(userID int) (*ActiveMembership, error) {
	var m ActiveMembership
	err := r.db.QueryRow(`
		SELECT pt.name, pt.display_name, pt.discount_percent, upp.expires_at
		FROM user_program_purchases upp
		JOIN program_tiers pt ON pt.id = upp.tier_id
		WHERE upp.user_id = $1 AND upp.expires_at > NOW()
		ORDER BY upp.expires_at DESC
		LIMIT 1`, userID,
	).Scan(&m.TierName, &m.DisplayName, &m.DiscountPercent, &m.ExpiresAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *Repository) Purchase(userID, tierID int, expiresAt time.Time) error {
	_, err := r.db.Exec(
		`INSERT INTO user_program_purchases (user_id, tier_id, purchased_at, expires_at)
		 VALUES ($1, $2, NOW(), $3)`,
		userID, tierID, expiresAt,
	)
	return err
}
