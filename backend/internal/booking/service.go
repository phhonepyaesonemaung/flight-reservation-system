package booking

import (
	"errors"
	"strings"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateBooking(userID int, req *CreateBookingRequest) (*CreateBookingResponse, error) {
	if req.FlightID <= 0 {
		return nil, errors.New("flight_id is required")
	}
	cabin := strings.TrimSpace(strings.ToLower(req.CabinClass))
	if cabin == "" {
		cabin = "economy"
	}
	if cabin != "economy" && cabin != "business" && cabin != "first" {
		return nil, errors.New("cabin_class must be economy, business, or first")
	}
	if len(req.Passengers) == 0 {
		return nil, errors.New("at least one passenger is required")
	}
	for i, p := range req.Passengers {
		if strings.TrimSpace(p.FirstName) == "" {
			return nil, errors.New("passenger first_name is required")
		}
		if strings.TrimSpace(p.LastName) == "" {
			return nil, errors.New("passenger last_name is required")
		}
		if strings.TrimSpace(p.Email) == "" {
			return nil, errors.New("passenger email is required")
		}
		if strings.TrimSpace(p.Phone) == "" {
			return nil, errors.New("passenger phone is required")
		}
		_ = i
	}
	if req.TotalAmount < 0 {
		return nil, errors.New("total_amount must be non-negative")
	}

	bookingID, bookingRef, err := s.repo.CreateBooking(userID, req.FlightID, cabin, req.TotalAmount, req.Passengers)
	if err != nil {
		return nil, err
	}
	return &CreateBookingResponse{
		BookingID:        bookingID,
		BookingReference: bookingRef,
	}, nil
}
