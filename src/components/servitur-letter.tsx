import { useTheme } from '@/lib/theme'

type ServiturLetterProps = {
  size?: string
  className?: string
}

export default function ServiturLetter({ size = 'h-2', className = '' }: ServiturLetterProps) {
  const { theme } = useTheme()
  const src =
    theme === 'dark'
      ? `${import.meta.env.BASE_URL}letter_soft.webp`
      : `${import.meta.env.BASE_URL}serviture_letter_v2.svg`

  return (
    <img src={src} alt="SERVITUR" className={`${size} ${className}`} style={{ height: '2rem' }} />
  )
}
