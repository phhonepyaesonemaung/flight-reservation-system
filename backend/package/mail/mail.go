package mail

import (
	"fmt"
	"net/smtp"
	"os"
	"strconv"
	"strings"
)

type ReceiptEmail struct {
	BookingReference string
	FlightNumber     string
	Route            string
	DepartureTime    string
	ArrivalTime      string
	CabinClass       string
	TotalAmount      float64
	PassengerCount   int
	PassengerNames   []string
	IssuedAt         string
}

// SendingDisabled returns true when email is not configured (e.g. local dev without SMTP).
func SendingDisabled() bool {
	return os.Getenv("SMTP_HOST") == "" || os.Getenv("FROM_EMAIL") == ""
}

// SendVerificationEmail sends an email with a magic link to verify the account.
// Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (optional), FROM_EMAIL, APP_URL (e.g. http://localhost:3000).
func SendVerificationEmail(toEmail, token string) error {
	if SendingDisabled() {
		return fmt.Errorf("mail config missing")
	}
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	from := os.Getenv("FROM_EMAIL")
	appURL := strings.TrimSuffix(os.Getenv("APP_URL"), "/")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}

	if host == "" || portStr == "" || from == "" {
		return fmt.Errorf("mail config missing: set SMTP_HOST, SMTP_PORT, FROM_EMAIL")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil || port <= 0 {
		return fmt.Errorf("invalid SMTP_PORT: %s", portStr)
	}

	verifyURL := appURL + "/auth/verify-email?token=" + token
	subject := "Verify your AEROLINK account"
	body := fmt.Sprintf(
		"Hello,\n\nPlease verify your email by clicking the link below:\n\n%s\n\nThis link expires in 24 hours.\n\n— AEROLINK",
		verifyURL,
	)

	return sendPlainEmail(host, port, user, pass, from, toEmail, subject, body)
}

// SendReceiptEmail sends a booking receipt email.
// Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (optional), FROM_EMAIL.
func SendReceiptEmail(toEmail string, receipt ReceiptEmail) error {
	if SendingDisabled() {
		return fmt.Errorf("mail config missing")
	}
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	from := os.Getenv("FROM_EMAIL")

	if host == "" || portStr == "" || from == "" {
		return fmt.Errorf("mail config missing: set SMTP_HOST, SMTP_PORT, FROM_EMAIL")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil || port <= 0 {
		return fmt.Errorf("invalid SMTP_PORT: %s", portStr)
	}

	passengerList := strings.Join(receipt.PassengerNames, ", ")
	if passengerList == "" {
		passengerList = "(not provided)"
	}

	subject := "Your AEROLINK receipt"
	body := fmt.Sprintf(
		"Hello,\n\n"+
			"Thank you for your booking. Here is your receipt:\n\n"+
			"Booking Reference: %s\n"+
			"Flight: %s (%s)\n"+
			"Route: %s\n"+
			"Departure: %s\n"+
			"Arrival: %s\n"+
			"Cabin Class: %s\n"+
			"Passengers: %d\n"+
			"Passenger Names: %s\n"+
			"Total Paid: %.2f\n"+
			"Issued At: %s\n\n"+
			"— AEROLINK",
		receipt.BookingReference,
		receipt.FlightNumber,
		receipt.BookingReference,
		receipt.Route,
		receipt.DepartureTime,
		receipt.ArrivalTime,
		receipt.CabinClass,
		receipt.PassengerCount,
		passengerList,
		receipt.TotalAmount,
		receipt.IssuedAt,
	)

	return sendPlainEmail(host, port, user, pass, from, toEmail, subject, body)
}

func sendPlainEmail(host string, port int, user, pass, from, to, subject, body string) error {
	msg := []byte(
		"From: " + from + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"Content-Type: text/plain; charset=UTF-8\r\n" +
			"\r\n" + body,
	)

	addr := fmt.Sprintf("%s:%d", host, port)
	if user != "" && pass != "" {
		auth := smtp.PlainAuth("", user, pass, host)
		return smtp.SendMail(addr, auth, from, []string{to}, msg)
	}
	return smtp.SendMail(addr, nil, from, []string{to}, msg)
}
