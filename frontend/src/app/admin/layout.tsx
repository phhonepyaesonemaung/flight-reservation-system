'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

function hasToken() {
  if (typeof window === 'undefined') return false
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const isSigninPage = pathname === '/auth/admin/signin'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isSigninPage) return
    if (!hasToken()) {
      router.replace('/auth/admin/signin')
    }
  }, [mounted, isSigninPage, router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (isSigninPage) {
    return <>{children}</>
  }

  return <AdminLayout>{children}</AdminLayout>
}
