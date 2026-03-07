'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Search } from 'lucide-react'
import { api } from '@/lib/api'

type Booking = {
  id: number
  booking_reference: string
  user_email: string
  flight_number: string
  route: string
  departure_time: string
  total_amount: number
  status: string
  passenger_name: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    api
      .get('/admin/bookings')
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data
        setBookings(Array.isArray(data) ? data : [])
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter((b) => {
    const matchSearch =
      searchTerm === '' ||
      b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === '' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by confirmation, passenger, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading bookings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confirmation</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Passenger</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Departure</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No bookings match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm text-gray-800">{b.booking_reference}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">{b.passenger_name}</p>
                        <p className="text-xs text-gray-500">{b.user_email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">{b.flight_number}</p>
                        <p className="text-xs text-gray-500">{b.route}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-800 text-sm">{b.departure_time}</td>
                      <td className="py-3 px-4 text-gray-800">${Number(b.total_amount).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-800'
                            : b.status === 'cancelled' ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
