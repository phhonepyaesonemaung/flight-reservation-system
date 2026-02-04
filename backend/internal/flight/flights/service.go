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

// BackfillFlightCabinInventory creates or updates flight_cabin_inventory for all existing flights from their aircraft seats.
func (s *Service) BackfillFlightCabinInventory() (flightsProcessed int, err error) {
	return s.repo.BackfillFlightCabinInventory()
}

// SearchFlightsRequest is the body for the flight search endpoint.
type SearchFlightsRequest struct {
	Type          string `json:"type"`           // "one-way" or "round-trip"
	From          int    `json:"from"`            // departure airport ID
	To            int    `json:"to"`              // arrival airport ID
	DepartureDate string `json:"departureDate"`   // YYYY-MM-DD
	ReturnDate    string `json:"returnDate"`      // YYYY-MM-DD, required if round-trip
	CabinClass    string `json:"cabinClass"`      // economy, business, first
}

// SearchFlightsResponse is the search endpoint response.
type SearchFlightsResponse struct {
	Outbound []SearchFlightRow `json:"outbound"`
	Return   []SearchFlightRow `json:"return,omitempty"` // only for round-trip
}

// SearchFlights runs the flight search and returns outbound (and return for round-trip) flights.
func (s *Service) SearchFlights(req *SearchFlightsRequest) (*SearchFlightsResponse, error) {
	if req.From <= 0 || req.To <= 0 {
		return nil, errors.New("from and to (airport IDs) are required")
	}
	if req.DepartureDate == "" {
		return nil, errors.New("departureDate is required")
	}
	cabin := req.CabinClass
	if cabin == "" {
		cabin = "economy"
	}
	if cabin != "economy" && cabin != "business" && cabin != "first" {
		return nil, errors.New("cabinClass must be economy, business, or first")
	}
	outbound, err := s.repo.SearchFlights(req.From, req.To, req.DepartureDate, cabin)
	if err != nil {
		return nil, err
	}
	resp := &SearchFlightsResponse{Outbound: outbound}
	if req.Type == "round-trip" {
		if req.ReturnDate == "" {
			return nil, errors.New("returnDate is required for round-trip")
		}
		returnFlights, err := s.repo.SearchFlights(req.To, req.From, req.ReturnDate, cabin)
		if err != nil {
			return nil, err
		}
		resp.Return = returnFlights
	}
	return resp, nil
}
