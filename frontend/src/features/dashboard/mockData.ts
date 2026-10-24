import type { Estado } from '@/features/reclamos/estados'

/*
 * Datos de prueba del panel. Ficticios: no representan información de SERNAC.
 * Se reemplazarán por la API cuando el equipo acuerde los contratos.
 */

export const reclamosActivos = {
  total: 342,
  etapas: [
    { label: 'Por asignar', value: 48 },
    { label: 'En gestión', value: 214 },
    { label: 'Esperando empresa', value: 80 },
  ],
}

export const ingresosPorMes = [
  { label: 'May', value: 210 },
  { label: 'Jun', value: 168 },
  { label: 'Jul', value: 340 },
  { label: 'Ago', value: 262 },
  { label: 'Sep', value: 295 },
]

export const cumplimientoPlazos = {
  value: 87,
  delta: 4,
  serie: [62, 70, 66, 78, 71, 84, 79, 87],
}

export type ReclamoAtencion = {
  id: string
  mercado: string
  estado: Estado
  dias: number
}

export const requierenAtencion: ReclamoAtencion[] = [
  {
    id: 'R-2026-004790',
    mercado: 'Telecomunicaciones',
    estado: 'esperando_empresa',
    dias: -5,
  },
  { id: 'R-2026-004812', mercado: 'Retail', estado: 'en_gestion', dias: 0 },
  {
    id: 'R-2026-004798',
    mercado: 'Mercado financiero',
    estado: 'asignado',
    dias: 2,
  },
  {
    id: 'R-2026-004775',
    mercado: 'Servicios básicos',
    estado: 'pendiente_antecedentes',
    dias: 3,
  },
]
