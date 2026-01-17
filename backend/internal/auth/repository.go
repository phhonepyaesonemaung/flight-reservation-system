package auth

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

func (r *Repository) CreateUser(first_name, last_name, username, email, phone, passwordHash string) (*User, error) {
	var user User
	now := time.Now()
	err := r.db.QueryRow(
		`INSERT INTO users (first_name, last_name, username, email, phone, password_hash, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, first_name, last_name, username, email, phone, password_hash, created_at, updated_at`,
		first_name, last_name, username, email, phone, passwordHash, now, now,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByEmail(email string) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, created_at, updated_at FROM users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByUsername(username string) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, created_at, updated_at FROM users WHERE username = $1",
		username,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByPhone(phone string) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, created_at, updated_at FROM users WHERE phone = $1",
		phone,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByID(id int) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, created_at, updated_at FROM users WHERE id = $1",
		id,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) EmailExists(email string) (bool, error) {
	var id int
	err := r.db.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *Repository) PhoneExists(phone string) (bool, error) {
	var id int
	err := r.db.QueryRow("SELECT id FROM users WHERE phone = $1", phone).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *Repository) UsernameExists(username string) (bool, error) {
	var id int
	err := r.db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
