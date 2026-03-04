'use client'

import { Plane, Users, CreditCard, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  // Mock stats (no data binding yet)
  const stats = {
    totalFlights: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
  }

  const recentBookings: { id: number; passenger: string; flight: string; amount: number; status: string }[] = []

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Flights</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalFlights}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-800">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Active Users</p>
          <p className="text-3xl font-bold text-gray-800">{stats.activeUsers}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Passenger</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-gray-500">No bookings yet</td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{booking.passenger}</td>
                    <td className="py-3 px-4 text-gray-800">{booking.flight}</td>
                    <td className="py-3 px-4 text-gray-800">${booking.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
