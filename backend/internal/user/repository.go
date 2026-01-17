package user

import (
	"aerolink_backend/internal/auth"
	"database/sql"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByID(userID int) (*auth.User, error) {
	var user auth.User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, created_at, updated_at FROM users WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
