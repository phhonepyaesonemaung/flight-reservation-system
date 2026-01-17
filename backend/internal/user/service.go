package user

import (
	"aerolink_backend/internal/auth"
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetUser(userID int) (*auth.User, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}
