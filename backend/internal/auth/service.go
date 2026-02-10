package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"regexp"
	"strings"
	"time"

	"aerolink_backend/package/jwt"
	"aerolink_backend/package/mail"
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

// SignupMessageResponse is returned on signup when email verification is required (no tokens).
type SignupMessageResponse struct {
	Message string `json:"message"`
}

func (s *Service) Signup(req *SignupRequest) (interface{}, error) {
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

	token, err := generateSecureToken()
	if err != nil {
		return nil, errors.New("failed to generate verification token")
	}
	expiresAt := time.Now().Add(24 * time.Hour)
	if err := s.repo.CreateVerificationToken(user.ID, token, expiresAt); err != nil {
		return nil, errors.New("failed to create verification token")
	}
	if err := mail.SendVerificationEmail(user.Email, token); err != nil {
		// In development without SMTP configured, mark user verified so they can sign in
		if mail.SendingDisabled() {
			_ = s.repo.MarkEmailVerified(user.ID)
			return &SignupMessageResponse{Message: "Account created. Email sending is disabled (no SMTP); you can sign in now."}, nil
		}
		return nil, errors.New("failed to send verification email; account was created—please contact support or try signing in later")
	}

	return &SignupMessageResponse{Message: "Check your email to verify your account. The link expires in 24 hours."}, nil
}

func generateSecureToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (s *Service) Signin(req *SigninRequest) (*AuthResponse, error) {
	if strings.TrimSpace(req.Username) == "" || strings.TrimSpace(req.Password) == "" {
		return nil, errors.New("username and password are required")
	}

	user, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if user.EmailVerifiedAt == nil {
		return nil, errors.New("email not verified; please check your inbox for the verification link")
	}

	if !password.ComparePassword(user.PasswordHash, req.Password) {
		return nil, errors.New("invalid username or password")
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

// VerifyEmail consumes the token, marks the user as verified, and returns auth tokens so the user can be signed in.
// The token is only deleted after full success so duplicate requests (e.g. React double-mount) don't cause "already used".
func (s *Service) VerifyEmail(token string) (*AuthResponse, error) {
	if strings.TrimSpace(token) == "" {
		return nil, errors.New("verification token is required")
	}
	userID, err := s.repo.GetUserIDByToken(token)
	if err != nil {
		return nil, errors.New("this verification link is invalid or has already been used; try signing in with your username and password")
	}
	if err := s.repo.MarkEmailVerified(userID); err != nil {
		return nil, errors.New("failed to verify email")
	}
	user, err := s.repo.FindByID(userID)
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
	_ = s.repo.DeleteVerificationToken(token)
	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user.ToResponse(),
	}, nil
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
