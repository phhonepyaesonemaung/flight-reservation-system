'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Plane, Clock, DollarSign } from 'lucide-react'

function SearchResults() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const passengers = searchParams.get('passengers')
  const type = searchParams.get('type')

  // Mock flight data
  const flights = [
    {
      id: 1,
      airline: 'AEROLINK Airways',
      flightNumber: 'AL 101',
      departure: '08:00 AM',
      arrival: '10:30 AM',
      duration: '2h 30m',
      price: 250,
      availableSeats: 45,
    },
    {
      id: 2,
      airline: 'Sky Jet',
      flightNumber: 'SJ 205',
      departure: '12:00 PM',
      arrival: '02:45 PM',
      duration: '2h 45m',
      price: 280,
      availableSeats: 32,
    },
    {
      id: 3,
      airline: 'AEROLINK Airways',
      flightNumber: 'AL 303',
      departure: '04:30 PM',
      arrival: '07:00 PM',
      duration: '2h 30m',
      price: 245,
      availableSeats: 58,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo size="md" showText={true} className="text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="font-semibold">{from}</span>
            <span className="text-accent">→</span>
            <span className="font-semibold">{to}</span>
            <span>•</span>
            <span>{date}</span>
            <span>•</span>
            <span>{passengers} Passenger(s)</span>
            <span>•</span>
            <span className="capitalize">{type}</span>
          </div>
        </div>

        {/* Flight List */}
        <div className="space-y-4">
          {flights.map((flight) => (
            <div key={flight.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <Plane className="w-6 h-6 text-primary-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{flight.airline}</h3>
                      <p className="text-sm text-gray-500">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="text-2xl font-bold text-gray-800">{flight.departure}</p>
                      <p className="text-sm text-gray-600">{from}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Duration</p>
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{flight.duration}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Arrival</p>
                      <p className="text-2xl font-bold text-gray-800">{flight.arrival}</p>
                      <p className="text-sm text-gray-600">{to}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-sm text-green-600">
                      {flight.availableSeats} seats available
                    </span>
                  </div>
                </div>

                <div className="text-right ml-8">
                  <div className="flex items-center justify-end mb-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-3xl font-bold text-gray-800">{flight.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">per person</p>
                  <Link
                    href="/auth/signin"
                    className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                  >
                    Select Flight
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
