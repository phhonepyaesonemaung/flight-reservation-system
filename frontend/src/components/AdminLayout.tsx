import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, persistor } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { useRehydrated } from '@/contexts/RehydrationContext'
import Logo from './Logo'
import Link from 'next/link'
import { LayoutDashboard, Plane, Users, CreditCard, BarChart3, MapPin, LogOut } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    }
    dispatch(logout())
    persistor.purge().then(() => router.replace('/auth/admin/signin'))
  }

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
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/90 hover:text-white text-sm"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
              { href: '/admin/flights', label: 'Flights', icon: Plane, exact: false },
              { href: '/admin/bookings', label: 'Bookings', icon: CreditCard, exact: false },
              { href: '/admin/users', label: 'Users', icon: Users, exact: false },
              { href: '/admin/airports', label: 'Airports', icon: MapPin, exact: false },
              { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, exact: false },
            ].map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
