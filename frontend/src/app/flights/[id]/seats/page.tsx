'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Plane, Users, ArrowRight, Check } from 'lucide-react'
import Logo from '@/components/Logo'

export default function SeatSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const flightId = params.id
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [numPassengers] = useState(2) // From search params

  // Mock seat data
  const rows = 30
  const seatsPerRow = 6
  const aisleAfter = 3
  
  const bookedSeats = ['1A', '1B', '2C', '3D', '5A', '5F', '8B', '10C', '12D', '15A']

  const getSeatStatus = (seat: string) => {
    if (bookedSeats.includes(seat)) return 'booked'
    if (selectedSeats.includes(seat)) return 'selected'
    return 'available'
  }

  const handleSeatClick = (seat: string) => {
    if (bookedSeats.includes(seat)) return

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat))
    } else {
      if (selectedSeats.length < numPassengers) {
        setSelectedSeats([...selectedSeats, seat])
      }
    }
  }

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-gray-300 cursor-not-allowed'
      case 'selected':
        return 'bg-green-500 text-white cursor-pointer'
      default:
        return 'bg-blue-100 hover:bg-blue-200 cursor-pointer'
    }
  }

  const seatPrice = 250
  const totalPrice = selectedSeats.length * seatPrice

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <Link href={`/flights/${flightId}`} className="text-white hover:text-blue-200 transition">
              Back to Flight Details
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                <Check className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Flight Details</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
              <span className="ml-2 text-sm font-medium text-primary-600">Select Seats</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Passenger Info</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Select Your Seats</h1>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mb-6 pb-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Booked</span>
                </div>
              </div>

              {/* Plane Front */}
              <div className="flex justify-center mb-4">
                <div className="text-center">
                  <Plane className="w-12 h-12 text-primary-600 mx-auto" />
                  <p className="text-xs text-gray-500 mt-1">Front of Aircraft</p>
                </div>
              </div>

              {/* Seat Map */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {Array.from({ length: rows }, (_, rowIndex) => {
                  const rowNumber = rowIndex + 1
                  return (
                    <div key={rowNumber} className="flex items-center justify-center space-x-2">
                      <span className="w-8 text-sm font-medium text-gray-600 text-center">{rowNumber}</span>
                      {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                        const seatLetter = String.fromCharCode(65 + seatIndex)
                        const seatId = `${rowNumber}${seatLetter}`
                        const status = getSeatStatus(seatId)

                        return (
                          <div key={seatIndex} className="flex items-center">
                            <button
                              onClick={() => handleSeatClick(seatId)}
                              disabled={status === 'booked'}
                              className={`w-10 h-10 rounded text-sm font-medium transition ${
                                getSeatColor(status)
                              }`}
                            >
                              {seatLetter}
                            </button>
                            {seatIndex === aisleAfter - 1 && <div className="w-6"></div>}
                          </div>
                        )
                      })}
                      <span className="w-8 text-sm font-medium text-gray-600 text-center">{rowNumber}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Selection Summary</h2>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Users className="w-5 h-5" />
                  <span>{numPassengers} Passenger(s)</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Seats:</p>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No seats selected</p>
                  )}
                </div>

                {selectedSeats.length < numPassengers && (
                  <p className="text-sm text-orange-600 mt-2">
                    Please select {numPassengers - selectedSeats.length} more seat(s)
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seat Price (each)</span>
                    <span className="font-semibold text-gray-800">${seatPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Seats</span>
                    <span className="font-semibold text-gray-800">{selectedSeats.length}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-800 font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">${totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/flights/${flightId}/passengers`)}
                disabled={selectedSeats.length !== numPassengers}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to Passenger Info</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Seats are held for 15 minutes
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
