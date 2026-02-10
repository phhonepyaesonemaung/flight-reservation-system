'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bell, Search, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import type { Airport } from '@/types'

const searchSchema = z.object({
  from: z.number({ required_error: 'Origin is required' }).min(1, 'Origin is required'),
  to: z.number({ required_error: 'Destination is required' }).min(1, 'Destination is required'),
  departDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().optional(),
  tripType: z.enum(['round', 'oneway']),
  cabinClass: z.enum(['economy', 'business', 'first']),
  passengers: z.number().min(1).max(9),
  flexibleDates: z.boolean(),
  refundableOnly: z.boolean(),
}).refine((data) => {
  if (data.tripType === 'round') return !!data.returnDate?.trim()
  return true
}, { message: 'Return date is required for round trip', path: ['returnDate'] })

type SearchFormData = z.infer<typeof searchSchema>

export default function Home() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    }
    toast.success('Logged out successfully')
    router.push('/')
  }
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [airports, setAirports] = useState<Airport[]>([])
  const [arrivalAirportIds, setArrivalAirportIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.get('/flight/get-all-airports')
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data
        if (Array.isArray(data)) setAirports(data)
      })
      .catch(() => setAirports([]))
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: 0,
      to: 0,
      tripType: 'round',
      cabinClass: 'economy',
      passengers: 1,
      flexibleDates: false,
      refundableOnly: false,
    },
  })

  const tripType = watch('tripType')
  const fromId = watch('from')

  // When "From" changes: reset "To" and fetch arrival airports from get-all-flights by departure_airport_id
  useEffect(() => {
    if (!fromId || fromId === 0) {
      setArrivalAirportIds(new Set())
      setValue('to', 0)
      return
    }
    setValue('to', 0)
    api.get(`/flight/get-all-flights?departure_airport_id=${fromId}`)
      .then((res: any) => {
        const raw = res?.data?.data ?? res?.data
        const flights = Array.isArray(raw) ? raw : []
        const ids = new Set(
          flights
            .map((f: { arrival_airport_id?: number }) => f.arrival_airport_id)
            .filter((id): id is number => typeof id === 'number')
        )
        setArrivalAirportIds(ids)
      })
      .catch(() => setArrivalAirportIds(new Set()))
  }, [fromId, setValue])

  const destinationAirports = useMemo(
    () => airports.filter((a) => arrivalAirportIds.has(a.id)),
    [airports, arrivalAirportIds]
  )

  const onSubmit = async (data: SearchFormData) => {
    try {
      const body = {
        type: data.tripType === 'round' ? 'round-trip' : 'one-way',
        from: data.from,
        to: data.to,
        departureDate: data.departDate,
        returnDate: data.tripType === 'round' ? data.returnDate : undefined,
        cabinClass: data.cabinClass,
      }
      const res: any = await api.post('/flight/search', body)
      const payload = res?.data?.data ?? res?.data
      // Optional: still navigate with query params for later use
      router.push(
        `/flights/search?from=${data.from}&to=${data.to}&date=${data.departDate}&passengers=${data.passengers}&type=${data.tripType}` +
        (data.tripType === 'round' && data.returnDate ? `&returnDate=${data.returnDate}` : '') +
        `&cabinClass=${data.cabinClass}`
      )
    } catch (e) {
      console.error('Search failed:', e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-blue-200 transition font-medium">
                BOOK
              </Link>
              <Link href="/check-in" className="text-white hover:text-blue-200 transition font-medium">
                CHECK-IN
              </Link>
              <Link href="/my-trips" className="text-white hover:text-blue-200 transition font-medium">
                MY TRIPS
              </Link>
              <Link href="/flight-status" className="text-white hover:text-blue-200 transition font-medium">
                FLIGHT STATUS
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-blue-200 transition">
                <Bell className="w-6 h-6" />
              </button>
              <button className="text-white hover:text-blue-200 transition">
                <Search className="w-6 h-6" />
              </button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-white text-sm">Welcome, {user?.firstName}</span>
                  <Link
                    href="/dashboard"
                    className="bg-white text-primary-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-white hover:text-blue-200 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/signup"
                    className="text-white hover:text-blue-200 transition font-medium"
                  >
                    Sign-up
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Background with Planes */}
        <div className="relative h-[600px] bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-400 overflow-hidden">
          {/* Animated plane images */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 opacity-20 animate-float-slow">
              <div className="w-32 h-32 bg-white/10 rounded-full" />
            </div>
            <div className="absolute top-20 right-20 opacity-15 animate-float">
              <div className="w-24 h-24 bg-white/10 rounded-full" />
            </div>
            <div className="absolute bottom-32 left-1/4 opacity-10 animate-float-slower">
              <div className="w-40 h-40 bg-white/10 rounded-full" />
            </div>
          </div>

          {/* Large centered logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-center">
              <div className="text-9xl font-bold text-white">AEROLINK</div>
            </div>
          </div>
        </div>

        {/* Reservation Panel - Overlapping hero section */}
        <div className="relative -mt-80 z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-primary-800 rounded-t-2xl shadow-2xl p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Reservation Panel</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* From/To and Trip Options Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* From */}
                  <div className="md:col-span-3">
                    <label className="block text-white text-sm font-medium mb-2">
                      From
                    </label>
                    <select
                      {...register('from', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800"
                    >
                      <option value={0}>Select origin</option>
                      {airports.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} – {a.city}
                        </option>
                      ))}
                    </select>
                    {errors.from && (
                      <p className="mt-1 text-sm text-red-300">{errors.from.message}</p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="md:col-span-1 flex items-end pb-3">
                    <div className="w-full flex justify-center">
                      <div className="text-accent text-2xl">⇄</div>
                    </div>
                  </div>

                  {/* To - only destinations that have flights from selected origin */}
                  <div className="md:col-span-3">
                    <label className="block text-white text-sm font-medium mb-2">
                      To
                    </label>
                    <select
                      {...register('to', { valueAsNumber: true })}
                      disabled={!fromId || fromId === 0}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                      <option value={0}>
                        {fromId ? 'Select destination' : 'Select origin first'}
                      </option>
                      {destinationAirports.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} – {a.city}
                        </option>
                      ))}
                    </select>
                    {errors.to && (
                      <p className="mt-1 text-sm text-red-300">{errors.to.message}</p>
                    )}
                  </div>

                  {/* Round Trip / One Way */}
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Trip Type
                    </label>
                    <select
                      {...register('tripType')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800"
                    >
                      <option value="round">Round Trip</option>
                      <option value="oneway">One Way</option>
                    </select>
                  </div>

                  {/* Departure Date */}
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Depart
                    </label>
                    <div className="relative">
                      <input
                        {...register('departDate')}
                        type="date"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.departDate && (
                      <p className="mt-1 text-sm text-red-300">{errors.departDate.message}</p>
                    )}
                  </div>

                  {/* Return Date - only for round trip */}
                  {tripType === 'round' && (
                    <div className="md:col-span-2">
                      <label className="block text-white text-sm font-medium mb-2">
                        Return
                      </label>
                      <div className="relative">
                        <input
                          {...register('returnDate')}
                          type="date"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.returnDate && (
                        <p className="mt-1 text-sm text-red-300">{errors.returnDate.message}</p>
                      )}
                    </div>
                  )}

                  {/* Cabin Class */}
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Cabin
                    </label>
                    <select
                      {...register('cabinClass')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800"
                    >
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First</option>
                    </select>
                  </div>

                  {/* Passengers */}
                  <div className="md:col-span-1">
                    <label className="block text-white text-sm font-medium mb-2">
                      Passengers
                    </label>
                    <select
                      {...register('passengers', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white text-gray-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Options */}
                <div className="flex items-center justify-between">
                  {/* <div className="flex items-center space-x-6">
                    <label className="flex items-center text-white text-sm">
                      <input
                        {...register('flexibleDates')}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      My dates are flexible
                    </label>
                    <label className="flex items-center text-white text-sm">
                      <input
                        {...register('refundableOnly')}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      Refundable Only
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-blue-200 hover:text-white text-sm font-medium transition"
                    >
                      Advance Search {showAdvanced ? '▲' : '▼'}
                    </button>
                  </div> */}

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-hover text-white px-12 py-3 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>

                {/* Advanced Search Options */}
                {showAdvanced && (
                  <div className="bg-primary-700 rounded-lg p-6 space-y-4">
                    <h3 className="text-white font-semibold mb-4">Advanced Search Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Class
                        </label>
                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-800">
                          <option>Economy</option>
                          <option>Business</option>
                          <option>First Class</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Airline
                        </label>
                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-800">
                          <option>Any Airline</option>
                          <option>AEROLINK Airways</option>
                          <option>Sky Jet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Stops
                        </label>
                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-800">
                          <option>Any</option>
                          <option>Non-stop</option>
                          <option>1 Stop</option>
                          <option>2+ Stops</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find the best flights quickly with our advanced search features
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Flexible Booking</h3>
              <p className="text-gray-600">
                Book with confidence with flexible dates and refundable options
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Group Travel</h3>
              <p className="text-gray-600">
                Perfect for families and groups - book up to 9 passengers
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Logo size="sm" showText={true} className="justify-center mb-4" />
          <p className="text-sm text-gray-300">
            © 2026 AEROLINK. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
