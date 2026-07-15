import { useTheme } from '@/lib/theme'

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-12 w-auto',
} as const

type ServiturLogoProps = {
  size?: keyof typeof sizeClasses
  className?: string
}

export default function ServiturLogo({ size = 'md', className = '' }: ServiturLogoProps) {
  const { theme } = useTheme()
  const src =
    theme === 'dark'
      ? `${import.meta.env.BASE_URL}logo_soft.webp`
      : `${import.meta.env.BASE_URL}logo_ligth_soft.webp`

  return (
    <img
      src={src}
      alt="SERVITUR"
      className={`${sizeClasses[size]} ${className}`}
      style={size === 'lg' ? {} : { borderRadius: '9999px', objectFit: 'contain' }}
    />
  )
}
