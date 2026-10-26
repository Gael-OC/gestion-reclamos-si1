import type { Estado } from '../estados'

export type ReclamoListado = {
  id: string
  asunto: string
  empresa: string
  mercado: string
  comuna: string
  responsableId: string | null
  estado: Estado
  fechaIngreso: string
  fechaLimite: string
  fechaCierre?: string
  diasRestantes: number | null
  atencion: 'en_plazo' | 'por_vencer' | 'vencido' | 'no_aplica'
  cierreEnPlazo?: boolean
  descripcion?: string
}

export type NuevoReclamoDatos = Pick<
  ReclamoListado,
  'asunto' | 'empresa' | 'mercado' | 'comuna'
> & { descripcion: string }

export type Atencion = 'todos' | 'vencidos' | 'por_vencer' | 'sin_asignar'
export type Orden = 'recientes' | 'antiguos' | 'urgentes' | 'empresa'

export type FiltrosListado = {
  buscar: string
  estado: string
  mercado: string
  responsable: string
  alcance: 'todos' | 'mios'
  atencion: Atencion
  orden: Orden
}

export function normalizarBusqueda(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CL')
    .trim()
}

export function filtrarReclamos(
  rows: ReclamoListado[],
  filtros: FiltrosListado,
  usuarioId: string,
  responsables: { id: string; nombre: string }[],
) {
  const terms = normalizarBusqueda(filtros.buscar).split(/\s+/).filter(Boolean)
  const filtered = rows.filter((row) => {
    const responsable = responsables.find(
      (item) => item.id === row.responsableId,
    )
    const searchable = normalizarBusqueda(
      [
        row.id,
        row.asunto,
        row.empresa,
        row.mercado,
        row.comuna,
        responsable?.nombre,
      ]
        .filter(Boolean)
        .join(' '),
    )
    return (
      terms.every((term) => searchable.includes(term)) &&
      (!filtros.estado || row.estado === filtros.estado) &&
      (!filtros.mercado || row.mercado === filtros.mercado) &&
      (!filtros.responsable ||
        (filtros.responsable === 'sin_asignar'
          ? row.responsableId === null
          : row.responsableId === filtros.responsable)) &&
      (filtros.alcance !== 'mios' || row.responsableId === usuarioId) &&
      (filtros.atencion === 'todos' ||
        (filtros.atencion === 'sin_asignar' && row.responsableId === null) ||
        (filtros.atencion === 'vencidos' && row.atencion === 'vencido') ||
        (filtros.atencion === 'por_vencer' && row.atencion === 'por_vencer'))
    )
  })

  return filtered.sort((a, b) => {
    if (filtros.orden === 'empresa') {
      return (
        a.empresa.localeCompare(b.empresa, 'es-CL') || b.id.localeCompare(a.id)
      )
    }
    if (filtros.orden === 'urgentes') {
      const aDias = a.diasRestantes ?? Infinity
      const bDias = b.diasRestantes ?? Infinity
      if (aDias !== bDias) return aDias < bDias ? -1 : 1
    }
    const byDate = a.fechaIngreso.localeCompare(b.fechaIngreso)
    return (
      (filtros.orden === 'antiguos' ? byDate : -byDate) ||
      b.id.localeCompare(a.id)
    )
  })
}

export function fechaVisible(isoDate: string, short = false) {
  const [year, month, day] = isoDate.split('-')
  return short ? `${day}-${month}` : `${day}-${month}-${year}`
}
