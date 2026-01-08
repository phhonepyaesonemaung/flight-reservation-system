'use client'

import AdminLayout from '@/components/AdminLayout'
import { TrendingUp, DollarSign, Users, Plane } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics & Reports</h1>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Overview</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Revenue Chart (Integration with Chart.js or Recharts)</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Monthly Growth</p>
          <p className="text-3xl font-bold">+24%</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <DollarSign className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Avg. Booking Value</p>
          <p className="text-3xl font-bold">$324</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <Users className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">New Users</p>
          <p className="text-3xl font-bold">+156</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <Plane className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Flights This Month</p>
          <p className="text-3xl font-bold">842</p>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Routes</h2>
        <div className="space-y-4">
          {[
            { route: 'JFK → LAX', bookings: 347, revenue: 86750 },
            { route: 'LAX → MIA', bookings: 289, revenue: 92480 },
            { route: 'MIA → JFK', bookings: 256, revenue: 62720 },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">{item.route}</p>
                <p className="text-sm text-gray-600">{item.bookings} bookings</p>
              </div>
              <p className="text-lg font-bold text-primary-600">${(item.revenue / 1000).toFixed(1)}K</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
