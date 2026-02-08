'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Plane, Clock, MapPin, Calendar, Users, Wifi, Coffee, Tv, ArrowLeft } from 'lucide-react'

export default function FlightDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const flightId = params.id

  // Mock flight data
  const flight = {
    id: flightId,
    airline: 'AEROLINK Airways',
    flightNumber: 'AL 101',
    aircraft: 'Boeing 737-800',
    origin: 'New York (JFK)',
    destination: 'Los Angeles (LAX)',
    departure: '08:00 AM',
    arrival: '10:30 AM',
    date: '2026-02-15',
    duration: '5h 30m',
    price: 250,
    availableSeats: 45,
    totalSeats: 180,
    class: 'Economy',
    amenities: ['WiFi', 'Entertainment', 'Meals', 'Power Outlets'],
    baggage: { checkedBag: '23kg', carryOn: '7kg' },
    cancellationPolicy: 'Refundable within 24 hours',
  }

  const handleSelectFlight = () => {
    router.push(`/booking/passengers/${flightId}?passengers=1&cabinClass=economy`)
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/flights/search" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search Results
        </Link>

        {/* Flight Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{flight.airline}</h1>
              <p className="text-gray-600">Flight {flight.flightNumber} • {flight.aircraft}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Price per person</p>
              <p className="text-4xl font-bold text-accent">${flight.price}</p>
            </div>
          </div>

          {/* Flight Route */}
          <div className="grid grid-cols-3 gap-8 mb-8 py-6 border-y border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Departure</p>
              <p className="text-3xl font-bold text-gray-800">{flight.departure}</p>
              <p className="text-gray-600 mt-2">{flight.origin}</p>
              <p className="text-sm text-gray-500">{flight.date}</p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <div className="flex items-center justify-center mb-2">
                <div className="h-px w-16 bg-gray-300"></div>
                <Plane className="w-6 h-6 text-primary-600 mx-2" />
                <div className="h-px w-16 bg-gray-300"></div>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{flight.duration}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Direct Flight</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Arrival</p>
              <p className="text-3xl font-bold text-gray-800">{flight.arrival}</p>
              <p className="text-gray-600 mt-2">{flight.destination}</p>
              <p className="text-sm text-gray-500">{flight.date}</p>
            </div>
          </div>

          {/* Flight Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Class</p>
              <p className="font-semibold text-gray-800">{flight.class}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Available Seats</p>
              <p className="font-semibold text-green-600">{flight.availableSeats} / {flight.totalSeats}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Checked Bag</p>
              <p className="font-semibold text-gray-800">{flight.baggage.checkedBag}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Carry-on</p>
              <p className="font-semibold text-gray-800">{flight.baggage.carryOn}</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Flight Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <Wifi className="w-5 h-5 text-primary-600" />
                <span>WiFi Available</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Tv className="w-5 h-5 text-primary-600" />
                <span>Entertainment</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Coffee className="w-5 h-5 text-primary-600" />
                <span>Meals Included</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span>Power Outlets</span>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Cancellation Policy</h3>
            <p className="text-gray-600">{flight.cancellationPolicy}</p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSelectFlight}
            className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
          >
            Continue to Seat Selection
          </button>
        </div>
      </main>
    </div>
  )
}
