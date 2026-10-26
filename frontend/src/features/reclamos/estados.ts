import {
  Ban,
  Building2,
  CircleCheck,
  Clock,
  FileText,
  Inbox,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'

/** Estados del proceso de gestión de un reclamo (nombres provisionales del frontend). */
export type Estado =
  | 'ingresado'
  | 'pendiente_antecedentes'
  | 'asignado'
  | 'en_gestion'
  | 'esperando_empresa'
  | 'cerrado'
  | 'anulado'

type EstadoInfo = {
  label: string
  short?: string
  pill: string
  icon: LucideIcon
}

export const ESTADOS: Record<Estado, EstadoInfo> = {
  ingresado: { label: 'Ingresado', pill: 'pill-neutral', icon: Inbox },
  pendiente_antecedentes: {
    label: 'Pendiente de antecedentes',
    short: 'Pend. antecedentes',
    pill: 'pill-warning',
    icon: FileText,
  },
  asignado: { label: 'Asignado', pill: 'pill-brand', icon: UserPlus },
  en_gestion: { label: 'En gestión', pill: 'pill-filled', icon: Clock },
  esperando_empresa: {
    label: 'Esperando respuesta de empresa',
    short: 'Esperando empresa',
    pill: 'pill-neutral',
    icon: Building2,
  },
  cerrado: { label: 'Cerrado', pill: 'pill-success', icon: CircleCheck },
  anulado: { label: 'Anulado', pill: 'pill-muted', icon: Ban },
}

/** Plazo de gestión del prototipo: 20 días corridos desde el ingreso. */
export const PLAZO_DIAS = 20
