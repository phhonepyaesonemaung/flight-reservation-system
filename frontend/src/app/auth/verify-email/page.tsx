'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import LogoIcon from '@/components/LogoIcon'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const dispatch = useDispatch()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Verification link is invalid or missing.')
      return
    }

    let cancelled = false
    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((response) => {
        if (cancelled) return
        const payload = response.data?.data ?? response.data
        const user = payload?.user
        const accessToken = payload?.access_token ?? payload?.token
        if (user && accessToken) {
          const normalizedUser = {
            id: String(user.id),
            email: user.email ?? '',
            firstName: user.first_name ?? user.firstName ?? '',
            lastName: user.last_name ?? user.lastName ?? '',
            role: (user.role as 'user' | 'admin') ?? 'user',
          }
          localStorage.setItem('token', accessToken)
          sessionStorage.setItem('token', accessToken)
          dispatch(setCredentials({ user: normalizedUser, token: accessToken }))
          setStatus('success')
          toast.success('Email verified! You are now signed in.')
          router.push(redirectTo)
        } else {
          setStatus('error')
          setMessage('Could not complete verification.')
        }
      })
      .catch((err: any) => {
        if (cancelled) return
        setStatus('error')
        const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Invalid or expired verification link.'
        setMessage(msg)
        toast.error(msg)
      })

    return () => { cancelled = true }
  }, [token, redirectTo, dispatch, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      <div className="inline-flex items-center justify-center mb-6">
        <LogoIcon size={80} />
      </div>
      <h1 className="text-2xl font-bold text-primary-800 mb-2">Verify your email</h1>

      {status === 'loading' && (
        <p className="text-gray-600">Verifying your email...</p>
      )}

      {status === 'success' && (
        <p className="text-gray-600">Redirecting you...</p>
      )}

      {status === 'error' && (
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{message}</p>
          <Link
            href="/auth/signin"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-semibold"
          >
            Go to Sign in
          </Link>
        </div>
      )}
    </div>
  )
}
