'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'
import { CheckCircle, Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

type Receipt = {
  booking_id?: number
  booking_reference?: string
  flight_number?: string
  departure_airport_code?: string
  arrival_airport_code?: string
  departure_time?: string
  arrival_time?: string
  cabin_class?: string
  total_amount?: number
  passenger_count?: number
  passengers?: { first_name?: string; last_name?: string; email?: string }[]
  checked_in_at?: string | null
}

export default function CheckInBookingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    api
      .get('/booking/receipt', { params: { id: bookingId } })
      .then((res) => {
        const data = res.data?.data ?? res.data
        setReceipt(data ?? null)
      })
      .catch(() => {
        setReceipt(null)
        toast.error('Booking not found')
      })
      .finally(() => setLoading(false))
  }, [bookingId])

  const handleCheckIn = async () => {
    if (!bookingId) return
    setCheckingIn(true)
    try {
      await api.post('/booking/check-in', { booking_id: parseInt(String(bookingId), 10) })
      setCheckedIn(true)
      toast.success('You’re checked in! Have a great flight.')
    } catch (err: any) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Check-in failed'
      toast.error(msg)
    } finally {
      setCheckingIn(false)
    }
  }

  const formatDateTime = (s?: string) => {
    if (!s) return '—'
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString('en-US')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Logo size="md" showText={true} className="text-white" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-600">Loading booking…</main>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Logo size="md" showText={true} className="text-white" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-6">Booking not found or you don’t have access.</p>
          <Link href="/my-bookings" className="text-primary-600 hover:underline font-semibold">
            Back to My Bookings
          </Link>
        </main>
      </div>
    )
  }

  const alreadyCheckedIn = !!receipt.checked_in_at

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <Link href="/my-bookings" className="text-white hover:text-blue-200 transition">
              My Bookings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {!checkedIn && !alreadyCheckedIn ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Plane className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Online Check-In</h1>
              <p className="text-gray-600">Check-in opens 24 hours before departure and closes 45 minutes before.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Booking reference</p>
              <p className="text-xl font-bold text-gray-800 mb-4">{receipt.booking_reference ?? '—'}</p>
              <p className="text-sm text-gray-500 mb-1">Flight</p>
              <p className="font-semibold text-gray-800">{receipt.flight_number ?? '—'}</p>
              <p className="text-gray-600">
                {receipt.departure_airport_code} → {receipt.arrival_airport_code}
              </p>
              <p className="text-sm text-gray-500 mt-2 mb-1">Departure</p>
              <p className="text-gray-800">{formatDateTime(receipt.departure_time)}</p>
              <p className="text-sm text-gray-500 mt-2 mb-1">Passengers</p>
              <p className="text-gray-800">
                {receipt.passengers?.map((p) => `${p.first_name} ${p.last_name}`).join(', ') ?? receipt.passenger_count}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center"
            >
              {checkingIn ? 'Checking in…' : 'Check in'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">You’re checked in!</h1>
              <p className="text-gray-600">Your booking is confirmed. Download your ticket below.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Booking reference</p>
              <p className="text-xl font-bold text-gray-800">{receipt.booking_reference ?? '—'}</p>
              <p className="text-sm text-gray-500 mt-2 mb-1">Flight</p>
              <p className="font-semibold text-gray-800">{receipt.flight_number ?? '—'}</p>
              <p className="text-gray-600">
                {receipt.departure_airport_code} → {receipt.arrival_airport_code}
              </p>
              <p className="text-sm text-gray-500 mt-2">Departure: {formatDateTime(receipt.departure_time)}</p>
            </div>

            <Link
              href={`/booking/confirmation/${bookingId}`}
              className="block w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold text-center transition mb-3"
            >
              View &amp; download ticket
            </Link>
            <Link
              href="/my-bookings"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold text-center transition"
            >
              Back to My Bookings
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
