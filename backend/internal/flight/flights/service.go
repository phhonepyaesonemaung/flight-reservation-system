package flights

import (
	"errors"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateFlightRequest struct {
	FlightNumber       string    `json:"flight_number"`
	DepartureAirportID int       `json:"departure_airport_id"`
	ArrivalAirportID   int       `json:"arrival_airport_id"`
	DepartureTime      time.Time `json:"departure_time"`
	ArrivalTime        time.Time `json:"arrival_time"`
	AircraftID         int       `json:"aircraft_id"`
	BasePrice          float64   `json:"base_price"`
	Status             string    `json:"status"`
}

func (s *Service) CreateFlight(req *CreateFlightRequest) (*Flight, error) {
	// Set default status if not provided
	status := req.Status
	if status == "" {
		status = "scheduled"
	}

	// Validate status
	if status != "scheduled" && status != "delayed" && status != "cancelled" {
		return nil, errors.New("invalid status: must be 'scheduled', 'delayed', or 'cancelled'")
	}

	flight, err := s.repo.CreateFlight(
		req.FlightNumber,
		req.DepartureAirportID,
		req.ArrivalAirportID,
		req.AircraftID,
		req.DepartureTime,
		req.ArrivalTime,
		req.BasePrice,
		status,
	)
	if err != nil {
		return nil, errors.New("failed to create flight")
	}

	return flight, nil
}

func (s *Service) GetAllFlights(departureAirportID *int) ([]Flight, error) {
	flights, err := s.repo.GetAllFlights(departureAirportID)
	if err != nil {
		return nil, errors.New("failed to fetch flights")
	}
	return flights, nil
}
