'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'

const ADMIN_SESSION_KEY = 'admin_logged_in'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // UI only: no API call yet
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SESSION_KEY, '1')
    }
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left: branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-800 flex-col justify-between p-12">
        <Logo size="lg" showText={true} className="text-white" />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-blue-200">
            Manage flights, airports, aircraft, bookings and users.
          </p>
        </div>
        <p className="text-sm text-blue-200/80">AEROLINK © 2026</p>
      </div>

      {/* Right: login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="md" showText={true} className="text-primary-800" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin sign in</h1>
          <p className="text-gray-500 mb-8">Use your admin credentials to access the panel.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aerolink.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              Sign in
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="text-primary-600 hover:underline">Back to main site</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
