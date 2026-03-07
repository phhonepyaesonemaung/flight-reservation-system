'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Logo from '@/components/Logo'
import { Plane, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

type BookingItem = {
  id: number
  booking_reference: string
  status: string
  total_amount: number
  checked_in_at: string | null
  flight_number: string
  departure_airport_code: string
  arrival_airport_code: string
  departure_time: string
  arrival_time: string
  cabin_class: string
  passenger_count: number
}

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    api
      .get('/booking/my-bookings')
      .then((res) => {
        const data = res.data?.data ?? res.data
        setBookings(Array.isArray(data) ? data : [])
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [isAuthenticated, router])

  const now = new Date()
  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && new Date(b.departure_time) >= now)
  const past = bookings.filter((b) => b.status !== 'cancelled' && new Date(b.departure_time) < now)
  const cancelled = bookings.filter((b) => b.status === 'cancelled')

  const tabBookings = {
    upcoming,
    past,
    cancelled,
  }
  const currentBookings = tabBookings[activeTab]

  const formatDate = (s: string) => {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('en-US', { dateStyle: 'medium' })
  }
  const formatTime = (s: string) => {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

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
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'past'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Past ({past.length})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'cancelled'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cancelled ({cancelled.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-600">Loading your bookings…</div>
        ) : currentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You don&apos;t have any {activeTab} bookings yet.</p>
            <Link
              href="/flights/search"
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
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status === 'confirmed' && booking.checked_in_at
                            ? 'Checked in'
                            : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        {booking.checked_in_at && (
                          <span className="text-green-600 text-xs font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Checked in
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Confirmation: {booking.booking_reference}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">${Number(booking.total_amount).toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Flight</p>
                      <p className="font-semibold text-gray-800">AEROLINK Airways</p>
                      <p className="text-gray-600">{booking.flight_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Route</p>
                      <p className="font-semibold text-gray-800">{booking.departure_airport_code}</p>
                      <p className="text-gray-600 flex items-center">
                        <span className="text-accent mx-2">→</span>
                        {booking.arrival_airport_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-800">{formatDate(booking.departure_time)}</p>
                      <p className="text-gray-600">
                        {formatTime(booking.departure_time)} – {formatTime(booking.arrival_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Passengers: <span className="font-semibold text-gray-800">{booking.passenger_count}</span>
                      <span className="ml-2 text-gray-500">• {booking.cabin_class}</span>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/booking/confirmation/${booking.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Ticket
                      </Link>
                      {activeTab === 'upcoming' && !booking.checked_in_at && (
                        <Link
                          href={`/check-in/${booking.id}`}
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
