'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Logo from '@/components/Logo'
import { Search, CheckCircle, Plane } from 'lucide-react'
import toast from 'react-hot-toast'

const checkInSchema = z.object({
  confirmationNumber: z.string().min(1, 'Confirmation number is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

type CheckInFormData = z.infer<typeof checkInSchema>

export default function CheckInPage() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [boardingPass, setBoardingPass] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
  })

  const onSubmit = (data: CheckInFormData) => {
    // Simulate check-in process
    setTimeout(() => {
      setCheckedIn(true)
      setBoardingPass({
        confirmationNumber: data.confirmationNumber,
        passenger: data.lastName.toUpperCase(),
        flight: 'AL 101',
        gate: 'A12',
        seat: '12A',
        boarding: '07:30 AM',
        departure: '08:00 AM',
      })
      toast.success('Check-in successful!')
    }, 1500)
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
      <main className="max-w-2xl mx-auto px-4 py-8">
        {!checkedIn ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Plane className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Online Check-In</h1>
              <p className="text-gray-600">Check-in opens 24 hours before departure</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmation Number
                </label>
                <input
                  {...register('confirmationNumber')}
                  type="text"
                  placeholder="e.g., AL2026-ABC123"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500 uppercase"
                />
                {errors.confirmationNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmationNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Check In
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Check-In Complete!</h1>
              <p className="text-gray-600">Your boarding pass is ready</p>
            </div>

            {/* Boarding Pass */}
            <div className="border-2 border-dashed border-primary-600 rounded-lg p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-800 mb-2">BOARDING PASS</div>
                <div className="text-sm text-gray-600">AEROLINK Airways</div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Passenger</p>
                  <p className="text-lg font-bold text-gray-800">{boardingPass.passenger}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Flight</p>
                  <p className="text-lg font-bold text-gray-800">{boardingPass.flight}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Gate</p>
                  <p className="text-lg font-bold text-accent">{boardingPass.gate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Seat</p>
                  <p className="text-lg font-bold text-gray-800">{boardingPass.seat}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Boarding</p>
                  <p className="text-lg font-bold text-gray-800">{boardingPass.boarding}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Departure</p>
                  <p className="text-lg font-bold text-gray-800">{boardingPass.departure}</p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <p className="text-xs text-gray-500 text-center">Confirmation: {boardingPass.confirmationNumber}</p>
              </div>
            </div>

            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-bold transition mb-3">
              Download Boarding Pass
            </button>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition">
              Email Boarding Pass
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
