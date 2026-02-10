package booking

import "time"

type PassengerInput struct {
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	DateOfBirth   string `json:"date_of_birth"`
	PassportNumber string `json:"passport_number,omitempty"`
}

type CreateBookingRequest struct {
	FlightID    int             `json:"flight_id"`
	CabinClass  string          `json:"cabin_class"`
	TotalAmount float64         `json:"total_amount"`
	Passengers  []PassengerInput `json:"passengers"`
}

type CreateBookingResponse struct {
	BookingID       int    `json:"booking_id"`
	BookingReference string `json:"booking_reference"`
	Receipt          Receipt `json:"receipt"`
	EmailSent        bool    `json:"email_sent"`
}

type ReceiptPassenger struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

type Receipt struct {
	BookingID            int                `json:"booking_id"`
	BookingReference     string             `json:"booking_reference"`
	FlightNumber         string             `json:"flight_number"`
	DepartureAirportCode string             `json:"departure_airport_code"`
	ArrivalAirportCode   string             `json:"arrival_airport_code"`
	DepartureTime        time.Time          `json:"departure_time"`
	ArrivalTime          time.Time          `json:"arrival_time"`
	CabinClass           string             `json:"cabin_class"`
	TotalAmount          float64            `json:"total_amount"`
	PassengerCount       int                `json:"passenger_count"`
	Passengers           []ReceiptPassenger `json:"passengers"`
	IssuedAt             time.Time          `json:"issued_at"`
}
