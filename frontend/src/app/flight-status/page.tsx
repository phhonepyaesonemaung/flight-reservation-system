'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Logo from '@/components/Logo'
import { Search, Plane } from 'lucide-react'
import { api } from '@/lib/api'

const statusSchema = z.object({
  flightNumber: z.string().min(1, 'Flight number is required'),
  date: z.string().min(1, 'Date is required'),
})

type StatusFormData = z.infer<typeof statusSchema>

type FlightStatusResult = {
  flight_number: string
  status: string
  departure_airport_code: string
  departure_airport_name: string
  arrival_airport_code: string
  arrival_airport_name: string
  departure_time: string
  arrival_time: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function displayStatus(status: string) {
  if (status === 'scheduled') return 'On Time'
  if (status === 'delayed') return 'Delayed'
  if (status === 'cancelled') return 'Cancelled'
  return status
}

export default function FlightStatusPage() {
  const [flightStatus, setFlightStatus] = useState<FlightStatusResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
  })

  const onSubmit = async (data: StatusFormData) => {
    setLoading(true)
    setNotFound(false)
    setFlightStatus(null)
    try {
      const res = await api.get('/flight/status', {
        params: { flight_number: data.flightNumber.trim(), date: data.date },
      })
      const payload = res.data?.data ?? res.data
      if (payload && payload.flight_number) {
        setFlightStatus(payload)
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
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
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-70 text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Checking…' : 'Check Status'}
            </button>
          </form>
        </div>

        {/* Not found */}
        {notFound && !flightStatus && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No flight found for this flight number and date.</p>
            <p className="text-gray-500 text-sm mt-2">Please check the flight number and date and try again.</p>
          </div>
        )}

        {/* Flight Status Result */}
        {flightStatus && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={`p-6 ${
              flightStatus.status === 'scheduled'
                ? 'bg-green-50 border-l-4 border-green-500'
                : flightStatus.status === 'cancelled'
                  ? 'bg-red-50 border-l-4 border-red-500'
                  : 'bg-yellow-50 border-l-4 border-yellow-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {flightStatus.flight_number}
                  </h2>
                  <p className="text-gray-600">AEROLINK Airways</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${
                  flightStatus.status === 'scheduled'
                    ? 'bg-green-500 text-white'
                    : flightStatus.status === 'cancelled'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                }`}>
                  {displayStatus(flightStatus.status)}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Route */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Departure</p>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{formatTime(flightStatus.departure_time)}</p>
                  <p className="text-gray-600">{flightStatus.departure_airport_name} ({flightStatus.departure_airport_code})</p>
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
                  <p className="text-2xl font-bold text-gray-800 mb-1">{formatTime(flightStatus.arrival_time)}</p>
                  <p className="text-gray-600">{flightStatus.arrival_airport_name} ({flightStatus.arrival_airport_code})</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Terminal</p>
                  <p className="font-semibold text-gray-800">—</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gate</p>
                  <p className="font-semibold text-gray-800">—</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scheduled Departure</p>
                  <p className="font-semibold text-gray-800">{formatTime(flightStatus.departure_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scheduled Arrival</p>
                  <p className="font-semibold text-gray-800">{formatTime(flightStatus.arrival_time)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
