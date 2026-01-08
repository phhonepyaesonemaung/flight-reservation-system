'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { ArrowLeft, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SeatSelectionPage() {
  const params = useParams()
  const router = useRouter()
  const flightId = params.id
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const passengers = 1 // From search params

  // Generate seat map (6 seats per row, A-F)
  const rows = 30
  const columns = ['A', 'B', 'C', 'D', 'E', 'F']
  
  // Mock occupied seats
  const occupiedSeats = ['1A', '1B', '2C', '5D', '5E', '8A', '8F', '12B', '15C', '15D']

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat)) return

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat))
    } else {
      if (selectedSeats.length >= passengers) {
        toast.error(`You can only select ${passengers} seat(s)`)
        return
      }
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const getSeatStatus = (seat: string) => {
    if (occupiedSeats.includes(seat)) return 'occupied'
    if (selectedSeats.includes(seat)) return 'selected'
    return 'available'
  }

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-gray-400 cursor-not-allowed'
      case 'selected':
        return 'bg-green-500 hover:bg-green-600 cursor-pointer'
      case 'available':
        return 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
      default:
        return 'bg-gray-200'
    }
  }

  const handleContinue = () => {
    if (selectedSeats.length !== passengers) {
      toast.error(`Please select ${passengers} seat(s)`)
      return
    }
    router.push(`/booking/passengers/${flightId}?seats=${selectedSeats.join(',')}`)
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
        <Link href={`/flights/${flightId}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Flight Details
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Seats</h2>
            
            {/* Legend */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-600">Occupied</span>
              </div>
            </div>

            {/* Cockpit */}
            <div className="bg-gray-800 text-white text-center py-3 rounded-t-lg mb-4">
              <span className="text-sm font-semibold">COCKPIT</span>
            </div>

            {/* Seat Grid */}
            <div className="space-y-2">
              {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center space-x-1">
                  {/* Row Number */}
                  <span className="w-8 text-sm text-gray-500 font-semibold">{rowIndex + 1}</span>
                  
                  {/* Seats ABC */}
                  {columns.slice(0, 3).map((col) => {
                    const seat = `${rowIndex + 1}${col}`
                    const status = getSeatStatus(seat)
                    return (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-10 h-10 rounded text-white text-xs font-semibold transition ${getSeatColor(status)}`}
                        disabled={status === 'occupied'}
                      >
                        {col}
                      </button>
                    )
                  })}
                  
                  {/* Aisle */}
                  <div className="w-6"></div>
                  
                  {/* Seats DEF */}
                  {columns.slice(3).map((col) => {
                    const seat = `${rowIndex + 1}${col}`
                    const status = getSeatStatus(seat)
                    return (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-10 h-10 rounded text-white text-xs font-semibold transition ${getSeatColor(status)}`}
                        disabled={status === 'occupied'}
                      >
                        {col}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Selection</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Passengers:</span>
                <span className="font-semibold">{passengers}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Seats Required:</span>
                <span className="font-semibold">{passengers}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Seats Selected:</span>
                <span className={`font-semibold ${selectedSeats.length === passengers ? 'text-green-600' : 'text-accent'}`}>
                  {selectedSeats.length}
                </span>
              </div>
            </div>

            {/* Selected Seats Display */}
            {selectedSeats.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Selected Seats:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <div key={seat} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <span>{seat}</span>
                      <button onClick={() => handleSeatClick(seat)} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seat Price */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Seat Selection:</span>
                <span className="text-lg font-bold text-gray-800">$0</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Seat selection is complimentary</p>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={selectedSeats.length !== passengers}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition"
            >
              Continue to Passenger Details
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
