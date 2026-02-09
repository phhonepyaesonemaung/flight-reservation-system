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
	// email_verified_at is NULL for new signups
	return &user, nil
}

func (r *Repository) FindByEmail(email string) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, email_verified_at, created_at, updated_at FROM users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByUsername(username string) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, email_verified_at, created_at, updated_at FROM users WHERE username = $1",
		username,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByPhone(phone string) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, email_verified_at, created_at, updated_at FROM users WHERE phone = $1",
		phone,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByID(id int) (*User, error) {
	var user User
	err := r.db.QueryRow(
		"SELECT id, first_name, last_name, username, email, phone, password_hash, email_verified_at, created_at, updated_at FROM users WHERE id = $1",
		id,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt)

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

// CreateVerificationToken inserts a token for the user, expires at the given time.
func (r *Repository) CreateVerificationToken(userID int, token string, expiresAt time.Time) error {
	_, err := r.db.Exec(
		`INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
		userID, token, expiresAt,
	)
	return err
}

// GetUserIDByToken returns the user ID for a valid, non-expired token and deletes the token.
func (r *Repository) GetUserIDByToken(token string) (int, error) {
	var userID int
	err := r.db.QueryRow(
		`SELECT user_id FROM email_verification_tokens WHERE token = $1 AND expires_at > NOW()`,
		token,
	).Scan(&userID)
	if err != nil {
		return 0, err
	}
	_, _ = r.db.Exec(`DELETE FROM email_verification_tokens WHERE token = $1`, token)
	return userID, nil
}

// MarkEmailVerified sets email_verified_at for the user.
func (r *Repository) MarkEmailVerified(userID int) error {
	_, err := r.db.Exec(
		`UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1`,
		userID,
	)
	return err
}
