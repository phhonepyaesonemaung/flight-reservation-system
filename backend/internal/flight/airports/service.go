package airports

import (
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateAirportRequest struct {
	Code    string `json:"code"`
	Name    string `json:"name"`
	City    string `json:"city"`
	Country string `json:"country"`
}

func (s *Service) CreateAirport(req *CreateAirportRequest) (*Airport, error) {
	codeExists, err := s.repo.CodeExists(req.Code)
	if err != nil {
		return nil, err
	}
	if codeExists {
		return nil, errors.New("code already exists")
	}

	airport, err := s.repo.CreateAirport(req.Code, req.Name, req.City, req.Country)
	if err != nil {
		return nil, errors.New("failed to create airport")
	}

	return airport, nil
}

func (s *Service) GetAllAirports() ([]Airport, error) {
	airports, err := s.repo.GetAllAirports()
	if err != nil {
		return nil, errors.New("failed to fetch airports")
	}
	return airports, nil
}
