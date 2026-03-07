'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

type Airport = { id: number; code: string; name: string; city: string; country: string }
type Aircraft = { id: number; model: string; total_seats: number }
type Flight = {
  id: number
  flight_number: string
  departure_airport_id: number
  arrival_airport_id: number
  departure_time: string
  arrival_time: string
  aircraft_id: number
  base_price: number
  status: string
}

const defaultForm = {
  flight_number: '',
  departure_airport_id: 0,
  arrival_airport_id: 0,
  departure_time: '',
  arrival_time: '',
  aircraft_id: 0,
  base_price: '',
  status: 'scheduled',
}

function toDatetimeLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminFlightsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [flights, setFlights] = useState<Flight[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const loadFlights = () => {
    api
      .get('/flight/get-all-flights')
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data
        setFlights(Array.isArray(data) ? data : [])
      })
      .catch(() => setFlights([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    api.get('/flight/get-all-airports').then((res: any) => {
      const data = res?.data?.data ?? res?.data
      if (Array.isArray(data)) setAirports(data)
    }).catch(() => setAirports([]))
    api.get('/flight/get-all-aircrafts').then((res: any) => {
      const data = res?.data?.data ?? res?.data
      if (Array.isArray(data)) setAircrafts(data)
    }).catch(() => setAircrafts([]))
    loadFlights()
  }, [])

  const getAirportCode = (id: number) => airports.find((a) => a.id === id)?.code ?? String(id)
  const getAircraftModel = (id: number) => aircrafts.find((a) => a.id === id)?.model ?? String(id)
  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  const filteredFlights = flights.filter(
    (f) =>
      searchTerm === '' ||
      f.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAirportCode(f.departure_airport_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAirportCode(f.arrival_airport_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const depId = form.departure_airport_id
    const arrId = form.arrival_airport_id
    const aircraftId = form.aircraft_id
    if (!form.flight_number.trim()) {
      toast.error('Flight number is required')
      return
    }
    if (!depId || !arrId) {
      toast.error('Please select departure and arrival airports')
      return
    }
    if (depId === arrId) {
      toast.error('Departure and arrival airports must be different')
      return
    }
    if (!aircraftId) {
      toast.error('Please select an aircraft')
      return
    }
    const basePrice = parseFloat(form.base_price)
    if (Number.isNaN(basePrice) || basePrice < 0) {
      toast.error('Please enter a valid base price')
      return
    }
    if (!form.departure_time || !form.arrival_time) {
      toast.error('Please enter departure and arrival date/time')
      return
    }
    setSubmitting(true)
    api
      .post('/flight/create-flight', {
        flight_number: form.flight_number.trim(),
        departure_airport_id: depId,
        arrival_airport_id: arrId,
        aircraft_id: aircraftId,
        departure_time: new Date(form.departure_time).toISOString(),
        arrival_time: new Date(form.arrival_time).toISOString(),
        base_price: basePrice,
        status: form.status,
      })
      .then(() => {
        toast.success('Flight created successfully')
        setShowAddModal(false)
        setForm(defaultForm)
        loadFlights()
      })
      .catch((err: any) => {
        const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Failed to create flight'
        toast.error(msg)
      })
      .finally(() => setSubmitting(false))
  }

  const openEditModal = (flight: Flight) => {
    setEditingFlight(flight)
    setForm({
      flight_number: flight.flight_number,
      departure_airport_id: flight.departure_airport_id,
      arrival_airport_id: flight.arrival_airport_id,
      departure_time: toDatetimeLocal(flight.departure_time),
      arrival_time: toDatetimeLocal(flight.arrival_time),
      aircraft_id: flight.aircraft_id,
      base_price: String(flight.base_price),
      status: flight.status,
    })
  }

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFlight) return
    const depId = form.departure_airport_id
    const arrId = form.arrival_airport_id
    const aircraftId = form.aircraft_id
    if (!form.flight_number.trim()) {
      toast.error('Flight number is required')
      return
    }
    if (!depId || !arrId) {
      toast.error('Please select departure and arrival airports')
      return
    }
    if (depId === arrId) {
      toast.error('Departure and arrival airports must be different')
      return
    }
    if (!aircraftId) {
      toast.error('Please select an aircraft')
      return
    }
    const basePrice = parseFloat(form.base_price)
    if (Number.isNaN(basePrice) || basePrice < 0) {
      toast.error('Please enter a valid base price')
      return
    }
    if (!form.departure_time || !form.arrival_time) {
      toast.error('Please enter departure and arrival date/time')
      return
    }
    setSubmitting(true)
    api
      .put('/flight/update-flight', {
        id: editingFlight.id,
        flight_number: form.flight_number.trim(),
        departure_airport_id: depId,
        arrival_airport_id: arrId,
        aircraft_id: aircraftId,
        departure_time: new Date(form.departure_time).toISOString(),
        arrival_time: new Date(form.arrival_time).toISOString(),
        base_price: basePrice,
        status: form.status,
      })
      .then(() => {
        toast.success('Flight updated successfully')
        setEditingFlight(null)
        setForm(defaultForm)
        loadFlights()
      })
      .catch((err: any) => {
        const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Failed to update flight'
        toast.error(msg)
      })
      .finally(() => setSubmitting(false))
  }

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

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by flight number or airport code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Flights Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading flights...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flight #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Departure</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Arrival</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aircraft</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No flights found. Create one using &quot;Add Flight&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredFlights.map((flight) => (
                    <tr key={flight.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-800">{flight.flight_number}</td>
                      <td className="py-3 px-4 text-gray-800">
                        {getAirportCode(flight.departure_airport_id)} → {getAirportCode(flight.arrival_airport_id)}
                      </td>
                      <td className="py-3 px-4 text-gray-800 text-sm">{formatDateTime(flight.departure_time)}</td>
                      <td className="py-3 px-4 text-gray-800 text-sm">{formatDateTime(flight.arrival_time)}</td>
                      <td className="py-3 px-4 text-gray-800">{getAircraftModel(flight.aircraft_id)}</td>
                      <td className="py-3 px-4 text-gray-800">${Number(flight.base_price).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            flight.status === 'scheduled'
                              ? 'bg-green-100 text-green-800'
                              : flight.status === 'delayed'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {flight.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(flight)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            title="Edit flight"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(flight.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete (not implemented)"
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
        )}
      </div>

      {/* Create Flight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Create Flight</h2>
              <button
                type="button"
                onClick={() => !submitting && setShowAddModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number *</label>
                <input
                  type="text"
                  value={form.flight_number}
                  onChange={(e) => setForm((f) => ({ ...f, flight_number: e.target.value }))}
                  placeholder="e.g. AL 101"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport *</label>
                  <select
                    value={form.departure_airport_id}
                    onChange={(e) => setForm((f) => ({ ...f, departure_airport_id: Number(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value={0}>Select airport</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} – {a.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport *</label>
                  <select
                    value={form.arrival_airport_id}
                    onChange={(e) => setForm((f) => ({ ...f, arrival_airport_id: Number(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value={0}>Select airport</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} – {a.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.departure_time}
                    onChange={(e) => setForm((f) => ({ ...f, departure_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.arrival_time}
                    onChange={(e) => setForm((f) => ({ ...f, arrival_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft *</label>
                <select
                  value={form.aircraft_id}
                  onChange={(e) => setForm((f) => ({ ...f, aircraft_id: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                >
                  <option value={0}>Select aircraft</option>
                  {aircrafts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.model} ({a.total_seats} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.base_price}
                    onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => !submitting && setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Flight Modal */}
      {editingFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Edit Flight</h2>
              <button
                type="button"
                onClick={() => !submitting && (setEditingFlight(null), setForm(defaultForm))}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number *</label>
                <input
                  type="text"
                  value={form.flight_number}
                  onChange={(e) => setForm((f) => ({ ...f, flight_number: e.target.value }))}
                  placeholder="e.g. AL 101"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport *</label>
                  <select
                    value={form.departure_airport_id}
                    onChange={(e) => setForm((f) => ({ ...f, departure_airport_id: Number(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value={0}>Select airport</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} – {a.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport *</label>
                  <select
                    value={form.arrival_airport_id}
                    onChange={(e) => setForm((f) => ({ ...f, arrival_airport_id: Number(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value={0}>Select airport</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} – {a.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.departure_time}
                    onChange={(e) => setForm((f) => ({ ...f, departure_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.arrival_time}
                    onChange={(e) => setForm((f) => ({ ...f, arrival_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft *</label>
                <select
                  value={form.aircraft_id}
                  onChange={(e) => setForm((f) => ({ ...f, aircraft_id: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                >
                  <option value={0}>Select aircraft</option>
                  {aircrafts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.model} ({a.total_seats} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.base_price}
                    onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => !submitting && (setEditingFlight(null), setForm(defaultForm))}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
