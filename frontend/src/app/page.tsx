import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-primary-700">AEROLINK</h1>
        <p className="text-xl mb-8 text-gray-600">Flight Reservation Management System</p>
        <div className="space-x-4">
          <Link
            href="/auth/signin"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}
