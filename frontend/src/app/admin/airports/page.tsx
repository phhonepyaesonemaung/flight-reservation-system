'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

type Airport = {
  id: number
  code: string
  name: string
  city: string
  country: string
}

export default function AdminAirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', city: '', country: '' })

  const loadAirports = () => {
    api
      .get('/flight/get-all-airports')
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data
        setAirports(Array.isArray(data) ? data : [])
      })
      .catch(() => setAirports([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    loadAirports()
  }, [])

  const filtered = airports.filter(
    (a) =>
      searchTerm === '' ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim() || !form.city.trim() || !form.country.trim()) {
      toast.error('All fields are required')
      return
    }
    setSubmitting(true)
    api
      .post('/flight/create-airport', {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
      })
      .then(() => {
        toast.success('Airport created')
        setShowAdd(false)
        setForm({ code: '', name: '', city: '', country: '' })
        loadAirports()
      })
      .catch((err: any) => {
        const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Failed to create airport'
        toast.error(msg)
      })
      .finally(() => setSubmitting(false))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Airports</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Airport
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, name, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading airports...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">City</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Country</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No airports found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          {a.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{a.name}</td>
                      <td className="py-3 px-4 text-gray-800">{a.city}</td>
                      <td className="py-3 px-4 text-gray-800">{a.country}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Add Airport</h2>
              <button
                type="button"
                onClick={() => !submitting && setShowAdd(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. JFK"
                  maxLength={10}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Airport name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="City"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="Country"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !submitting && setShowAdd(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
