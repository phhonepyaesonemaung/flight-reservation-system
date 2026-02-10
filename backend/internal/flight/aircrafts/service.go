package aircrafts

import (
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateAircraftRequest struct {
	Model      string `json:"model"`
	TotalSeats int    `json:"total_seats"`
}

func (s *Service) CreateAircraft(req *CreateAircraftRequest) (*Aircraft, error) {
	aircraft, err := s.repo.CreateAircraft(req.Model, req.TotalSeats)
	if err != nil {
		return nil, errors.New("failed to create aircraft")
	}

	return aircraft, nil
}

func (s *Service) GetAllAircrafts() ([]Aircraft, error) {
	aircrafts, err := s.repo.GetAllAircrafts()
	if err != nil {
		return nil, errors.New("failed to fetch aircrafts")
	}
	return aircrafts, nil
}
