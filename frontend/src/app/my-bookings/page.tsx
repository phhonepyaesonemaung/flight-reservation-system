'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Link from 'next/link'
import { Plane, Calendar, MapPin, User, Download, X } from 'lucide-react'
import Logo from '@/components/Logo'

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  // Mock bookings data
  const bookings = [
    {
      id: 'BK001',
      status: 'confirmed',
      bookingDate: 'Jan 08, 2026',
      flight: {
        airline: 'AEROLINK Airways',
        flightNumber: 'AL 101',
        departure: {
          time: '08:00 AM',
          date: 'Jan 15, 2026',
          code: 'MDL',
          city: 'Mandalay',
        },
        arrival: {
          time: '10:30 AM',
          date: 'Jan 15, 2026',
          code: 'RGN',
          city: 'Yangon',
        },
      },
      passengers: 2,
      seats: ['5A', '5B'],
      totalAmount: 500,
    },
    {
      id: 'BK002',
      status: 'completed',
      bookingDate: 'Dec 20, 2025',
      flight: {
        airline: 'Sky Jet',
        flightNumber: 'SJ 205',
        departure: {
          time: '12:00 PM',
          date: 'Dec 25, 2025',
          code: 'RGN',
          city: 'Yangon',
        },
        arrival: {
          time: '02:45 PM',
          date: 'Dec 25, 2025',
          code: 'MDL',
          city: 'Mandalay',
        },
      },
      passengers: 1,
      seats: ['12C'],
      totalAmount: 280,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-white hover:text-blue-200 transition">Home</Link>
              <Link href="/dashboard" className="text-white hover:text-blue-200 transition">Dashboard</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your flight reservations</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              filter === 'upcoming' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              filter === 'completed' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              filter === 'cancelled' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                {/* Booking Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Plane className="w-6 h-6 text-primary-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{booking.flight.airline}</h3>
                      <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                {/* Flight Route */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Departure</p>
                    <p className="text-xl font-bold text-gray-800">{booking.flight.departure.time}</p>
                    <p className="text-sm text-gray-600">{booking.flight.departure.date}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {booking.flight.departure.code} - {booking.flight.departure.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full h-px bg-gray-300 relative">
                      <Plane className="w-5 h-5 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{booking.flight.flightNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Arrival</p>
                    <p className="text-xl font-bold text-gray-800">{booking.flight.arrival.time}</p>
                    <p className="text-sm text-gray-600">{booking.flight.arrival.date}</p>
                    <div className="flex items-center justify-end space-x-1 mt-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {booking.flight.arrival.code} - {booking.flight.arrival.city}
                      </span>
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{booking.passengers} Passenger(s)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Booked on {booking.bookingDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Seats: </span>
                      {booking.seats.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-primary-600">${booking.totalAmount}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href={`/bookings/confirmation/${booking.id}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition text-center"
                  >
                    View Details
                  </Link>
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-semibold transition flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  {booking.status === 'confirmed' && (
                    <button className="bg-white border border-red-300 hover:bg-red-50 text-red-600 py-2 px-4 rounded-lg font-semibold transition flex items-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You haven't made any flight reservations yet</p>
            <Link
              href="/"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg font-semibold transition"
            >
              Book a Flight Now
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
