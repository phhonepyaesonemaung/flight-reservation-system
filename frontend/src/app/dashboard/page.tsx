'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    dispatch(logout())
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    }
    toast.success('Logged out successfully')
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-primary-700">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <Link href="/" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
          <p className="text-gray-600">
            Welcome to your AEROLINK dashboard. Flight search and booking features will be available soon.
          </p>
        </div>
      </main>
    </div>
  )
}
