'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Logo from '@/components/Logo'
import { ArrowLeft, CreditCard, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Invalid card number'),
  cardName: z.string().min(1, 'Cardholder name is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)'),
  cvv: z.string().min(3, 'Invalid CVV').max(4),
})

type PaymentFormData = z.infer<typeof paymentSchema>

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const flightId = params.id
  const seats = searchParams.get('seats')?.split(',') || []
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  // Mock pricing
  const flightPrice = 250
  const taxes = 35
  const total = flightPrice + taxes

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      toast.success('Payment successful!')
      router.push(`/booking/confirmation/${flightId}`)
    }, 2000)
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href={`/booking/passengers/${flightId}?seats=${seats.join(',')}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Passenger Info
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Secure Payment</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('cardNumber')}
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                )}
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name *
                </label>
                <input
                  {...register('cardName')}
                  type="text"
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500 uppercase"
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardName.message}</p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    {...register('expiryDate')}
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    {...register('cvv')}
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Your payment is secure</p>
                    <p className="text-xs text-green-700 mt-1">
                      We use industry-standard encryption to protect your payment information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-accent hover:bg-accent-hover disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                {isProcessing ? 'Processing Payment...' : `Pay $${total}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Flight (AEROLINK AL 101)</span>
                <span className="font-semibold">${flightPrice}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Taxes & Fees</span>
                <span className="font-semibold">${taxes}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Selected Seats</span>
                <span className="font-semibold">{seats.join(', ')}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-accent">${total}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-3">We accept:</p>
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 px-3 py-2 rounded text-xs font-semibold">VISA</div>
                <div className="bg-gray-100 px-3 py-2 rounded text-xs font-semibold">Mastercard</div>
                <div className="bg-gray-100 px-3 py-2 rounded text-xs font-semibold">AMEX</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
