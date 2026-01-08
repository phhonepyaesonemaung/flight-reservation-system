'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

export default function AdminAirportsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock airports data
  const airports = [
    {
      id: 1,
      name: 'John F. Kennedy International Airport',
      code: 'JFK',
      city: 'New York',
      country: 'United States',
      terminals: 6,
      airlines: 90,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Los Angeles International Airport',
      code: 'LAX',
      city: 'Los Angeles',
      country: 'United States',
      terminals: 9,
      airlines: 85,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Miami International Airport',
      code: 'MIA',
      city: 'Miami',
      country: 'United States',
      terminals: 4,
      airlines: 68,
      status: 'Active',
    },
  ]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Airport Management</h1>
        <button className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Airport
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search airports by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
          />
        </div>
      </div>

      {/* Airports Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Airport</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Terminals</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Airlines</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((airport) => (
                <tr key={airport.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{airport.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                      {airport.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {airport.city}, {airport.country}
                  </td>
                  <td className="py-3 px-4 text-gray-800">{airport.terminals}</td>
                  <td className="py-3 px-4 text-gray-800">{airport.airlines}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {airport.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
