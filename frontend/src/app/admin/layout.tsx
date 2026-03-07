'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import {
  LayoutDashboard,
  Plane,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
  MapPin,
  LogOut,
} from 'lucide-react'

const ADMIN_SESSION_KEY = 'admin_logged_in'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoginPage) return
    const session = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_SESSION_KEY) : null
    if (!session) {
      router.replace('/admin/login')
    }
  }, [mounted, isLoginPage, router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_SESSION_KEY)
    }
    router.replace('/admin/login')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  const nav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/flights', label: 'Flights', icon: Plane },
    { href: '/admin/bookings', label: 'Bookings', icon: CreditCard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/airports', label: 'Airports', icon: MapPin },
    { href: '/admin/airlines', label: 'Aircraft', icon: Building2 },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} className="text-white" />
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">Admin Portal</span>
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
        <aside className="w-64 bg-white shadow min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    active ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
