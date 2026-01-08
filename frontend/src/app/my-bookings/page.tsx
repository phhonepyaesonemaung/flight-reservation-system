'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Logo from '@/components/Logo'
import { Plane, Calendar, MapPin, Download, X, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  // Mock bookings data
  const bookings = {
    upcoming: [
      {
        id: '1',
        confirmationNumber: 'AL2026-ABC123',
        flight: {
          airline: 'AEROLINK Airways',
          flightNumber: 'AL 101',
          origin: 'New York (JFK)',
          destination: 'Los Angeles (LAX)',
          departure: '08:00 AM',
          arrival: '10:30 AM',
          date: '2026-02-15',
        },
        seat: '12A',
        status: 'Confirmed',
        price: 285,
      },
      {
        id: '2',
        confirmationNumber: 'AL2026-XYZ789',
        flight: {
          airline: 'AEROLINK Airways',
          flightNumber: 'AL 205',
          origin: 'Los Angeles (LAX)',
          destination: 'Miami (MIA)',
          departure: '02:00 PM',
          arrival: '10:00 PM',
          date: '2026-03-10',
        },
        seat: '8C',
        status: 'Confirmed',
        price: 320,
      },
    ],
    past: [
      {
        id: '3',
        confirmationNumber: 'AL2025-DEF456',
        flight: {
          airline: 'AEROLINK Airways',
          flightNumber: 'AL 303',
          origin: 'Miami (MIA)',
          destination: 'New York (JFK)',
          departure: '10:00 AM',
          arrival: '01:00 PM',
          date: '2025-12-20',
        },
        seat: '15F',
        status: 'Completed',
        price: 275,
      },
    ],
    cancelled: [],
  }

  const currentBookings = bookings[activeTab]

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <Link href="/dashboard" className="text-white hover:text-blue-200 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'upcoming'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Upcoming ({bookings.upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'past'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Past ({bookings.past.length})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'cancelled'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cancelled ({bookings.cancelled.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {currentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You don't have any {activeTab} bookings yet.</p>
            <Link
              href="/"
              className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Book a Flight
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {currentBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Confirmation: {booking.confirmationNumber}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">${booking.price}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Flight</p>
                      <p className="font-semibold text-gray-800">{booking.flight.airline}</p>
                      <p className="text-gray-600">{booking.flight.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Route</p>
                      <p className="font-semibold text-gray-800">{booking.flight.origin}</p>
                      <p className="text-gray-600 flex items-center">
                        <span className="text-accent mx-2">→</span>
                        {booking.flight.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-800">{booking.flight.date}</p>
                      <p className="text-gray-600">{booking.flight.departure} - {booking.flight.arrival}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Seat: <span className="font-semibold text-gray-800">{booking.seat}</span>
                    </div>
                    <div className="flex space-x-3">
                      <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download Ticket
                      </button>
                      {activeTab === 'upcoming' && (
                        <Link
                          href="/check-in"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Check-in
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
