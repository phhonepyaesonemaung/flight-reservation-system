'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminFlightsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock flights data
  const flights = [
    {
      id: 1,
      flightNumber: 'AL 101',
      airline: 'AEROLINK Airways',
      origin: 'JFK',
      destination: 'LAX',
      departure: '08:00',
      arrival: '10:30',
      price: 250,
      seats: 180,
      available: 45,
      status: 'Active',
    },
    {
      id: 2,
      flightNumber: 'AL 205',
      airline: 'AEROLINK Airways',
      origin: 'LAX',
      destination: 'MIA',
      departure: '14:00',
      arrival: '22:00',
      price: 320,
      seats: 180,
      available: 32,
      status: 'Active',
    },
    {
      id: 3,
      flightNumber: 'AL 303',
      airline: 'AEROLINK Airways',
      origin: 'MIA',
      destination: 'JFK',
      departure: '16:30',
      arrival: '19:00',
      price: 245,
      seats: 180,
      available: 58,
      status: 'Active',
    },
  ]

  const handleDelete = (id: number) => {
    toast.success('Flight deleted successfully')
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Flight Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Flight
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search flights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
            />
          </div>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800">
            <option>All Airlines</option>
            <option>AEROLINK Airways</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Flights Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Seats</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-800">{flight.flightNumber}</p>
                      <p className="text-xs text-gray-500">{flight.airline}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {flight.origin} → {flight.destination}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {flight.departure} - {flight.arrival}
                  </td>
                  <td className="py-3 px-4 text-gray-800">${flight.price}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {flight.available}/{flight.seats}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {flight.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(flight.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
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
