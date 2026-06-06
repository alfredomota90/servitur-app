import { Clock, Shield, MapPin, type LucideIcon } from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  desc: string
}

export interface Stat {
  value: string
  label: string
}

export interface Company {
  name: string
  abbr: string
  url: string
}

export const features: Feature[] = [
  { icon: Clock, title: 'Puntualidad', desc: 'Nos comprometemos con horarios estrictos' },
  { icon: Shield, title: 'Seguridad', desc: 'Unidades en óptimas condiciones' },
  { icon: MapPin, title: 'Cobertura', desc: 'Durango, Jalisco, Zacatecas y más' },
]

export const stats: Stat[] = [
  { value: '15+', label: 'Años de experiencia' },
  { value: '3', label: 'Clientes activos' },
  { value: '500+', label: 'Viajes realizados' },
]

export const trustedCompanies: Company[] = [
  { name: 'Minera la Cantera', abbr: 'MLC', url: 'https://www.mineralacantera.com/' },
  { name: 'Cominvi', abbr: 'CN', url: 'https://cominvi.com.mx/' },
  { name: 'Conade', abbr: 'CON', url: 'https://www.gob.mx/conade' },
]
