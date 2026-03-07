'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useRef, useEffect, useMemo, useState } from 'react'
import Logo from '@/components/Logo'
import { CheckCircle, Download, Mail, Plane, Calendar } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { api } from '@/lib/api'

type ReceiptPassenger = {
  first_name?: string
  last_name?: string
  email?: string
}

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
  passengers?: ReceiptPassenger[]
  issued_at?: string
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const bookingId = params.id
  const ticketRef = useRef<HTMLDivElement>(null)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('booking_confirmation')
        if (raw) {
          const data = JSON.parse(raw)
          if (String(data.bookingId) === String(bookingId)) {
            setBookingRef(data.bookingRef ?? null)
          }
        }
        const receiptRaw = sessionStorage.getItem('booking_receipt')
        if (receiptRaw) {
          setReceipt(JSON.parse(receiptRaw))
        }
      } catch {
        // ignore
      }
    }
  }, [bookingId])

  // If no receipt in session (e.g. came from My Bookings or check-in), fetch from API
  useEffect(() => {
    if (!bookingId || receipt !== null) return
    api
      .get('/booking/receipt', { params: { id: bookingId } })
      .then((res) => {
        const data = res.data?.data ?? res.data
        if (data) {
          setReceipt(data)
          if (data.booking_reference) setBookingRef(data.booking_reference)
        }
      })
      .catch(() => {})
  }, [bookingId, receipt])

  const passengerNames = useMemo(() => {
    if (!receipt?.passengers?.length) return []
    return receipt.passengers.map((p) => `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim())
  }, [receipt])

  const formatDateTime = (value?: string) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString()
  }

  const confirmationNumber = bookingRef ?? `Booking #${bookingId}`
  const flightNumber = receipt?.flight_number ?? '—'
  const route = receipt?.departure_airport_code && receipt?.arrival_airport_code
    ? `${receipt.departure_airport_code} → ${receipt.arrival_airport_code}`
    : '—'
  const departureTime = formatDateTime(receipt?.departure_time)
  const arrivalTime = formatDateTime(receipt?.arrival_time)
  const totalAmount = receipt?.total_amount ?? 0

  const handleDownloadTicket = async () => {
    const el = ticketRef.current
    if (!el) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgW = canvas.width
      const imgH = canvas.height
      const pxToMm = 25.4 / 96
      let w = imgW * pxToMm
      let h = imgH * pxToMm
      const margin = 10
      if (w > pdfW - 2 * margin || h > pdfH - 2 * margin) {
        const scale = Math.min((pdfW - 2 * margin) / w, (pdfH - 2 * margin) / h)
        w *= scale
        h *= scale
      }
      pdf.addImage(imgData, 'PNG', (pdfW - w) / 2, margin, w, h)
      const filename = `AEROLINK-Ticket-${(bookingRef ?? bookingId) ?? 'ticket'}.pdf`.replace(/\s/g, '-')
      pdf.save(filename)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setDownloading(false)
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
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your flight has been successfully booked. Confirmation details have been sent to your email.
          </p>
          
          {/* Confirmation Number */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold text-primary-800">{confirmationNumber}</p>
          </div>
        </div>

        {/* E-Ticket */}
        <div ref={ticketRef} className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-primary-800 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">E-Ticket</h2>
            <p className="text-blue-200">Please save or print this ticket for your records</p>
          </div>

          <div className="p-8">
            {/* Flight Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-primary-600" />
                  Flight Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Airline</p>
                    <p className="font-semibold text-gray-800">AEROLINK Airways</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Flight Number</p>
                    <p className="font-semibold text-gray-800">{flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seat</p>
                    <p className="font-semibold text-gray-800">—</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Travel Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-800">{departureTime || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-semibold text-gray-800">{departureTime || '—'} - {receipt?.departure_airport_code ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Arrival</p>
                    <p className="font-semibold text-gray-800">{arrivalTime || '—'} - {receipt?.arrival_airport_code ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Passenger Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Passengers</p>
                  <p className="font-semibold text-gray-800">
                    {passengerNames.length ? passengerNames.join(', ') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-semibold text-gray-800">{route}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Paid</span>
                <span className="text-2xl font-bold text-gray-800">${totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            type="button"
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            {downloading ? 'Generating PDF...' : 'Download Ticket'}
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Ticket
          </button>
          <Link
            href="/my-bookings"
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
          >
            View My Bookings
          </Link>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Please arrive at the airport at least 2 hours before departure for domestic flights</li>
            <li>• Bring a valid government-issued photo ID for check-in</li>
            <li>• Check-in online 24 hours before your flight to save time</li>
            <li>• Review baggage allowances before arriving at the airport</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
