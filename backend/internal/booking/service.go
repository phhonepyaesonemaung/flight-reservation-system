package booking

import (
	"errors"
	"strings"
	"time"

	"aerolink_backend/package/mail"
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

	flightInfo, err := s.repo.GetFlightReceiptInfo(req.FlightID)
	if err != nil {
		return nil, err
	}

	passengers := make([]ReceiptPassenger, 0, len(req.Passengers))
	for _, p := range req.Passengers {
		passengers = append(passengers, ReceiptPassenger{
			FirstName: strings.TrimSpace(p.FirstName),
			LastName:  strings.TrimSpace(p.LastName),
			Email:     strings.TrimSpace(p.Email),
		})
	}

	receipt := Receipt{
		BookingID:            bookingID,
		BookingReference:     bookingRef,
		FlightNumber:         flightInfo.FlightNumber,
		DepartureAirportCode: flightInfo.DepartureAirportCode,
		ArrivalAirportCode:   flightInfo.ArrivalAirportCode,
		DepartureTime:        flightInfo.DepartureTime,
		ArrivalTime:          flightInfo.ArrivalTime,
		CabinClass:           cabin,
		TotalAmount:          req.TotalAmount,
		PassengerCount:       len(req.Passengers),
		Passengers:           passengers,
		IssuedAt:             time.Now(),
	}

	mailSent := false
	if email, err := s.repo.GetUserEmail(userID); err == nil && strings.TrimSpace(email) != "" {
		receiptEmail := mail.ReceiptEmail{
			BookingReference: receipt.BookingReference,
			FlightNumber:     receipt.FlightNumber,
			Route:            receipt.DepartureAirportCode + " -> " + receipt.ArrivalAirportCode,
			DepartureTime:    receipt.DepartureTime.Format(time.RFC1123),
			ArrivalTime:      receipt.ArrivalTime.Format(time.RFC1123),
			CabinClass:       formatCabinClass(receipt.CabinClass),
			TotalAmount:      receipt.TotalAmount,
			PassengerCount:   receipt.PassengerCount,
			PassengerNames:   extractPassengerNames(passengers),
			IssuedAt:         receipt.IssuedAt.Format(time.RFC1123),
		}
		if err := mail.SendReceiptEmail(email, receiptEmail); err == nil {
			mailSent = true
		}
	}
	return &CreateBookingResponse{
		BookingID:        bookingID,
		BookingReference: bookingRef,
		Receipt:          receipt,
		EmailSent:        mailSent,
	}, nil
}

func extractPassengerNames(passengers []ReceiptPassenger) []string {
	items := make([]string, 0, len(passengers))
	for _, p := range passengers {
		name := strings.TrimSpace(p.FirstName + " " + p.LastName)
		if name != "" {
			items = append(items, name)
		}
	}
	return items
}

func formatCabinClass(cabin string) string {
	trimmed := strings.TrimSpace(cabin)
	if trimmed == "" {
		return ""
	}
	return strings.ToUpper(trimmed[:1]) + strings.ToLower(trimmed[1:])
}
