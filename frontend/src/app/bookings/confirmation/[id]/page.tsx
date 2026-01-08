'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, Mail, Calendar, MapPin, Plane, User } from 'lucide-react'
import Logo from '@/components/Logo'

export default function BookingConfirmationPage() {
  const params = useParams()
  const bookingId = params.id

  const booking = {
    id: bookingId,
    status: 'confirmed',
    bookingDate: 'Jan 08, 2026',
    flight: {
      airline: 'AEROLINK Airways',
      flightNumber: 'AL 101',
      departure: {
        time: '08:00 AM',
        date: 'Jan 15, 2026',
        airport: 'Mandalay International',
        city: 'Mandalay',
        code: 'MDL',
      },
      arrival: {
        time: '10:30 AM',
        date: 'Jan 15, 2026',
        airport: 'Yangon International',
        city: 'Yangon',
        code: 'RGN',
      },
    },
    passengers: [
      { name: 'John Doe', seat: '5A' },
      { name: 'Jane Doe', seat: '5B' },
    ],
    totalAmount: 500,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo size="md" showText={true} className="text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your flight has been successfully booked</p>
          <p className="text-sm text-gray-500 mt-2">Booking Reference: <span className="font-bold text-primary-600">{bookingId}</span></p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-primary-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{booking.flight.airline}</h2>
                <p className="text-blue-100">Flight {booking.flight.flightNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Booking Date</p>
                <p className="font-semibold">{booking.bookingDate}</p>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Departure</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{booking.flight.departure.time}</p>
                <p className="text-sm text-gray-600">{booking.flight.departure.date}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{booking.flight.departure.code}</p>
                    <p className="text-xs text-gray-600">{booking.flight.departure.airport}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <Plane className="w-8 h-8 text-primary-600 mb-2" />
                <p className="text-sm text-gray-600">Direct Flight</p>
                <div className="w-full h-px bg-gray-300 my-2"></div>
                <p className="text-xs text-gray-500">2h 30m</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">Arrival</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{booking.flight.arrival.time}</p>
                <p className="text-sm text-gray-600">{booking.flight.arrival.date}</p>
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{booking.flight.arrival.code}</p>
                    <p className="text-xs text-gray-600">{booking.flight.arrival.airport}</p>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Passengers
              </h3>
              <div className="space-y-3">
                {booking.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-semibold text-gray-800">{passenger.name}</p>
                      <p className="text-sm text-gray-600">Passenger {index + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Seat</p>
                      <p className="font-bold text-primary-600 text-lg">{passenger.seat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount Paid</span>
                <span className="text-3xl font-bold text-green-600">${booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download E-Ticket</span>
          </button>
          <button className="bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Email Confirmation</span>
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Check-in opens 24 hours before departure</span>
            </li>
            <li className="flex items-start">
              <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Confirmation email has been sent to your registered email</span>
            </li>
            <li className="flex items-start">
              <Plane className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Arrive at the airport at least 2 hours before departure</span>
            </li>
          </ul>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-center space-x-4">
          <Link
            href="/my-bookings"
            className="text-primary-600 hover:text-primary-700 font-semibold transition"
          >
            View My Bookings
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-semibold transition"
          >
            Book Another Flight
          </Link>
        </div>
      </main>
    </div>
  )
}
