'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { Plane, CreditCard, BarChart3, Users } from 'lucide-react'
import { api } from '@/lib/api'

type Stats = {
  total_flights: number
  total_bookings: number
  total_revenue: number
  total_users: number
}

type RecentBooking = {
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').then((res: any) => res?.data?.data ?? res?.data),
      api.get('/admin/bookings').then((res: any) => res?.data?.data ?? res?.data),
    ])
      .then(([statsData, bookingsData]) => {
        setStats(statsData ?? null)
        setRecentBookings(Array.isArray(bookingsData) ? bookingsData.slice(0, 10) : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Flights</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total_flights ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total_bookings ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">
                ${stats?.total_revenue != null ? Number(stats.total_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Registered Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total_users ?? 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-primary-600 hover:underline text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confirmation</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Passenger</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Departure</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No bookings yet.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => (
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
                            b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
          </div>
        </>
      )}
    </AdminLayout>
  )
}
