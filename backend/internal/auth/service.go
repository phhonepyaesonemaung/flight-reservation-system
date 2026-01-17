package auth

import (
	"errors"
	"regexp"
	"strings"

	"aerolink_backend/package/jwt"
	"aerolink_backend/package/password"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type SignupRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Password  string `json:"password"`
}

type SigninRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type AuthResponse struct {
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	User         *UserResponse `json:"user"`
}

func (s *Service) Signup(req *SignupRequest) (*AuthResponse, error) {
	if err := validateSignupRequest(req); err != nil {
		return nil, err
	}

	emailExists, err := s.repo.EmailExists(req.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, errors.New("email already exists")
	}

	usernameExists, err := s.repo.UsernameExists(req.Username)
	if err != nil {
		return nil, err
	}
	if usernameExists {
		return nil, errors.New("username already exists")
	}

	phoneExists, err := s.repo.PhoneExists(req.Phone)
	if err != nil {
		return nil, err
	}
	if phoneExists {
		return nil, errors.New("phone already exists")
	}

	hashedPassword, err := password.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to process password")
	}

	user, err := s.repo.CreateUser(req.FirstName, req.LastName, req.Username, req.Email, req.Phone, hashedPassword)
	if err != nil {
		return nil, errors.New("failed to create user")
	}

	accessToken, err := jwt.GenerateAccessToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	response := &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user.ToResponse(),
	}

	return response, nil
}

func (s *Service) Signin(req *SigninRequest) (*AuthResponse, error) {
	if strings.TrimSpace(req.Username) == "" || strings.TrimSpace(req.Password) == "" {
		return nil, errors.New("username and password are required")
	}

	user, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username")
	}

	if !password.ComparePassword(user.PasswordHash, req.Password) {
		return nil, errors.New("invalid password")
	}

	accessToken, err := jwt.GenerateAccessToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	response := &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user.ToResponse(),
	}

	return response, nil
}

func (s *Service) RefreshToken(req *RefreshTokenRequest) (*AuthResponse, error) {
	if strings.TrimSpace(req.RefreshToken) == "" {
		return nil, errors.New("refresh token is required")
	}

	claims, err := jwt.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}

	user, err := s.repo.FindByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	accessToken, err := jwt.GenerateAccessToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	response := &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user.ToResponse(),
	}

	return response, nil
}

func validateSignupRequest(req *SignupRequest) error {
	if strings.TrimSpace(req.Username) == "" {
		return errors.New("username is required")
	}
	if len(req.Username) < 3 || len(req.Username) > 100 {
		return errors.New("username must be between 3 and 100 characters")
	}
	if strings.TrimSpace(req.Phone) == "" {
		return errors.New("phone is required")
	}
	if strings.TrimSpace(req.Email) == "" {
		return errors.New("email is required")
	}
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return errors.New("invalid email format")
	}

	if strings.TrimSpace(req.Password) == "" {
		return errors.New("password is required")
	}
	if len(req.Password) < 6 {
		return errors.New("password must be at least 6 characters long")
	}

	return nil
}
