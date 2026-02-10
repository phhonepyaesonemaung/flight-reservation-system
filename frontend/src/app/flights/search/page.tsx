'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
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
  selectFlightHref,
  isSelected,
  onSelect,
}: {
  flight: SearchFlightRow
  fromLabel: string
  toLabel: string
  selectFlightHref: string
  isSelected?: boolean
  onSelect?: () => void
}) {
  const useButton = typeof onSelect === 'function'
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition ${
        isSelected ? 'ring-2 ring-accent ring-offset-2' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <Plane className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">AEROLINK</h3>
              <p className="text-sm text-gray-500">{flight.flight_number}</p>
            </div>
            {isSelected && (
              <span className="text-sm font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                Selected
              </span>
            )}
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
          {useButton ? (
            <button
              type="button"
              onClick={onSelect}
              className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              {isSelected ? 'Selected' : 'Select Flight'}
            </button>
          ) : (
            <Link
              href={selectFlightHref}
              className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              Select Flight
            </Link>
          )}
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
    const passengerType = searchParams.get('passengerType') || 'local'

  const [data, setData] = useState<SearchFlightsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOutboundId, setSelectedOutboundId] = useState<number | null>(null)
  const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null)
  const isRoundTrip = type === 'round'

  useEffect(() => {
    setSelectedOutboundId(null)
    setSelectedReturnId(null)
  }, [from, to, date, returnDate, type])

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
  }, [from, to, date, returnDate, type, cabinClass, passengerType])

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const outbound = data?.outbound ?? []
  const returnFlights = data?.return ?? []
  const fromCode = outbound[0]?.departure_airport_code ?? from ?? '—'
  const toCode = outbound[0]?.arrival_airport_code ?? to ?? '—'
  const fromLabel = fromCode
  const toLabel = toCode

  const buildSelectFlightHref = (
    flightId: number,
    returnId?: number,
    outboundPrice?: number,
    returnPrice?: number
  ) => {
    const bookingPath = `/booking/passengers/${flightId}`
    const params = new URLSearchParams()
    if (passengers) params.set('passengers', passengers)
    if (cabinClass) params.set('cabinClass', cabinClass)
    if (passengerType) params.set('passengerType', passengerType)
    if (returnId != null) params.set('returnId', String(returnId))
    if (outboundPrice != null) params.set('outboundPrice', String(outboundPrice))
    if (returnPrice != null) params.set('returnPrice', String(returnPrice))
    const qs = params.toString()
    const bookingUrl = qs ? `${bookingPath}?${qs}` : bookingPath
    if (isAuthenticated) return bookingUrl
    return `/auth/signin?redirect=${encodeURIComponent(bookingUrl)}`
  }

  const selectedOutbound = outbound.find((f) => f.id === selectedOutboundId)
  const selectedReturn = returnFlights.find((f) => f.id === selectedReturnId)
  const roundTripContinueHref =
    isRoundTrip && selectedOutboundId != null && selectedReturnId != null && selectedOutbound && selectedReturn
      ? buildSelectFlightHref(
          selectedOutboundId,
          selectedReturnId,
          selectedOutbound.base_price,
          selectedReturn.base_price
        )
      : null

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
                      selectFlightHref={buildSelectFlightHref(flight.id)}
                      isSelected={isRoundTrip ? selectedOutboundId === flight.id : undefined}
                      onSelect={
                        isRoundTrip
                          ? () => setSelectedOutboundId(flight.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Return (round-trip) */}
            {isRoundTrip && (
              <section className="mb-8">
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
                        selectFlightHref={buildSelectFlightHref(flight.id)}
                        isSelected={selectedReturnId === flight.id}
                        onSelect={() => setSelectedReturnId(flight.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Round trip: continue only when both selected */}
            {isRoundTrip && (
              <section className="mt-8 pt-6 border-t border-gray-200">
                {selectedOutboundId != null && selectedReturnId != null ? (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-600">
                      You selected outbound and return flights. Continue to passenger details.
                    </p>
                    <Link
                      href={roundTripContinueHref!}
                      className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                    >
                      Continue to passenger details
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    Select one outbound and one return flight to continue.
                  </p>
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
