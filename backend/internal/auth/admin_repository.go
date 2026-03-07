package auth

import (
	"database/sql"
	"time"
)

// AdminUser represents a row in admin_users table
type AdminUser struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (r *Repository) FindAdminByUsername(username string) (*AdminUser, error) {
	var a AdminUser
	err := r.db.QueryRow(
		"SELECT id, username, password_hash, created_at, updated_at FROM admin_users WHERE username = $1",
		username,
	).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) CountAdmins() (int, error) {
	var n int
	err := r.db.QueryRow("SELECT COUNT(*) FROM admin_users").Scan(&n)
	return n, err
}

func (r *Repository) CreateAdmin(username, passwordHash string) (*AdminUser, error) {
	var a AdminUser
	now := time.Now()
	err := r.db.QueryRow(
		`INSERT INTO admin_users (username, password_hash, created_at, updated_at)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, username, password_hash, created_at, updated_at`,
		username, passwordHash, now, now,
	).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// AdminExists returns true if the username is taken in admin_users
func (r *Repository) AdminUsernameExists(username string) (bool, error) {
	var id int
	err := r.db.QueryRow("SELECT id FROM admin_users WHERE username = $1", username).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
