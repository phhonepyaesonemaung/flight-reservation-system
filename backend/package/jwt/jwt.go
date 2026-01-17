package jwt

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	accessTokenSecret  []byte
	refreshTokenSecret []byte
)

func InitJWT() {
	accessSecret := os.Getenv("JWT_ACCESS_SECRET")
	if accessSecret == "" {
		accessSecret = "your-access-token-secret-key-change-this-in-production"
	}
	accessTokenSecret = []byte(accessSecret)

	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	if refreshSecret == "" {
		refreshSecret = "your-refresh-token-secret-key-change-this-in-production"
	}
	refreshTokenSecret = []byte(refreshSecret)
}

type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateAccessToken generates a short-lived access token (15 minutes)
func GenerateAccessToken(userID int) (string, error) {
	expirationTime := time.Now().Add(15 * time.Minute)
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(accessTokenSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// GenerateRefreshToken generates a long-lived refresh token (7 days)
func GenerateRefreshToken(userID int) (string, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(refreshTokenSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateAccessToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token signing method")
		}
		return accessTokenSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func ValidateRefreshToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token signing method")
		}
		return refreshTokenSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
