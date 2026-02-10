'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray } from 'react-hook-form'
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
  passengerType: z.enum(['local', 'foreign']),
  nrcNumber: z.string().optional(),
  passportNumber: z.string().optional(),
}).refine(
  (data) => {
    if (data.passengerType === 'local') {
      return !!data.nrcNumber && data.nrcNumber.trim().length > 0
    }
    if (data.passengerType === 'foreign') {
      return !!data.passportNumber && data.passportNumber.trim().length > 0
    }
    return true
  },
  {
    message: 'NRC number is required for local passengers, Passport number is required for foreign passengers',
    path: ['nrcNumber'], // This will be dynamically set
  }
)

const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema),
})

type PassengerFormData = z.infer<typeof passengersFormSchema>

const BOOKING_PASSENGER_KEY = 'booking_passenger'

export default function PassengerInfoPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const flightId = params.id as string
  const passengersCount = Math.max(1, parseInt(searchParams.get('passengers') || '1', 10))
  const cabinClass = searchParams.get('cabinClass') || 'economy'
  const passengerType = (searchParams.get('passengerType') || 'local') as 'local' | 'foreign'

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengersFormSchema),
    defaultValues: {
      passengers: Array.from({ length: passengersCount }, () => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        passengerType: passengerType,
        nrcNumber: '',
        passportNumber: '',
      })),
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'passengers',
  })

  const onSubmit = (data: PassengerFormData) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BOOKING_PASSENGER_KEY, JSON.stringify(data.passengers))
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
            {fields.map((field, index) => {
              const selectedPassengerType = watch(
                `passengers.${index}.passengerType`,
                passengerType
              )

              return (
                <div key={field.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Passenger {index + 1}
                    </h3>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register(`passengers.${index}.firstName`)}
                          type="text"
                          placeholder="John"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      {errors.passengers?.[index]?.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.passengers[index]?.firstName?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register(`passengers.${index}.lastName`)}
                          type="text"
                          placeholder="Doe"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      {errors.passengers?.[index]?.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.passengers[index]?.lastName?.message}
                        </p>
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
                          {...register(`passengers.${index}.email`)}
                          type="email"
                          placeholder="john@example.com"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      {errors.passengers?.[index]?.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.passengers[index]?.email?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register(`passengers.${index}.phone`)}
                          type="tel"
                          placeholder="+1234567890"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      {errors.passengers?.[index]?.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.passengers[index]?.phone?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Birth Date and Passenger Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register(`passengers.${index}.dateOfBirth`)}
                          type="date"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                        />
                      </div>
                      {errors.passengers?.[index]?.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.passengers[index]?.dateOfBirth?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passenger Type *
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2">
                          <input
                            {...register(`passengers.${index}.passengerType`)}
                            type="radio"
                            value="local"
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="text-sm text-gray-700">Local</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            {...register(`passengers.${index}.passengerType`)}
                            type="radio"
                            value="foreign"
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="text-sm text-gray-700">Foreign</span>
                        </label>
                      </div>
                    </div>

                    {/* NRC Number for Local / Passport for Foreign */}
                    {selectedPassengerType === 'local' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NRC Number *
                        </label>
                        <input
                          {...register(`passengers.${index}.nrcNumber`)}
                          type="text"
                          placeholder="12/OUKAMA(N)123456"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                        />
                        {errors.passengers?.[index]?.nrcNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.passengers[index]?.nrcNumber?.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passport Number *
                        </label>
                        <input
                          {...register(`passengers.${index}.passportNumber`)}
                          type="text"
                          placeholder="A12345678"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                        />
                        {errors.passengers?.[index]?.passportNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.passengers[index]?.passportNumber?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

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
