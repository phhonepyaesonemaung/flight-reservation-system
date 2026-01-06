import { Plane } from 'lucide-react'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  href?: string
}

export default function Logo({ size = 'md', showText = true, className = '', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Three streamlined shapes */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <div className="absolute inset-0">
          {/* Three swoosh lines representing flight paths */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transform -rotate-12 opacity-70"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform -rotate-12 opacity-85"></div>
          <div className="absolute top-3/4 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transform -rotate-12"></div>
        </div>
      </div>
      
      {showText && (
        <span className={`font-bold text-primary-800 tracking-tight ${textSizeClasses[size]}`}>
          AEROLINK
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
