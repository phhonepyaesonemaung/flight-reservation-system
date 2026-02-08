'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Logo from '@/components/Logo'
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const passengerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  passportNumber: z.string().optional(),
})

type PassengerFormData = z.infer<typeof passengerSchema>

const BOOKING_PASSENGER_KEY = 'booking_passenger'

export default function PassengerInfoPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const flightId = params.id as string
  const passengersCount = Math.max(1, parseInt(searchParams.get('passengers') || '1', 10))
  const cabinClass = searchParams.get('cabinClass') || 'economy'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
  })

  const onSubmit = (data: PassengerFormData) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BOOKING_PASSENGER_KEY, JSON.stringify(data))
    }
    toast.success('Passenger information saved')
    const params = new URLSearchParams()
    params.set('passengers', String(passengersCount))
    params.set('cabinClass', cabinClass)
    router.push(`/booking/payment/${flightId}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo size="md" showText={true} className="text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/flights/search" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search Results
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Passenger Information</h2>
          <p className="text-gray-600 mb-6">
            Please provide passenger details for {passengersCount} passenger{passengersCount > 1 ? 's' : ''}.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Birth Date and Passport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number (Optional)
                </label>
                <input
                  {...register('passportNumber')}
                  type="text"
                  placeholder="A12345678"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please ensure all passenger information matches the government-issued ID that will be presented at the airport.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
            >
              Continue to Payment
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
