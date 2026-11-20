import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { estaActivo } from '@/features/cliente/model'
import type { ReclamoListado } from '@/features/reclamos/listado/model'
import {
  aIngreso,
  EQUIPO,
  RECIBIDOS_SEMILLA,
  type IngresoBandeja,
} from './escenario'

/** Casos activos de cada funcionario según el listado compartido (KPI 5). */
export function cargaPorResponsable(reclamos: ReclamoListado[]) {
  const carga = new Map<string, number>()
  for (const row of reclamos)
    if (row.responsableId && estaActivo(row))
      carga.set(row.responsableId, (carga.get(row.responsableId) ?? 0) + 1)
  return carga
}

/**
 * Bandeja de revisión calculada desde el estado compartido de la demo: los
 * reclamos ingresados (incluidos los nuevos del portal) y los pendientes de
 * antecedentes que el consumidor ya respondió. Primero los de menor plazo.
 */
export function useBandeja() {
  const { reclamos, recibidos, detalle } = useReclamosDemo()
  const devueltos = new Set([...RECIBIDOS_SEMILLA, ...recibidos])
  const ingresos: IngresoBandeja[] = [
    ...reclamos
      .filter((row) => row.estado === 'ingresado')
      .map((row) => aIngreso(row, 'nuevo')),
    ...reclamos
      .filter(
        (row) =>
          row.estado === 'pendiente_antecedentes' && devueltos.has(row.id),
      )
      .map((row) => {
        if (!recibidos.includes(row.id)) return aIngreso(row, 'antecedentes')
        const ficha = detalle(row.id)
        return {
          ...aIngreso(row, 'antecedentes', ficha?.adjuntos ?? []),
          respuesta: ficha?.historial
            .filter((evento) => evento.titulo === 'Antecedentes enviados')
            .at(-1)?.detalle,
        }
      }),
  ].sort((a, b) => a.dias - b.dias || a.id.localeCompare(b.id))

  const carga = cargaPorResponsable(reclamos)
  const equipo = EQUIPO.map((persona) => ({
    ...persona,
    activos: carga.get(persona.id) ?? persona.activos,
  }))

  return {
    ingresos,
    nuevos: ingresos.filter((item) => item.tipo === 'nuevo').length,
    antecedentes: ingresos.filter((item) => item.tipo === 'antecedentes')
      .length,
    equipo,
  }
}
