'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Plane, User, Mail, Phone } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import LogoIcon from '@/components/LogoIcon'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const signUpSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')?.trim() || ''
  const storedRedirect = typeof window !== 'undefined' ? localStorage.getItem('post_auth_redirect') : null
  const signinHref = redirectParam || storedRedirect
    ? `/auth/signin?redirect=${encodeURIComponent(redirectParam || storedRedirect || '')}`
    : '/auth/signin'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (redirectParam) {
      localStorage.setItem('post_auth_redirect', redirectParam)
    }
  }, [redirectParam])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { agreeToTerms: false },
  })

  const agreeToTerms = watch('agreeToTerms')
  const isSubmitDisabled = isLoading || !agreeToTerms

  const [signupSuccess, setSignupSuccess] = useState(false)

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setSignupSuccess(false)
    try {
      const response = await api.post('/auth/signup', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        username: data.username,
        password: data.password,
      })
      const payload = response.data?.data ?? response.data
      const message = payload?.message ?? 'Check your email to verify your account. The link expires in 24 hours.'
      setSignupSuccess(true)
      toast.success(message)
    } catch (error: any) {
      toast.error(error.response?.data?.error ?? error.response?.data?.message ?? 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="absolute top-20 right-10 animate-float-slow opacity-20">
          <Plane className="w-32 h-32 text-primary-400 -rotate-45" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float opacity-15">
          <Plane className="w-28 h-28 text-purple-400 rotate-12" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-float-slower opacity-10">
          <Plane className="w-36 h-36 text-indigo-500 rotate-90" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <LogoIcon size={80} />
            </div>
            <h1 className="text-4xl font-bold text-primary-800 mb-2 tracking-tight">
              AEROLINK
            </h1>
            <p className="text-gray-600 text-sm">Join Us and Explore the World</p>
          </div>

          {/* Sign Up Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-primary-700 mb-2">
              CREATE ACCOUNT
            </h2>
            <p className="text-center text-gray-600 mb-6 text-sm">
              Sign up to start your journey
            </p>

            {signupSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-800 font-medium">Check your email</p>
                <p className="text-green-700 text-sm mt-1">
                  We sent a verification link to your email. Click it to verify your account, then sign in.
                </p>
                <Link
                  href={signinHref}
                  className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                >
                  Go to Sign in →
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" style={{ display: signupSuccess ? 'none' : undefined }}>
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('first_name')}
                      type="text"
                      id="first_name"
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 text-gray-900"
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('last_name')}
                      type="text"
                      id="last_name"
                      placeholder="Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 text-gray-900"
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 text-gray-900"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      placeholder="+1234567890"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 text-gray-900"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  {...register('username')}
                  type="text"
                  id="username"
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 text-gray-900"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Enter password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 pr-12 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 outline-none bg-white/80 pr-12 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div>
                <label className="flex items-start">
                  <input
                    {...register('agreeToTerms')}
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submit Button - enabled only when agree to terms is checked */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href={signinHref}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
