import type { Estado } from '@/features/reclamos/estados'

/** Etapas que ve el consumidor, en lenguaje simple (agrupan los 7 estados). */
export const ETAPAS = [
  'Registrado',
  'Asignado',
  'En gestión',
  'Respuesta',
  'Cierre',
] as const

const INDICE: Record<Estado, number> = {
  ingresado: 0,
  pendiente_antecedentes: 0,
  asignado: 1,
  en_gestion: 2,
  esperando_empresa: 3,
  cerrado: 4,
  anulado: -1,
}

/** Índice de la etapa del reclamo; -1 si fue anulado. */
export function indiceEtapa(estado: Estado) {
  return INDICE[estado]
}
