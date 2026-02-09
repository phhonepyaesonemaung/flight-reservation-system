'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Logo from '@/components/Logo'
import { CheckCircle, Download, Mail, Plane, Calendar } from 'lucide-react'

type ReceiptPassenger = {
  first_name?: string
  last_name?: string
  email?: string
}

type Receipt = {
  booking_id?: number
  booking_reference?: string
  flight_number?: string
  departure_airport_code?: string
  arrival_airport_code?: string
  departure_time?: string
  arrival_time?: string
  cabin_class?: string
  total_amount?: number
  passenger_count?: number
  passengers?: ReceiptPassenger[]
  issued_at?: string
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const bookingId = params.id
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('booking_confirmation')
        if (raw) {
          const data = JSON.parse(raw)
          if (String(data.bookingId) === String(bookingId)) {
            setBookingRef(data.bookingRef ?? null)
          }
        }
        const receiptRaw = sessionStorage.getItem('booking_receipt')
        if (receiptRaw) {
          setReceipt(JSON.parse(receiptRaw))
        }
      } catch {
        // ignore
      }
    }
  }, [bookingId])

  const passengerNames = useMemo(() => {
    if (!receipt?.passengers?.length) return []
    return receipt.passengers.map((p) => `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim())
  }, [receipt])

  const formatDateTime = (value?: string) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString()
  }

  const confirmationNumber = bookingRef ?? `Booking #${bookingId}`
  const flightNumber = receipt?.flight_number ?? '—'
  const route = receipt?.departure_airport_code && receipt?.arrival_airport_code
    ? `${receipt.departure_airport_code} → ${receipt.arrival_airport_code}`
    : '—'
  const departureTime = formatDateTime(receipt?.departure_time)
  const arrivalTime = formatDateTime(receipt?.arrival_time)
  const totalAmount = receipt?.total_amount ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo size="md" showText={true} className="text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your flight has been successfully booked. Confirmation details have been sent to your email.
          </p>
          
          {/* Confirmation Number */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold text-primary-800">{confirmationNumber}</p>
          </div>
        </div>

        {/* E-Ticket */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-primary-800 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">E-Ticket</h2>
            <p className="text-blue-200">Please save or print this ticket for your records</p>
          </div>

          <div className="p-8">
            {/* Flight Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-primary-600" />
                  Flight Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Airline</p>
                    <p className="font-semibold text-gray-800">AEROLINK Airways</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Flight Number</p>
                    <p className="font-semibold text-gray-800">{flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seat</p>
                    <p className="font-semibold text-gray-800">—</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Travel Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-800">{departureTime || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-semibold text-gray-800">{departureTime || '—'} - {receipt?.departure_airport_code ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Arrival</p>
                    <p className="font-semibold text-gray-800">{arrivalTime || '—'} - {receipt?.arrival_airport_code ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Passenger Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Passengers</p>
                  <p className="font-semibold text-gray-800">
                    {passengerNames.length ? passengerNames.join(', ') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-semibold text-gray-800">{route}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Paid</span>
                <span className="text-2xl font-bold text-gray-800">${totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center">
            <Download className="w-5 h-5 mr-2" />
            Download Ticket
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Ticket
          </button>
          <Link
            href="/my-bookings"
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
          >
            View My Bookings
          </Link>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Please arrive at the airport at least 2 hours before departure for domestic flights</li>
            <li>• Bring a valid government-issued photo ID for check-in</li>
            <li>• Check-in online 24 hours before your flight to save time</li>
            <li>• Review baggage allowances before arriving at the airport</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
