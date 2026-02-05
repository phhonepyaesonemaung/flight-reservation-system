'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Plane, Clock, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import type { SearchFlightRow, SearchFlightsResponse } from '@/types'

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return iso
  }
}

function formatDuration(depIso: string, arrIso: string): string {
  try {
    const dep = new Date(depIso).getTime()
    const arr = new Date(arrIso).getTime()
    const mins = Math.round((arr - dep) / 60000)
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  } catch {
    return '—'
  }
}

function FlightCard({
  flight,
  fromLabel,
  toLabel,
}: {
  flight: SearchFlightRow
  fromLabel: string
  toLabel: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <Plane className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">AEROLINK</h3>
              <p className="text-sm text-gray-500">{flight.flight_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(flight.departure_time)}</p>
              <p className="text-sm text-gray-600">
                {fromLabel} ({flight.departure_airport_code})
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Duration</p>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {formatDuration(flight.departure_time, flight.arrival_time)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(flight.arrival_time)}</p>
              <p className="text-sm text-gray-600">
                {toLabel} ({flight.arrival_airport_code})
              </p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-green-600">
              {flight.available_seats} seats available • {flight.cabin_class}
            </span>
          </div>
        </div>

        <div className="text-right ml-8">
          <div className="flex items-center justify-end mb-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <span className="text-3xl font-bold text-gray-800">{flight.base_price}</span>
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
  )
}

function SearchResults() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const returnDate = searchParams.get('returnDate')
  const passengers = searchParams.get('passengers')
  const type = searchParams.get('type')
  const cabinClass = searchParams.get('cabinClass') || 'economy'

  const [data, setData] = useState<SearchFlightsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fromId = from ? parseInt(from, 10) : 0
    const toId = to ? parseInt(to, 10) : 0
    if (!fromId || !toId || !date) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const body = {
      type: type === 'round' ? 'round-trip' : 'one-way',
      from: fromId,
      to: toId,
      departureDate: date,
      returnDate: type === 'round' && returnDate ? returnDate : undefined,
      cabinClass: cabinClass === 'business' ? 'business' : cabinClass === 'first' ? 'first' : 'economy',
    }
    api
      .post('/flight/search', body)
      .then((res: any) => {
        const payload = res?.data?.data ?? res?.data
        setData(payload || { outbound: [], return: [] })
      })
      .catch((err: any) => {
        setError(err?.response?.data?.error ?? err?.message ?? 'Search failed')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [from, to, date, returnDate, type, cabinClass])

  const outbound = data?.outbound ?? []
  const returnFlights = data?.return ?? []
  const fromCode = outbound[0]?.departure_airport_code ?? from ?? '—'
  const toCode = outbound[0]?.arrival_airport_code ?? to ?? '—'
  const fromLabel = fromCode
  const toLabel = toCode

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo size="md" showText={true} className="text-white" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600">
            <span className="font-semibold">{fromCode}</span>
            <span className="text-accent">→</span>
            <span className="font-semibold">{toCode}</span>
            <span>•</span>
            <span>{date}</span>
            {type === 'round' && returnDate && (
              <>
                <span>•</span>
                <span>Return {returnDate}</span>
              </>
            )}
            <span>•</span>
            <span>{passengers} Passenger(s)</span>
            <span>•</span>
            <span className="capitalize">{type === 'round' ? 'Round trip' : 'One way'}</span>
            <span>•</span>
            <span className="capitalize">{cabinClass}</span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500">Loading flights...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Outbound */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Outbound</h2>
              {outbound.length === 0 ? (
                <p className="text-gray-500">No outbound flights found for this date.</p>
              ) : (
                <div className="space-y-4">
                  {outbound.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      fromLabel={fromLabel}
                      toLabel={toLabel}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Return (round-trip) */}
            {type === 'round' && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Return</h2>
                {returnFlights.length === 0 ? (
                  <p className="text-gray-500">No return flights found for this date.</p>
                ) : (
                  <div className="space-y-4">
                    {returnFlights.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        fromLabel={toLabel}
                        toLabel={fromLabel}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
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
