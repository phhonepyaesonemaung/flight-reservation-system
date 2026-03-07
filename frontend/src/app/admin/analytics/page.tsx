'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, Plane } from 'lucide-react'
import { api } from '@/lib/api'

type Stats = {
  total_flights: number
  total_bookings: number
  total_revenue: number
  total_users: number
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data
        setStats(data ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const avgBooking = stats && stats.total_bookings > 0
    ? stats.total_revenue / stats.total_bookings
    : 0

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Flights</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total_flights ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">
                ${stats?.total_revenue != null ? Number(stats.total_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total_bookings ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Registered Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total_users ?? 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Average booking value</span>
                <span className="font-semibold text-gray-800">${avgBooking.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Revenue per user</span>
                <span className="font-semibold text-gray-800">
                  ${stats?.total_users ? (stats.total_revenue / stats.total_users).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
