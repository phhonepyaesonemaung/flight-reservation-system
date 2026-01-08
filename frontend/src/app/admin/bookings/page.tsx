'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Search, Download, Eye } from 'lucide-react'

export default function AdminBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock bookings data
  const bookings = [
    {
      id: 1,
      confirmationNumber: 'AL2026-ABC123',
      passenger: 'John Doe',
      email: 'john@example.com',
      flight: 'AL 101',
      route: 'JFK → LAX',
      date: '2026-02-15',
      amount: 285,
      status: 'Confirmed',
      paymentStatus: 'Paid',
    },
    {
      id: 2,
      confirmationNumber: 'AL2026-XYZ789',
      passenger: 'Jane Smith',
      email: 'jane@example.com',
      flight: 'AL 205',
      route: 'LAX → MIA',
      date: '2026-03-10',
      amount: 320,
      status: 'Confirmed',
      paymentStatus: 'Paid',
    },
    {
      id: 3,
      confirmationNumber: 'AL2026-DEF456',
      passenger: 'Bob Johnson',
      email: 'bob@example.com',
      flight: 'AL 303',
      route: 'MIA → JFK',
      date: '2026-03-20',
      amount: 245,
      status: 'Pending',
      paymentStatus: 'Pending',
    },
  ]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by confirmation number, passenger name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
            />
          </div>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confirmation</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Passenger</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{booking.confirmationNumber}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.passenger}</p>
                      <p className="text-xs text-gray-500">{booking.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.flight}</p>
                      <p className="text-xs text-gray-500">{booking.route}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{booking.date}</td>
                  <td className="py-3 px-4 text-gray-800">${booking.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'Paid'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
