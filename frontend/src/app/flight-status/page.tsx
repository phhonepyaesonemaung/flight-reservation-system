'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Logo from '@/components/Logo'
import { Search, Plane, Clock, MapPin, AlertCircle } from 'lucide-react'

const statusSchema = z.object({
  flightNumber: z.string().min(1, 'Flight number is required'),
  date: z.string().min(1, 'Date is required'),
})

type StatusFormData = z.infer<typeof statusSchema>

export default function FlightStatusPage() {
  const [flightStatus, setFlightStatus] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
  })

  const onSubmit = (data: StatusFormData) => {
    // Simulate flight status lookup
    setFlightStatus({
      flightNumber: data.flightNumber.toUpperCase(),
      airline: 'AEROLINK Airways',
      status: 'On Time',
      origin: 'New York (JFK)',
      destination: 'Los Angeles (LAX)',
      scheduledDeparture: '08:00 AM',
      estimatedDeparture: '08:00 AM',
      scheduledArrival: '10:30 AM',
      estimatedArrival: '10:30 AM',
      gate: 'A12',
      terminal: 'Terminal 4',
      date: data.date,
    })
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <Plane className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Flight Status</h1>
            <p className="text-gray-600">Check real-time flight information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Number
                </label>
                <input
                  {...register('flightNumber')}
                  type="text"
                  placeholder="e.g., AL 101"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500 uppercase"
                />
                {errors.flightNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.flightNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Check Status
            </button>
          </form>
        </div>

        {/* Flight Status Result */}
        {flightStatus && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={`p-6 ${
              flightStatus.status === 'On Time'
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-yellow-50 border-l-4 border-yellow-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {flightStatus.flightNumber}
                  </h2>
                  <p className="text-gray-600">{flightStatus.airline}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${
                  flightStatus.status === 'On Time'
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}>
                  {flightStatus.status}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Route */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Departure</p>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{flightStatus.scheduledDeparture}</p>
                  <p className="text-gray-600">{flightStatus.origin}</p>
                </div>
                <div className="flex-1 px-8">
                  <div className="flex items-center justify-center">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <Plane className="w-6 h-6 text-primary-600 mx-4" />
                    <div className="h-px flex-1 bg-gray-300"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Arrival</p>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{flightStatus.scheduledArrival}</p>
                  <p className="text-gray-600">{flightStatus.destination}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Terminal</p>
                  <p className="font-semibold text-gray-800">{flightStatus.terminal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gate</p>
                  <p className="font-semibold text-gray-800">{flightStatus.gate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Departure</p>
                  <p className="font-semibold text-gray-800">{flightStatus.estimatedDeparture}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Arrival</p>
                  <p className="font-semibold text-gray-800">{flightStatus.estimatedArrival}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
