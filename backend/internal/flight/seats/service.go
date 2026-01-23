package seats

import "errors"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateSeatRequest struct {
	AircraftID int    `json:"aircraft_id"`
	SeatNumber string `json:"seat_number"`
	Class      string `json:"class"`
}

func (s *Service) CreateSeat(req *CreateSeatRequest) (*Seat, error) {
	class := req.Class
	if class == "" {
		class = "economy"
	}

	// Validate status
	if class != "economy" && class != "business" && class != "first" {
		return nil, errors.New("invalid status: must be 'economy', 'business', or 'first'")
	}
	seat, err := s.repo.CreateSeat(
		req.AircraftID,
		req.SeatNumber,
		req.Class,
	)
	if err != nil {
		return nil, errors.New("failed to create seat")
	}

	return seat, nil
}

func (s *Service) GetAllSeats(aircraftId *int) ([]Seat, error) {
	seats, err := s.repo.GetAllSeats(aircraftId)
	if err != nil {
		return nil, errors.New("failed to fetch seats")
	}
	return seats, nil
}
