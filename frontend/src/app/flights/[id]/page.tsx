'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Plane, Clock, Calendar, Users, MapPin, Info, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'

export default function FlightDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const flightId = params.id

  // Mock flight data
  const flight = {
    id: flightId,
    airline: 'AEROLINK Airways',
    flightNumber: 'AL 101',
    aircraft: 'Boeing 737-800',
    departure: {
      time: '08:00 AM',
      date: 'Jan 15, 2026',
      airport: 'Mandalay International Airport',
      city: 'Mandalay',
      code: 'MDL',
      terminal: 'Terminal 1',
      gate: 'A12',
    },
    arrival: {
      time: '10:30 AM',
      date: 'Jan 15, 2026',
      airport: 'Yangon International Airport',
      city: 'Yangon',
      code: 'RGN',
      terminal: 'Terminal 2',
      gate: 'B8',
    },
    duration: '2h 30m',
    price: 250,
    availableSeats: 45,
    totalSeats: 180,
    class: 'Economy',
    baggage: {
      checkedIn: '20 kg',
      cabin: '7 kg',
    },
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Power Outlet'],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <Link href="/" className="text-white hover:text-blue-200 transition">
              Back to Search
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Plane className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{flight.airline}</h1>
                    <p className="text-gray-600">{flight.flightNumber} • {flight.aircraft}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="text-lg font-semibold text-gray-800">{flight.class}</p>
                </div>
              </div>

              {/* Flight Route */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Departure</p>
                  <p className="text-3xl font-bold text-gray-800">{flight.departure.time}</p>
                  <p className="text-sm text-gray-600 mt-1">{flight.departure.date}</p>
                  <p className="text-lg font-semibold text-gray-800 mt-2">{flight.departure.code}</p>
                  <p className="text-sm text-gray-600">{flight.departure.city}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">{flight.duration}</p>
                  <div className="w-full h-px bg-gray-300 my-2"></div>
                  <p className="text-xs text-gray-500">Direct Flight</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Arrival</p>
                  <p className="text-3xl font-bold text-gray-800">{flight.arrival.time}</p>
                  <p className="text-sm text-gray-600 mt-1">{flight.arrival.date}</p>
                  <p className="text-lg font-semibold text-gray-800 mt-2">{flight.arrival.code}</p>
                  <p className="text-sm text-gray-600">{flight.arrival.city}</p>
                </div>
              </div>

              {/* Airport Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Departure Details</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><MapPin className="w-4 h-4 inline mr-2" />{flight.departure.airport}</p>
                    <p className="ml-6">Terminal: {flight.departure.terminal}</p>
                    <p className="ml-6">Gate: {flight.departure.gate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Arrival Details</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><MapPin className="w-4 h-4 inline mr-2" />{flight.arrival.airport}</p>
                    <p className="ml-6">Terminal: {flight.arrival.terminal}</p>
                    <p className="ml-6">Gate: {flight.arrival.gate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Baggage Allowance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Checked-in Baggage</p>
                  <p className="text-2xl font-bold text-primary-600">{flight.baggage.checkedIn}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Cabin Baggage</p>
                  <p className="text-2xl font-bold text-primary-600">{flight.baggage.cabin}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flight.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check-in opens 3 hours before departure</li>
                    <li>• Please arrive at least 2 hours before departure</li>
                    <li>• Valid ID required for all passengers</li>
                    <li>• Cancellation fees may apply</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Route</span>
                  <span className="font-semibold text-gray-800">{flight.departure.code} → {flight.arrival.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-800">{flight.departure.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Flight</span>
                  <span className="font-semibold text-gray-800">{flight.flightNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Class</span>
                  <span className="font-semibold text-gray-800">{flight.class}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Seats</span>
                  <span className="font-semibold text-green-600">{flight.availableSeats}/{flight.totalSeats}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Price per person</span>
                  <span className="text-2xl font-bold text-gray-800">${flight.price}</span>
                </div>
                <p className="text-xs text-gray-500">Taxes and fees included</p>
              </div>

              <button
                onClick={() => router.push(`/flights/${flightId}/seats`)}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Continue to Seat Selection</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Free cancellation within 24 hours
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
