'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { User, Calendar, Mail, Phone, CreditCard, ArrowRight, Check } from 'lucide-react'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

const passengerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  passportNumber: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
})

const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(10, 'Invalid phone number'),
})

type PassengersFormData = z.infer<typeof passengersFormSchema>

export default function PassengerInfoPage() {
  const router = useRouter()
  const params = useParams()
  const flightId = params.id
  const numPassengers = 2 // From previous step
  const selectedSeats = ['5A', '5B'] // From previous step

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengersFormData>({
    resolver: zodResolver(passengersFormSchema),
    defaultValues: {
      passengers: Array.from({ length: numPassengers }, () => ({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male' as const,
        email: '',
        phone: '',
        passportNumber: '',
        nationality: '',
      })),
      contactEmail: '',
      contactPhone: '',
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'passengers',
  })

  const onSubmit = (data: PassengersFormData) => {
    console.log('Passenger data:', data)
    toast.success('Passenger information saved!')
    router.push(`/flights/${flightId}/payment`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <Link href={`/flights/${flightId}/seats`} className="text-white hover:text-blue-200 transition">
              Back to Seat Selection
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Flight Details</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Select Seats</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="ml-2 text-sm font-medium text-primary-600">Passenger Info</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Passenger Forms */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Passenger Information</h1>

            {fields.map((field, index) => (
              <div key={field.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Passenger {index + 1} - Seat {selectedSeats[index]}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register(`passengers.${index}.firstName`)}
                      type="text"
                      placeholder="John"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
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
                    <input
                      {...register(`passengers.${index}.lastName`)}
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    {errors.passengers?.[index]?.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.passengers[index]?.lastName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      {...register(`passengers.${index}.dateOfBirth`)}
                      type="date"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    {errors.passengers?.[index]?.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.passengers[index]?.dateOfBirth?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register(`passengers.${index}.gender`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register(`passengers.${index}.email`)}
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
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
                    <input
                      {...register(`passengers.${index}.phone`)}
                      type="tel"
                      placeholder="+959123456789"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    {errors.passengers?.[index]?.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.passengers[index]?.phone?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passport Number
                    </label>
                    <input
                      {...register(`passengers.${index}.passportNumber`)}
                      type="text"
                      placeholder="Optional"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality *
                    </label>
                    <input
                      {...register(`passengers.${index}.nationality`)}
                      type="text"
                      placeholder="Myanmar"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    {errors.passengers?.[index]?.nationality && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.passengers[index]?.nationality?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <p className="text-sm text-gray-600 mb-4">Booking confirmation will be sent to this contact</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    {...register('contactEmail')}
                    type="email"
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    {...register('contactPhone')}
                    type="tel"
                    placeholder="+959123456789"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight</span>
                  <span className="font-semibold">AL 101</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-semibold">MDL → RGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-semibold">{numPassengers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats</span>
                  <span className="font-semibold">{selectedSeats.join(', ')}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">$500</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
