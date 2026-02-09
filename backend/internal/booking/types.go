package booking

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
}
