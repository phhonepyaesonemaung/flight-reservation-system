import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useRehydrated } from '@/contexts/RehydrationContext'
import Logo from './Logo'
import Link from 'next/link'
import { LayoutDashboard, Plane, Users, CreditCard, BarChart3, MapPin } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const rehydrated = useRehydrated()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [authCheckReady, setAuthCheckReady] = useState(false)

  const adminSignInPath = process.env.NEXT_PUBLIC_SITE === 'admin' ? '/auth/admin/signin' : '/auth/signin'

  useEffect(() => {
    if (!rehydrated) {
      setAuthCheckReady(false)
      return
    }
    const id = setTimeout(() => setAuthCheckReady(true), 100)
    return () => clearTimeout(id)
  }, [rehydrated])

  useEffect(() => {
    if (!authCheckReady) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push(adminSignInPath)
    }
  }, [authCheckReady, isAuthenticated, user, router, adminSignInPath])

  if (!rehydrated || !authCheckReady) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" /></div>
  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Admin: {user?.firstName}</span>
              <Link href="/profile" className="text-white hover:text-blue-200 transition">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/flights"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Plane className="w-5 h-5" />
              <span>Flights</span>
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <CreditCard className="w-5 h-5" />
              <span>Bookings</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/airports"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <MapPin className="w-5 h-5" />
              <span>Airports</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
