'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAirlinesPage() {
  // Mock airlines data
  const airlines = [
    {
      id: 1,
      name: 'AEROLINK Airways',
      code: 'AL',
      country: 'United States',
      fleet: 45,
      destinations: 120,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Sky Jet',
      code: 'SJ',
      country: 'United States',
      fleet: 30,
      destinations: 85,
      status: 'Active',
    },
  ]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Airline Management</h1>
        <button className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Airline
        </button>
      </div>

      {/* Airlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {airlines.map((airline) => (
          <div key={airline.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{airline.name}</h3>
                <p className="text-gray-600">{airline.code} • {airline.country}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                {airline.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fleet Size:</span>
                <span className="font-semibold text-gray-800">{airline.fleet}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Destinations:</span>
                <span className="font-semibold text-gray-800">{airline.destinations}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button className="flex-1 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition flex items-center justify-center">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
