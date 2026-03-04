'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'

// UI only – matches backend: flights (flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, aircraft_id, base_price, status)
type FlightStatus = 'scheduled' | 'delayed' | 'cancelled'

export default function AdminFlightsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Mock list – no API yet (backend: flights table)
  const flights: {
    id: number
    flight_number: string
    departure_airport_code: string
    arrival_airport_code: string
    departure_time: string
    arrival_time: string
    aircraft_id: number
    base_price: number
    status: FlightStatus
  }[] = []

  const handleDelete = (_id: number) => {
    // No binding yet
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Flights</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Flight
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by flight number..."
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
            <option value="all">All status</option>
            <option value="scheduled">Scheduled</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table – columns match backend flights table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Departure</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Arrival</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aircraft ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Base price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center text-gray-500">
                    No flights. Add one to get started.
                  </td>
                </tr>
              ) : (
                flights.map((f) => (
                  <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{f.flight_number}</td>
                    <td className="py-3 px-4 text-gray-800">
                      {f.departure_airport_code} → {f.arrival_airport_code}
                    </td>
                    <td className="py-3 px-4 text-gray-800">{f.departure_time}</td>
                    <td className="py-3 px-4 text-gray-800">{f.arrival_time}</td>
                    <td className="py-3 px-4 text-gray-800">{f.aircraft_id}</td>
                    <td className="py-3 px-4 text-gray-800">${f.base_price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          f.status === 'scheduled'
                            ? 'bg-green-100 text-green-800'
                            : f.status === 'delayed'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(f.id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Flight modal – fields match backend */}
      {(showAddModal || editingId !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId !== null ? 'Edit Flight' : 'Add Flight'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingId(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form
              className="p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setShowAddModal(false)
                setEditingId(null)
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight number</label>
                <input
                  type="text"
                  placeholder="e.g. AL 101"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure airport ID</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival airport ID</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="2"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure date & time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival date & time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft ID</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="199.99"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800">
                  <option value="scheduled">Scheduled</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingId(null)
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium"
                >
                  {editingId !== null ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
