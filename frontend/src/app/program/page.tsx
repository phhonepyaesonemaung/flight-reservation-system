'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Logo from '@/components/Logo'
import { Crown, Award, Gem, CreditCard, Lock, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const cardSchema = z.object({
  cardNumber: z.string().min(16, 'Invalid card number'),
  cardName: z.string().min(1, 'Cardholder name is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry (MM/YY)'),
  cvv: z.string().min(3, 'Invalid CVV').max(4),
})
type CardFormData = z.infer<typeof cardSchema>

type Tier = {
  id: number
  name: string
  display_name: string
  discount_percent: number
  duration_months: number
  price: number
  benefits_text: string
}

const tierIcons: Record<string, React.ReactNode> = {
  silver: <Award className="w-10 h-10 text-gray-400" />,
  gold: <Crown className="w-10 h-10 text-amber-500" />,
  diamond: <Gem className="w-10 h-10 text-primary-500" />,
}

const tierBg: Record<string, string> = {
  silver: 'border-gray-300 bg-gray-50',
  gold: 'border-amber-300 bg-amber-50/30',
  diamond: 'border-primary-400 bg-primary-50/50',
}

export default function ProgramPage() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [paymentTier, setPaymentTier] = useState<Tier | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  })

  useEffect(() => {
    api
      .get('/program/tiers')
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data
        setTiers(Array.isArray(data) ? data : [])
      })
      .catch(() => setTiers([]))
      .finally(() => setLoading(false))
  }, [])

  const openPaymentModal = (tier: Tier) => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    setPaymentTier(tier)
    reset({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' })
  }

  const closePaymentModal = () => {
    if (!purchasing) {
      setPaymentTier(null)
    }
  }

  const onCardSubmit = async (data: CardFormData, tier: Tier) => {
    setPurchasing(tier.name)
    try {
      await api.post('/program/purchase', { tier: tier.name })
      toast.success('Program purchased successfully! Your discount will apply on future bookings.')
      setPaymentTier(null)
    } catch (err: any) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Purchase failed'
      toast.error(msg)
    } finally {
      setPurchasing(null)
    }
  }

  const durationLabel = (months: number) => {
    if (months >= 24) return '2 years'
    if (months >= 12) return `${months / 12} year(s)`
    return `${months} months`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/program" className="text-white font-medium">
                PROGRAM
              </Link>
              <Link href="/my-bookings" className="text-white/80 hover:text-white transition">
                MY TRIPS
              </Link>
              <Link href="/flight-status" className="text-white/80 hover:text-white transition">
                FLIGHT STATUS
              </Link>
            </nav>
            <Link href="/" className="text-white hover:text-blue-200 transition text-sm font-medium">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AEROLINK Program</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join our membership tiers and save on every flight. Choose the plan that fits you and enjoy exclusive benefits.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading programs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl border-2 p-8 flex flex-col ${tierBg[tier.name] ?? 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {tierIcons[tier.name] ?? <Award className="w-10 h-10 text-gray-400" />}
                    <h2 className="text-2xl font-bold text-gray-800">{tier.display_name}</h2>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-primary-700">
                    {tier.discount_percent}% off
                  </p>
                  <p className="text-gray-600">for {durationLabel(tier.duration_months)}</p>
                </div>
                <div className="mb-6 flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Benefits &amp; promotions</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tier.benefits_text.split('•').map((s, i) => {
                      const t = s.trim()
                      return t ? <li key={i}>• {t}</li> : null
                    })}
                  </ul>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <p className="text-2xl font-bold text-gray-800 mb-4">
                    ${Number(tier.price).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => openPaymentModal(tier)}
                    className="w-full py-3 rounded-lg font-semibold transition bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-center text-gray-500 mt-8">
            <Link href="/auth/signin" className="text-primary-600 hover:underline font-medium">
              Sign in
            </Link>
            {' '}to purchase a program. Your discount will apply when you book flights.
          </p>
        )}
      </main>

      {/* Payment modal */}
      {paymentTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Pay for {paymentTier.display_name} — ${Number(paymentTier.price).toFixed(2)}
              </h2>
              <button
                type="button"
                onClick={closePaymentModal}
                disabled={!!purchasing}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit((data) => onCardSubmit(data, paymentTier))}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card number *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('cardNumber')}
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder name *</label>
                <input
                  {...register('cardName')}
                  type="text"
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 placeholder-gray-500 uppercase"
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY) *</label>
                  <input
                    {...register('expiryDate')}
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                  <input
                    {...register('cvv')}
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                  )}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-green-800">Your payment is secure. We use encryption to protect your card details.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={!!purchasing}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!purchasing}
                  className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-70"
                >
                  {purchasing ? 'Processing...' : `Pay $${Number(paymentTier.price).toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
