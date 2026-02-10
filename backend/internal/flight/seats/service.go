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

// CreateFlightSeatsForAllResult is the result of creating flight seats for all flights.
type CreateFlightSeatsForAllResult struct {
	FlightsProcessed   int   `json:"flights_processed"`
	FlightSeatsCreated int64 `json:"flight_seats_created"`
}

// CreateFlightSeatsForAll creates flight_seats for every existing flight (using each flight's aircraft seats).
// No request body required. Idempotent: existing flight_seats are skipped.
func (s *Service) CreateFlightSeatsForAll() (*CreateFlightSeatsForAllResult, error) {
	flights, err := s.repo.GetAllFlights()
	if err != nil {
		return nil, errors.New("failed to fetch flights")
	}
	var totalCreated int64
	for _, f := range flights {
		seats, err := s.repo.GetAllSeats(&f.AircraftID)
		if err != nil {
			continue // skip flight on error (e.g. no seats for aircraft)
		}
		if len(seats) == 0 {
			continue
		}
		seatIDs := make([]int, 0, len(seats))
		for _, seat := range seats {
			seatIDs = append(seatIDs, seat.ID)
		}
		created, err := s.repo.CreateFlightSeats(f.FlightID, seatIDs)
		if err != nil {
			continue
		}
		totalCreated += created
	}
	return &CreateFlightSeatsForAllResult{
		FlightsProcessed:   len(flights),
		FlightSeatsCreated: totalCreated,
	}, nil
}
