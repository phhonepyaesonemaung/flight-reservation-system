'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import LogoIcon from '@/components/LogoIcon'
import { RootState } from '@/store'
import { useRehydrated } from '@/contexts/RehydrationContext'

export default function AdminSignInPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const rehydrated = useRehydrated()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  useEffect(() => {
    if (!rehydrated) return
    if (isAuthenticated && user?.role === 'admin') router.replace('/admin')
  }, [rehydrated, isAuthenticated, user, router])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [showSeed, setShowSeed] = useState(false)
  const [seedUsername, setSeedUsername] = useState('')
  const [seedPassword, setSeedPassword] = useState('')
  const [seedLoading, setSeedLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      toast.error('Username and password are required')
      return
    }
    setIsLoading(true)
    try {
      const response = await api.post('/auth/admin/signin', { username: username.trim(), password })
      const payload = response.data?.data ?? response.data
      const rawUser = payload?.user
      const token = payload?.access_token ?? payload?.token
      if (!rawUser || !token) {
        toast.error('Invalid response from server')
        return
      }
      const user = {
        id: String(rawUser.id),
        email: rawUser.email ?? '',
        firstName: rawUser.first_name ?? rawUser.firstName ?? '',
        lastName: rawUser.last_name ?? rawUser.lastName ?? '',
        role: (rawUser.role as 'user' | 'admin') ?? 'admin',
      }
      sessionStorage.setItem('token', token)
      localStorage.setItem('token', token)
      dispatch(setCredentials({ user, token }))
      toast.success('Admin signed in')
      router.push('/admin')
    } catch (error: any) {
      const msg = error.response?.data?.error ?? error.response?.data?.message ?? 'Invalid credentials'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seedUsername.trim() || seedPassword.length < 6) {
      toast.error('Username and password (min 6 characters) are required')
      return
    }
    setSeedLoading(true)
    try {
      const response = await api.post('/auth/admin/seed', {
        username: seedUsername.trim(),
        password: seedPassword,
      })
      const payload = response.data?.data ?? response.data
      const rawUser = payload?.user
      const token = payload?.access_token ?? payload?.token
      if (!rawUser || !token) {
        toast.error('Invalid response from server')
        return
      }
      const user = {
        id: String(rawUser.id),
        email: rawUser.email ?? '',
        firstName: rawUser.first_name ?? rawUser.firstName ?? '',
        lastName: rawUser.last_name ?? rawUser.lastName ?? '',
        role: 'admin' as const,
      }
      sessionStorage.setItem('token', token)
      localStorage.setItem('token', token)
      dispatch(setCredentials({ user, token }))
      toast.success('First admin created and signed in')
      router.push('/admin')
    } catch (error: any) {
      const msg = error.response?.data?.error ?? error.response?.data?.message ?? 'Failed to create admin'
      toast.error(msg)
    } finally {
      setSeedLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
      <div className="inline-flex items-center justify-center mb-6">
        <LogoIcon size={64} />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin sign in</h1>
      <p className="text-gray-600 text-sm mb-6">Use your admin account</p>

      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-gray-800 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
          >
            <Shield className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowSeed(!showSeed)}
            className="text-sm text-gray-500 hover:text-primary-600"
          >
            {showSeed ? 'Hide' : 'First time? Create first admin'}
          </button>
          {showSeed && (
            <form onSubmit={handleSeed} className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Only works when no admin exists yet.</p>
              <input
                type="text"
                value={seedUsername}
                onChange={(e) => setSeedUsername(e.target.value)}
                placeholder="Username (min 3)"
                className="w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white text-gray-800 placeholder-gray-500"
              />
              <input
                type="password"
                value={seedPassword}
                onChange={(e) => setSeedPassword(e.target.value)}
                placeholder="Password (min 6)"
                className="w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white text-gray-800 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={seedLoading}
                className="w-full py-2 rounded bg-gray-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {seedLoading ? 'Creating...' : 'Create admin & sign in'}
              </button>
            </form>
          )}
        </div>
      </div>

      <a
        href="http://localhost:3000"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 text-sm text-gray-500 hover:text-primary-600"
      >
        User site (port 3000) →
      </a>
    </div>
  )
}
