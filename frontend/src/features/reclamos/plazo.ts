import { PLAZO_DIAS } from './estados'

export type TonoPlazo = 'vencido' | 'por_vencer' | 'en_plazo'

/** Tono del plazo según los días que faltan (lo calculará el backend). */
export function tonoPlazo(dias: number): TonoPlazo {
  if (dias < 0) return 'vencido'
  if (dias <= 3) return 'por_vencer'
  return 'en_plazo'
}

const dia = (n: number) => (n === 1 ? 'día' : 'días')

/** "Vencido hace 2 días", "Vence hoy", "Vence en 3 días", "12 días restantes". */
export function textoPlazo(dias: number) {
  if (dias < 0) return `Vencido hace ${-dias} ${dia(-dias)}`
  if (dias === 0) return 'Vence hoy'
  if (dias <= 3) return `Vence en ${dias} ${dia(dias)}`
  return `${dias} ${dia(dias)} restantes`
}

/** Porción del plazo ya usada, de 0 a 100. */
export function plazoUsado(dias: number, plazo = PLAZO_DIAS) {
  return Math.min(100, Math.max(0, ((plazo - dias) / plazo) * 100))
}

export const COLOR_PLAZO: Record<TonoPlazo, string> = {
  vencido: 'var(--color-danger)',
  por_vencer: 'var(--color-warning)',
  en_plazo: 'var(--color-brand)',
}
