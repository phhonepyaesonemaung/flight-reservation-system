interface LogoIconProps {
  className?: string
  size?: number
}

export default function LogoIcon({ className = '', size = 48 }: LogoIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Three streamlined swoosh shapes */}
      <div className="absolute inset-0 flex flex-col justify-center gap-0.5">
        <div 
          className="h-[20%] bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transform -rotate-12 opacity-70"
          style={{ marginLeft: '0%', width: '90%' }}
        />
        <div 
          className="h-[25%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform -rotate-12 opacity-85"
          style={{ marginLeft: '5%', width: '90%' }}
        />
        <div 
          className="h-[30%] bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transform -rotate-12"
          style={{ marginLeft: '10%', width: '85%' }}
        />
      </div>
    </div>
  )
}
