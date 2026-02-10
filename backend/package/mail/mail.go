package mail

import (
	"bytes"
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

// SendReceiptEmail sends a booking receipt email as a styled HTML ticket.
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

	subject := "Your AEROLINK booking confirmation – " + receipt.BookingReference
	plainBody := fmt.Sprintf(
		"Hello,\n\nThank you for your booking. Here is your receipt:\n\n"+
			"Booking Reference: %s\nFlight: %s\nRoute: %s\n"+
			"Departure: %s\nArrival: %s\nCabin Class: %s\n"+
			"Passengers: %d\nPassenger Names: %s\nTotal Paid: $%.2f\nIssued At: %s\n\n— AEROLINK",
		receipt.BookingReference, receipt.FlightNumber, receipt.Route,
		receipt.DepartureTime, receipt.ArrivalTime, receipt.CabinClass,
		receipt.PassengerCount, passengerList, receipt.TotalAmount, receipt.IssuedAt,
	)
	htmlBody := buildReceiptHTML(receipt, passengerList)

	return sendMultipartEmail(host, port, user, pass, from, toEmail, subject, plainBody, htmlBody)
}

// buildReceiptHTML returns a styled HTML ticket for the receipt email.
func buildReceiptHTML(r ReceiptEmail, passengerList string) string {
	totalStr := fmt.Sprintf("%.2f", r.TotalAmount)
	// Inline styles for maximum email client compatibility
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ` + r.BookingReference + `</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 24px 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">AEROLINK</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Booking Confirmation</p>
            </td>
          </tr>
          <!-- PNR -->
          <tr>
            <td style="padding: 20px 28px 12px 28px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Booking reference</p>
              <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 700; color: #1e3a5f; letter-spacing: 2px;">` + r.BookingReference + `</p>
            </td>
          </tr>
          <!-- Flight card -->
          <tr>
            <td style="padding: 8px 28px 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td colspan="3" style="background-color: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Flight</span>
                    <span style="font-weight: 700; color: #1e293b; margin-left: 8px;">` + r.FlightNumber + `</span>
                    <span style="color: #64748b; margin-left: 8px;">` + r.CabinClass + `</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; width: 33%; vertical-align: top;">
                    <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Departure</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 600; color: #1e293b;">` + r.DepartureTime + `</p>
                  </td>
                  <td style="padding: 16px; width: 34%; text-align: center; vertical-align: top;">
                    <p style="margin: 0; font-size: 12px; color: #1e3a5f; font-weight: 600;">` + r.Route + `</p>
                    <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">—</p>
                  </td>
                  <td style="padding: 16px; width: 33%; vertical-align: top; text-align: right;">
                    <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Arrival</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 600; color: #1e293b;">` + r.ArrivalTime + `</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Passengers -->
          <tr>
            <td style="padding: 0 28px 8px 28px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Passengers (` + strconv.Itoa(r.PassengerCount) + `)</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #374151;">` + passengerList + `</p>
            </td>
          </tr>
          <!-- Total -->
          <tr>
            <td style="padding: 16px 28px 24px 28px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><span style="font-size: 15px; font-weight: 600; color: #1e293b;">Total paid</span></td>
                  <td align="right"><span style="font-size: 20px; font-weight: 700; color: #1e3a5f;">$` + totalStr + `</span></td>
                </tr>
              </table>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">Issued ` + r.IssuedAt + `</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; text-align: center; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">Thank you for flying with <strong>AEROLINK</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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

// sendMultipartEmail sends an email with both plain text and HTML parts (multipart/alternative).
func sendMultipartEmail(host string, port int, user, pass, from, to, subject, plainBody, htmlBody string) error {
	boundary := "aero-boundary-" + strconv.FormatInt(int64(len(plainBody)+len(htmlBody)), 10)
	var buf bytes.Buffer
	buf.WriteString("From: " + from + "\r\n")
	buf.WriteString("To: " + to + "\r\n")
	buf.WriteString("Subject: " + subject + "\r\n")
	buf.WriteString("MIME-Version: 1.0\r\n")
	buf.WriteString("Content-Type: multipart/alternative; boundary=\"" + boundary + "\"\r\n\r\n")

	// Plain part
	buf.WriteString("--" + boundary + "\r\n")
	buf.WriteString("Content-Type: text/plain; charset=UTF-8\r\n\r\n")
	buf.WriteString(plainBody)
	buf.WriteString("\r\n")

	// HTML part
	buf.WriteString("--" + boundary + "\r\n")
	buf.WriteString("Content-Type: text/html; charset=UTF-8\r\n\r\n")
	buf.WriteString(htmlBody)
	buf.WriteString("\r\n")
	buf.WriteString("--" + boundary + "--\r\n")

	addr := fmt.Sprintf("%s:%d", host, port)
	if user != "" && pass != "" {
		auth := smtp.PlainAuth("", user, pass, host)
		return smtp.SendMail(addr, auth, from, []string{to}, buf.Bytes())
	}
	return smtp.SendMail(addr, nil, from, []string{to}, buf.Bytes())
}
