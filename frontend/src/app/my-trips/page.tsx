'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Logo from '@/components/Logo'
import { Plane, Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function MyTripsPage() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  // Mock trips data
  const trips = [
    {
      id: '1',
      type: 'upcoming',
      destination: 'Los Angeles',
      origin: 'New York',
      departDate: '2026-02-15',
      returnDate: '2026-02-22',
      flights: [
        {
          type: 'Outbound',
          flightNumber: 'AL 101',
          departure: '08:00 AM',
          arrival: '10:30 AM',
          status: 'On Time',
        },
        {
          type: 'Return',
          flightNumber: 'AL 102',
          departure: '03:00 PM',
          arrival: '11:30 PM',
          status: 'On Time',
        },
      ],
    },
    {
      id: '2',
      type: 'upcoming',
      destination: 'Miami',
      origin: 'Los Angeles',
      departDate: '2026-03-10',
      returnDate: null,
      flights: [
        {
          type: 'Outbound',
          flightNumber: 'AL 205',
          departure: '02:00 PM',
          arrival: '10:00 PM',
          status: 'On Time',
        },
      ],
    },
  ]

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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Trips</h1>

        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips planned</h3>
            <p className="text-gray-600 mb-6">Start planning your next adventure!</p>
            <Link
              href="/"
              className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Book a Flight
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{trip.destination}</h2>
                      <p className="text-blue-200">from {trip.origin}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-200 mb-1">Trip Dates</p>
                      <p className="font-semibold">{trip.departDate}</p>
                      {trip.returnDate && <p className="font-semibold">to {trip.returnDate}</p>}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {trip.flights.map((flight, index) => (
                      <div key={index} className="border-l-4 border-primary-600 pl-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-800">{flight.type} Flight</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {flight.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Flight Number</p>
                            <p className="font-semibold text-gray-800">{flight.flightNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Departure</p>
                            <p className="font-semibold text-gray-800">{flight.departure}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Arrival</p>
                            <p className="font-semibold text-gray-800">{flight.arrival}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <Link
                      href="/check-in"
                      className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-semibold transition text-center"
                    >
                      Check-in
                    </Link>
                    <Link
                      href="/my-bookings"
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition text-center"
                    >
                      View Details
                    </Link>
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
