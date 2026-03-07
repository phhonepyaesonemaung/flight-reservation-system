import axios from 'axios'
import { store, persistor } from '@/store'
import { logout } from '@/store/slices/authSlice'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token (check both storage so "remember me" and session work)
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        store.dispatch(logout())
        const signInPath = process.env.NEXT_PUBLIC_SITE === 'admin' ? '/auth/admin/signin' : '/auth/signin'
        persistor.purge().then(() => {
          window.location.href = signInPath
        })
      }
    }
    return Promise.reject(error)
  }
)
