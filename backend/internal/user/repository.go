package user

import (
	"aerolink_backend/internal/auth"
	"database/sql"
	"time"
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
		"SELECT id, first_name, last_name, username, email, phone, password_hash, email_verified_at, created_at, updated_at FROM users WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.Phone, &user.PasswordHash, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UserWithBookingCount is used by admin list
type UserWithBookingCount struct {
	ID           int    `json:"id"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	CreatedAt    string `json:"created_at"`
	BookingCount int    `json:"booking_count"`
}

func (r *Repository) GetAllUsersWithBookingCount() ([]UserWithBookingCount, error) {
	rows, err := r.db.Query(`
		SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
		       (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS booking_count
		FROM users u
		ORDER BY u.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []UserWithBookingCount
	for rows.Next() {
		var u UserWithBookingCount
		var createdAt time.Time
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &createdAt, &u.BookingCount); err != nil {
			return nil, err
		}
		u.CreatedAt = createdAt.Format("2006-01-02")
		list = append(list, u)
	}
	return list, rows.Err()
}
